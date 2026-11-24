import { BadRequestException, HttpStatus, Injectable, InternalServerErrorException, Logger, NotFoundException, StreamableFile } from '@nestjs/common';
import type { OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Category } from '../../../entities/category.entity';
import { Wallpaper } from '../../../entities/wallpaper.entity';
import { CategoryKind } from '../../../enums/category-kind.enum';
import { ErrorCode } from '../../../enums/error-code.enum';
import { isProductionStage } from '../../../utils/stage.util';
import { DescriptionService } from '../../description/services/description.service';
import {
    DEFAULT_WALLPAPER_DESCRIPTION,
    DEFAULT_WALLPAPER_PATH,
    GIMP_CONSOLE_PATHS,
    WALLPAPER_AUTO_UPDATE_DELAY,
    WALLPAPER_PNG_FILE_NAME,
    WALLPAPER_ROOT_DIRECTORY,
    WALLPAPER_XCF_EXTENSION,
    WALLPAPER_XCF_FILE_NAME,
} from '../constants/wallpaper.constants';
import type { WallpaperSettingsDto } from '../dtos/wallpaper-settings.dto';
import type { UploadedFile } from '../interfaces/uploaded-file.interface';
import type { WallpaperResponse } from '../interfaces/wallpaper-response.interface';
import { isDesktopWallpaperSupported, setDesktopWallpaper } from '../utils/desktop-wallpaper.util';
import { findGimpConsolePath, runGimpScript } from '../utils/gimp.util';
import { readPng } from '../utils/png.util';

import { createReadStream, existsSync } from 'node:fs';
import { mkdir, rename, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

@Injectable()
export class WallpaperService implements OnApplicationBootstrap, OnApplicationShutdown {
    private readonly logger = new Logger(WallpaperService.name, { timestamp: true });
    private readonly stage: string;
    private readonly directory: string;
    private autoUpdateTimeout: NodeJS.Timeout | null = null;
    // Generations run one after another, so two of them never write the same files at once
    private queue: Promise<void> = Promise.resolve();
    private pendingJobsAmount = 0;
    // Exists while an update is scheduled and is kept when the schedule restarts, so requests waiting for the update aren't answered before it's queued
    private scheduledUpdate: Promise<void> | null = null;
    private finishScheduledUpdate: (() => void) | null = null;

    private get xcfPath(): string {
        return join(this.directory, WALLPAPER_XCF_FILE_NAME);
    }

    private get pngPath(): string {
        return join(this.directory, WALLPAPER_PNG_FILE_NAME);
    }

    constructor(
        @InjectRepository(Wallpaper)
        private readonly wallpaperRepository: Repository<Wallpaper>,
        @InjectRepository(Category)
        private readonly categoriesRepository: Repository<Category>,
        private readonly descriptionService: DescriptionService,
        private readonly configService: ConfigService
    ) {
        this.stage = this.configService.getOrThrow<string>('STAGE');
        this.directory = join(WALLPAPER_ROOT_DIRECTORY, this.stage);
    }

    // Brings the wallpaper up to date with changes made while the application was stopped
    public onApplicationBootstrap(): void {
        const gimpConsolePath = findGimpConsolePath();

        if (gimpConsolePath === null) {
            this.logger.warn(`GIMP 3 wasn't found in ${GIMP_CONSOLE_PATHS.join(' or ')}, so the wallpaper can't be generated`);
        } else {
            this.logger.log(`Generating wallpapers with ${gimpConsolePath} into ${this.directory}`);
        }

        this.scheduleAutoUpdate();
    }

    public async onApplicationShutdown(): Promise<void> {
        this.clearAutoUpdate();
        this.settleScheduledUpdate();

        await this.queue;
    }

    public async getWallpaper(): Promise<WallpaperResponse> {
        const settings = await this.getSettings();
        const { excludedCategoryId, isAutoGenerateEnabled, isDesktopUpdateEnabled, text } = settings;

        return {
            excludedCategoryId,
            isAutoGenerateEnabled,
            isDesktopUpdateEnabled,
            isGimpInstalled: findGimpConsolePath() !== null,
            canUpdateDesktop: this.canUpdateDesktopWallpaper(),
            text,
            png: await readPng(this.pngPath),
            isUpdating: await this.isUpdating(settings),
            isGenerating: this.isGenerating(),
        };
    }

    public async waitForUpdate(): Promise<WallpaperResponse> {
        while (this.isGenerating() || this.scheduledUpdate !== null) {
            await (this.isGenerating() ? this.queue : this.scheduledUpdate);
        }

        return this.getWallpaper();
    }

    public async saveSettings(wallpaperSettingsDto: WallpaperSettingsDto): Promise<void> {
        const { excludedCategoryId, isAutoGenerateEnabled, isDesktopUpdateEnabled } = wallpaperSettingsDto;

        if (isDesktopUpdateEnabled && !this.canUpdateDesktopWallpaper()) {
            throw new BadRequestException(`The desktop wallpaper can be updated only in production on Windows (stage: ${this.stage}, platform: ${process.platform})`);
        }

        await this.throwIfCategoryCantBeExcluded(excludedCategoryId);

        const settings = await this.getSettings();

        await this.wallpaperRepository.update(settings.id, { excludedCategoryId, isAutoGenerateEnabled, isDesktopUpdateEnabled });

        this.logger.log(
            `Saved wallpaper settings: excluded category ${excludedCategoryId ?? 'none'}, automatic generation ${isAutoGenerateEnabled ? 'on' : 'off'}, desktop update ${isDesktopUpdateEnabled ? 'on' : 'off'}`
        );

        // Generating can't be started by hand while it's automatic, so a changed category updates the wallpaper right away
        await this.enqueue(() => this.autoUpdate());
    }

    // The uploaded file becomes the wallpaper only once GIMP has put the text into it, so an invalid file never overwrites the current one
    public async uploadXcf(file: UploadedFile | undefined): Promise<void> {
        const xcfSignature = 'gimp xcf ';

        if (file === undefined || !file.originalname.toLowerCase().endsWith(WALLPAPER_XCF_EXTENSION) || file.buffer.subarray(0, xcfSignature.length).toString('latin1') !== xcfSignature) {
            throw new BadRequestException({ message: 'Only XCF files can be uploaded', errorCode: ErrorCode.INVALID_WALLPAPER_FILE, statusCode: HttpStatus.BAD_REQUEST });
        }

        const uploadedPath = join(this.directory, 'upload.xcf');

        this.logger.debug(`Received XCF '${file.originalname}' (${file.buffer.length} bytes)`);

        await this.enqueue(async () => {
            await mkdir(this.directory, { recursive: true });
            await writeFile(uploadedPath, file.buffer);

            try {
                await this.generate(uploadedPath, `uploaded '${file.originalname}'`);
            } finally {
                await rm(uploadedPath, { force: true });
            }
        });
    }

    public restoreDefaultWallpaper(): Promise<void> {
        return this.enqueue(() => this.generate(DEFAULT_WALLPAPER_PATH, DEFAULT_WALLPAPER_DESCRIPTION));
    }

    public generateWallpaper(): Promise<void> {
        return this.enqueue(() => this.generateFromSource());
    }

    public getPng(): StreamableFile {
        if (!existsSync(this.pngPath)) {
            throw new NotFoundException('The wallpaper has not been generated yet');
        }

        return new StreamableFile(createReadStream(this.pngPath));
    }

    // Queued or running, so the numbers it's generated with must not change meanwhile
    public isGenerating(): boolean {
        return this.pendingJobsAmount > 0;
    }

    // Restarted by every change, so a burst of changes generates the wallpaper once
    public scheduleAutoUpdate(): void {
        this.clearAutoUpdate();

        this.scheduledUpdate ??= new Promise((resolve) => {
            this.finishScheduledUpdate = () => resolve();
        });

        this.logger.debug(`Scheduled automatic wallpaper generation in ${WALLPAPER_AUTO_UPDATE_DELAY} ms`);

        this.autoUpdateTimeout = setTimeout(() => {
            this.autoUpdateTimeout = null;
            this.enqueue(() => this.autoUpdate()).catch((error: unknown) =>
                this.logger.error(`Scheduled automatic wallpaper generation failed (stage: ${this.stage})`, error instanceof Error ? error.stack : error)
            );
            // Queued now, so the requests waiting for the update wait for the queue from here on
            this.settleScheduledUpdate();
        }, WALLPAPER_AUTO_UPDATE_DELAY);
    }

    private clearAutoUpdate(): void {
        if (!this.autoUpdateTimeout) {
            return;
        }

        clearTimeout(this.autoUpdateTimeout);
        this.autoUpdateTimeout = null;
    }

    private settleScheduledUpdate(): void {
        this.finishScheduledUpdate?.();
        this.scheduledUpdate = null;
        this.finishScheduledUpdate = null;
    }

    private async autoUpdate(): Promise<void> {
        const settings = await this.getSettings();

        if (!this.isAutoUpdateEnabled(settings)) {
            this.logger.debug(`Skipped automatic wallpaper generation, as ${settings.isAutoGenerateEnabled ? 'GIMP 3 is not installed' : 'it is turned off'}`);

            return;
        }

        if (await this.isUpToDate(settings)) {
            this.logger.debug(`Wallpaper is up to date with text '${settings.text ?? ''}'`);

            return;
        }

        await this.generateFromSource();
    }

    private isAutoUpdateEnabled(settings: Wallpaper): boolean {
        return settings.isAutoGenerateEnabled && findGimpConsolePath() !== null;
    }

    private async isUpToDate(settings: Wallpaper): Promise<boolean> {
        return existsSync(this.pngPath) && (await this.getText(settings.excludedCategoryId)) === settings.text;
    }

    // Lets the frontend wait for the wallpaper generated in the background after games, groups or categories change
    private async isUpdating(settings: Wallpaper): Promise<boolean> {
        if (this.isGenerating()) {
            return true;
        }

        // A scheduled update that will find the wallpaper up to date, e.g. after renaming a game, doesn't change it
        return this.autoUpdateTimeout !== null && this.isAutoUpdateEnabled(settings) && !(await this.isUpToDate(settings));
    }

    private enqueue(job: () => Promise<void>): Promise<void> {
        this.pendingJobsAmount++;

        const result = this.queue.then(job).finally(() => {
            this.pendingJobsAmount--;
        });

        this.queue = result.catch(() => undefined);

        return result;
    }

    private async generate(sourcePath: string, sourceDescription: string): Promise<void> {
        const gimpConsolePath = findGimpConsolePath();

        if (gimpConsolePath === null) {
            throw new BadRequestException('GIMP 3 is not installed');
        }

        if (!existsSync(sourcePath)) {
            throw new InternalServerErrorException(`The wallpaper source ${sourcePath} doesn't exist (stage: ${this.stage})`);
        }

        const settings = await this.getSettings();
        const text = await this.getText(settings.excludedCategoryId);
        // GIMP picks the format by the extension, so the files it writes keep theirs until they replace the wallpaper
        const temporaryXcfFileName = 'wallpaper.tmp.xcf';
        const temporaryPngFileName = 'wallpaper.tmp.png';
        const temporaryXcfPath = join(this.directory, temporaryXcfFileName);
        const temporaryPngPath = join(this.directory, temporaryPngFileName);
        const startTime = Date.now();

        this.logger.log(`Generating wallpaper with text '${text}' from ${sourceDescription} (${sourcePath})`);

        await mkdir(this.directory, { recursive: true });

        const result = await runGimpScript(gimpConsolePath, sourcePath, temporaryXcfPath, temporaryPngPath, text);

        if (result.error === 'TEXT_LAYERS') {
            throw new BadRequestException({
                message: `The XCF file has to have exactly 1 text layer, but it has ${result.textLayersAmount ?? 0}`,
                errorCode: ErrorCode.INVALID_WALLPAPER_TEXT_LAYERS,
                statusCode: HttpStatus.BAD_REQUEST,
            });
        }

        if (result.error === 'GIMP') {
            throw new InternalServerErrorException(`GIMP failed to generate the wallpaper from ${sourceDescription} (${sourcePath}): ${result.message ?? 'unknown error'}`);
        }

        // Renamed into place, so the wallpaper is never read while half written
        await rename(temporaryXcfPath, this.xcfPath);
        await rename(temporaryPngPath, this.pngPath);
        await this.wallpaperRepository.update(settings.id, { text });

        this.logger.log(`Generated wallpaper with text '${text}' from ${sourceDescription} in ${Date.now() - startTime} ms`);

        if (settings.isDesktopUpdateEnabled && this.canUpdateDesktopWallpaper()) {
            await setDesktopWallpaper(this.pngPath)
                .then(() => this.logger.log(`Set desktop wallpaper to ${this.pngPath}`))
                .catch((error: unknown) => this.logger.warn(`Failed to set desktop wallpaper: ${error instanceof Error ? error.message : String(error)}`));
        }
    }

    // The current wallpaper of the stage, uploaded or put into its folder by hand, is used before the default one
    private generateFromSource(): Promise<void> {
        if (existsSync(this.xcfPath)) {
            return this.generate(this.xcfPath, 'current XCF');
        }

        return this.generate(DEFAULT_WALLPAPER_PATH, DEFAULT_WALLPAPER_DESCRIPTION);
    }

    private async getText(excludedCategoryId: number | null): Promise<string> {
        const { amount, entries } = (await this.descriptionService.getDescription()).completed;

        if (excludedCategoryId === null) {
            return String(amount);
        }

        const excludedAmount = entries.filter(({ game }) => game.categories.some(({ id }) => id === excludedCategoryId)).reduce((sum, { listedGroups }) => sum + 1 + listedGroups.length, 0);

        return `${amount} (${amount - excludedAmount})`;
    }

    private async getSettings(): Promise<Wallpaper> {
        const currentSettings = await this.wallpaperRepository.findOne({ where: {}, order: { id: 'ASC' } });

        if (currentSettings) {
            return currentSettings;
        }

        const newSettings = this.wallpaperRepository.create({ text: null, excludedCategoryId: null, isAutoGenerateEnabled: true, isDesktopUpdateEnabled: false });

        return this.wallpaperRepository.save(newSettings);
    }

    private async throwIfCategoryCantBeExcluded(categoryId: number | null): Promise<void> {
        if (categoryId === null) {
            return;
        }

        const category = await this.categoriesRepository.findOneBy({ id: categoryId });

        if (!category) {
            throw new BadRequestException(`Category ${categoryId} doesn't exist`);
        }

        // Every game is in the 100% category, so excluding it would always give 0
        if (category.kind === CategoryKind.ONE_HUNDRED_PERCENT) {
            throw new BadRequestException(`The 100% category can't be excluded from the wallpaper`);
        }
    }

    private canUpdateDesktopWallpaper(): boolean {
        return isProductionStage(this.stage) && isDesktopWallpaperSupported();
    }
}

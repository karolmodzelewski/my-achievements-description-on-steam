import { BadRequestException, InternalServerErrorException, Logger, NotFoundException, StreamableFile } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import type { Repository } from 'typeorm';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { WallpaperService } from './wallpaper.service';
import { Category } from '../../../entities/category.entity';
import { Game } from '../../../entities/game.entity';
import { Wallpaper } from '../../../entities/wallpaper.entity';
import { CategoryKind } from '../../../enums/category-kind.enum';
import { ErrorCode } from '../../../enums/error-code.enum';
import { buildCategory } from '../../../testing/builders/category.builders';
import { buildDescription, buildDescriptionSection } from '../../../testing/builders/description.builders';
import { buildUpdateResult } from '../../../testing/builders/query-result.builders';
import { buildWallpaper, buildWallpaperSettingsDto } from '../../../testing/builders/wallpaper.builders';
import { stubEnvironment } from '../../../testing/helpers/environment.helpers';
import { createEntityManager, provideRepository } from '../../../testing/helpers/repository.helpers';
import { isProductionStage } from '../../../utils/stage.util';
import type { DescriptionEntry } from '../../description/interfaces/description-entry.interface';
import { DescriptionService } from '../../description/services/description.service';
import { DEFAULT_WALLPAPER_PATH, WALLPAPER_AUTO_UPDATE_DELAY, WALLPAPER_PNG_FILE_NAME, WALLPAPER_ROOT_DIRECTORY, WALLPAPER_XCF_FILE_NAME } from '../constants/wallpaper.constants';
import type { GimpResult } from '../interfaces/gimp-result.interface';
import type { UploadedFile } from '../interfaces/uploaded-file.interface';
import type { WallpaperPng } from '../interfaces/wallpaper-png.interface';
import { isDesktopWallpaperSupported, setDesktopWallpaper } from '../utils/desktop-wallpaper.util';
import { findGimpConsolePath, runGimpScript } from '../utils/gimp.util';
import { readPng } from '../utils/png.util';

import { createReadStream, existsSync } from 'node:fs';
import type { ReadStream } from 'node:fs';
import { mkdir, rename, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { Readable } from 'node:stream';

vi.mock('node:fs', { spy: true });
vi.mock('node:fs/promises', { spy: true });
vi.mock('../utils/gimp.util', { spy: true });
vi.mock('../utils/png.util', { spy: true });
vi.mock('../utils/desktop-wallpaper.util', { spy: true });
vi.mock('../../../utils/stage.util', { spy: true });

describe('WallpaperService', () => {
    let service: WallpaperService;
    let wallpaperRepository: Repository<Wallpaper>;
    let categoriesRepository: Repository<Category>;
    let descriptionService: DescriptionService;

    const gimpConsolePath = 'C:\\GIMP 3\\bin\\gimp-console-3.exe';
    const directory = join(WALLPAPER_ROOT_DIRECTORY, 'test');
    const xcfPath = join(directory, WALLPAPER_XCF_FILE_NAME);
    const pngPath = join(directory, WALLPAPER_PNG_FILE_NAME);
    const temporaryXcfPath = join(directory, 'wallpaper.tmp.xcf');
    const temporaryPngPath = join(directory, 'wallpaper.tmp.png');
    const uploadedPath = join(directory, 'upload.xcf');
    const png: WallpaperPng = { width: 1920, height: 1080, size: 2048, modifiedAt: 1000 };
    const xcfFile: UploadedFile = { originalname: 'Wallpaper.XCF', buffer: Buffer.from('gimp xcf v011') };
    const excludedCategory = buildCategory({ id: 3, kind: CategoryKind.MAIN });

    const buildEntry = (categoryIds: number[], listedGroupsAmount = 0): DescriptionEntry => ({
        game: {
            id: 1,
            name: 'Game',
            hasNewAchievements: false,
            categories: categoryIds.map((id) => ({ id, kind: CategoryKind.MAIN, iconName: ':heart:', shouldHideGames: false })),
            oneHundredPercentIconName: ':100:',
            groups: [],
        },
        group: null,
        listedGroups: Array.from({ length: listedGroupsAmount }, (_group, index) => ({ id: index + 1, name: `DLC ${index}`, hasNewAchievements: false })),
    });

    const excludedGameWithListedGroup = buildEntry([excludedCategory.id], 1);
    const includedGame = buildEntry([]);
    const excludedGameOfOtherCategory = buildEntry([2, excludedCategory.id]);
    const completedAmount = 5;

    const mockSettings = (overrides: Partial<Wallpaper>): void => {
        vi.mocked(wallpaperRepository.findOne).mockResolvedValue(buildWallpaper(overrides));
    };

    const mockMissingPaths = (...missingPaths: string[]): void => {
        vi.mocked(existsSync).mockImplementation((path) => !missingPaths.includes(String(path)));
    };

    const mockDesktopUpdateAvailable = (): void => {
        vi.mocked(isProductionStage).mockReturnValue(true);
        vi.mocked(isDesktopWallpaperSupported).mockReturnValue(true);
    };

    const deferGimpResult = (): ((result: GimpResult) => void) => {
        let resolveGimpResult: (result: GimpResult) => void = () => undefined;

        vi.mocked(runGimpScript).mockReturnValueOnce(
            new Promise((resolve) => {
                resolveGimpResult = resolve;
            })
        );

        return (result) => resolveGimpResult(result);
    };

    const flushPromises = (): Promise<void> =>
        new Promise((resolve) => {
            setImmediate(resolve);
        });

    beforeEach(async () => {
        stubEnvironment();

        const manager = createEntityManager();
        const module = await Test.createTestingModule({
            providers: [WallpaperService, DescriptionService, ConfigService, provideRepository(Wallpaper, manager), provideRepository(Category, manager), provideRepository(Game, manager)],
        }).compile();

        wallpaperRepository = module.get(getRepositoryToken(Wallpaper));
        categoriesRepository = module.get(getRepositoryToken(Category));
        descriptionService = module.get(DescriptionService);

        vi.spyOn(wallpaperRepository, 'findOne').mockResolvedValue(buildWallpaper());
        vi.spyOn(wallpaperRepository, 'update').mockResolvedValue(buildUpdateResult());
        vi.spyOn(categoriesRepository, 'findOneBy').mockResolvedValue(excludedCategory);
        vi.spyOn(descriptionService, 'getDescription').mockResolvedValue(
            buildDescription({ completed: buildDescriptionSection({ amount: completedAmount, entries: [excludedGameWithListedGroup, includedGame, excludedGameOfOtherCategory] }) })
        );
        vi.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
        vi.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
        vi.mocked(findGimpConsolePath).mockReturnValue(gimpConsolePath);
        vi.mocked(runGimpScript).mockResolvedValue({ error: null });
        vi.mocked(readPng).mockResolvedValue(png);
        vi.mocked(isProductionStage).mockReturnValue(false);
        vi.mocked(isDesktopWallpaperSupported).mockReturnValue(false);
        vi.mocked(setDesktopWallpaper).mockResolvedValue();
        vi.mocked(existsSync).mockReturnValue(true);
        vi.mocked(createReadStream).mockReturnValue(Readable.from([]) as ReadStream);
        vi.mocked(mkdir).mockResolvedValue(undefined);
        vi.mocked(rename).mockResolvedValue();
        vi.mocked(rm).mockResolvedValue();
        vi.mocked(writeFile).mockResolvedValue();

        service = module.get(WallpaperService);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should create a service', () => {
        // Assert
        expect(service).toBeTruthy();
    });

    describe('getWallpaper', () => {
        it('should present the settings with the generated PNG', async () => {
            // Arrange
            mockSettings({ text: '5 (2)', excludedCategoryId: excludedCategory.id, isAutoGenerateEnabled: true });

            // Act
            const wallpaper = await service.getWallpaper();

            // Assert
            expect(readPng).toHaveBeenCalledWith(pngPath);
            expect(wallpaper).toEqual({
                excludedCategoryId: excludedCategory.id,
                isAutoGenerateEnabled: true,
                isDesktopUpdateEnabled: false,
                isGimpInstalled: true,
                canUpdateDesktop: false,
                text: '5 (2)',
                png,
                isUpdating: false,
                isGenerating: false,
            });
        });

        it('should create the default settings when there are none', async () => {
            // Arrange
            const defaultSettings = { text: null, excludedCategoryId: null, isAutoGenerateEnabled: true, isDesktopUpdateEnabled: false };

            vi.mocked(wallpaperRepository.findOne).mockResolvedValue(null);
            vi.spyOn(wallpaperRepository, 'create').mockImplementation((settings) => Object.assign(new Wallpaper(), settings));
            vi.spyOn(wallpaperRepository, 'save').mockImplementation((settings) => Promise.resolve(Object.assign(buildWallpaper(), settings)));

            // Act
            const wallpaper = await service.getWallpaper();

            // Assert
            expect(wallpaperRepository.save).toHaveBeenCalledWith(defaultSettings);
            expect(wallpaper).toMatchObject(defaultSettings);
        });

        it('should present that GIMP is not installed', async () => {
            // Arrange
            vi.mocked(findGimpConsolePath).mockReturnValue(null);

            // Act
            const { isGimpInstalled } = await service.getWallpaper();

            // Assert
            expect(isGimpInstalled).toBe(false);
        });

        it('should present no PNG before the wallpaper is generated', async () => {
            // Arrange
            vi.mocked(readPng).mockResolvedValue(null);

            // Act
            const wallpaper = await service.getWallpaper();

            // Assert
            expect(wallpaper.png).toBeNull();
        });

        it('should allow updating the desktop wallpaper only in production on Windows', async () => {
            // Arrange
            mockDesktopUpdateAvailable();

            // Act
            const { canUpdateDesktop } = await service.getWallpaper();

            // Assert
            expect(isProductionStage).toHaveBeenCalledWith('test');
            expect(canUpdateDesktop).toBe(true);
        });

        it('should present the scheduled update which will change the wallpaper as updating', async () => {
            // Arrange
            vi.useFakeTimers();
            mockSettings({ text: '4', isAutoGenerateEnabled: true });
            service.scheduleAutoUpdate();

            // Act
            const { isUpdating } = await service.getWallpaper();

            // Assert
            expect(isUpdating).toBe(true);
        });

        it('should not present the scheduled update which will find the wallpaper up to date as updating', async () => {
            // Arrange
            vi.useFakeTimers();
            mockSettings({ text: '5', isAutoGenerateEnabled: true });
            service.scheduleAutoUpdate();

            // Act
            const { isUpdating } = await service.getWallpaper();

            // Assert
            expect(isUpdating).toBe(false);
        });

        it('should present the running generation as updating and generating', async () => {
            // Arrange
            deferGimpResult();
            void service.generateWallpaper();

            // Act
            const wallpaper = await service.getWallpaper();

            // Assert
            expect(wallpaper).toMatchObject({ isUpdating: true, isGenerating: true });
        });
    });

    describe('saveSettings', () => {
        it('should save the settings', async () => {
            // Arrange
            const wallpaperSettingsDto = buildWallpaperSettingsDto({ excludedCategoryId: excludedCategory.id });

            // Act
            await service.saveSettings(wallpaperSettingsDto);

            // Assert
            expect(categoriesRepository.findOneBy).toHaveBeenCalledWith({ id: excludedCategory.id });
            expect(wallpaperRepository.update).toHaveBeenCalledWith(1, { excludedCategoryId: excludedCategory.id, isAutoGenerateEnabled: false, isDesktopUpdateEnabled: false });
            expect(runGimpScript).not.toHaveBeenCalled();
        });

        it('should save the settings without an excluded category', async () => {
            // Act
            await service.saveSettings(buildWallpaperSettingsDto());

            // Assert
            expect(categoriesRepository.findOneBy).not.toHaveBeenCalled();
            expect(wallpaperRepository.update).toHaveBeenCalledWith(1, { excludedCategoryId: null, isAutoGenerateEnabled: false, isDesktopUpdateEnabled: false });
        });

        it('should save turning the desktop update on in production on Windows', async () => {
            // Arrange
            mockDesktopUpdateAvailable();

            // Act
            await service.saveSettings(buildWallpaperSettingsDto({ isDesktopUpdateEnabled: true }));

            // Assert
            expect(wallpaperRepository.update).toHaveBeenCalledWith(1, expect.objectContaining({ isDesktopUpdateEnabled: true }));
        });

        it('should generate the out of date wallpaper right away when it is generated automatically', async () => {
            // Arrange
            mockSettings({ text: '5', excludedCategoryId: excludedCategory.id, isAutoGenerateEnabled: true });

            // Act
            await service.saveSettings(buildWallpaperSettingsDto({ excludedCategoryId: excludedCategory.id, isAutoGenerateEnabled: true }));

            // Assert
            expect(runGimpScript).toHaveBeenCalledWith(gimpConsolePath, xcfPath, temporaryXcfPath, temporaryPngPath, '5 (2)');
        });

        it('should not generate the wallpaper which is up to date', async () => {
            // Arrange
            mockSettings({ text: '5', isAutoGenerateEnabled: true });

            // Act
            await service.saveSettings(buildWallpaperSettingsDto({ isAutoGenerateEnabled: true }));

            // Assert
            expect(runGimpScript).not.toHaveBeenCalled();
        });

        it.each([
            { reason: 'the desktop update outside production on Windows', overrides: { isDesktopUpdateEnabled: true }, message: 'The desktop wallpaper can be updated only in production on Windows' },
            { reason: 'excluding a category which does not exist', overrides: { excludedCategoryId: 999 }, message: `Category 999 doesn't exist`, category: null },
            {
                reason: 'excluding the 100% category',
                overrides: { excludedCategoryId: 1 },
                message: `The 100% category can't be excluded from the wallpaper`,
                category: buildCategory({ kind: CategoryKind.ONE_HUNDRED_PERCENT }),
            },
        ])('should reject $reason', async ({ overrides, message, category = excludedCategory }) => {
            // Arrange
            vi.mocked(categoriesRepository.findOneBy).mockResolvedValue(category);

            // Act
            const result = service.saveSettings(buildWallpaperSettingsDto(overrides));

            // Assert
            await expect(result).rejects.toThrow(BadRequestException);
            await expect(result).rejects.toThrow(message);
            expect(wallpaperRepository.update).not.toHaveBeenCalled();
        });
    });

    describe('uploadXcf', () => {
        it('should generate the wallpaper from the uploaded file and remove the file afterwards', async () => {
            // Act
            await service.uploadXcf(xcfFile);

            // Assert
            expect(mkdir).toHaveBeenCalledWith(directory, { recursive: true });
            expect(writeFile).toHaveBeenCalledWith(uploadedPath, xcfFile.buffer);
            expect(runGimpScript).toHaveBeenCalledWith(gimpConsolePath, uploadedPath, temporaryXcfPath, temporaryPngPath, '5');
            expect(rename).toHaveBeenCalledWith(temporaryXcfPath, xcfPath);
            expect(rm).toHaveBeenCalledWith(uploadedPath, { force: true });
        });

        it('should keep the current wallpaper and remove the uploaded file when GIMP rejects it', async () => {
            // Arrange
            vi.mocked(runGimpScript).mockResolvedValue({ error: 'TEXT_LAYERS' });

            // Act
            const result = service.uploadXcf(xcfFile);

            // Assert
            await expect(result).rejects.toMatchObject({
                response: { message: 'The XCF file has to have exactly 1 text layer, but it has 0', errorCode: ErrorCode.INVALID_WALLPAPER_TEXT_LAYERS, statusCode: 400 },
            });
            expect(rename).not.toHaveBeenCalled();
            expect(rm).toHaveBeenCalledWith(uploadedPath, { force: true });
        });

        it.each([
            { reason: 'no file', file: undefined },
            { reason: 'a file without the XCF extension', file: { ...xcfFile, originalname: 'wallpaper.png' } },
            { reason: 'a file without the XCF signature', file: { ...xcfFile, buffer: Buffer.from('not an xcf') } },
        ])('should reject $reason', async ({ file }) => {
            // Act
            const result = service.uploadXcf(file);

            // Assert
            await expect(result).rejects.toThrow(BadRequestException);
            await expect(result).rejects.toThrow(expect.objectContaining({ response: { message: 'Only XCF files can be uploaded', errorCode: ErrorCode.INVALID_WALLPAPER_FILE, statusCode: 400 } }));
            expect(writeFile).not.toHaveBeenCalled();
            expect(runGimpScript).not.toHaveBeenCalled();
        });
    });

    describe('generateWallpaper', () => {
        it('should generate the current XCF of the stage with the amount of completed games and groups', async () => {
            // Act
            await service.generateWallpaper();

            // Assert
            expect(mkdir).toHaveBeenCalledWith(directory, { recursive: true });
            expect(runGimpScript).toHaveBeenCalledWith(gimpConsolePath, xcfPath, temporaryXcfPath, temporaryPngPath, '5');
            expect(rename).toHaveBeenCalledWith(temporaryXcfPath, xcfPath);
            expect(rename).toHaveBeenCalledWith(temporaryPngPath, pngPath);
            expect(wallpaperRepository.update).toHaveBeenCalledWith(1, { text: '5' });
        });

        it('should add the amount without the games and groups of the excluded category in brackets', async () => {
            // Arrange
            mockSettings({ excludedCategoryId: excludedCategory.id });

            // Act
            await service.generateWallpaper();

            // Assert
            expect(runGimpScript).toHaveBeenCalledWith(gimpConsolePath, xcfPath, temporaryXcfPath, temporaryPngPath, '5 (2)');
            expect(wallpaperRepository.update).toHaveBeenCalledWith(1, { text: '5 (2)' });
        });

        it('should generate the default XCF when the stage has no XCF yet', async () => {
            // Arrange
            mockMissingPaths(xcfPath);

            // Act
            await service.generateWallpaper();

            // Assert
            expect(runGimpScript).toHaveBeenCalledWith(gimpConsolePath, DEFAULT_WALLPAPER_PATH, temporaryXcfPath, temporaryPngPath, '5');
        });

        it('should update the desktop wallpaper in production on Windows when it is turned on', async () => {
            // Arrange
            mockDesktopUpdateAvailable();
            mockSettings({ isDesktopUpdateEnabled: true });

            // Act
            await service.generateWallpaper();

            // Assert
            expect(setDesktopWallpaper).toHaveBeenCalledWith(pngPath);
        });

        it.each([
            { reason: 'it is turned off', isDesktopUpdateEnabled: false, isAvailable: true },
            { reason: 'it is not available', isDesktopUpdateEnabled: true, isAvailable: false },
        ])('should not update the desktop wallpaper when $reason', async ({ isDesktopUpdateEnabled, isAvailable }) => {
            // Arrange
            if (isAvailable) {
                mockDesktopUpdateAvailable();
            }

            mockSettings({ isDesktopUpdateEnabled });

            // Act
            await service.generateWallpaper();

            // Assert
            expect(setDesktopWallpaper).not.toHaveBeenCalled();
        });

        it('should keep the generated wallpaper when the desktop wallpaper can not be updated', async () => {
            // Arrange
            mockDesktopUpdateAvailable();
            mockSettings({ isDesktopUpdateEnabled: true });
            vi.mocked(setDesktopWallpaper).mockRejectedValue(new Error('SystemParametersInfo failed'));

            // Act
            await service.generateWallpaper();

            // Assert
            expect(wallpaperRepository.update).toHaveBeenCalledWith(1, { text: '5' });
            expect(Logger.prototype.warn).toHaveBeenCalledWith('Failed to set desktop wallpaper: SystemParametersInfo failed');
        });

        it.each([
            {
                reason: 'GIMP is not installed',
                arrange: (): void => {
                    vi.mocked(findGimpConsolePath).mockReturnValue(null);
                },
                exception: BadRequestException,
                message: 'GIMP 3 is not installed',
            },
            {
                reason: 'neither the current nor the default XCF exists',
                arrange: (): void => mockMissingPaths(xcfPath, DEFAULT_WALLPAPER_PATH),
                exception: InternalServerErrorException,
                message: `The wallpaper source ${DEFAULT_WALLPAPER_PATH} doesn't exist (stage: test)`,
            },
            {
                reason: 'the XCF does not have exactly 1 text layer',
                arrange: (): void => {
                    vi.mocked(runGimpScript).mockResolvedValue({ error: 'TEXT_LAYERS', textLayersAmount: 2 });
                },
                exception: BadRequestException,
                message: 'The XCF file has to have exactly 1 text layer, but it has 2',
            },
            {
                reason: 'GIMP fails',
                arrange: (): void => {
                    vi.mocked(runGimpScript).mockResolvedValue({ error: 'GIMP', message: 'Font not found' });
                },
                exception: InternalServerErrorException,
                message: `GIMP failed to generate the wallpaper from current XCF (${xcfPath}): Font not found`,
            },
        ])('should keep the current wallpaper when $reason', async ({ arrange, exception, message }) => {
            // Arrange
            arrange();

            // Act
            const result = service.generateWallpaper();

            // Assert
            await expect(result).rejects.toThrow(exception);
            await expect(result).rejects.toThrow(message);
            expect(rename).not.toHaveBeenCalled();
            expect(wallpaperRepository.update).not.toHaveBeenCalled();
        });
    });

    describe('restoreDefaultWallpaper', () => {
        it('should generate the default XCF even when the stage has its own XCF', async () => {
            // Act
            await service.restoreDefaultWallpaper();

            // Assert
            expect(runGimpScript).toHaveBeenCalledWith(gimpConsolePath, DEFAULT_WALLPAPER_PATH, temporaryXcfPath, temporaryPngPath, '5');
            expect(rename).toHaveBeenCalledWith(temporaryXcfPath, xcfPath);
        });
    });

    describe('getPng', () => {
        it('should stream the generated PNG', () => {
            // Act
            const file = service.getPng();

            // Assert
            expect(createReadStream).toHaveBeenCalledWith(pngPath);
            expect(file).toBeInstanceOf(StreamableFile);
        });

        it('should reject the request before the wallpaper is generated', () => {
            // Arrange
            mockMissingPaths(pngPath);

            // Act
            const getPng = (): StreamableFile => service.getPng();

            // Assert
            expect(getPng).toThrow(NotFoundException);
            expect(createReadStream).not.toHaveBeenCalled();
        });
    });

    describe('generations queue', () => {
        it('should be generating while a generation is running', () => {
            // Arrange
            deferGimpResult();

            // Act
            void service.generateWallpaper();

            // Assert
            expect(service.isGenerating()).toBe(true);
        });

        it('should stop generating once the generation is done', async () => {
            // Act
            await service.generateWallpaper();

            // Assert
            expect(service.isGenerating()).toBe(false);
        });

        it('should not start the queued generation before the running one is done', async () => {
            // Arrange
            deferGimpResult();

            // Act
            void service.generateWallpaper();
            void service.restoreDefaultWallpaper();
            await flushPromises();

            // Assert
            expect(runGimpScript).toHaveBeenCalledOnce();
            expect(service.isGenerating()).toBe(true);
        });

        it('should run the queued generation once the running one is done', async () => {
            // Arrange
            const resolveFirstGimpResult = deferGimpResult();
            const firstGeneration = service.generateWallpaper();
            const queuedGeneration = service.restoreDefaultWallpaper();

            // Act
            resolveFirstGimpResult({ error: null });
            await Promise.all([firstGeneration, queuedGeneration]);

            // Assert
            expect(vi.mocked(runGimpScript).mock.calls.map(([, sourcePath]) => sourcePath)).toEqual([xcfPath, DEFAULT_WALLPAPER_PATH]);
        });

        it('should run the next generation after a failed one', async () => {
            // Arrange
            vi.mocked(runGimpScript).mockResolvedValueOnce({ error: 'GIMP', message: 'Font not found' });

            const failedGeneration = service.generateWallpaper();

            // Act
            const nextGeneration = service.generateWallpaper();

            // Assert
            await expect(failedGeneration).rejects.toThrow(InternalServerErrorException);
            await expect(nextGeneration).resolves.toBeUndefined();
            expect(service.isGenerating()).toBe(false);
        });
    });

    describe('automatic update', () => {
        beforeEach(() => {
            vi.useFakeTimers();
            mockSettings({ text: '4', isAutoGenerateEnabled: true });
        });

        it('should generate the out of date wallpaper once after a burst of changes', async () => {
            // Act
            service.scheduleAutoUpdate();
            await vi.advanceTimersByTimeAsync(WALLPAPER_AUTO_UPDATE_DELAY - 1);
            service.scheduleAutoUpdate();
            await vi.advanceTimersByTimeAsync(WALLPAPER_AUTO_UPDATE_DELAY - 1);
            service.scheduleAutoUpdate();
            await vi.advanceTimersByTimeAsync(WALLPAPER_AUTO_UPDATE_DELAY);

            // Assert
            expect(runGimpScript).toHaveBeenCalledOnce();
            expect(runGimpScript).toHaveBeenCalledWith(gimpConsolePath, xcfPath, temporaryXcfPath, temporaryPngPath, '5');
        });

        it('should not generate the wallpaper before the delay since the last change passes', async () => {
            // Act
            service.scheduleAutoUpdate();
            await vi.advanceTimersByTimeAsync(WALLPAPER_AUTO_UPDATE_DELAY - 1);

            // Assert
            expect(runGimpScript).not.toHaveBeenCalled();
        });

        it('should generate the wallpaper with the up to date text when its PNG is missing', async () => {
            // Arrange
            mockSettings({ text: '5', isAutoGenerateEnabled: true });
            mockMissingPaths(pngPath);

            // Act
            service.scheduleAutoUpdate();
            await vi.advanceTimersByTimeAsync(WALLPAPER_AUTO_UPDATE_DELAY);

            // Assert
            expect(runGimpScript).toHaveBeenCalledOnce();
        });

        it.each([
            { reason: 'it is turned off', arrange: (): void => mockSettings({ text: '4', isAutoGenerateEnabled: false }) },
            {
                reason: 'GIMP is not installed',
                arrange: (): void => {
                    vi.mocked(findGimpConsolePath).mockReturnValue(null);
                },
            },
            { reason: 'the wallpaper is up to date', arrange: (): void => mockSettings({ text: '5', isAutoGenerateEnabled: true }) },
        ])('should skip the generation when $reason', async ({ arrange }) => {
            // Arrange
            arrange();

            // Act
            service.scheduleAutoUpdate();
            await vi.advanceTimersByTimeAsync(WALLPAPER_AUTO_UPDATE_DELAY);

            // Assert
            expect(runGimpScript).not.toHaveBeenCalled();
        });

        it('should log the failed generation', async () => {
            // Arrange
            vi.mocked(runGimpScript).mockResolvedValue({ error: 'GIMP', message: 'Font not found' });

            // Act
            service.scheduleAutoUpdate();
            await vi.advanceTimersByTimeAsync(WALLPAPER_AUTO_UPDATE_DELAY);

            // Assert
            expect(Logger.prototype.error).toHaveBeenCalledWith('Scheduled automatic wallpaper generation failed (stage: test)', expect.stringContaining('Font not found'));
        });

        it('should bring the wallpaper up to date after the application starts', async () => {
            // Act
            service.onApplicationBootstrap();
            await vi.advanceTimersByTimeAsync(WALLPAPER_AUTO_UPDATE_DELAY);

            // Assert
            expect(runGimpScript).toHaveBeenCalledOnce();
        });

        it('should warn after the application starts when GIMP is not installed', () => {
            // Arrange
            vi.mocked(findGimpConsolePath).mockReturnValue(null);

            // Act
            service.onApplicationBootstrap();

            // Assert
            expect(Logger.prototype.warn).toHaveBeenCalledWith(expect.stringContaining(`GIMP 3 wasn't found in`));
        });

        it('should cancel the scheduled update when the application shuts down', async () => {
            // Arrange
            service.scheduleAutoUpdate();

            // Act
            await service.onApplicationShutdown();
            await vi.advanceTimersByTimeAsync(WALLPAPER_AUTO_UPDATE_DELAY);

            // Assert
            expect(runGimpScript).not.toHaveBeenCalled();
        });

        it('should answer right away when no update is scheduled', async () => {
            // Act
            const wallpaper = await service.waitForUpdate();

            // Assert
            expect(wallpaper).toMatchObject({ text: '4', isUpdating: false });
        });

        it('should not answer while the update is scheduled', async () => {
            // Arrange
            const onAnswer = vi.fn();

            service.scheduleAutoUpdate();

            // Act
            void service.waitForUpdate().then(onAnswer);
            await vi.advanceTimersByTimeAsync(WALLPAPER_AUTO_UPDATE_DELAY - 1);

            // Assert
            expect(onAnswer).not.toHaveBeenCalled();
        });

        it('should answer with the wallpaper once the scheduled update is generated', async () => {
            // Arrange
            service.scheduleAutoUpdate();

            // Act
            const answer = service.waitForUpdate();

            await vi.advanceTimersByTimeAsync(WALLPAPER_AUTO_UPDATE_DELAY);

            // Assert
            await expect(answer).resolves.toMatchObject({ isUpdating: false, isGenerating: false });
            expect(vi.mocked(readPng).mock.invocationCallOrder.at(-1)).toBeGreaterThan(vi.mocked(rename).mock.invocationCallOrder[1]);
        });

        it('should answer the waiting requests when the application shuts down', async () => {
            // Arrange
            service.scheduleAutoUpdate();

            const answer = service.waitForUpdate();

            // Act
            await service.onApplicationShutdown();

            // Assert
            await expect(answer).resolves.toMatchObject({ isUpdating: false });
            expect(runGimpScript).not.toHaveBeenCalled();
        });
    });
});

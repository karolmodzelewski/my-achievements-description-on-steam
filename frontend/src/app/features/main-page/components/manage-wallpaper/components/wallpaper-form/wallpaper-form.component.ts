import { LiveAnnouncer } from '@angular/cdk/a11y';
import { DOCUMENT } from '@angular/common';
import type { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, DestroyRef, effect, inject, input, linkedSignal, signal, untracked } from '@angular/core';
import { rxResource, takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { disabled, form, FormField } from '@angular/forms/signals';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatOptgroup, MatOption } from '@angular/material/core';
import { MatFormField, MatHint, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatSelect } from '@angular/material/select';
import { MatTooltip } from '@angular/material/tooltip';

import type { Observable } from 'rxjs';
import { catchError, delay, EMPTY, filter, finalize, skip, switchMap, take, tap } from 'rxjs';

import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { ConfirmationService } from '../../../../../../components/confirmation/confirmation.service';
import { ErrorStateComponent } from '../../../../../../components/error-state/error-state.component';
import { FileDropZoneComponent } from '../../../../../../components/file-drop-zone/file-drop-zone.component';
import { InfobarComponent } from '../../../../../../components/infobar/infobar.component';
import { LoadingStateComponent } from '../../../../../../components/loading-state/loading-state.component';
import { SnackbarType } from '../../../../../../components/snackbar/enums/snackbar-type.enum';
import { SnackbarService } from '../../../../../../components/snackbar/snackbar.service';
import { WarnbarComponent } from '../../../../../../components/warnbar/warnbar.component';
import { CategoryKind } from '../../../../../../enums/category-kind.enum';
import { ErrorCode } from '../../../../../../enums/error-code.enum';
import type { Category } from '../../../../../../interfaces/category.interface';
import type { ErrorResponseBody } from '../../../../../../interfaces/error-response-body.interface';
import type { WallpaperSettings } from '../../../../../../interfaces/wallpaper-settings.interface';
import { WallpaperApiService } from '../../../../services/wallpaper-api.service';
import { WallpaperStatusService } from '../../../../services/wallpaper-status.service';

const DOWNLOADED_FILE_NAME = 'wallpaper.png';
const BYTES_IN_KILOBYTE = 1024;
const BYTES_IN_MEGABYTE = BYTES_IN_KILOBYTE * 1024;
// A 16:9 frame until the first wallpaper is generated
const DEFAULT_PREVIEW_VIEW_BOX = '0 0 16 9';

@Component({
    selector: 'mados-wallpaper-form',
    templateUrl: './wallpaper-form.component.html',
    styleUrl: './wallpaper-form.component.scss',
    imports: [
        InfobarComponent,
        WarnbarComponent,
        FileDropZoneComponent,
        LoadingStateComponent,
        ErrorStateComponent,
        FormField,
        MatFormField,
        MatLabel,
        MatHint,
        MatSuffix,
        MatSelect,
        MatOptgroup,
        MatOption,
        MatCheckbox,
        MatButton,
        MatIconButton,
        MatIcon,
        MatTooltip,
        TranslocoPipe,
    ],
})
export class WallpaperFormComponent {
    private readonly wallpaperApiService = inject(WallpaperApiService);
    private readonly wallpaperStatusService = inject(WallpaperStatusService);
    private readonly snackbarService = inject(SnackbarService);
    private readonly confirmationService = inject(ConfirmationService);
    private readonly translocoService = inject(TranslocoService);
    private readonly liveAnnouncer = inject(LiveAnnouncer);
    private readonly document = inject(DOCUMENT);

    public readonly mainCategories = input.required<Category[]>();
    public readonly lengthCategories = input.required<Category[]>();
    public readonly difficultyCategories = input.required<Category[]>();

    public readonly previewHeadingId = 'wallpaperPreviewHeading';

    public readonly wallpaperResource = rxResource({ stream: () => this.wallpaperApiService.getWallpaper() });
    public readonly pngResource = rxResource({
        params: () => this.wallpaper()?.png?.modifiedAt,
        stream: () => this.wallpaperApiService.getPng(),
    });

    public readonly previewUrl = signal<string | null>(null);
    public readonly isPreviewLoaded = signal<boolean>(false);
    public readonly isPreviewUpdating = signal<boolean>(false);
    public readonly isUploading = signal<boolean>(false);
    public readonly isRestoring = signal<boolean>(false);
    public readonly isGenerating = signal<boolean>(false);
    public readonly isSavingSettings = signal<boolean>(false);

    // Reset to the saved settings whenever they're loaded again, which also reverts a change that failed to save
    private readonly settingsModel = linkedSignal<WallpaperSettings>(() => ({
        excludedCategoryId: this.wallpaper()?.excludedCategoryId ?? null,
        isAutoGenerateEnabled: this.wallpaper()?.isAutoGenerateEnabled ?? true,
        isDesktopUpdateEnabled: this.wallpaper()?.isDesktopUpdateEnabled ?? false,
    }));

    public readonly settingsForm = form(this.settingsModel, (path) => {
        disabled(path, { when: () => this.isBusy() || !this.isGimpInstalled() });
        disabled(path.isDesktopUpdateEnabled, { when: () => !this.canUpdateDesktop() });
    });

    public readonly wallpaper = computed(() => (this.wallpaperResource.hasValue() ? this.wallpaperResource.value() : null));
    public readonly png = computed<Blob | null>(() => (this.pngResource.hasValue() ? this.pngResource.value() : null));
    public readonly isUpdating = computed<boolean>(() => this.wallpaper()?.isUpdating ?? false);
    public readonly isGimpInstalled = computed<boolean>(() => this.wallpaper()?.isGimpInstalled ?? false);
    public readonly canUpdateDesktop = computed<boolean>(() => this.wallpaper()?.canUpdateDesktop ?? false);
    public readonly isRequestPending = computed<boolean>(() => this.isUploading() || this.isRestoring() || this.isGenerating() || this.isSavingSettings());
    public readonly isBusy = computed<boolean>(() => this.isRequestPending() || this.wallpaperResource.isLoading());
    public readonly categoryGroups = computed(() =>
        [
            { kind: CategoryKind.MAIN, categories: this.mainCategories() },
            { kind: CategoryKind.LENGTH, categories: this.lengthCategories() },
            { kind: CategoryKind.DIFFICULTY, categories: this.difficultyCategories() },
        ].filter(({ categories }) => categories.length)
    );

    public readonly isAutoGenerated = computed<boolean>(() => this.isGimpInstalled() && this.settingsModel().isAutoGenerateEnabled);
    public readonly isDesktopUpdated = computed<boolean>(() => this.canUpdateDesktop() && this.settingsModel().isDesktopUpdateEnabled);
    public readonly canReplaceWallpaper = computed<boolean>(() => !this.isBusy() && this.isGimpInstalled());
    public readonly canGenerate = computed<boolean>(() => !this.isBusy() && this.isGimpInstalled() && !this.isAutoGenerated());
    public readonly canDownload = computed<boolean>(() => !this.isBusy() && this.png() !== null);
    public readonly isPreviewLoading = computed<boolean>(
        () => this.isPreviewUpdating() || this.isUpdating() || this.pngResource.isLoading() || (this.previewUrl() !== null && !this.isPreviewLoaded())
    );

    public readonly previewViewBox = computed<string>(() => {
        const png = this.wallpaper()?.png;

        return png ? `0 0 ${png.width} ${png.height}` : DEFAULT_PREVIEW_VIEW_BOX;
    });

    // Small wallpapers, like the default one, would show 0.0 MB
    public readonly pngSize = computed<string>(() => {
        const size = this.wallpaper()?.png?.size ?? 0;

        return size < BYTES_IN_MEGABYTE ? `${Math.max(1, Math.round(size / BYTES_IN_KILOBYTE))} KB` : `${(size / BYTES_IN_MEGABYTE).toFixed(1)} MB`;
    });

    constructor() {
        // The preview shows the PNG through an object URL, released once it's replaced or the form is destroyed
        effect((onCleanup) => {
            const png = this.png();

            this.isPreviewLoaded.set(false);

            if (!png) {
                this.previewUrl.set(null);

                return;
            }

            const url = URL.createObjectURL(png);

            this.previewUrl.set(url);
            onCleanup(() => URL.revokeObjectURL(url));
        });

        // Every request ends with loading the wallpaper again, after which a changed PNG is already being fetched
        effect(() => {
            if (this.wallpaperResource.isLoading()) {
                return;
            }

            this.isPreviewUpdating.set(false);
        });

        // The wallpaper checked by the page while it's updated in the background, set without loading the resource, so the form isn't disabled meanwhile
        toObservable(this.wallpaperStatusService.wallpaper)
            .pipe(
                skip(1),
                filter((wallpaper) => wallpaper !== null),
                takeUntilDestroyed()
            )
            .subscribe((wallpaper) => this.wallpaperResource.set(wallpaper));

        // An update found out by the section itself, e.g. after saving the settings, is followed by the page too
        effect(() => {
            if (!this.isUpdating()) {
                return;
            }

            untracked(() => this.wallpaperStatusService.refreshStatus());
        });

        // Games, groups and categories can't be changed while the section generates the wallpaper
        effect(() => this.wallpaperStatusService.setGeneratingInSection(this.isRequestPending()));
        inject(DestroyRef).onDestroy(() => this.wallpaperStatusService.setGeneratingInSection(false));
    }

    public saveSettings(): void {
        if (this.isAutoGenerated() && this.settingsModel().excludedCategoryId !== this.wallpaper()?.excludedCategoryId) {
            this.isPreviewUpdating.set(true);
        }

        this.isSavingSettings.set(true);

        this.runRequest(
            this.wallpaperApiService.saveSettings(this.settingsModel()).pipe(
                // Keeps the form disabled a moment longer after saving the settings, so a quick request doesn't make it flicker
                delay(200)
            ),
            'manageWallpaper.settingsSuccess',
            'manageWallpaper.settingsError',
            () => this.isSavingSettings.set(false)
        )
            .pipe(take(1))
            .subscribe();
    }

    public clearExcludedCategory(event: MouseEvent): void {
        event.stopPropagation();
        this.settingsForm.excludedCategoryId().reset(null);
        this.settingsForm.excludedCategoryId().focusBoundControl();
        this.saveSettings();
    }

    public uploadXcf(file: File): void {
        this.isUploading.set(true);
        this.isPreviewUpdating.set(true);
        void this.liveAnnouncer.announce(this.translocoService.translate('manageWallpaper.uploading'));

        this.runRequest(this.wallpaperApiService.uploadXcf(file), 'manageWallpaper.uploadSuccess', 'manageWallpaper.uploadError', () => this.isUploading.set(false))
            .pipe(take(1))
            .subscribe();
    }

    public rejectFile(): void {
        this.snackbarService.openSnackbar(this.translocoService.translate('manageWallpaper.invalidFile'), SnackbarType.ERROR);
    }

    public restoreDefaultWallpaper(): void {
        this.confirmationService
            .openConfirmation({
                title: this.translocoService.translate('confirmation.restoreWallpaper.title'),
                questionStart: this.translocoService.translate('confirmation.restoreWallpaper.questionStart'),
                identifier: this.translocoService.translate('confirmation.restoreWallpaper.identifier'),
                questionEnd: this.translocoService.translate('confirmation.restoreWallpaper.questionEnd'),
            })
            .pipe(
                take(1),
                filter(Boolean),
                switchMap(() => {
                    this.isRestoring.set(true);
                    this.isPreviewUpdating.set(true);
                    void this.liveAnnouncer.announce(this.translocoService.translate('manageWallpaper.restoring'));

                    return this.runRequest(this.wallpaperApiService.restoreDefaultWallpaper(), 'manageWallpaper.restoreSuccess', 'manageWallpaper.restoreError', () => this.isRestoring.set(false));
                }),
                take(1)
            )
            .subscribe();
    }

    public generateWallpaper(): void {
        if (!this.canGenerate()) {
            return;
        }

        this.isGenerating.set(true);
        this.isPreviewUpdating.set(true);
        void this.liveAnnouncer.announce(this.translocoService.translate('manageWallpaper.generating'));

        this.runRequest(this.wallpaperApiService.generateWallpaper(), 'manageWallpaper.generateSuccess', 'manageWallpaper.generateError', () => this.isGenerating.set(false))
            .pipe(take(1))
            .subscribe();
    }

    public downloadPng(): void {
        const previewUrl = this.previewUrl();

        if (previewUrl === null || !this.canDownload()) {
            return;
        }

        const link = this.document.createElement('a');

        link.href = previewUrl;
        link.download = DOWNLOADED_FILE_NAME;
        link.click();
    }

    private runRequest(request: Observable<unknown>, successKey: string, errorKey: string, onFinish: () => void): Observable<unknown> {
        return request.pipe(
            tap(() => {
                this.snackbarService.openSnackbar(this.translocoService.translate(successKey), SnackbarType.SUCCESS);
                this.wallpaperResource.reload();
            }),
            catchError(({ error }: HttpErrorResponse) => {
                this.snackbarService.openSnackbar(this.translocoService.translate(this.getErrorKey(error, errorKey)), SnackbarType.ERROR);
                // Reverts the settings to the saved ones
                this.wallpaperResource.reload();

                return EMPTY;
            }),
            finalize(onFinish)
        );
    }

    private getErrorKey(error: unknown, defaultKey: string): string {
        switch ((error as ErrorResponseBody | null)?.errorCode) {
            case ErrorCode.INVALID_WALLPAPER_FILE:
                return 'manageWallpaper.invalidFile';
            case ErrorCode.INVALID_WALLPAPER_TEXT_LAYERS:
                return 'manageWallpaper.invalidTextLayers';
            default:
                return defaultKey;
        }
    }
}

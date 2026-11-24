import type { LiveAnnouncer } from '@angular/cdk/a11y';
import { provideHttpClient } from '@angular/common/http';
import type { DebugElement } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { MatCheckboxHarness } from '@angular/material/checkbox/testing';
import { MatSelectHarness } from '@angular/material/select/testing';

import { NEVER, of, Subject } from 'rxjs';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TranslocoService } from '@jsverse/transloco';

import { WallpaperFormComponent } from './wallpaper-form.component';
import { WallpaperApiService } from '../../../../services/wallpaper-api.service';
import { WallpaperStatusService } from '../../../../services/wallpaper-status.service';
import { ConfirmationService } from '../../../../../../components/confirmation/confirmation.service';
import { SnackbarType } from '../../../../../../components/snackbar/enums/snackbar-type.enum';
import { SnackbarService } from '../../../../../../components/snackbar/snackbar.service';
import { CategoryKind } from '../../../../../../enums/category-kind.enum';
import { ErrorCode } from '../../../../../../enums/error-code.enum';
import type { Wallpaper } from '../../../../../../interfaces/wallpaper.interface';
import { buildCategory } from '../../../../../../../testing/builders/category.builders';
import { buildWallpaper, buildWallpaperPng } from '../../../../../../../testing/builders/wallpaper.builders';
import { clickByTestId, emitByTestId, getElementByTestId, getTextByTestId, isDisabledByTestId, queryByTestId } from '../../../../../../../testing/helpers/dom.helpers';
import { getHarnessByTestId } from '../../../../../../../testing/helpers/harness.helpers';
import { spyOnConfirmationService, spyOnLiveAnnouncer, spyOnSnackbarService, spyOnWallpaperApiService } from '../../../../../../../testing/helpers/service-spy.helpers';
import { mockErrorResponse } from '../../../../../../../testing/mocks/error-response.mocks';

describe('WallpaperFormComponent', () => {
    let component: WallpaperFormComponent;
    let fixture: ComponentFixture<WallpaperFormComponent>;
    let debugElement: DebugElement;
    let wallpaperApiService: WallpaperApiService;
    let wallpaperStatusService: WallpaperStatusService;
    let snackbarService: SnackbarService;
    let confirmationService: ConfirmationService;
    let liveAnnouncer: LiveAnnouncer;
    let translocoService: TranslocoService;

    const SETTINGS_SAVING_DELAY = 200;
    const previewUrl = 'blob:http://localhost/wallpaper';
    const lovedCategory = buildCategory({ id: 7, name: 'Loved game' });
    const shortCategory = buildCategory({ id: 8, kind: CategoryKind.LENGTH, name: 'Short' });
    const xcfFile = new File(['gimp xcf '], 'wallpaper.xcf');

    const createComponent = (): void => {
        fixture = TestBed.createComponent(WallpaperFormComponent);
        component = fixture.componentInstance;
        debugElement = fixture.debugElement;

        fixture.componentRef.setInput('mainCategories', [lovedCategory]);
        fixture.componentRef.setInput('lengthCategories', [shortCategory]);
        fixture.componentRef.setInput('difficultyCategories', []);
    };

    const mockWallpaper = (overrides: Partial<Wallpaper>): void => {
        vi.mocked(wallpaperApiService.getWallpaper).mockImplementation(() => of(buildWallpaper(overrides)));
    };

    const getCategorySelect = (): Promise<MatSelectHarness> => getHarnessByTestId(fixture, MatSelectHarness, 'excludedCategorySelect');

    const getCheckbox = (testId: 'autoGenerateCheckbox' | 'desktopUpdateCheckbox'): Promise<MatCheckboxHarness> => getHarnessByTestId(fixture, MatCheckboxHarness, testId);

    const expectSnackbar = (key: string, type: SnackbarType): void => {
        expect(snackbarService.openSnackbar).toHaveBeenCalledWith(translocoService.translate(key), type);
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [WallpaperFormComponent],
            providers: [provideHttpClient(), WallpaperApiService, WallpaperStatusService, SnackbarService, ConfirmationService],
        });

        wallpaperApiService = spyOnWallpaperApiService();
        snackbarService = spyOnSnackbarService();
        confirmationService = spyOnConfirmationService();
        liveAnnouncer = spyOnLiveAnnouncer();
        wallpaperStatusService = TestBed.inject(WallpaperStatusService);
        translocoService = TestBed.inject(TranslocoService);

        vi.spyOn(URL, 'createObjectURL').mockReturnValue(previewUrl);
        vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    });

    describe('after loading the wallpaper', () => {
        beforeEach(async () => {
            createComponent();
            await fixture.whenStable();
        });

        it('should create a component', () => {
            // Assert
            expect(component).toBeTruthy();
        });

        it('should explain how the wallpaper is generated', () => {
            // Assert
            expect(queryByTestId(debugElement, 'wallpaperInfobar')).not.toBeNull();
            expect(queryByTestId(debugElement, 'wallpaperWarnbar')).toBeNull();
            expect(getElementByTestId(debugElement, 'wallpaperFormContent').getAttribute('aria-busy')).toBe('false');
        });

        describe('preview', () => {
            it('should present the generated PNG once it is loaded', async () => {
                // Act
                await emitByTestId(fixture, 'wallpaperPreviewImage', 'load');

                // Assert
                const previewImage = getElementByTestId<HTMLImageElement>(debugElement, 'wallpaperPreviewImage');

                expect(wallpaperApiService.getPng).toHaveBeenCalledOnce();
                expect(previewImage.getAttribute('src')).toBe(previewUrl);
                expect(previewImage.alt).toBe('Wallpaper preview with the text 10');
                expect(queryByTestId(debugElement, 'wallpaperPreviewLoading')).toBeNull();
            });

            it('should present the loading state until the PNG is loaded', () => {
                // Assert
                expect(queryByTestId(debugElement, 'wallpaperPreviewLoading')).not.toBeNull();
            });

            it('should present the text and the size of the wallpaper', () => {
                // Assert
                expect(getTextByTestId(debugElement, 'wallpaperPreviewCaption')).toBe('Current text: 10');
                expect(getTextByTestId(debugElement, 'wallpaperPreviewDetails')).toBe('1920 × 1080 px, 2 KB');
            });

            it('should download the PNG', async () => {
                // Arrange
                const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);

                // Act
                await clickByTestId(fixture, 'downloadWallpaperButton');

                // Assert
                const [link] = clickSpy.mock.contexts as HTMLAnchorElement[];

                expect(clickSpy).toHaveBeenCalledOnce();
                expect(link.href).toBe(previewUrl);
                expect(link.download).toBe('wallpaper.png');
            });

            it('should present the wallpaper updated in the background without disabling the form', async () => {
                // Arrange
                mockWallpaper({ text: '11' });

                // Act
                wallpaperStatusService.refreshStatus();
                await fixture.whenStable();

                // Assert
                expect(getTextByTestId(debugElement, 'wallpaperPreviewCaption')).toBe('Current text: 11');
                expect(getElementByTestId(debugElement, 'wallpaperFormContent').getAttribute('aria-busy')).toBe('false');
            });
        });

        describe('settings', () => {
            beforeEach(() => {
                vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] });
            });

            afterEach(() => {
                vi.useRealTimers();
            });

            const finishSaving = async (): Promise<void> => {
                await vi.advanceTimersByTimeAsync(SETTINGS_SAVING_DELAY);
                await fixture.whenStable();
            };

            it('should offer the categories grouped by their kinds without the kinds without categories', async () => {
                // Arrange
                const categorySelect = await getCategorySelect();

                // Act
                await categorySelect.open();

                // Assert
                const optionGroups = await categorySelect.getOptionGroups();

                expect(await Promise.all(optionGroups.map(async (optionGroup) => optionGroup.getLabelText()))).toEqual(['Main categories', 'Length categories']);
                expect(await Promise.all((await categorySelect.getOptions()).map(async (option) => option.getText()))).toEqual(['Loved game', 'Short']);
            });

            it('should save the category left out and keep the form disabled for a moment', async () => {
                // Act
                await (await getCategorySelect()).clickOptions({ text: 'Short' });

                // Assert
                expect(wallpaperApiService.saveSettings).toHaveBeenCalledWith({ excludedCategoryId: shortCategory.id, isAutoGenerateEnabled: false, isDesktopUpdateEnabled: false });
                expect(await (await getCategorySelect()).isDisabled()).toBe(true);
                expect(snackbarService.openSnackbar).not.toHaveBeenCalled();
            });

            it('should inform about the saved settings and load the wallpaper again', async () => {
                // Arrange
                await (await getCategorySelect()).clickOptions({ text: 'Short' });

                // Act
                await finishSaving();

                // Assert
                expectSnackbar('manageWallpaper.settingsSuccess', SnackbarType.SUCCESS);
                expect(wallpaperApiService.getWallpaper).toHaveBeenCalledTimes(2);
                expect(await (await getCategorySelect()).isDisabled()).toBe(false);
            });

            it('should not fetch the same PNG again after saving the settings', async () => {
                // Arrange
                await (await getCategorySelect()).clickOptions({ text: 'Short' });

                // Act
                await finishSaving();

                // Assert
                expect(wallpaperApiService.getPng).toHaveBeenCalledOnce();
            });

            it('should inform about an error while saving and revert to the saved settings', async () => {
                // Arrange
                vi.mocked(wallpaperApiService.saveSettings).mockReturnValue(mockErrorResponse());

                // Act
                await (await getCategorySelect()).clickOptions({ text: 'Short' });

                // Assert
                expectSnackbar('manageWallpaper.settingsError', SnackbarType.ERROR);
                expect(await (await getCategorySelect()).getValueText()).toBe('');
            });

            it('should save turning the automatic generation on', async () => {
                // Act
                await (await getCheckbox('autoGenerateCheckbox')).check();

                // Assert
                expect(wallpaperApiService.saveSettings).toHaveBeenCalledWith({ excludedCategoryId: null, isAutoGenerateEnabled: true, isDesktopUpdateEnabled: false });
            });

            it('should not allow updating the desktop wallpaper outside production on Windows', async () => {
                // Assert
                expect(await (await getCheckbox('desktopUpdateCheckbox')).isDisabled()).toBe(true);
            });
        });

        describe('uploading', () => {
            it('should upload the chosen file, inform about it and load the wallpaper again', async () => {
                // Act
                await emitByTestId(fixture, 'wallpaperDropZone', 'fileSelected', xcfFile);

                // Assert
                expect(wallpaperApiService.uploadXcf).toHaveBeenCalledWith(xcfFile);
                expect(liveAnnouncer.announce).toHaveBeenCalledWith('Uploading...');
                expectSnackbar('manageWallpaper.uploadSuccess', SnackbarType.SUCCESS);
                expect(wallpaperApiService.getWallpaper).toHaveBeenCalledTimes(2);
            });

            it('should disable the form while the file is uploaded', async () => {
                // Arrange
                vi.mocked(wallpaperApiService.uploadXcf).mockReturnValue(new Subject<void>());

                // Act
                await emitByTestId(fixture, 'wallpaperDropZone', 'fileSelected', xcfFile);

                // Assert
                expect(getTextByTestId(debugElement, 'fileDropZoneButton')).toBe('Uploading...');
                expect(isDisabledByTestId(debugElement, 'fileDropZoneButton')).toBe(true);
                expect(isDisabledByTestId(debugElement, 'restoreWallpaperButton')).toBe(true);
                expect(isDisabledByTestId(debugElement, 'generateWallpaperButton')).toBe(true);
                expect(isDisabledByTestId(debugElement, 'downloadWallpaperButton')).toBe(true);
                expect(await (await getCategorySelect()).isDisabled()).toBe(true);
                expect(getElementByTestId(debugElement, 'wallpaperFormContent').getAttribute('aria-busy')).toBe('true');
                expect(queryByTestId(debugElement, 'wallpaperPreviewLoading')).not.toBeNull();
            });

            it.each([
                { reason: 'a file which is not an XCF', errorCode: ErrorCode.INVALID_WALLPAPER_FILE, key: 'manageWallpaper.invalidFile' },
                { reason: 'an XCF without exactly one text layer', errorCode: ErrorCode.INVALID_WALLPAPER_TEXT_LAYERS, key: 'manageWallpaper.invalidTextLayers' },
                { reason: 'any other error', errorCode: undefined, key: 'manageWallpaper.uploadError' },
            ])('should inform about $reason rejected while uploading', async ({ errorCode, key }) => {
                // Arrange
                vi.mocked(wallpaperApiService.uploadXcf).mockReturnValue(mockErrorResponse({ message: 'Rejected', errorCode }));

                // Act
                await emitByTestId(fixture, 'wallpaperDropZone', 'fileSelected', xcfFile);

                // Assert
                expectSnackbar(key, SnackbarType.ERROR);
                expect(isDisabledByTestId(debugElement, 'fileDropZoneButton')).toBe(false);
            });

            it('should inform about the file rejected by the drop zone', async () => {
                // Act
                await emitByTestId(fixture, 'wallpaperDropZone', 'fileRejected');

                // Assert
                expectSnackbar('manageWallpaper.invalidFile', SnackbarType.ERROR);
                expect(wallpaperApiService.uploadXcf).not.toHaveBeenCalled();
            });
        });

        describe('restoring', () => {
            it('should restore the default wallpaper after confirmation', async () => {
                // Act
                await clickByTestId(fixture, 'restoreWallpaperButton');

                // Assert
                expect(confirmationService.openConfirmation).toHaveBeenCalledWith(expect.objectContaining({ title: 'Restore default wallpaper', identifier: 'the current wallpaper' }));
                expect(wallpaperApiService.restoreDefaultWallpaper).toHaveBeenCalledOnce();
                expect(liveAnnouncer.announce).toHaveBeenCalledWith('Restoring...');
                expectSnackbar('manageWallpaper.restoreSuccess', SnackbarType.SUCCESS);
                expect(wallpaperApiService.getWallpaper).toHaveBeenCalledTimes(2);
            });

            it('should keep the wallpaper when restoring is not confirmed', async () => {
                // Arrange
                vi.mocked(confirmationService.openConfirmation).mockReturnValue(of(false));

                // Act
                await clickByTestId(fixture, 'restoreWallpaperButton');

                // Assert
                expect(wallpaperApiService.restoreDefaultWallpaper).not.toHaveBeenCalled();
            });

            it('should inform about an error while restoring', async () => {
                // Arrange
                vi.mocked(wallpaperApiService.restoreDefaultWallpaper).mockReturnValue(mockErrorResponse());

                // Act
                await clickByTestId(fixture, 'restoreWallpaperButton');

                // Assert
                expectSnackbar('manageWallpaper.restoreError', SnackbarType.ERROR);
            });
        });

        describe('generating', () => {
            it('should generate the wallpaper, inform about it and load the wallpaper again', async () => {
                // Act
                await clickByTestId(fixture, 'generateWallpaperButton');

                // Assert
                expect(wallpaperApiService.generateWallpaper).toHaveBeenCalledOnce();
                expect(liveAnnouncer.announce).toHaveBeenCalledWith('Generating...');
                expectSnackbar('manageWallpaper.generateSuccess', SnackbarType.SUCCESS);
                expect(wallpaperApiService.getWallpaper).toHaveBeenCalledTimes(2);
            });

            it('should fetch the generated PNG and release the previous preview', async () => {
                // Arrange
                mockWallpaper({ png: buildWallpaperPng({ modifiedAt: 2000 }) });

                // Act
                await clickByTestId(fixture, 'generateWallpaperButton');

                // Assert
                expect(wallpaperApiService.getPng).toHaveBeenCalledTimes(2);
                expect(URL.revokeObjectURL).toHaveBeenCalledWith(previewUrl);
            });

            it('should block changing games and categories while the wallpaper is generated', async () => {
                // Arrange
                vi.mocked(wallpaperApiService.generateWallpaper).mockReturnValue(new Subject<void>());

                // Act
                await clickByTestId(fixture, 'generateWallpaperButton');

                // Assert
                expect(wallpaperStatusService.isGenerating()).toBe(true);
                expect(getTextByTestId(debugElement, 'generateWallpaperButton')).toBe('Generating...');
                expect(isDisabledByTestId(debugElement, 'generateWallpaperButton')).toBe(true);
            });

            it('should unblock changing games and categories once the wallpaper is generated', async () => {
                // Act
                await clickByTestId(fixture, 'generateWallpaperButton');

                // Assert
                expect(wallpaperStatusService.isGenerating()).toBe(false);
            });

            it('should unblock changing games and categories when the form is destroyed while generating', async () => {
                // Arrange
                vi.mocked(wallpaperApiService.generateWallpaper).mockReturnValue(new Subject<void>());
                await clickByTestId(fixture, 'generateWallpaperButton');

                // Act
                fixture.destroy();

                // Assert
                expect(wallpaperStatusService.isGenerating()).toBe(false);
            });

            it('should inform about an error while generating', async () => {
                // Arrange
                vi.mocked(wallpaperApiService.generateWallpaper).mockReturnValue(mockErrorResponse());

                // Act
                await clickByTestId(fixture, 'generateWallpaperButton');

                // Assert
                expectSnackbar('manageWallpaper.generateError', SnackbarType.ERROR);
                expect(wallpaperStatusService.isGenerating()).toBe(false);
            });
        });
    });

    describe('depending on the loaded wallpaper', () => {
        it('should present the loading state until the wallpaper is loaded', () => {
            // Arrange
            vi.mocked(wallpaperApiService.getWallpaper).mockReturnValue(NEVER);

            // Act
            createComponent();
            fixture.detectChanges();

            // Assert
            expect(queryByTestId(debugElement, 'wallpaperLoadingState')).not.toBeNull();
            expect(queryByTestId(debugElement, 'wallpaperFormContent')).toBeNull();
        });

        it('should present the error state when the wallpaper could not be loaded', async () => {
            // Arrange
            vi.mocked(wallpaperApiService.getWallpaper).mockReturnValue(mockErrorResponse());

            // Act
            createComponent();
            await fixture.whenStable();

            // Assert
            expect(queryByTestId(debugElement, 'wallpaperErrorState')).not.toBeNull();
            expect(queryByTestId(debugElement, 'wallpaperFormContent')).toBeNull();
        });

        it('should warn and disable everything but downloading when GIMP is not installed', async () => {
            // Arrange
            mockWallpaper({ isGimpInstalled: false });

            // Act
            createComponent();
            await fixture.whenStable();

            // Assert
            expect(queryByTestId(debugElement, 'wallpaperWarnbar')).not.toBeNull();
            expect(queryByTestId(debugElement, 'wallpaperInfobar')).toBeNull();
            expect(isDisabledByTestId(debugElement, 'fileDropZoneButton')).toBe(true);
            expect(isDisabledByTestId(debugElement, 'restoreWallpaperButton')).toBe(true);
            expect(isDisabledByTestId(debugElement, 'generateWallpaperButton')).toBe(true);
            expect(isDisabledByTestId(debugElement, 'downloadWallpaperButton')).toBe(false);
            expect(await (await getCategorySelect()).isDisabled()).toBe(true);
            expect(await (await getCheckbox('autoGenerateCheckbox')).isDisabled()).toBe(true);
        });

        it('should present that the wallpaper has not been generated yet', async () => {
            // Arrange
            mockWallpaper({ text: null, png: null });

            // Act
            createComponent();
            await fixture.whenStable();

            // Assert
            expect(getTextByTestId(debugElement, 'wallpaperNoPreview')).toBe(`The wallpaper hasn't been generated yet`);
            expect(queryByTestId(debugElement, 'wallpaperPreviewImage')).toBeNull();
            expect(queryByTestId(debugElement, 'wallpaperPreviewCaption')).toBeNull();
            expect(isDisabledByTestId(debugElement, 'downloadWallpaperButton')).toBe(true);
            expect(wallpaperApiService.getPng).not.toHaveBeenCalled();
        });

        it.each([
            { reason: 'at least 1 KB for a tiny wallpaper', size: 100, details: '1920 × 1080 px, 1 KB' },
            { reason: 'kilobytes below 1 MB', size: 500 * 1024, details: '1920 × 1080 px, 500 KB' },
            { reason: 'megabytes from 1 MB', size: 5_431_091, details: '1920 × 1080 px, 5.2 MB' },
        ])('should present the size of the wallpaper in $reason', async ({ size, details }) => {
            // Arrange
            mockWallpaper({ png: buildWallpaperPng({ size }) });

            // Act
            createComponent();
            await fixture.whenStable();

            // Assert
            expect(getTextByTestId(debugElement, 'wallpaperPreviewDetails')).toBe(details);
        });

        it('should present the saved settings', async () => {
            // Arrange
            mockWallpaper({ excludedCategoryId: lovedCategory.id, isAutoGenerateEnabled: true });

            // Act
            createComponent();
            await fixture.whenStable();

            // Assert
            expect(await (await getCategorySelect()).getValueText()).toBe('Loved game');
            expect(await (await getCheckbox('autoGenerateCheckbox')).isChecked()).toBe(true);
            expect(await (await getCheckbox('desktopUpdateCheckbox')).isChecked()).toBe(false);
        });

        it('should clear the category left out, focus its field and save the settings', async () => {
            // Arrange
            mockWallpaper({ excludedCategoryId: lovedCategory.id });
            createComponent();
            await fixture.whenStable();

            // Act
            await clickByTestId(fixture, 'clearExcludedCategoryButton');

            // Assert
            expect(wallpaperApiService.saveSettings).toHaveBeenCalledWith({ excludedCategoryId: null, isAutoGenerateEnabled: false, isDesktopUpdateEnabled: false });
            expect(document.activeElement).toBe(getElementByTestId(debugElement, 'excludedCategorySelect'));
        });

        it('should not offer clearing the category left out when no category is left out', async () => {
            // Act
            createComponent();
            await fixture.whenStable();

            // Assert
            expect(queryByTestId(debugElement, 'clearExcludedCategoryButton')).toBeNull();
        });

        it('should present the preview as loading while the automatically generated wallpaper is updated with the changed category', async () => {
            // Arrange
            mockWallpaper({ isAutoGenerateEnabled: true });
            vi.mocked(wallpaperApiService.saveSettings).mockReturnValue(new Subject<void>());
            createComponent();
            await fixture.whenStable();
            await emitByTestId(fixture, 'wallpaperPreviewImage', 'load');

            // Act
            await (await getCategorySelect()).clickOptions({ text: 'Short' });

            // Assert
            expect(queryByTestId(debugElement, 'wallpaperPreviewLoading')).not.toBeNull();
        });

        it('should not allow generating by hand while the wallpaper is generated automatically', async () => {
            // Arrange
            mockWallpaper({ isAutoGenerateEnabled: true });
            createComponent();
            await fixture.whenStable();

            // Act
            await clickByTestId(fixture, 'generateWallpaperButton');

            // Assert
            expect(isDisabledByTestId(debugElement, 'generateWallpaperButton')).toBe(true);
            expect(wallpaperApiService.generateWallpaper).not.toHaveBeenCalled();
        });

        it('should offer updating the desktop wallpaper together with generating in production on Windows', async () => {
            // Arrange
            mockWallpaper({ canUpdateDesktop: true, isDesktopUpdateEnabled: true });

            // Act
            createComponent();
            await fixture.whenStable();

            // Assert
            expect(await (await getCheckbox('desktopUpdateCheckbox')).isDisabled()).toBe(false);
            expect(getTextByTestId(debugElement, 'generateWallpaperButton')).toBe('Generate and update');
        });

        it('should let the page follow the wallpaper updated in the background', async () => {
            // Arrange
            mockWallpaper({ isUpdating: true, isGenerating: true });

            // Act
            createComponent();
            await fixture.whenStable();

            // Assert
            expect(wallpaperApiService.waitForUpdate).toHaveBeenCalledOnce();
            expect(getTextByTestId(debugElement, 'wallpaperPreviewCaption')).toBe('Current text: 10');
        });
    });
});

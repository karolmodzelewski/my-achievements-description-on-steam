import { provideHttpClient } from '@angular/common/http';
import type { DebugElement } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import type { Mock } from 'vitest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TranslocoService } from '@jsverse/transloco';

import { OneHundredPercentFormComponent } from './one-hundred-percent-form.component';
import { CategoriesApiService } from '../../../../services/categories-api.service';
import { WallpaperApiService } from '../../../../services/wallpaper-api.service';
import { WallpaperStatusService } from '../../../../services/wallpaper-status.service';
import { SnackbarType } from '../../../../../../components/snackbar/enums/snackbar-type.enum';
import { SnackbarService } from '../../../../../../components/snackbar/snackbar.service';
import { CategoryKind } from '../../../../../../enums/category-kind.enum';
import { ErrorCode } from '../../../../../../enums/error-code.enum';
import type { CategoryRequestBody } from '../../../../../../interfaces/category-request-body.interface';
import { buildCategory } from '../../../../../../../testing/builders/category.builders';
import { clickByTestId, getElementByTestId, isDisabledByTestId, typeByTestId } from '../../../../../../../testing/helpers/dom.helpers';
import { mockErrorResponse } from '../../../../../../../testing/mocks/error-response.mocks';
import { spyOnCategoriesApiService, spyOnSnackbarService } from '../../../../../../../testing/helpers/service-spy.helpers';

describe('OneHundredPercentFormComponent', () => {
    let component: OneHundredPercentFormComponent;
    let fixture: ComponentFixture<OneHundredPercentFormComponent>;
    let debugElement: DebugElement;
    let categoriesApiService: CategoriesApiService;
    let snackbarService: SnackbarService;
    let translocoService: TranslocoService;
    let wallpaperStatusService: WallpaperStatusService;
    let categorySavedMock: Mock<() => void>;

    beforeEach(async () => {
        TestBed.configureTestingModule({
            imports: [OneHundredPercentFormComponent],
            providers: [provideHttpClient(), WallpaperApiService, WallpaperStatusService, CategoriesApiService, SnackbarService],
        });

        categorySavedMock = vi.fn();
        categoriesApiService = spyOnCategoriesApiService();
        snackbarService = spyOnSnackbarService();
        translocoService = TestBed.inject(TranslocoService);
        wallpaperStatusService = TestBed.inject(WallpaperStatusService);
        fixture = TestBed.createComponent(OneHundredPercentFormComponent);
        component = fixture.componentInstance;
        debugElement = fixture.debugElement;

        component.categorySaved.subscribe(categorySavedMock);
        fixture.componentRef.setInput('category', buildCategory({ id: 12, kind: CategoryKind.ONE_HUNDRED_PERCENT, name: '100%', description: null, iconName: ':100:' }));

        await fixture.whenStable();
    });

    it('should present the saved icon name', () => {
        // Assert
        expect(getElementByTestId<HTMLInputElement>(debugElement, 'oneHundredPercentIconInput').value).toBe(':100:');
    });

    it('should not allow saving without changes', () => {
        // Assert
        expect(isDisabledByTestId(debugElement, 'oneHundredPercentSaveButton')).toBe(true);
    });

    it('should allow saving a changed icon name', async () => {
        // Act
        await typeByTestId(fixture, 'oneHundredPercentIconInput', ':new:');

        // Assert
        expect(isDisabledByTestId(debugElement, 'oneHundredPercentSaveButton')).toBe(false);
    });

    it('should not allow saving an icon name containing only whitespaces', async () => {
        // Act
        await typeByTestId(fixture, 'oneHundredPercentIconInput', '   ');

        // Assert
        expect(isDisabledByTestId(debugElement, 'oneHundredPercentSaveButton')).toBe(true);
    });

    it('should not save the icon name when it was only surrounded with whitespaces', async () => {
        // Arrange
        await typeByTestId(fixture, 'oneHundredPercentIconInput', ' :100: ');

        // Act
        await clickByTestId(fixture, 'oneHundredPercentSaveButton');

        // Assert
        expect(categoriesApiService.saveCategories).not.toHaveBeenCalled();
        expect(isDisabledByTestId(debugElement, 'oneHundredPercentSaveButton')).toBe(true);
    });

    it('should clear the icon name after clicking the clear button', async () => {
        // Act
        await clickByTestId(fixture, 'oneHundredPercentClearButton');

        // Assert
        expect(getElementByTestId<HTMLInputElement>(debugElement, 'oneHundredPercentIconInput').value).toBe('');
        expect(isDisabledByTestId(debugElement, 'oneHundredPercentSaveButton')).toBe(true);
    });

    it('should save the trimmed icon name and inform about it', async () => {
        // Arrange
        await typeByTestId(fixture, 'oneHundredPercentIconInput', ' :new: ');

        // Act
        await clickByTestId(fixture, 'oneHundredPercentSaveButton');

        // Assert
        expect(categoriesApiService.saveCategories).toHaveBeenCalledWith(CategoryKind.ONE_HUNDRED_PERCENT, [
            { id: 12, name: '100%', iconName: ':new:', shouldHideGames: false },
        ] satisfies CategoryRequestBody[]);
        expect(snackbarService.openSnackbar).toHaveBeenCalledWith(translocoService.translate('oneHundredPercentForm.saveSuccess'), SnackbarType.SUCCESS);
        expect(categorySavedMock).toHaveBeenCalledTimes(1);
    });

    it('should inform about an error while saving the icon name', async () => {
        // Arrange
        vi.mocked(categoriesApiService.saveCategories).mockReturnValue(mockErrorResponse());
        await typeByTestId(fixture, 'oneHundredPercentIconInput', ':new:');

        // Act
        await clickByTestId(fixture, 'oneHundredPercentSaveButton');

        // Assert
        expect(snackbarService.openSnackbar).toHaveBeenCalledWith(translocoService.translate('oneHundredPercentForm.saveError'), SnackbarType.ERROR);
        expect(categorySavedMock).not.toHaveBeenCalled();
    });

    it('should not allow saving the icon name while the wallpaper is generated', async () => {
        // Arrange
        await typeByTestId(fixture, 'oneHundredPercentIconInput', ':new:');
        wallpaperStatusService.setGeneratingInSection(true);

        // Act
        await fixture.whenStable();

        // Assert
        expect(isDisabledByTestId(debugElement, 'oneHundredPercentSaveButton')).toBe(true);
    });

    it('should inform about the generated wallpaper instead of saving the icon name', async () => {
        // Arrange
        await typeByTestId(fixture, 'oneHundredPercentIconInput', ':new:');
        wallpaperStatusService.setGeneratingInSection(true);
        await fixture.whenStable();

        // Act
        await clickByTestId(fixture, 'oneHundredPercentSaveButton');

        // Assert
        expect(categoriesApiService.saveCategories).not.toHaveBeenCalled();
        expect(snackbarService.openSnackbar).toHaveBeenCalledWith(translocoService.translate('common.wallpaperGenerating'), SnackbarType.ERROR);
    });

    it('should inform about the generated wallpaper rejecting the icon name while saving', async () => {
        // Arrange
        vi.mocked(categoriesApiService.saveCategories).mockReturnValue(mockErrorResponse({ message: 'The wallpaper is being generated', errorCode: ErrorCode.WALLPAPER_GENERATING }));
        await typeByTestId(fixture, 'oneHundredPercentIconInput', ':new:');

        // Act
        await clickByTestId(fixture, 'oneHundredPercentSaveButton');

        // Assert
        expect(snackbarService.openSnackbar).toHaveBeenCalledWith(translocoService.translate('common.wallpaperGenerating'), SnackbarType.ERROR);
        expect(categorySavedMock).not.toHaveBeenCalled();
    });
});

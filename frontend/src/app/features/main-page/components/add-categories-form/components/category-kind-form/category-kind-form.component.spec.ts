import { provideHttpClient } from '@angular/common/http';
import type { LiveAnnouncer } from '@angular/cdk/a11y';
import type { DebugElement } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { MatCheckboxHarness } from '@angular/material/checkbox/testing';

import { of } from 'rxjs';

import type { Mock } from 'vitest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TranslocoService } from '@jsverse/transloco';

import { CategoryKindFormComponent } from './category-kind-form.component';
import { CategoriesApiService } from '../../../../services/categories-api.service';
import { ConfirmationService } from '../../../../../../components/confirmation/confirmation.service';
import { SnackbarType } from '../../../../../../components/snackbar/enums/snackbar-type.enum';
import { SnackbarService } from '../../../../../../components/snackbar/snackbar.service';
import { CategoryKind } from '../../../../../../enums/category-kind.enum';
import { ErrorCode } from '../../../../../../enums/error-code.enum';
import type { CategoryRequestBody } from '../../../../../../interfaces/category-request-body.interface';
import { buildCategory } from '../../../../../../../testing/builders/category.builders';
import {
    clickByTestId,
    emitByTestId,
    getElementByTestId,
    getInputValuesByTestId,
    isDisabledByTestId,
    pressKeyByTestId,
    queryAllByTestId,
    typeByTestId,
} from '../../../../../../../testing/helpers/dom.helpers';
import { getAllHarnessesByTestId } from '../../../../../../../testing/helpers/harness.helpers';
import { mockErrorResponse } from '../../../../../../../testing/mocks/error-response.mocks';
import { spyOnCategoriesApiService, spyOnConfirmationService, spyOnLiveAnnouncer, spyOnSnackbarService } from '../../../../../../../testing/helpers/service-spy.helpers';

describe('CategoryKindFormComponent', () => {
    let component: CategoryKindFormComponent;
    let fixture: ComponentFixture<CategoryKindFormComponent>;
    let debugElement: DebugElement;
    let categoriesApiService: CategoriesApiService;
    let snackbarService: SnackbarService;
    let confirmationService: ConfirmationService;
    let liveAnnouncer: LiveAnnouncer;
    let translocoService: TranslocoService;
    let categoriesSavedMock: Mock<() => void>;

    const lovedCategory = buildCategory({ id: 1, name: 'Loved', description: 'Loved game', iconName: ':loved:', position: 0 });
    const badCategory = buildCategory({ id: 2, name: 'Bad', description: 'Bad game', iconName: ':bad:', position: 1 });

    const getCategoriesNames = (): string[] => getInputValuesByTestId(debugElement, 'categoryNameInput');

    const fillNewCategory = async (index: number, name: string): Promise<void> => {
        await typeByTestId(fixture, 'categoryNameInput', name, index);
        await typeByTestId(fixture, 'categoryDescriptionInput', `${name} description`, index);
        await typeByTestId(fixture, 'categoryIconNameInput', `:${name}:`, index);
    };

    beforeEach(async () => {
        TestBed.configureTestingModule({
            imports: [CategoryKindFormComponent],
            providers: [provideHttpClient(), CategoriesApiService, SnackbarService, ConfirmationService],
        });

        categoriesSavedMock = vi.fn();
        categoriesApiService = spyOnCategoriesApiService();
        snackbarService = spyOnSnackbarService();
        confirmationService = spyOnConfirmationService();
        liveAnnouncer = spyOnLiveAnnouncer();
        translocoService = TestBed.inject(TranslocoService);
        fixture = TestBed.createComponent(CategoryKindFormComponent);
        component = fixture.componentInstance;
        debugElement = fixture.debugElement;

        component.categoriesSaved.subscribe(categoriesSavedMock);
        fixture.componentRef.setInput('kind', CategoryKind.MAIN);
        fixture.componentRef.setInput('categories', [lovedCategory, badCategory]);

        await fixture.whenStable();
    });

    it('should present the saved categories in their order', () => {
        // Assert
        expect(getCategoriesNames()).toEqual(['Loved', 'Bad']);
        expect(isDisabledByTestId(debugElement, 'categoriesSaveButton')).toBe(true);
    });

    it('should present a saved category without description with an empty description', async () => {
        // Arrange
        fixture.componentRef.setInput('categories', [buildCategory({ ...lovedCategory, description: null })]);

        // Act
        await fixture.whenStable();

        // Assert
        expect(getInputValuesByTestId(debugElement, 'categoryDescriptionInput')).toEqual(['']);
    });

    it('should clear the name and focus its field after clicking its clear button', async () => {
        // Act
        await clickByTestId(fixture, 'categoryNameClearButton', 0);

        // Assert
        expect(getCategoriesNames()).toEqual(['', 'Bad']);
        expect(document.activeElement).toBe(getElementByTestId(debugElement, 'categoryNameInput', 0));
        expect(isDisabledByTestId(debugElement, 'categoriesSaveButton')).toBe(true);
    });

    it('should add an empty category after the category of the clicked add button', async () => {
        // Act
        await clickByTestId(fixture, 'addCategoryButton', 0);

        // Assert
        expect(getCategoriesNames()).toEqual(['Loved', '', 'Bad']);
        expect(isDisabledByTestId(debugElement, 'categoriesSaveButton')).toBe(true);
    });

    it('should add the first category when there are no categories', async () => {
        // Arrange
        fixture.componentRef.setInput('categories', []);
        await fixture.whenStable();

        // Act
        await clickByTestId(fixture, 'addFirstCategoryButton');

        // Assert
        expect(getCategoriesNames()).toEqual(['']);
        expect(queryAllByTestId(debugElement, 'addFirstCategoryButton').length).toBe(0);
    });

    it('should remove a not saved category without confirmation', async () => {
        // Arrange
        await clickByTestId(fixture, 'addCategoryButton', 0);

        // Act
        await clickByTestId(fixture, 'removeCategoryButton', 1);

        // Assert
        expect(confirmationService.openConfirmation).not.toHaveBeenCalled();
        expect(getCategoriesNames()).toEqual(['Loved', 'Bad']);
    });

    it('should remove a saved category after confirmation', async () => {
        // Act
        await clickByTestId(fixture, 'removeCategoryButton', 0);

        // Assert
        expect(confirmationService.openConfirmation).toHaveBeenCalledWith(expect.objectContaining({ title: translocoService.translate('confirmation.delete.category.title'), identifier: 'Loved' }));
        expect(getCategoriesNames()).toEqual(['Bad']);
        expect(isDisabledByTestId(debugElement, 'categoriesSaveButton')).toBe(false);
    });

    it('should keep a saved category when its removal is not confirmed', async () => {
        // Arrange
        vi.mocked(confirmationService.openConfirmation).mockReturnValue(of(false));

        // Act
        await clickByTestId(fixture, 'removeCategoryButton', 0);

        // Assert
        expect(getCategoriesNames()).toEqual(['Loved', 'Bad']);
    });

    it('should focus the add button of the category above after removing a category', async () => {
        // Act
        await clickByTestId(fixture, 'removeCategoryButton', 1);

        // Assert
        expect(document.activeElement).toBe(getElementByTestId(debugElement, 'addCategoryButton', 0));
    });

    it('should focus the add first category button after removing the last category', async () => {
        // Arrange
        fixture.componentRef.setInput('categories', [lovedCategory]);
        await fixture.whenStable();

        // Act
        await clickByTestId(fixture, 'removeCategoryButton', 0);

        // Assert
        expect(document.activeElement).toBe(getElementByTestId(debugElement, 'addFirstCategoryButton'));
    });

    it('should move a category down with the keyboard and announce its new position', async () => {
        // Act
        await pressKeyByTestId(fixture, 'categoryDragHandle', 'ArrowDown', 0);

        // Assert
        expect(getCategoriesNames()).toEqual(['Bad', 'Loved']);
        expect(liveAnnouncer.announce).toHaveBeenCalledWith(translocoService.translate('categoryKindForm.categoryMoved', { name: 'Loved', position: 2, total: 2 }));
        expect(isDisabledByTestId(debugElement, 'categoriesSaveButton')).toBe(false);
    });

    it('should move a category up with the keyboard', async () => {
        // Act
        await pressKeyByTestId(fixture, 'categoryDragHandle', 'ArrowUp', 1);

        // Assert
        expect(getCategoriesNames()).toEqual(['Bad', 'Loved']);
    });

    it('should announce a moved category without name as a new category', async () => {
        // Arrange
        const newCategoryName = translocoService.translate('categoryKindForm.newCategory');

        await clickByTestId(fixture, 'addCategoryButton', 1);

        // Act
        await pressKeyByTestId(fixture, 'categoryDragHandle', 'ArrowUp', 2);

        // Assert
        expect(liveAnnouncer.announce).toHaveBeenCalledWith(translocoService.translate('categoryKindForm.categoryMoved', { name: newCategoryName, position: 2, total: 3 }));
    });

    it('should not move the first category up nor the last category down', async () => {
        // Act
        await pressKeyByTestId(fixture, 'categoryDragHandle', 'ArrowUp', 0);
        await pressKeyByTestId(fixture, 'categoryDragHandle', 'ArrowDown', 1);

        // Assert
        expect(getCategoriesNames()).toEqual(['Loved', 'Bad']);
        expect(liveAnnouncer.announce).not.toHaveBeenCalled();
    });

    it('should move a dropped category', async () => {
        // Act
        await emitByTestId(fixture, 'categoryRows', 'cdkDropListDropped', { previousIndex: 1, currentIndex: 0 });

        // Assert
        expect(getCategoriesNames()).toEqual(['Bad', 'Loved']);
    });

    it('should not change anything when a category is dropped in its place', async () => {
        // Act
        await emitByTestId(fixture, 'categoryRows', 'cdkDropListDropped', { previousIndex: 1, currentIndex: 1 });

        // Assert
        expect(getCategoriesNames()).toEqual(['Loved', 'Bad']);
        expect(isDisabledByTestId(debugElement, 'categoriesSaveButton')).toBe(true);
    });

    it('should not allow saving categories with the same trimmed names', async () => {
        // Act
        await typeByTestId(fixture, 'categoryNameInput', ' Bad ', 0);

        // Assert
        expect(isDisabledByTestId(debugElement, 'categoriesSaveButton')).toBe(true);
    });

    it('should allow hiding games only by main categories', async () => {
        // Arrange
        const mainCheckboxesAmount = queryAllByTestId(debugElement, 'categoryHideGamesCheckbox').length;

        fixture.componentRef.setInput('kind', CategoryKind.LENGTH);

        // Act
        await fixture.whenStable();

        // Assert
        expect(mainCheckboxesAmount).toBe(2);
        expect(queryAllByTestId(debugElement, 'categoryHideGamesCheckbox').length).toBe(0);
    });

    it('should not save categories without changes', async () => {
        // Act
        await clickByTestId(fixture, 'categoriesSaveButton');

        // Assert
        expect(categoriesApiService.saveCategories).not.toHaveBeenCalled();
    });

    it('should save trimmed categories in their order and inform about it', async () => {
        // Arrange
        await typeByTestId(fixture, 'categoryNameInput', ' Loved more ', 0);
        await clickByTestId(fixture, 'addCategoryButton', 0);
        await fillNewCategory(1, 'New');

        const checkboxes = await getAllHarnessesByTestId(fixture, MatCheckboxHarness, 'categoryHideGamesCheckbox');

        await checkboxes[1].check();

        // Act
        await clickByTestId(fixture, 'categoriesSaveButton');

        // Assert
        expect(categoriesApiService.saveCategories).toHaveBeenCalledWith(CategoryKind.MAIN, [
            { id: 1, name: 'Loved more', description: 'Loved game', iconName: ':loved:', shouldHideGames: false },
            { name: 'New', description: 'New description', iconName: ':New:', shouldHideGames: true },
            { id: 2, name: 'Bad', description: 'Bad game', iconName: ':bad:', shouldHideGames: false },
        ] satisfies CategoryRequestBody[]);
        expect(snackbarService.openSnackbar).toHaveBeenCalledWith(translocoService.translate(`categoryKind.${CategoryKind.MAIN}.saveSuccess`), SnackbarType.SUCCESS);
        expect(categoriesSavedMock).toHaveBeenCalledTimes(1);
    });

    it('should never save categories other than main ones as hiding games', async () => {
        // Arrange
        fixture.componentRef.setInput('kind', CategoryKind.LENGTH);
        fixture.componentRef.setInput('categories', [buildCategory({ ...lovedCategory, kind: CategoryKind.LENGTH, shouldHideGames: true })]);
        await fixture.whenStable();
        await typeByTestId(fixture, 'categoryNameInput', 'Long', 0);

        // Act
        await clickByTestId(fixture, 'categoriesSaveButton');

        // Assert
        expect(categoriesApiService.saveCategories).toHaveBeenCalledWith(CategoryKind.LENGTH, [
            { id: 1, name: 'Long', description: 'Loved game', iconName: ':loved:', shouldHideGames: false },
        ] satisfies CategoryRequestBody[]);
    });

    it('should inform about duplicated names rejected while saving', async () => {
        // Arrange
        vi.mocked(categoriesApiService.saveCategories).mockReturnValue(mockErrorResponse({ message: 'Duplicated', errorCode: ErrorCode.DUPLICATED_CATEGORY_NAME }));
        await pressKeyByTestId(fixture, 'categoryDragHandle', 'ArrowDown', 0);

        // Act
        await clickByTestId(fixture, 'categoriesSaveButton');

        // Assert
        expect(snackbarService.openSnackbar).toHaveBeenCalledWith(translocoService.translate('categoryKindForm.namesUnique'), SnackbarType.ERROR);
        expect(categoriesSavedMock).not.toHaveBeenCalled();
    });

    it('should inform about an error while saving', async () => {
        // Arrange
        vi.mocked(categoriesApiService.saveCategories).mockReturnValue(mockErrorResponse());
        await pressKeyByTestId(fixture, 'categoryDragHandle', 'ArrowDown', 0);

        // Act
        await clickByTestId(fixture, 'categoriesSaveButton');

        // Assert
        expect(snackbarService.openSnackbar).toHaveBeenCalledWith(translocoService.translate(`categoryKind.${CategoryKind.MAIN}.saveError`), SnackbarType.ERROR);
        expect(categoriesSavedMock).not.toHaveBeenCalled();
    });
});

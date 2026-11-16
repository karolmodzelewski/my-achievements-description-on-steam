import { provideHttpClient } from '@angular/common/http';
import type { ViewportScroller } from '@angular/common';
import type { DebugElement } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import type { Mock } from 'vitest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AddCategoriesFormComponent } from './add-categories-form.component';
import { CategoriesApiService } from '../../services/categories-api.service';
import { ConfirmationService } from '../../../../components/confirmation/confirmation.service';
import { SnackbarService } from '../../../../components/snackbar/snackbar.service';
import { CategoryKind } from '../../../../enums/category-kind.enum';
import { buildCategory } from '../../../../../testing/builders/category.builders';
import { clickByTestId, emitByTestId, getElementByTestId, queryAllByTestId, queryByTestId } from '../../../../../testing/helpers/dom.helpers';
import { spyOnViewportScroller } from '../../../../../testing/helpers/service-spy.helpers';

describe('AddCategoriesFormComponent', () => {
    let component: AddCategoriesFormComponent;
    let fixture: ComponentFixture<AddCategoriesFormComponent>;
    let debugElement: DebugElement;
    let viewportScroller: ViewportScroller;
    let categoriesSavedMock: Mock<() => void>;

    beforeEach(async () => {
        TestBed.configureTestingModule({
            imports: [AddCategoriesFormComponent],
            providers: [provideHttpClient(), CategoriesApiService, SnackbarService, ConfirmationService],
        });

        categoriesSavedMock = vi.fn();
        viewportScroller = spyOnViewportScroller();
        fixture = TestBed.createComponent(AddCategoriesFormComponent);
        component = fixture.componentInstance;
        debugElement = fixture.debugElement;

        component.categoriesSaved.subscribe(categoriesSavedMock);
        fixture.componentRef.setInput('oneHundredPercentCategory', buildCategory({ id: 12, kind: CategoryKind.ONE_HUNDRED_PERCENT, name: '100%', iconName: ':100:' }));
        fixture.componentRef.setInput('mainCategories', []);
        fixture.componentRef.setInput('lengthCategories', []);
        fixture.componentRef.setInput('difficultyCategories', []);

        await fixture.whenStable();
    });

    it('should create a component', () => {
        // Assert
        expect(component).toBeTruthy();
    });

    it('should hide the categories forms initially', () => {
        // Assert
        expect(queryByTestId(debugElement, 'oneHundredPercentForm')).toBeNull();
        expect(queryAllByTestId(debugElement, 'categoryKindForm').length).toBe(0);
        expect(getElementByTestId(debugElement, 'bottomExpansionButton').getAttribute('aria-expanded')).toBe('false');
    });

    it('should show the categories forms after clicking the expansion button', async () => {
        // Act
        await clickByTestId(fixture, 'bottomExpansionButton');

        // Assert
        expect(queryByTestId(debugElement, 'oneHundredPercentForm')).not.toBeNull();
        expect(queryAllByTestId(debugElement, 'categoryKindForm').length).toBe(3);
        expect(getElementByTestId(debugElement, 'bottomExpansionButton').getAttribute('aria-expanded')).toBe('true');
        expect(viewportScroller.scrollToAnchor).toHaveBeenCalledWith(component.headingId);
    });

    it('should focus the top collapse button after expanding', async () => {
        // Act
        await clickByTestId(fixture, 'bottomExpansionButton');

        // Assert
        expect(document.activeElement).toBe(getElementByTestId(debugElement, 'topCollapseButton'));
    });

    it('should hide the categories forms and focus the bottom button after clicking the top collapse button', async () => {
        // Arrange
        await clickByTestId(fixture, 'bottomExpansionButton');

        // Act
        await clickByTestId(fixture, 'topCollapseButton');

        // Assert
        expect(queryAllByTestId(debugElement, 'categoryKindForm').length).toBe(0);
        expect(queryByTestId(debugElement, 'topCollapseButton')).toBeNull();
        expect(document.activeElement).toBe(getElementByTestId(debugElement, 'bottomExpansionButton'));
    });

    it('should not present the 100% form without the 100% category', async () => {
        // Arrange
        fixture.componentRef.setInput('oneHundredPercentCategory', null);

        // Act
        await clickByTestId(fixture, 'bottomExpansionButton');

        // Assert
        expect(queryByTestId(debugElement, 'oneHundredPercentForm')).toBeNull();
        expect(queryAllByTestId(debugElement, 'categoryKindForm').length).toBe(3);
    });

    it('should inform about the saved 100% category', async () => {
        // Arrange
        await clickByTestId(fixture, 'bottomExpansionButton');

        // Act
        await emitByTestId(fixture, 'oneHundredPercentForm', 'categorySaved');

        // Assert
        expect(categoriesSavedMock).toHaveBeenCalledTimes(1);
    });

    it('should inform about the saved categories of every kind', async () => {
        // Arrange
        await clickByTestId(fixture, 'bottomExpansionButton');

        // Act
        await emitByTestId(fixture, 'categoryKindForm', 'categoriesSaved', undefined, 0);
        await emitByTestId(fixture, 'categoryKindForm', 'categoriesSaved', undefined, 1);
        await emitByTestId(fixture, 'categoryKindForm', 'categoriesSaved', undefined, 2);

        // Assert
        expect(categoriesSavedMock).toHaveBeenCalledTimes(3);
    });
});

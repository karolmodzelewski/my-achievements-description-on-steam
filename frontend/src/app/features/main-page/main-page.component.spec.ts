import { provideHttpClient } from '@angular/common/http';
import type { DebugElement } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { NEVER, of } from 'rxjs';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MainPageComponent } from './main-page.component';
import { CategoriesApiService } from './services/categories-api.service';
import { DescriptionApiService } from './services/description-api.service';
import { EditGameService } from './services/edit-game.service';
import { GameApiService } from './services/game-api.service';
import { ConfirmationService } from '../../components/confirmation/confirmation.service';
import { SnackbarService } from '../../components/snackbar/snackbar.service';
import { CategoryKind } from '../../enums/category-kind.enum';
import { buildCategory } from '../../../testing/builders/category.builders';
import { emitByTestId, queryByTestId } from '../../../testing/helpers/dom.helpers';
import { mockErrorResponse } from '../../../testing/mocks/error-response.mocks';
import { spyOnCategoriesApiService, spyOnDescriptionApiService } from '../../../testing/helpers/service-spy.helpers';

describe('MainPageComponent', () => {
    let component: MainPageComponent;
    let fixture: ComponentFixture<MainPageComponent>;
    let debugElement: DebugElement;
    let categoriesApiService: CategoriesApiService;
    let descriptionApiService: DescriptionApiService;

    const oneHundredPercentCategory = buildCategory({ id: 12, kind: CategoryKind.ONE_HUNDRED_PERCENT, name: '100%', description: null, iconName: ':100:' });

    const createComponent = (): void => {
        fixture = TestBed.createComponent(MainPageComponent);
        component = fixture.componentInstance;
        debugElement = fixture.debugElement;
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [MainPageComponent],
            providers: [provideHttpClient(), CategoriesApiService, DescriptionApiService, GameApiService, EditGameService, SnackbarService, ConfirmationService],
        });

        categoriesApiService = spyOnCategoriesApiService();
        descriptionApiService = spyOnDescriptionApiService();
        vi.mocked(categoriesApiService.getCategories).mockReturnValue(of([oneHundredPercentCategory]));
    });

    describe('after loading data', () => {
        beforeEach(async () => {
            createComponent();

            await fixture.whenStable();
        });

        it('should create a component', () => {
            // Assert
            expect(component).toBeTruthy();
        });

        it('should present the game form and the description when the 100% icon is set', () => {
            // Assert
            expect(queryByTestId(debugElement, 'addCategoriesForm')).not.toBeNull();
            expect(queryByTestId(debugElement, 'addGameForm')).not.toBeNull();
            expect(queryByTestId(debugElement, 'descriptionSection')).not.toBeNull();
            expect(queryByTestId(debugElement, 'mainPageInfobar')).toBeNull();
            expect(queryByTestId(debugElement, 'loadingState')).toBeNull();
        });

        it('should reload the categories and the description after saving categories', async () => {
            // Act
            await emitByTestId(fixture, 'addCategoriesForm', 'categoriesSaved');

            // Assert
            expect(categoriesApiService.getCategories).toHaveBeenCalledTimes(2);
            expect(descriptionApiService.getDescription).toHaveBeenCalledTimes(2);
        });

        it('should reload only the description after saving a game', async () => {
            // Act
            await emitByTestId(fixture, 'addGameForm', 'reloadDescription');

            // Assert
            expect(categoriesApiService.getCategories).toHaveBeenCalledTimes(1);
            expect(descriptionApiService.getDescription).toHaveBeenCalledTimes(2);
        });

        it('should reload only the description after deleting an entry of the description', async () => {
            // Act
            await emitByTestId(fixture, 'descriptionSection', 'reloadDescription');

            // Assert
            expect(categoriesApiService.getCategories).toHaveBeenCalledTimes(1);
            expect(descriptionApiService.getDescription).toHaveBeenCalledTimes(2);
        });
    });

    describe('depending on the loaded data', () => {
        it('should present the loading state until the data is loaded', () => {
            // Arrange
            vi.mocked(categoriesApiService.getCategories).mockReturnValue(NEVER);

            // Act
            createComponent();
            fixture.detectChanges();

            // Assert
            expect(queryByTestId(debugElement, 'loadingState')).not.toBeNull();
            expect(queryByTestId(debugElement, 'addCategoriesForm')).toBeNull();
        });

        it('should present the error state when the categories could not be loaded', async () => {
            // Arrange
            vi.mocked(categoriesApiService.getCategories).mockReturnValue(mockErrorResponse());

            // Act
            createComponent();
            await fixture.whenStable();

            // Assert
            expect(queryByTestId(debugElement, 'errorState')).not.toBeNull();
            expect(queryByTestId(debugElement, 'addCategoriesForm')).toBeNull();
        });

        it('should present the error state when the description could not be loaded', async () => {
            // Arrange
            vi.mocked(descriptionApiService.getDescription).mockReturnValue(mockErrorResponse());

            // Act
            createComponent();
            await fixture.whenStable();

            // Assert
            expect(queryByTestId(debugElement, 'errorState')).not.toBeNull();
        });

        it('should ask for the 100% icon instead of presenting the game form and the description when the icon is not set', async () => {
            // Arrange
            vi.mocked(categoriesApiService.getCategories).mockReturnValue(of([{ ...oneHundredPercentCategory, iconName: '' }]));

            // Act
            createComponent();
            await fixture.whenStable();

            // Assert
            expect(queryByTestId(debugElement, 'addCategoriesForm')).not.toBeNull();
            expect(queryByTestId(debugElement, 'mainPageInfobar')).not.toBeNull();
            expect(queryByTestId(debugElement, 'addGameForm')).toBeNull();
            expect(queryByTestId(debugElement, 'descriptionSection')).toBeNull();
        });

        it('should ask for the 100% icon when there is no 100% category', async () => {
            // Arrange
            vi.mocked(categoriesApiService.getCategories).mockReturnValue(of([]));

            // Act
            createComponent();
            await fixture.whenStable();

            // Assert
            expect(queryByTestId(debugElement, 'mainPageInfobar')).not.toBeNull();
        });
    });
});

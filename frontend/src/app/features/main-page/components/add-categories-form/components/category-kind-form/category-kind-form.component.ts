import type { CdkDragDrop } from '@angular/cdk/drag-drop';
import { CdkDrag, CdkDragHandle, CdkDragPreview, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import type { HttpErrorResponse } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, input, linkedSignal, output } from '@angular/core';
import type { FieldState } from '@angular/forms/signals';
import { applyEach, form, FormField, FormRoot, pattern, required, validate } from '@angular/forms/signals';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatError, MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';

import { catchError, filter, firstValueFrom, of, take, tap } from 'rxjs';

import type { CategoryFormModel } from './interfaces/category-form-model.interface';
import type { CategoryKindFormModel } from './interfaces/category-kind-form-model.interface';
import { ConfirmationService } from '../../../../../../components/confirmation/confirmation.service';
import { SnackbarType } from '../../../../../../components/snackbar/enums/snackbar-type.enum';
import { SnackbarService } from '../../../../../../components/snackbar/snackbar.service';
import { CategoryKind } from '../../../../../../enums/category-kind.enum';
import { ErrorCode } from '../../../../../../enums/error-code.enum';
import type { CategoryRequestBody } from '../../../../../../interfaces/category-request-body.interface';
import type { Category } from '../../../../../../interfaces/category.interface';
import type { ErrorResponseBody } from '../../../../../../interfaces/error-response-body.interface';
import { NOT_BLANK_PATTERN } from '../../../../constants/form.constants';
import { areJsonEqual } from '../../../../utils/json-equality.util';

@Component({
    selector: 'mados-category-kind-form',
    templateUrl: './category-kind-form.component.html',
    styleUrl: './category-kind-form.component.scss',
    imports: [CdkDropList, CdkDrag, CdkDragHandle, CdkDragPreview, FormRoot, FormField, MatFormField, MatLabel, MatError, MatSuffix, MatInput, MatIcon, MatIconButton, MatCheckbox, MatButton],
})
export class CategoryKindFormComponent {
    private readonly httpClient = inject(HttpClient);
    private readonly confirmationService = inject(ConfirmationService);
    private readonly snackbarService = inject(SnackbarService);

    public readonly kind = input.required<CategoryKind>();
    public readonly legend = input.required<string>();
    public readonly categories = input.required<Category[]>();

    public readonly categoriesSaved = output();

    private readonly categoriesModel = linkedSignal<CategoryKindFormModel>(() => this.buildCategoriesModel(this.categories()));

    public readonly categoriesForm = form(
        this.categoriesModel,
        (path) => {
            applyEach(path.categories, (categoryPath) => {
                required(categoryPath.name);
                pattern(categoryPath.name, NOT_BLANK_PATTERN);
                // Names are compared trimmed, the same way they are saved
                validate(categoryPath.name, ({ value, valueOf }) => {
                    const name = value().trim();
                    const isDuplicated = name !== '' && valueOf(path.categories).filter((category) => category.name.trim() === name).length > 1;

                    return isDuplicated ? { kind: 'unique' } : null;
                });
                required(categoryPath.description);
                pattern(categoryPath.description, NOT_BLANK_PATTERN);
                required(categoryPath.iconName);
                pattern(categoryPath.iconName, NOT_BLANK_PATTERN);
            });
        },
        { submission: { action: () => this.saveCategories() } }
    );

    public readonly lowerCaseLegend = computed<string>(() => this.legend().toLowerCase());
    // Only main categories can hide games, length and difficulty categories are always listed with the game
    public readonly canHideGames = computed<boolean>(() => this.kind() === CategoryKind.MAIN);
    public readonly hasNoCategories = computed<boolean>(() => !this.categoriesModel().categories.length);
    public readonly hasChanges = computed<boolean>(() => !areJsonEqual(this.prepareRequestBody(this.categoriesModel()), this.prepareRequestBody(this.buildCategoriesModel(this.categories()))));

    public clearField(event: MouseEvent, field: () => FieldState<string>): void {
        event.stopPropagation();
        field().reset('');
        field().focusBoundControl();
    }

    public addCategory(index: number): void {
        const newCategory: CategoryFormModel = { id: null, name: '', description: '', iconName: '', shouldHideGames: false };

        this.categoriesModel.update((categoriesModel) => ({
            ...categoriesModel,
            categories: [...categoriesModel.categories.slice(0, index), newCategory, ...categoriesModel.categories.slice(index)],
        }));
    }

    // The new order is saved only after saving the form, the same way as added and removed categories
    public moveCategory({ previousIndex, currentIndex }: CdkDragDrop<unknown>): void {
        if (previousIndex === currentIndex) {
            return;
        }

        this.categoriesModel.update((categoriesModel) => {
            const categories = [...categoriesModel.categories];

            moveItemInArray(categories, previousIndex, currentIndex);

            return { ...categoriesModel, categories };
        });
    }

    // A saved category is deleted only after saving the form, so its removal is confirmed first
    public removeCategory(index: number): void {
        const category = this.categoriesModel().categories[index];
        const savedCategory = this.categories().find(({ id }) => id === category.id);

        if (!savedCategory) {
            this.removeCategoryFromModel(category);

            return;
        }

        this.confirmationService
            .openConfirmation({
                title: 'Delete category',
                question: 'Are you sure you want to delete',
                identifier: savedCategory.name,
                identifierType: 'category',
            })
            .pipe(take(1), filter(Boolean))
            .subscribe(() => this.removeCategoryFromModel(category));
    }

    private removeCategoryFromModel(removedCategory: CategoryFormModel): void {
        this.categoriesModel.update((categoriesModel) => ({ ...categoriesModel, categories: categoriesModel.categories.filter((category) => category !== removedCategory) }));
    }

    private saveCategories(): Promise<void> {
        return firstValueFrom(
            this.httpClient.put<void>(`categories/${this.kind()}`, this.prepareRequestBody(this.categoriesModel())).pipe(
                tap(() => {
                    this.snackbarService.openSnackbar(`Successfully saved ${this.lowerCaseLegend()}`, SnackbarType.SUCCESS);
                    this.categoriesSaved.emit();
                }),
                catchError(({ error }: HttpErrorResponse) => {
                    const errorResponseBody = error as ErrorResponseBody | null;
                    const message =
                        errorResponseBody?.errorCode === ErrorCode.DUPLICATED_CATEGORY_NAME ? 'Category names have to be unique' : `An error has occurred while saving ${this.lowerCaseLegend()}`;

                    this.snackbarService.openSnackbar(message, SnackbarType.ERROR);

                    return of(undefined);
                })
            )
        );
    }

    // The order of categories in the request is their order in the description
    private prepareRequestBody({ categories }: CategoryKindFormModel): CategoryRequestBody[] {
        return categories.map(({ id, name, description, iconName, shouldHideGames }) => ({
            ...(id === null ? {} : { id }),
            name: name.trim(),
            description: description.trim(),
            iconName: iconName.trim(),
            shouldHideGames: this.canHideGames() && shouldHideGames,
        }));
    }

    private buildCategoriesModel(categories: Category[]): CategoryKindFormModel {
        return {
            categories: categories.map(({ id, name, description, iconName, shouldHideGames }) => ({ id, name, description: description ?? '', iconName, shouldHideGames })),
        };
    }
}

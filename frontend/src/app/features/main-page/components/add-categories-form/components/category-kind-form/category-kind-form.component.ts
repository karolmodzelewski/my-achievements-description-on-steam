import { LiveAnnouncer } from '@angular/cdk/a11y';
import type { CdkDragDrop } from '@angular/cdk/drag-drop';
import { CdkDrag, CdkDragHandle, CdkDragPreview, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import type { HttpErrorResponse } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { afterNextRender, Component, computed, inject, Injector, input, linkedSignal, output, viewChild, viewChildren } from '@angular/core';
import type { FieldState } from '@angular/forms/signals';
import { applyEach, form, FormField, FormRoot, pattern, required, validate } from '@angular/forms/signals';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatError, MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';

import { catchError, filter, firstValueFrom, of, take, tap } from 'rxjs';

import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

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
    imports: [
        CdkDropList,
        CdkDrag,
        CdkDragHandle,
        CdkDragPreview,
        FormRoot,
        FormField,
        MatFormField,
        MatLabel,
        MatError,
        MatSuffix,
        MatInput,
        MatIcon,
        MatIconButton,
        MatCheckbox,
        MatButton,
        TranslocoPipe,
    ],
})
export class CategoryKindFormComponent {
    private readonly httpClient = inject(HttpClient);
    private readonly confirmationService = inject(ConfirmationService);
    private readonly snackbarService = inject(SnackbarService);
    private readonly translocoService = inject(TranslocoService);
    private readonly liveAnnouncer = inject(LiveAnnouncer);
    private readonly injector = inject(Injector);

    private readonly dragHandles = viewChildren('dragHandle', { read: MatIconButton });
    private readonly addCategoryButtons = viewChildren('addCategoryButton', { read: MatIconButton });
    private readonly addFirstCategoryButton = viewChild('addFirstCategoryButton', { read: MatButton });

    public readonly kind = input.required<CategoryKind>();
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

    public readonly kindKeyPrefix = computed<string>(() => `categoryKind.${this.kind()}`);
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

        this.reorderCategories(previousIndex, currentIndex);
    }

    public moveCategoryWithKeyboard(event: Event, index: number, offset: number): void {
        const { categories } = this.categoriesModel();
        const targetIndex = index + offset;

        event.preventDefault();

        if (targetIndex < 0 || targetIndex >= categories.length) {
            return;
        }

        const categoryName = categories[index].name.trim() || this.translocoService.translate('categoryKindForm.newCategory');

        this.reorderCategories(index, targetIndex);
        void this.liveAnnouncer.announce(this.translocoService.translate('categoryKindForm.categoryMoved', { name: categoryName, position: targetIndex + 1, total: categories.length }));
        afterNextRender(() => this.dragHandles().at(targetIndex)?.focus(), { injector: this.injector });
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
                title: this.translocoService.translate('confirmation.delete.category.title'),
                questionStart: this.translocoService.translate('confirmation.delete.category.questionStart'),
                identifier: savedCategory.name,
                questionEnd: this.translocoService.translate('confirmation.delete.category.questionEnd'),
            })
            .pipe(take(1), filter(Boolean))
            .subscribe(() => this.removeCategoryFromModel(category));
    }

    private reorderCategories(previousIndex: number, currentIndex: number): void {
        this.categoriesModel.update((categoriesModel) => {
            const categories = [...categoriesModel.categories];

            moveItemInArray(categories, previousIndex, currentIndex);

            return { ...categoriesModel, categories };
        });
    }

    private removeCategoryFromModel(removedCategory: CategoryFormModel): void {
        const removedIndex = this.categoriesModel().categories.indexOf(removedCategory);

        this.categoriesModel.update((categoriesModel) => ({ ...categoriesModel, categories: categoriesModel.categories.filter((category) => category !== removedCategory) }));
        afterNextRender(() => this.focusAfterRemoval(removedIndex), { injector: this.injector });
    }

    // The removed category takes its focused button with it. The add button of the category above restores the same position,
    // while focusing another remove button would let repeated key presses remove several categories by accident
    private focusAfterRemoval(removedIndex: number): void {
        const addCategoryButton = this.addCategoryButtons().at(Math.max(removedIndex - 1, 0)) ?? this.addFirstCategoryButton();

        addCategoryButton?.focus();
    }

    private saveCategories(): Promise<void> {
        // The save button stays focusable while there is nothing to save, so its submission has to be ignored here
        if (!this.hasChanges()) {
            return Promise.resolve();
        }

        return firstValueFrom(
            this.httpClient.put<void>(`categories/${this.kind()}`, this.prepareRequestBody(this.categoriesModel())).pipe(
                tap(() => {
                    this.snackbarService.openSnackbar(this.translocoService.translate(`${this.kindKeyPrefix()}.saveSuccess`), SnackbarType.SUCCESS);
                    this.categoriesSaved.emit();
                }),
                catchError(({ error }: HttpErrorResponse) => {
                    const errorResponseBody = error as ErrorResponseBody | null;
                    const messageKey = errorResponseBody?.errorCode === ErrorCode.DUPLICATED_CATEGORY_NAME ? 'categoryKindForm.namesUnique' : `${this.kindKeyPrefix()}.saveError`;

                    this.snackbarService.openSnackbar(this.translocoService.translate(messageKey), SnackbarType.ERROR);

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

import { ViewportScroller } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, input, linkedSignal, output, signal } from '@angular/core';
import type { FieldTree } from '@angular/forms/signals';
import { applyEach, form, FormField, FormRoot, required } from '@angular/forms/signals';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatError, MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';

import { catchError, firstValueFrom, of, tap } from 'rxjs';

import { ExpansionButtonTextComponent } from './components/expansion-button-text/expansion-button-text.component';
import type { CategoryFormModel } from './interfaces/category-form-model.interface';
import { SnackbarType } from '../../../../components/snackbar/enums/snackbar-type.enum';
import { SnackbarService } from '../../../../components/snackbar/snackbar.service';
import { CategoryType } from '../../../../enums/category-type.enum';
import type { CategoryRequestBody } from '../../../../interfaces/category-request-body.interface';
import type { Category } from '../../../../interfaces/category.interface';
import { CategoryTypeTranslationComponent } from '../category-type-translation/category-type-translation.component';
import { SectionHeadingComponent } from '../section-heading/section-heading.component';

const CATEGORY_TYPES = [
    CategoryType.LONG_GAME,
    CategoryType.VERY_LONG_GAME,
    CategoryType.ULTRA_LONG_GAME,
    CategoryType.HARD_GAME,
    CategoryType.VERY_HARD_GAME,
    CategoryType.ULTRA_HARD_GAME,
    CategoryType.LOVED_GAME,
    CategoryType.BAD_GAME,
    CategoryType.DOESNT_COUNT,
    CategoryType.BUGGED_GAME,
    CategoryType.ADULT_GAME,
    CategoryType.ONE_HUNDRED_PERCENT,
];

@Component({
    selector: 'mados-add-categories-form',
    templateUrl: './add-categories-form.component.html',
    styleUrl: './add-categories-form.component.scss',
    imports: [
        SectionHeadingComponent,
        FormRoot,
        FormField,
        CategoryTypeTranslationComponent,
        MatFormField,
        MatLabel,
        MatError,
        MatSuffix,
        MatInput,
        MatIcon,
        MatIconButton,
        MatButton,
        ExpansionButtonTextComponent,
    ],
})
export class AddCategoriesFormComponent {
    private readonly httpClient = inject(HttpClient);
    private readonly viewportScroller = inject(ViewportScroller);
    private readonly snackbarService = inject(SnackbarService);

    public readonly categories = input.required<Category[]>();

    public readonly reloadDescription = output();

    public readonly headingText = 'Add categories';
    public readonly headingId = 'addCategoriesHeading';
    public readonly categoriesFormId = 'addCategoriesForm';
    public readonly CategoryType = CategoryType;
    public readonly shouldShowCategories = signal<boolean>(false);

    private readonly categoriesModel = linkedSignal<CategoryFormModel[]>(() => this.buildCategoriesModel(this.categories()));

    public readonly categoriesForm = form(
        this.categoriesModel,
        (path) => {
            applyEach(path, (category) => {
                required(category.iconName);
                required(category.description, { when: ({ valueOf }) => valueOf(category.type) !== CategoryType.ONE_HUNDRED_PERCENT });
            });
        },
        { submission: { action: () => this.saveCategories() } }
    );

    public handleCategoriesVisibility(): void {
        this.shouldShowCategories.update((shouldShowCategories) => !shouldShowCategories);

        this.viewportScroller.scrollToAnchor(this.headingId);
    }

    public clearField(field: FieldTree<string>): void {
        field().reset('');
        field().focusBoundControl();
    }

    private saveCategories(): Promise<void> {
        return firstValueFrom(
            this.httpClient.post<void>('categories', this.prepareRequestBody()).pipe(
                tap(() => {
                    this.snackbarService.openSnackbar('Successfully saved categories', SnackbarType.SUCCESS);
                    this.reloadDescription.emit();
                }),
                catchError(() => {
                    this.snackbarService.openSnackbar('An error has occurred while saving categories', SnackbarType.ERROR);

                    return of(undefined);
                })
            )
        );
    }

    private prepareRequestBody(): CategoryRequestBody[] {
        return this.categoriesModel().map(({ type, iconName, description }) =>
            type === CategoryType.ONE_HUNDRED_PERCENT ? { type, iconName: iconName.trim() } : { type, iconName: iconName.trim(), description: description.trim() }
        );
    }

    private buildCategoriesModel(categories: Category[]): CategoryFormModel[] {
        return CATEGORY_TYPES.map((type) => {
            const savedCategory = categories.find((category) => category.type === type);

            return {
                type,
                iconName: savedCategory?.iconName ?? '',
                description: savedCategory?.description ?? '',
            };
        });
    }
}

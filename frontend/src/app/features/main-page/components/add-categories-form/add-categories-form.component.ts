import { KeyValuePipe, ViewportScroller } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import type { InputSignal, OnInit, OutputEmitterRef, WritableSignal } from '@angular/core';
import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import type { AbstractControl } from '@angular/forms';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { catchError, EMPTY, take } from 'rxjs';

import { ExpansionButtonTextComponent } from './components/expansion-button-text/expansion-button-text.component';
import type { CategoryFormControls } from './interfaces/category-form-controls.interface';
import { SnackbarService } from '../../../../components/snackbar/snackbar.service';
import { CategoryType } from '../../../../enums/category-type.enum';
import { ViewState } from '../../../../enums/view-state.enum';
import type { CategoryRequestBody } from '../../../../interfaces/category-request-body.interface';
import type { Category } from '../../../../interfaces/category.interface';
import { CategoryTypeTranslationComponent } from '../category-type-translation/category-type-translation.component';
import { SectionHeadingComponent } from '../section-heading/section-heading.component';

@Component({
    selector: 'mados-add-categories-form',
    templateUrl: './add-categories-form.component.html',
    styleUrl: './add-categories-form.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [SectionHeadingComponent, ReactiveFormsModule, CategoryTypeTranslationComponent, MatInputModule, MatIconModule, MatButtonModule, ExpansionButtonTextComponent, KeyValuePipe],
})
export class AddCategoriesFormComponent implements OnInit {
    private readonly httpClient: HttpClient = inject(HttpClient);
    private readonly viewportScroller: ViewportScroller = inject(ViewportScroller);
    private readonly snackbarService: SnackbarService = inject(SnackbarService);

    public readonly categories: InputSignal<Category[]> = input.required<Category[]>();

    public readonly reloadDescription: OutputEmitterRef<void> = output();

    public readonly headingText: string = 'Add categories';
    public readonly form: FormGroup<Record<string, FormGroup<CategoryFormControls>>> = new FormGroup<Record<string, FormGroup<CategoryFormControls>>>({});
    public readonly CategoryType: typeof CategoryType = CategoryType;
    public readonly ViewState: typeof ViewState = ViewState;
    public readonly viewState: WritableSignal<ViewState | null> = signal<ViewState | null>(null);
    public readonly shouldShowCategories: WritableSignal<boolean> = signal<boolean>(false);
    public readonly headingId: string = 'addCategoriesHeading';

    private readonly initialCategories: CategoryType[] = [
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

    public ngOnInit(): void {
        this.buildForm();
    }

    public readonly iterateByOriginalOrder = (): number => 0;

    public saveCategories(): void {
        if (this.form.invalid) {
            return;
        }

        this.viewState.set(ViewState.LOADING);

        const requestBody: CategoryRequestBody[] = this.prepareCategoriesDataForRequest();

        this.httpClient
            .post<Category[]>('categories', requestBody)
            .pipe(
                take(1),
                catchError(() => {
                    this.viewState.set(ViewState.ERROR);
                    this.snackbarService.openSnackbar('An error has occurred while saving categories', 'error');

                    return EMPTY;
                })
            )
            .subscribe(() => {
                this.viewState.set(ViewState.SUCCESS);
                this.snackbarService.openSnackbar('Successfully saved categories', 'success');
                this.reloadDescription.emit();
            });
    }

    public handleCategoriesVisibility(): void {
        this.shouldShowCategories.update((shouldShowCategories: boolean) => !shouldShowCategories);

        this.viewportScroller.scrollToAnchor(this.headingId);
    }

    public resetInputField(control: AbstractControl): void {
        control.reset();
        control.updateValueAndValidity();
    }

    private prepareCategoriesDataForRequest(): CategoryRequestBody[] {
        return Object.entries(this.form.controls).map(([categoryType, categoryFormGroup]: [string, FormGroup<CategoryFormControls>]) => ({
            type: categoryType as CategoryType,
            iconName: categoryFormGroup.controls.iconName.value ?? '',
            description: categoryFormGroup.controls.description?.value,
        }));
    }

    private buildForm(): void {
        const categories: Category[] = this.categories();

        if (categories.length) {
            categories.forEach((category: Category) => {
                this.form.addControl(category.type, this.buildCategoryFormGroup(category.iconName, category.description, category.type));
            });

            return;
        }

        this.initialCategories.forEach((categoryType: CategoryType) => {
            this.form.addControl(categoryType, this.buildCategoryFormGroup(null, null, categoryType));
        });
    }

    private buildCategoryFormGroup(iconName: string | null, description: string | null, type: CategoryType): FormGroup<CategoryFormControls> {
        return type === CategoryType.ONE_HUNDRED_PERCENT
            ? new FormGroup<CategoryFormControls>({ iconName: new FormControl<string | null>(iconName, Validators.required) })
            : new FormGroup<CategoryFormControls>({
                  iconName: new FormControl<string | null>(iconName, Validators.required),
                  description: new FormControl<string | null>(description, Validators.required),
              });
    }
}

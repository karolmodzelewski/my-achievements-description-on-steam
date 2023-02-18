import { ViewportScroller } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { EMPTY, take } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ViewState } from './../../../../enums/view-state.enum';
import { CategoryType } from './../../../../enums/category-type.enum';
import { Category } from './../../../../interfaces/category.interface';

@Component({
    selector: 'mados-add-categories-form',
    templateUrl: './add-categories-form.component.html',
    styleUrls: ['./add-categories-form.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddCategoriesFormComponent implements OnInit {
    @Input()
    public categories: Category[];

    public headingText: string = 'Add categories';
    public form: FormGroup = new FormGroup({});
    public CategoryType: typeof CategoryType = CategoryType;
    public ViewState: typeof ViewState = ViewState;
    public viewState: ViewState;
    public shouldShowCategories: boolean;
    public headingId: string = 'heading';

    constructor(private httpClient: HttpClient, private viewportScroller: ViewportScroller) {}

    public ngOnInit(): void {
        this.buildForm();
    }

    public iterateByOriginalOrder = (): number => 0;

    // TODO: Add snackbars
    public saveCategories(): void {
        if (this.form.invalid) {
            return;
        }

        this.viewState = ViewState.LOADING;

        const requestBody: Omit<Category, 'id'>[] = this.prepareCategoriesDataForRequest();

        this.httpClient.post<Category[]>('categories', requestBody)
            .pipe(
                take(1),
                catchError(() => {
                    this.viewState = ViewState.ERROR;

                    return EMPTY;
                })
            )
            .subscribe(() => {
                this.viewState = ViewState.SUCCESS;
            });
    }

    public handleCategoriesVisibility(): void {
        this.shouldShowCategories = !this.shouldShowCategories;

        this.viewportScroller.scrollToAnchor(this.headingId);
    }

    public resetInputField(control: FormControl | any): void {
        control.reset();
        control.updateValueAndValidity();
    }

    private prepareCategoriesDataForRequest(): Omit<Category, 'id'>[] {
        const categories: Omit<Category, 'id'>[] = [];

        for (const categoryType in this.form.value) {
            if (categoryType) {
                const category: Omit<Category, 'id'> = {
                    type: categoryType as CategoryType,
                    iconName: this.form.value[categoryType].iconName,
                    description: this.form.value[categoryType].description,
                };

                categories.push(category);
            }
        }

        return categories;
    }

    private buildForm(): void {
        this.categories?.forEach((category: Category) => this.form?.addControl(category.type, this.buildCategoryFormGroup(category)));
    }

    private buildCategoryFormGroup(category: Category): FormGroup {
        const { iconName, description, type } = category;

        return type === CategoryType.ONE_HUNDRED_PERCENT
            ? new FormGroup({ iconName: new FormControl<string | null>(iconName, Validators.required) })
            : new FormGroup({
                  iconName: new FormControl<string | null>(iconName, Validators.required),
                  description: new FormControl<string | null>(description, Validators.required),
              });
    }
}

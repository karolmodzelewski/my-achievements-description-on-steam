import { ViewportScroller } from '@angular/common';
import { Component, inject, input, output, signal } from '@angular/core';
import { MatButton } from '@angular/material/button';

import { CategoryKindFormComponent } from './components/category-kind-form/category-kind-form.component';
import { ExpansionButtonTextComponent } from './components/expansion-button-text/expansion-button-text.component';
import { OneHundredPercentFormComponent } from './components/one-hundred-percent-form/one-hundred-percent-form.component';
import { CategoryKind } from '../../../../enums/category-kind.enum';
import type { Category } from '../../../../interfaces/category.interface';
import { SectionHeadingComponent } from '../section-heading/section-heading.component';

@Component({
    selector: 'mados-add-categories-form',
    templateUrl: './add-categories-form.component.html',
    styleUrl: './add-categories-form.component.scss',
    imports: [SectionHeadingComponent, OneHundredPercentFormComponent, CategoryKindFormComponent, MatButton, ExpansionButtonTextComponent],
})
export class AddCategoriesFormComponent {
    private readonly viewportScroller = inject(ViewportScroller);

    public readonly oneHundredPercentCategory = input.required<Category | null>();
    public readonly mainCategories = input.required<Category[]>();
    public readonly lengthCategories = input.required<Category[]>();
    public readonly difficultyCategories = input.required<Category[]>();

    public readonly categoriesSaved = output();

    public readonly headingText = 'Manage categories';
    public readonly headingId = 'manageCategoriesHeading';
    public readonly categoriesFormsId = 'manageCategoriesForms';
    public readonly CategoryKind = CategoryKind;
    public readonly shouldShowCategories = signal<boolean>(false);

    public handleCategoriesVisibility(): void {
        this.shouldShowCategories.update((shouldShowCategories) => !shouldShowCategories);

        this.viewportScroller.scrollToAnchor(this.headingId);
    }
}

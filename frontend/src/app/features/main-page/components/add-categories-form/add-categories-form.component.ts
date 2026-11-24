import { Component, input, output } from '@angular/core';

import { TranslocoPipe } from '@jsverse/transloco';

import { CategoryKindFormComponent } from './components/category-kind-form/category-kind-form.component';
import { OneHundredPercentFormComponent } from './components/one-hundred-percent-form/one-hundred-percent-form.component';
import { CategoryKind } from '../../../../enums/category-kind.enum';
import type { Category } from '../../../../interfaces/category.interface';
import { ExpandableSectionComponent } from '../expandable-section/expandable-section.component';

@Component({
    selector: 'mados-add-categories-form',
    templateUrl: './add-categories-form.component.html',
    styleUrl: './add-categories-form.component.scss',
    imports: [ExpandableSectionComponent, OneHundredPercentFormComponent, CategoryKindFormComponent, TranslocoPipe],
})
export class AddCategoriesFormComponent {
    public readonly oneHundredPercentCategory = input.required<Category | null>();
    public readonly mainCategories = input.required<Category[]>();
    public readonly lengthCategories = input.required<Category[]>();
    public readonly difficultyCategories = input.required<Category[]>();

    public readonly categoriesSaved = output();

    public readonly headingId = 'manageCategoriesHeading';
    public readonly categoriesFormsId = 'manageCategoriesForms';
    public readonly CategoryKind = CategoryKind;
}

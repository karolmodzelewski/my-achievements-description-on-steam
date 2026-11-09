import { Component, input } from '@angular/core';

import { CategoryTypeTranslationHeadingComponent } from './components/category-type-translation-heading/category-type-translation-heading.component';
import { CategoryType } from '../../../../enums/category-type.enum';

@Component({
    selector: 'mados-category-type-translation',
    templateUrl: './category-type-translation.component.html',
    imports: [CategoryTypeTranslationHeadingComponent],
})
export class CategoryTypeTranslationComponent {
    public readonly key = input.required<CategoryType>();

    public readonly CategoryType = CategoryType;
}

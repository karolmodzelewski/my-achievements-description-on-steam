import { Component, input } from '@angular/core';

import { CategoryType } from '../../../../../../enums/category-type.enum';

@Component({
    selector: 'mados-category',
    templateUrl: './category.component.html',
    styleUrl: './category.component.scss',
})
export class CategoryComponent {
    public readonly type = input.required<CategoryType>();
    public readonly iconName = input.required<string>();
    public readonly description = input.required<string | null>();
    public readonly amount = input<number>();

    public readonly CategoryType = CategoryType;
}

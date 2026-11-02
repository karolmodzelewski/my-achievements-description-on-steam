import type { InputSignal } from '@angular/core';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { CategoryType } from '../../../../../../enums/category-type.enum';

@Component({
    selector: 'mados-category',
    templateUrl: './category.component.html',
    styleUrl: './category.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryComponent {
    public readonly type: InputSignal<CategoryType> = input.required<CategoryType>();
    public readonly iconName: InputSignal<string> = input.required<string>();
    public readonly description: InputSignal<string | null> = input.required<string | null>();
    public readonly amount: InputSignal<number | undefined> = input<number>();

    public readonly CategoryType: typeof CategoryType = CategoryType;
}

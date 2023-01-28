import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { CategoryType } from '../../../../../../enums/category-type.enum';

@Component({
    selector: 'mados-category',
    templateUrl: './category.component.html',
    styleUrls: ['./category.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryComponent {
    @Input()
    public type: CategoryType;
    @Input()
    public iconName: string;
    @Input()
    public description: string | null;
    @Input()
    public amount: number | null;

    public CategoryType: typeof CategoryType = CategoryType;
}

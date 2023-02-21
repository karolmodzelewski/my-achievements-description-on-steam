import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

import { CategoryType } from '../../../../enums/category-type.enum';

@Component({
    selector: 'mados-category-type-translation',
    templateUrl: './category-type-translation.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryTypeTranslationComponent {
    @Input()
    public key: string;

    public CategoryType: typeof CategoryType = CategoryType;
}

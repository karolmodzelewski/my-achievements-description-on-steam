import type { InputSignal } from '@angular/core';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { CategoryTypeTranslationHeadingComponent } from './components/category-type-translation-heading/category-type-translation-heading.component';
import { CategoryType } from '../../../../enums/category-type.enum';

@Component({
    selector: 'mados-category-type-translation',
    templateUrl: './category-type-translation.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CategoryTypeTranslationHeadingComponent],
})
export class CategoryTypeTranslationComponent {
    public readonly key: InputSignal<string> = input.required<string>();

    public readonly CategoryType: typeof CategoryType = CategoryType;
}

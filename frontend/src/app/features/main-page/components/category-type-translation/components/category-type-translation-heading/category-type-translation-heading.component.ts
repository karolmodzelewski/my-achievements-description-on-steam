import { Component, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'mados-category-type-translation-heading',
    templateUrl: './category-type-translation-heading.component.html',
    styleUrl: './category-type-translation-heading.component.scss',
    imports: [MatIcon],
})
export class CategoryTypeTranslationHeadingComponent {
    public readonly headingText = input.required<string>();
}

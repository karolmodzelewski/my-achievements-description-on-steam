import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
    selector: 'mados-category-type-translation-heading',
    templateUrl: './category-type-translation-heading.component.html',
    styleUrls: ['./category-type-translation-heading.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryTypeTranslationHeadingComponent {
    @Input()
    public headingText: string;
}

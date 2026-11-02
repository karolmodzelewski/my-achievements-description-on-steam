import type { InputSignal } from '@angular/core';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'mados-category-type-translation-heading',
    templateUrl: './category-type-translation-heading.component.html',
    styleUrl: './category-type-translation-heading.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatIconModule],
})
export class CategoryTypeTranslationHeadingComponent {
    public readonly headingText: InputSignal<string> = input.required<string>();
}

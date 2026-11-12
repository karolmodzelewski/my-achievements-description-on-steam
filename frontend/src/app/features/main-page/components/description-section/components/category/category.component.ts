import { Component, computed, input } from '@angular/core';

import { joinDescriptionParts } from '../../../../utils/description-text.util';
import { CutOffTextComponent } from '../cut-off-text/cut-off-text.component';

@Component({
    selector: 'mados-category',
    templateUrl: './category.component.html',
    styleUrl: './category.component.scss',
    imports: [CutOffTextComponent],
})
export class CategoryComponent {
    public readonly iconName = input.required<string>();
    public readonly description = input.required<string | null>();
    public readonly amount = input<number>();
    public readonly cutOffIndex = input<number>();
    // The first category of a kind, separated from the categories of the previous kind
    public readonly isBlockStart = input<boolean>(false);

    // Empty categories are hidden information, presented only in the application and never copied
    public readonly isHidden = computed<boolean>(() => this.amount() === 0);
    // Shared with the copied description, so the cut off index points to the same character
    public readonly categoryLine = computed<string>(() => joinDescriptionParts(this.iconName(), this.description() ?? '', `(${this.amount() ?? 0})`));
}

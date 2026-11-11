import { Component, computed, input } from '@angular/core';

@Component({
    selector: 'mados-cut-off-text',
    templateUrl: './cut-off-text.component.html',
    styleUrl: './cut-off-text.component.scss',
})
export class CutOffTextComponent {
    public readonly text = input.required<string>();
    // Index of the first character cut off by Steam, no index when the whole text fits
    public readonly cutOffIndex = input<number>();

    public readonly keptText = computed<string>(() => this.text().slice(0, this.cutOffIndex()));
    public readonly cutOffText = computed<string>(() => {
        const cutOffIndex = this.cutOffIndex();

        return cutOffIndex === undefined ? '' : this.text().slice(cutOffIndex);
    });
}

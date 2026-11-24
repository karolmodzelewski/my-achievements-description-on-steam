import { Component, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'mados-expansion-button-text',
    templateUrl: './expansion-button-text.component.html',
    styleUrl: './expansion-button-text.component.scss',
    imports: [MatIcon],
})
export class ExpansionButtonTextComponent {
    public readonly buttonText = input.required<string>();
    public readonly iconName = input.required<string>();
}

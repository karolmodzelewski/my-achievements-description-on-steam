import type { InputSignal } from '@angular/core';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'mados-expansion-button-text',
    templateUrl: './expansion-button-text.component.html',
    styleUrl: './expansion-button-text.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatIconModule],
})
export class ExpansionButtonTextComponent {
    public readonly buttonText: InputSignal<string> = input.required<string>();
    public readonly iconName: InputSignal<string> = input.required<string>();
}

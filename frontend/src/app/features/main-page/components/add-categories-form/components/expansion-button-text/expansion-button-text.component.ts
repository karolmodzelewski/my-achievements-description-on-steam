import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'mados-expansion-button-text',
    templateUrl: './expansion-button-text.component.html',
    styleUrls: ['./expansion-button-text.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpansionButtonTextComponent {
    @Input()
    public buttonText: string;
    @Input()
    public iconName: string;
}

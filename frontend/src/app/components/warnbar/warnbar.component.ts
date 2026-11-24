import { Component, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'mados-warnbar',
    templateUrl: './warnbar.component.html',
    styleUrl: './warnbar.component.scss',
    imports: [MatIcon],
})
export class WarnbarComponent {
    public readonly message = input.required<string>();
}

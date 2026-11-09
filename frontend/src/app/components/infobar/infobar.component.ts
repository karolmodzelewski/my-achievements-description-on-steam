import { Component, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'mados-infobar',
    templateUrl: './infobar.component.html',
    styleUrl: './infobar.component.scss',
    imports: [MatIcon],
})
export class InfobarComponent {
    public readonly message = input.required<string>();
}

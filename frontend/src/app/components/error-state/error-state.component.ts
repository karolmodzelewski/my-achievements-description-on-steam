import { Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'mados-error-state',
    templateUrl: './error-state.component.html',
    styleUrl: './error-state.component.scss',
    imports: [MatIcon],
    host: { role: 'alert' },
})
export class ErrorStateComponent {}

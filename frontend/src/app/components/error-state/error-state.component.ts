import { Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

import { TranslocoPipe } from '@jsverse/transloco';

@Component({
    selector: 'mados-error-state',
    templateUrl: './error-state.component.html',
    styleUrl: './error-state.component.scss',
    imports: [MatIcon, TranslocoPipe],
    host: { role: 'alert' },
})
export class ErrorStateComponent {}

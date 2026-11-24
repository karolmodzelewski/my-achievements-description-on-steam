import { Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

import { TranslocoPipe } from '@jsverse/transloco';

@Component({
    selector: 'mados-loading-state',
    templateUrl: './loading-state.component.html',
    styleUrl: './loading-state.component.scss',
    imports: [MatIcon, TranslocoPipe],
    host: { role: 'status' },
})
export class LoadingStateComponent {}

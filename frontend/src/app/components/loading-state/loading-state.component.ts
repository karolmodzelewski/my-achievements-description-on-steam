import { Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'mados-loading-state',
    templateUrl: './loading-state.component.html',
    styleUrl: './loading-state.component.scss',
    imports: [MatIcon],
    host: { role: 'status' },
})
export class LoadingStateComponent {}

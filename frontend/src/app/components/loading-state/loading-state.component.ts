import { MatIconModule } from '@angular/material/icon';
import { Component } from '@angular/core';

@Component({
    selector: 'mados-loading-state',
    templateUrl: './loading-state.component.html',
    styleUrls: ['./loading-state.component.scss'],
    standalone: true,
    imports: [MatIconModule],
})
export class LoadingStateComponent {}

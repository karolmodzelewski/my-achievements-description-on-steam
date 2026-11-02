import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'mados-loading-state',
    templateUrl: './loading-state.component.html',
    styleUrl: './loading-state.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatIconModule],
})
export class LoadingStateComponent {}

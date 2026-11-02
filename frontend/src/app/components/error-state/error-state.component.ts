import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'mados-error-state',
    templateUrl: './error-state.component.html',
    styleUrl: './error-state.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatIconModule],
})
export class ErrorStateComponent {}

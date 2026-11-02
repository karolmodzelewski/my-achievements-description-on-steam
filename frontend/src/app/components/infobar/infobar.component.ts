import type { InputSignal } from '@angular/core';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'mados-infobar',
    templateUrl: './infobar.component.html',
    styleUrl: './infobar.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatIconModule],
})
export class InfobarComponent {
    public readonly message: InputSignal<string> = input.required<string>();
}

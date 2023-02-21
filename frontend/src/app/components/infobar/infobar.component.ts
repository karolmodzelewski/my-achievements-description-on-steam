import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'mados-infobar',
    templateUrl: './infobar.component.html',
    styleUrls: ['./infobar.component.scss'],
    standalone: true,
    imports: [MatIconModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InfobarComponent {
    @Input()
    public message: string;
}

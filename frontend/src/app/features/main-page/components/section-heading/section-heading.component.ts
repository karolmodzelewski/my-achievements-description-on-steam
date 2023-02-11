import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
    selector: 'mados-section-heading',
    templateUrl: './section-heading.component.html',
    styleUrls: ['./section-heading.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionHeadingComponent {
    @Input()
    public headingText: string;
}

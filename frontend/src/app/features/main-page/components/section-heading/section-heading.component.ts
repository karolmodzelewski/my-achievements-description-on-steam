import type { InputSignal } from '@angular/core';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
    selector: 'mados-section-heading',
    templateUrl: './section-heading.component.html',
    styleUrl: './section-heading.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionHeadingComponent {
    public readonly headingText: InputSignal<string> = input.required<string>();
}

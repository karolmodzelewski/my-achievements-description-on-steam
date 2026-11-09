import { Component, input } from '@angular/core';

@Component({
    selector: 'mados-section-heading',
    templateUrl: './section-heading.component.html',
    styleUrl: './section-heading.component.scss',
})
export class SectionHeadingComponent {
    public readonly headingText = input.required<string>();
}

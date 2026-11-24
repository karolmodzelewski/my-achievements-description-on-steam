import { NgTemplateOutlet, ViewportScroller } from '@angular/common';
import { afterNextRender, Component, contentChild, inject, Injector, input, signal, TemplateRef, viewChild } from '@angular/core';
import { MatButton } from '@angular/material/button';

import { TranslocoPipe } from '@jsverse/transloco';

import { ExpansionButtonTextComponent } from '../expansion-button-text/expansion-button-text.component';
import { SectionHeadingComponent } from '../section-heading/section-heading.component';

@Component({
    selector: 'mados-expandable-section',
    templateUrl: './expandable-section.component.html',
    styleUrl: './expandable-section.component.scss',
    imports: [SectionHeadingComponent, ExpansionButtonTextComponent, MatButton, NgTemplateOutlet, TranslocoPipe],
})
export class ExpandableSectionComponent {
    private readonly viewportScroller = inject(ViewportScroller);
    private readonly injector = inject(Injector);

    private readonly topCollapseButton = viewChild('topCollapseButton', { read: MatButton });
    private readonly bottomExpansionButton = viewChild.required('bottomExpansionButton', { read: MatButton });

    public readonly headingText = input.required<string>();
    public readonly headingId = input.required<string>();
    public readonly contentId = input.required<string>();

    public readonly content = contentChild.required(TemplateRef);
    public readonly isExpanded = signal<boolean>(false);

    public toggle(): void {
        this.isExpanded.update((isExpanded) => !isExpanded);

        this.viewportScroller.scrollToAnchor(this.headingId());
        // Expanding focuses the top button, so the content follows it in the focus order and the focus stays in view.
        // Collapsing focuses the bottom button, as the top one disappears together with the content
        afterNextRender(() => (this.isExpanded() ? this.topCollapseButton() : this.bottomExpansionButton())?.focus(), { injector: this.injector });
    }
}

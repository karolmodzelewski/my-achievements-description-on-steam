import { ViewportScroller } from '@angular/common';
import { afterNextRender, Component, inject, Injector, input, output, signal, viewChild } from '@angular/core';
import { MatButton } from '@angular/material/button';

import { TranslocoPipe } from '@jsverse/transloco';

import { CategoryKindFormComponent } from './components/category-kind-form/category-kind-form.component';
import { ExpansionButtonTextComponent } from './components/expansion-button-text/expansion-button-text.component';
import { OneHundredPercentFormComponent } from './components/one-hundred-percent-form/one-hundred-percent-form.component';
import { CategoryKind } from '../../../../enums/category-kind.enum';
import type { Category } from '../../../../interfaces/category.interface';
import { SectionHeadingComponent } from '../section-heading/section-heading.component';

@Component({
    selector: 'mados-add-categories-form',
    templateUrl: './add-categories-form.component.html',
    styleUrl: './add-categories-form.component.scss',
    imports: [SectionHeadingComponent, OneHundredPercentFormComponent, CategoryKindFormComponent, MatButton, ExpansionButtonTextComponent, TranslocoPipe],
})
export class AddCategoriesFormComponent {
    private readonly viewportScroller = inject(ViewportScroller);
    private readonly injector = inject(Injector);

    private readonly topCollapseButton = viewChild('topCollapseButton', { read: MatButton });
    private readonly bottomExpansionButton = viewChild.required('bottomExpansionButton', { read: MatButton });

    public readonly oneHundredPercentCategory = input.required<Category | null>();
    public readonly mainCategories = input.required<Category[]>();
    public readonly lengthCategories = input.required<Category[]>();
    public readonly difficultyCategories = input.required<Category[]>();

    public readonly categoriesSaved = output();

    public readonly headingId = 'manageCategoriesHeading';
    public readonly categoriesFormsId = 'manageCategoriesForms';
    public readonly CategoryKind = CategoryKind;
    public readonly shouldShowCategories = signal<boolean>(false);

    public handleCategoriesVisibility(): void {
        this.shouldShowCategories.update((shouldShowCategories) => !shouldShowCategories);

        this.viewportScroller.scrollToAnchor(this.headingId);
        // Expanding focuses the top button, so the forms follow it in the focus order and the focus stays in view.
        // Collapsing focuses the bottom button, as the top one disappears together with the forms
        afterNextRender(() => (this.shouldShowCategories() ? this.topCollapseButton() : this.bottomExpansionButton())?.focus(), { injector: this.injector });
    }
}

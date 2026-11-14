import { httpResource } from '@angular/common/http';
import { Component, computed } from '@angular/core';

import { TranslocoPipe } from '@jsverse/transloco';

import { AddCategoriesFormComponent } from './components/add-categories-form/add-categories-form.component';
import { AddGameFormComponent } from './components/add-game-form/add-game-form.component';
import { DescriptionSectionComponent } from './components/description-section/description-section.component';
import { HeaderComponent } from './components/header/header.component';
import type { MainPageData } from './interfaces/main-page-data.interface';
import { areJsonEqual } from './utils/json-equality.util';
import { ErrorStateComponent } from '../../components/error-state/error-state.component';
import { InfobarComponent } from '../../components/infobar/infobar.component';
import { LoadingStateComponent } from '../../components/loading-state/loading-state.component';
import { CategoryKind } from '../../enums/category-kind.enum';
import type { Category } from '../../interfaces/category.interface';
import type { DescriptionResponseBody } from '../../interfaces/description-response-body.interface';

@Component({
    selector: 'mados-main-page',
    templateUrl: './main-page.component.html',
    styleUrl: './main-page.component.scss',
    imports: [HeaderComponent, AddCategoriesFormComponent, AddGameFormComponent, DescriptionSectionComponent, InfobarComponent, LoadingStateComponent, ErrorStateComponent, TranslocoPipe],
})
export class MainPageComponent {
    private readonly categoriesResource = httpResource<Category[]>(() => 'categories');
    private readonly descriptionResource = httpResource<DescriptionResponseBody>(() => 'description');

    public readonly hasError = computed<boolean>(() => this.categoriesResource.error() !== undefined || this.descriptionResource.error() !== undefined);
    public readonly data = computed<MainPageData | null>(() =>
        this.categoriesResource.hasValue() && this.descriptionResource.hasValue() ? { categories: this.categoriesResource.value(), description: this.descriptionResource.value() } : null
    );

    public readonly oneHundredPercentCategory = computed<Category | null>(() => this.getCategoriesOfKind(CategoryKind.ONE_HUNDRED_PERCENT).at(0) ?? null, { equal: areJsonEqual });
    public readonly mainCategories = computed<Category[]>(() => this.getCategoriesOfKind(CategoryKind.MAIN), { equal: areJsonEqual });
    public readonly lengthCategories = computed<Category[]>(() => this.getCategoriesOfKind(CategoryKind.LENGTH), { equal: areJsonEqual });
    public readonly difficultyCategories = computed<Category[]>(() => this.getCategoriesOfKind(CategoryKind.DIFFICULTY), { equal: areJsonEqual });

    // Every game belongs to the 100% category, so games can't be presented without its icon
    public readonly isOneHundredPercentIconSet = computed<boolean>(() => (this.oneHundredPercentCategory()?.iconName ?? '') !== '');

    public reloadDescription(): void {
        this.descriptionResource.reload();
    }

    public reloadCategoriesAndDescription(): void {
        this.categoriesResource.reload();
        this.descriptionResource.reload();
    }

    private getCategoriesOfKind(kind: CategoryKind): Category[] {
        return this.data()?.categories.filter((category) => category.kind === kind) ?? [];
    }
}

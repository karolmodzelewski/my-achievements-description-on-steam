import { httpResource } from '@angular/common/http';
import { Component, computed } from '@angular/core';

import { AddCategoriesFormComponent } from './components/add-categories-form/add-categories-form.component';
import { AddGameFormComponent } from './components/add-game-form/add-game-form.component';
import { DescriptionSectionComponent } from './components/description-section/description-section.component';
import { HeaderComponent } from './components/header/header.component';
import type { MainPageData } from './interfaces/main-page-data.interface';
import { ErrorStateComponent } from '../../components/error-state/error-state.component';
import { InfobarComponent } from '../../components/infobar/infobar.component';
import { LoadingStateComponent } from '../../components/loading-state/loading-state.component';
import type { Category } from '../../interfaces/category.interface';
import type { DescriptionResponseBody } from '../../interfaces/description-response-body.interface';

@Component({
    selector: 'mados-main-page',
    templateUrl: './main-page.component.html',
    styleUrl: './main-page.component.scss',
    imports: [HeaderComponent, AddCategoriesFormComponent, AddGameFormComponent, DescriptionSectionComponent, InfobarComponent, LoadingStateComponent, ErrorStateComponent],
})
export class MainPageComponent {
    private readonly categoriesResource = httpResource<Category[]>(() => 'categories');
    private readonly descriptionResource = httpResource<DescriptionResponseBody>(() => 'description');

    public readonly infobarMessage = 'To add a game and see the description, please fulfill all categories';

    public readonly hasError = computed<boolean>(() => this.categoriesResource.error() !== undefined || this.descriptionResource.error() !== undefined);
    public readonly data = computed<MainPageData | null>(() =>
        this.categoriesResource.hasValue() && this.descriptionResource.hasValue() ? { categories: this.categoriesResource.value(), description: this.descriptionResource.value() } : null
    );

    public reloadDescription(): void {
        this.descriptionResource.reload();
    }
}

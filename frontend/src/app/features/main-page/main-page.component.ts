import { HttpClient } from '@angular/common/http';
import type { OnInit, WritableSignal } from '@angular/core';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';

import { catchError, EMPTY, takeUntil, zip } from 'rxjs';

import { AddCategoriesFormComponent } from './components/add-categories-form/add-categories-form.component';
import { AddGameFormComponent } from './components/add-game-form/add-game-form.component';
import { DescriptionSectionComponent } from './components/description-section/description-section.component';
import { HeaderComponent } from './components/header/header.component';
import { ErrorStateComponent } from '../../components/error-state/error-state.component';
import { InfobarComponent } from '../../components/infobar/infobar.component';
import { LoadingStateComponent } from '../../components/loading-state/loading-state.component';
import { ViewState } from '../../enums/view-state.enum';
import type { Category } from '../../interfaces/category.interface';
import type { DescriptionResponseBody } from '../../interfaces/description-response-body.interface';
import { Destroyable } from '../../utils/destroyable.util';

@Component({
    selector: 'mados-main-page',
    templateUrl: './main-page.component.html',
    styleUrl: './main-page.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [HeaderComponent, AddCategoriesFormComponent, AddGameFormComponent, DescriptionSectionComponent, InfobarComponent, LoadingStateComponent, ErrorStateComponent],
})
export class MainPageComponent extends Destroyable implements OnInit {
    private readonly httpClient: HttpClient = inject(HttpClient);

    public readonly viewState: WritableSignal<ViewState> = signal<ViewState>(ViewState.LOADING);
    public readonly ViewState: typeof ViewState = ViewState;
    public readonly categories: WritableSignal<Category[]> = signal<Category[]>([]);
    public readonly description: WritableSignal<DescriptionResponseBody | null> = signal<DescriptionResponseBody | null>(null);
    public readonly infobarMessage: string = 'To add a game and see the description, please fulfill all categories';

    public ngOnInit(): void {
        this.initCategoriesAndDescriptionData();
    }

    public getDescriptionData(): void {
        this.httpClient
            .get<DescriptionResponseBody>('description')
            .pipe(takeUntil(this.destroyed$))
            .subscribe((description: DescriptionResponseBody) => this.description.set(description));
    }

    private initCategoriesAndDescriptionData(): void {
        zip(this.httpClient.get<Category[]>('categories'), this.httpClient.get<DescriptionResponseBody>('description'))
            .pipe(
                catchError(() => {
                    this.viewState.set(ViewState.ERROR);

                    return EMPTY;
                }),
                takeUntil(this.destroyed$)
            )
            .subscribe(([categories, description]: [Category[], DescriptionResponseBody]) => {
                this.categories.set(categories);
                this.description.set(description);
                this.viewState.set(ViewState.SUCCESS);
            });
    }
}

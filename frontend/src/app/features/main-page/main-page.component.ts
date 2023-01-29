import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

import { catchError, map, takeUntil } from 'rxjs/operators';
import { EMPTY, Observable, of, zip } from 'rxjs';

import { DescriptionResponseBody } from './../../interfaces/description-response-body.interface';
import { ViewState } from '../../enums/view-state.enum';
import { Destroyable } from '../../utils/destroyable.util';
import { CategoriesResponseBody } from './../../interfaces/categories-response-body.interface';

@Component({
    selector: 'mados-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent extends Destroyable implements OnInit {
    public viewState: ViewState = ViewState.LOADING;
    public ViewState: typeof ViewState = ViewState;
    public categories$: Observable<CategoriesResponseBody>;
    public description$: Observable<DescriptionResponseBody>;

    constructor(private httpClient: HttpClient) {
        super();
    }

    public ngOnInit(): void {
        this.initCategoriesAndDescriptionData();
    }

    private initCategoriesAndDescriptionData(): void {
        zip(this.httpClient.get<CategoriesResponseBody>('categories'), this.httpClient.get<DescriptionResponseBody>('description'))
            .pipe(
                catchError(() => {
                    this.viewState = ViewState.ERROR;

                    return EMPTY;
                }),
                map(([categories, description]: [CategoriesResponseBody, DescriptionResponseBody]) => {
                    this.categories$ = of(categories);
                    this.description$ = of(description);
                }),
                takeUntil(this.destroyed$)
            )
            .subscribe(() => (this.viewState = ViewState.SUCCESS));
    }
}

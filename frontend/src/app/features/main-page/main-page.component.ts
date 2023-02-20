import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

import { catchError, map, takeUntil } from 'rxjs/operators';
import { EMPTY, Observable, of, zip } from 'rxjs';

import { DescriptionResponseBody } from './../../interfaces/description-response-body.interface';
import { ViewState } from '../../enums/view-state.enum';
import { Destroyable } from '../../utils/destroyable.util';
import { Category } from './../../interfaces/category.interface';

@Component({
    selector: 'mados-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent extends Destroyable implements OnInit {
    public viewState: ViewState = ViewState.LOADING;
    public ViewState: typeof ViewState = ViewState;
    public categories$: Observable<Category[]>;
    public description$: Observable<DescriptionResponseBody>;

    constructor(private httpClient: HttpClient) {
        super();
    }

    public ngOnInit(): void {
        this.initCategoriesAndDescriptionData();
    }

    public getDescriptionData(): void {
        this.httpClient.get<DescriptionResponseBody>('description')
            .pipe(
                map((description: DescriptionResponseBody) => {
                    this.description$ = of(description);
                }),
                takeUntil(this.destroyed$)
            )
            .subscribe();
    }

    private initCategoriesAndDescriptionData(): void {
        zip(this.httpClient.get<Category[]>('categories'), this.httpClient.get<DescriptionResponseBody>('description'))
            .pipe(
                catchError(() => {
                    this.viewState = ViewState.ERROR;

                    return EMPTY;
                }),
                map(([categories, description]: [Category[], DescriptionResponseBody]) => {
                    this.categories$ = of(categories);
                    this.description$ = of(description);
                }),
                takeUntil(this.destroyed$)
            )
            .subscribe(() => {
                this.viewState = ViewState.SUCCESS;
            });
    }
}

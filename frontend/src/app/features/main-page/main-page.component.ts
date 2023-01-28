import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

import { catchError, takeUntil, tap } from 'rxjs/operators';
import { EMPTY, Observable } from 'rxjs';

import { DescriptionResponseBody } from './../../interfaces/description-response-body.interface';
import { ViewState } from '../../enums/view-state.enum';
import { Destroyable } from '../../utils/destroyable.util';

@Component({
    selector: 'mados-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent extends Destroyable implements OnInit {
    public viewState: ViewState = ViewState.LOADING;
    public ViewState: typeof ViewState = ViewState;
    public description$: Observable<DescriptionResponseBody>;

    constructor(private httpClient: HttpClient) {
        super();
    }

    public ngOnInit(): void {
        this.initDescriptionData();
    }

    private initDescriptionData(): void {
        this.description$ = this.httpClient.get<DescriptionResponseBody>('description').pipe(
            catchError(() => {
                this.viewState = ViewState.ERROR;

                return EMPTY;
            }),
            tap(() => (this.viewState = ViewState.SUCCESS)),
            takeUntil(this.destroyed$)
        );
    }
}

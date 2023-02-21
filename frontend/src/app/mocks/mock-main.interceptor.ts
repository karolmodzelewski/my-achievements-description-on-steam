import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';

import { delay, dematerialize, materialize, Observable, of } from 'rxjs';

import { MockMainData } from './mock-main.data';
import { HttpRequestMethod } from '../enums/http-request-method.enum';

@Injectable()
export class MockMainInterceptor extends MockMainData implements HttpInterceptor {
    constructor() {
        super();
    }

    public intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        const { url, method } = request;

        switch (true) {
            case url.endsWith('categories') && method === HttpRequestMethod.GET:
                return this.mockSuccess(this.categoriesResponseBody);
            case url.endsWith('description') && method === HttpRequestMethod.GET:
                return this.mockSuccess(this.descriptionResponseBody);
            case url.endsWith('categories') && method === HttpRequestMethod.POST:
            case url.endsWith('game') && method === HttpRequestMethod.DELETE:
            case url.endsWith('game') && method === HttpRequestMethod.POST:
                return this.mockSuccess();
            default:
                return next.handle(request);
        }
    }

    private mockSuccess(body: any = null, delayTime: number = 500): Observable<HttpEvent<unknown>> {
        const httpResponse: HttpResponse<any> = new HttpResponse({ status: 200, body });

        return of(httpResponse).pipe(materialize(), delay(delayTime), dematerialize());
    }
}

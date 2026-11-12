import type { HttpEvent, HttpInterceptorFn } from '@angular/common/http';
import { HttpResponse } from '@angular/common/http';

import type { Observable } from 'rxjs';
import { delay, of } from 'rxjs';

import { categoriesResponseBody, descriptionResponseBody } from './mock-main.data';
import { HttpRequestMethod } from '../enums/http-request-method.enum';

const categories = /categories\/[A-Z_]+$/;
const gameWithIdUrlPattern = /game\/\d+$/;
const gameGroupWithIdUrlPattern = /game\/\d+\/group\/\d+$/;

const mockSuccess = (body: unknown = null, delayTime = 500): Observable<HttpEvent<unknown>> => of(new HttpResponse({ status: 200, body })).pipe(delay(delayTime));

export const mockMainInterceptor: HttpInterceptorFn = (request, next) => {
    const { url } = request;
    const method = request.method as HttpRequestMethod;

    switch (true) {
        case url.endsWith('categories') && method === HttpRequestMethod.GET:
            return mockSuccess(categoriesResponseBody);
        case url.endsWith('description') && method === HttpRequestMethod.GET:
            return mockSuccess(descriptionResponseBody);
        case categories.test(url) && method === HttpRequestMethod.PUT:
        case url.endsWith('game') && method === HttpRequestMethod.POST:
        case gameWithIdUrlPattern.test(url) && method === HttpRequestMethod.PUT:
        case gameWithIdUrlPattern.test(url) && method === HttpRequestMethod.DELETE:
        case gameGroupWithIdUrlPattern.test(url) && method === HttpRequestMethod.DELETE:
            return mockSuccess();
        default:
            return next(request);
    }
};

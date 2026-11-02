import type { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';

import type { Observable } from 'rxjs';

@Injectable()
export class RequestsInterceptor implements HttpInterceptor {
    public intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        const apiRequest: HttpRequest<unknown> = request.clone({
            url: request.url.replace(request.url, `api/${request.url}`),
        });

        return next.handle(apiRequest);
    }
}

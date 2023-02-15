import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest,  } from '@angular/common/http';

import { Observable } from 'rxjs';

@Injectable()
export class RequestsInterceptor implements HttpInterceptor {
    public intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        request = request.clone({
            url: request.url.replace(request.url, `api/${request.url}`)
        });

        return next.handle(request);
    }
}

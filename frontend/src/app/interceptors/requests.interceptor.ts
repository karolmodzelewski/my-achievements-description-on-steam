import type { HttpInterceptorFn } from '@angular/common/http';

export const requestsInterceptor: HttpInterceptorFn = (request, next) => next(request.clone({ url: `api/${request.url}` }));

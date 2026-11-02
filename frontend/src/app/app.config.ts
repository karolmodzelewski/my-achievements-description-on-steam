import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi, withXhr } from '@angular/common/http';
import type { ApplicationConfig, Provider } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { RequestsInterceptor } from './interceptors/requests.interceptor';
import { MockMainInterceptor } from './mocks/mock-main.interceptor';
import { environment } from '../environments/environment';

const requestsInterceptor: Provider = {
    provide: HTTP_INTERCEPTORS,
    useClass: RequestsInterceptor,
    multi: true,
};
const mockMainInterceptor: Provider = {
    provide: HTTP_INTERCEPTORS,
    useClass: MockMainInterceptor,
    multi: true,
};

export const appConfig: ApplicationConfig = {
    providers: [provideRouter(routes), provideHttpClient(withXhr(), withInterceptorsFromDi()), ...(environment.production ? [requestsInterceptor] : [requestsInterceptor, mockMainInterceptor])],
};

import { provideHttpClient, withInterceptors } from '@angular/common/http';
import type { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { requestsInterceptor } from './interceptors/requests.interceptor';
import { mockMainInterceptor } from './mocks/mock-main.interceptor';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
    providers: [provideRouter(routes), provideHttpClient(withInterceptors(environment.production ? [requestsInterceptor] : [requestsInterceptor, mockMainInterceptor]))],
};

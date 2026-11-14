import { provideHttpClient, withInterceptors } from '@angular/common/http';
import type { ApplicationConfig } from '@angular/core';
import { inject, provideAppInitializer } from '@angular/core';
import { provideRouter } from '@angular/router';

import { provideTransloco } from '@jsverse/transloco';

import { routes } from './app.routes';
import { DEFAULT_LANGUAGE } from './constants/language.constants';
import { Language } from './enums/language.enum';
import { TranslocoJsonLoader } from './i18n/transloco-json.loader';
import { requestsInterceptor } from './interceptors/requests.interceptor';
import { mockMainInterceptor } from './mocks/mock-main.interceptor';
import { LanguageService } from './services/language.service';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(routes),
        provideHttpClient(withInterceptors(environment.production ? [requestsInterceptor] : [requestsInterceptor, mockMainInterceptor])),
        provideTransloco({
            config: {
                availableLangs: Object.values(Language),
                defaultLang: DEFAULT_LANGUAGE,
                fallbackLang: DEFAULT_LANGUAGE,
                missingHandler: { useFallbackTranslation: true },
                reRenderOnLangChange: true,
                prodMode: environment.production,
            },
            loader: TranslocoJsonLoader,
        }),
        provideAppInitializer(() => inject(LanguageService).initializeLanguage()),
    ],
};

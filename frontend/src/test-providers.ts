import type { EnvironmentProviders } from '@angular/core';
import { importProvidersFrom } from '@angular/core';

import { TranslocoTestingModule } from '@jsverse/transloco';

import { DEFAULT_LANGUAGE } from './app/constants/language.constants';
import { Language } from './app/enums/language.enum';
import en from './app/i18n/en.json';

// Applied to every TestBed by the providersFile option of the test builder, so specs don't have to set up translations themselves.
// Transloco provides only a testing module, which preloads the translations synchronously
const testProviders: EnvironmentProviders[] = [
    importProvidersFrom(
        TranslocoTestingModule.forRoot({
            langs: { [Language.ENGLISH]: en },
            preloadLangs: true,
            translocoConfig: { availableLangs: Object.values(Language), defaultLang: DEFAULT_LANGUAGE },
        })
    ),
];

export default testProviders;

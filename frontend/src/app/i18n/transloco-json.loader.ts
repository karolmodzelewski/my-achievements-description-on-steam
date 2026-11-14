import { Injectable } from '@angular/core';

import type { Translation, TranslocoLoader } from '@jsverse/transloco';

import { Language } from '../enums/language.enum';

// Bundled as lazy chunks instead of fetched with HttpClient, as its interceptors would redirect the request to the API
const TRANSLATION_IMPORTS: Record<Language, () => Promise<{ default: Translation }>> = {
    [Language.ENGLISH]: () => import('./en.json'),
    [Language.POLISH]: () => import('./pl.json'),
};

@Injectable({ providedIn: 'root' })
export class TranslocoJsonLoader implements TranslocoLoader {
    public async getTranslation(language: Language): Promise<Translation> {
        const { default: translation } = await TRANSLATION_IMPORTS[language]();

        return translation;
    }
}

import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';

import { firstValueFrom } from 'rxjs';

import { TranslocoService } from '@jsverse/transloco';

import { DEFAULT_LANGUAGE, LANGUAGE_STORAGE_KEY } from '../constants/language.constants';
import { Language } from '../enums/language.enum';

@Injectable({ providedIn: 'root' })
export class LanguageService {
    private readonly translocoService = inject(TranslocoService);
    private readonly document = inject(DOCUMENT);

    public readonly activeLanguage = signal<Language>(this.getStoredLanguage());

    // Awaited before the first render, so the application never presents translation keys instead of texts
    public async initializeLanguage(): Promise<void> {
        const language = this.activeLanguage();

        this.applyLanguage(language);
        await firstValueFrom(this.translocoService.load(language));
    }

    public setLanguage(language: Language): void {
        this.activeLanguage.set(language);
        this.applyLanguage(language);

        try {
            localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
        } catch {
            // Blocked storage only means the language isn't remembered after reloading
        }
    }

    private applyLanguage(language: Language): void {
        this.translocoService.setActiveLang(language);
        this.document.documentElement.lang = language;
    }

    private getStoredLanguage(): Language {
        try {
            const storedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);

            return Object.values(Language).find((language) => language === storedLanguage) ?? DEFAULT_LANGUAGE;
        } catch {
            return DEFAULT_LANGUAGE;
        }
    }
}

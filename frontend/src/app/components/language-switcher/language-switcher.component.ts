import { NgOptimizedImage } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatIconButton } from '@angular/material/button';

import { TranslocoPipe } from '@jsverse/transloco';

import { LANGUAGE_OPTIONS } from './constants/language-switcher.constants';
import type { Language } from '../../enums/language.enum';
import { LanguageService } from '../../services/language.service';

@Component({
    selector: 'mados-language-switcher',
    templateUrl: './language-switcher.component.html',
    styleUrl: './language-switcher.component.scss',
    imports: [NgOptimizedImage, MatIconButton, TranslocoPipe],
})
export class LanguageSwitcherComponent {
    private readonly languageService = inject(LanguageService);

    public readonly languageOptions = LANGUAGE_OPTIONS;
    public readonly activeLanguage = this.languageService.activeLanguage.asReadonly();

    public setLanguage(language: Language): void {
        this.languageService.setLanguage(language);
    }
}

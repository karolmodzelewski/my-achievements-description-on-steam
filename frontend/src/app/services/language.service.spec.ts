import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';

import { of } from 'rxjs';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TranslocoService } from '@jsverse/transloco';

import { LanguageService } from './language.service';
import { DEFAULT_LANGUAGE, LANGUAGE_STORAGE_KEY } from '../constants/language.constants';
import { Language } from '../enums/language.enum';

describe('LanguageService', () => {
    let service: LanguageService;
    let translocoService: TranslocoService;
    let document: Document;

    beforeEach(() => {
        localStorage.clear();

        translocoService = TestBed.inject(TranslocoService);
        document = TestBed.inject(DOCUMENT);
    });

    afterEach(() => {
        vi.restoreAllMocks();
        localStorage.clear();
        document.documentElement.lang = '';
    });

    describe('creation', () => {
        it('should use the stored language', () => {
            // Arrange
            localStorage.setItem(LANGUAGE_STORAGE_KEY, Language.POLISH);

            // Act
            service = TestBed.inject(LanguageService);

            // Assert
            expect(service.activeLanguage()).toBe(Language.POLISH);
        });

        it('should use the default language when no language is stored', () => {
            // Act
            service = TestBed.inject(LanguageService);

            // Assert
            expect(service.activeLanguage()).toBe(DEFAULT_LANGUAGE);
        });

        it('should use the default language when the stored language is not supported', () => {
            // Arrange
            localStorage.setItem(LANGUAGE_STORAGE_KEY, 'de');

            // Act
            service = TestBed.inject(LanguageService);

            // Assert
            expect(service.activeLanguage()).toBe(DEFAULT_LANGUAGE);
        });

        it('should use the default language when the storage is blocked', () => {
            // Arrange
            vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
                throw new Error('Blocked storage');
            });

            // Act
            service = TestBed.inject(LanguageService);

            // Assert
            expect(service.activeLanguage()).toBe(DEFAULT_LANGUAGE);
        });
    });

    describe('after creation', () => {
        beforeEach(() => {
            service = TestBed.inject(LanguageService);
        });

        it('should apply, present and remember the set language', () => {
            // Act
            service.setLanguage(Language.POLISH);

            // Assert
            expect(service.activeLanguage()).toBe(Language.POLISH);
            expect(translocoService.getActiveLang()).toBe(Language.POLISH);
            expect(document.documentElement.lang).toBe(Language.POLISH);
            expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe(Language.POLISH);
        });

        it('should still apply the set language when the storage is blocked', () => {
            // Arrange
            vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
                throw new Error('Blocked storage');
            });

            // Act
            service.setLanguage(Language.POLISH);

            // Assert
            expect(service.activeLanguage()).toBe(Language.POLISH);
            expect(translocoService.getActiveLang()).toBe(Language.POLISH);
        });

        it('should apply and load the active language on initialization', async () => {
            // Arrange
            const loadSpy = vi.spyOn(translocoService, 'load').mockReturnValue(of({}));

            // Act
            await service.initializeLanguage();

            // Assert
            expect(loadSpy).toHaveBeenCalledWith(DEFAULT_LANGUAGE);
            expect(document.documentElement.lang).toBe(DEFAULT_LANGUAGE);
        });
    });
});

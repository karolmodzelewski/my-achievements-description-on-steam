import type { DebugElement } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LanguageSwitcherComponent } from './language-switcher.component';
import { clickByTestId, getElementByTestId, queryAllByTestId } from '../../../testing/helpers/dom.helpers';
import { Language } from '../../enums/language.enum';
import { LanguageService } from '../../services/language.service';

describe('LanguageSwitcherComponent', () => {
    let fixture: ComponentFixture<LanguageSwitcherComponent>;
    let debugElement: DebugElement;
    let languageService: LanguageService;

    const englishButtonIndex = 0;
    const polishButtonIndex = 1;

    const isPressed = (index: number): boolean => getElementByTestId(debugElement, 'languageButton', index).getAttribute('aria-pressed') === 'true';

    beforeEach(async () => {
        localStorage.clear();

        languageService = TestBed.inject(LanguageService);
        fixture = TestBed.createComponent(LanguageSwitcherComponent);
        debugElement = fixture.debugElement;

        await fixture.whenStable();
    });

    afterEach(() => {
        localStorage.clear();
    });

    it('should present a button for every language', () => {
        // Assert
        expect(queryAllByTestId(debugElement, 'languageButton').length).toBe(Object.values(Language).length);
    });

    it('should mark the active language as pressed', () => {
        // Assert
        expect(isPressed(englishButtonIndex)).toBe(true);
        expect(isPressed(polishButtonIndex)).toBe(false);
    });

    it('should set the clicked language', async () => {
        // Arrange
        const setLanguageSpy = vi.spyOn(languageService, 'setLanguage');

        // Act
        await clickByTestId(fixture, 'languageButton', polishButtonIndex);

        // Assert
        expect(setLanguageSpy).toHaveBeenCalledWith(Language.POLISH);
        expect(isPressed(englishButtonIndex)).toBe(false);
        expect(isPressed(polishButtonIndex)).toBe(true);
    });
});

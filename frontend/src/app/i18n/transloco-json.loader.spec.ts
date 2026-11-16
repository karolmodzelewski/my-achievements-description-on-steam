import { TestBed } from '@angular/core/testing';

import { beforeEach, describe, expect, it } from 'vitest';

import en from './en.json';
import pl from './pl.json';
import { TranslocoJsonLoader } from './transloco-json.loader';
import { Language } from '../enums/language.enum';

describe('TranslocoJsonLoader', () => {
    let loader: TranslocoJsonLoader;

    beforeEach(() => {
        loader = TestBed.inject(TranslocoJsonLoader);
    });

    it('should load English translations', async () => {
        // Act
        const translation = await loader.getTranslation(Language.ENGLISH);

        // Assert
        expect(translation).toEqual(en);
    });

    it('should load Polish translations', async () => {
        // Act
        const translation = await loader.getTranslation(Language.POLISH);

        // Assert
        expect(translation).toEqual(pl);
    });
});

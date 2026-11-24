import { Language } from '../../../enums/language.enum';
import type { LanguageOption } from '../interfaces/language-option.interface';

export const LANGUAGE_OPTIONS: LanguageOption[] = [
    { language: Language.ENGLISH, name: 'English', flagPath: 'assets/flags/gb.svg' },
    { language: Language.POLISH, name: 'Polski', flagPath: 'assets/flags/pl.svg' },
];

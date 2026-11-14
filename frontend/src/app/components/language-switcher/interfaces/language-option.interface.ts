import type { Language } from '../../../enums/language.enum';
import type { LanguageName } from '../types/language-name.type';

export interface LanguageOption {
    language: Language;
    name: LanguageName;
    flagPath: string;
}

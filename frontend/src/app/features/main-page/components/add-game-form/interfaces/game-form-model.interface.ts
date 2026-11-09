import type { CategoryType } from '../../../../../enums/category-type.enum';

export interface GameFormModel {
    name: string;
    length: CategoryType | null;
    difficulty: CategoryType | null;
    lovedGame: boolean;
    badGame: boolean;
    doesntCount: boolean;
    buggedGame: boolean;
    adultGame: boolean;
    hasNewAchievements: boolean;
}

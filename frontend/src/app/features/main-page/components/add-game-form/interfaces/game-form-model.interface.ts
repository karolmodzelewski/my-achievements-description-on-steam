import type { GameGroupFormModel } from './game-group-form-model.interface';
import type { GameMainCategoryFormModel } from './game-main-category-form-model.interface';

export interface GameFormModel {
    name: string;
    // Ids of the selected length and difficulty categories
    length: number | null;
    difficulty: number | null;
    mainCategories: GameMainCategoryFormModel[];
    hasNewAchievements: boolean;
    groups: GameGroupFormModel[];
}

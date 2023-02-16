import { CategoryType } from '../enums/category-type.enum';

export interface AddGameRequestBody {
    name: string;
    gameCategories: CategoryType[];
    newAchievements: boolean;
}

import { CategoryType } from '../enums/category-type.enum';

export interface AddGameRequestBody {
    name: string;
    categories: CategoryType[];
    hasNewAchievements: boolean;
}

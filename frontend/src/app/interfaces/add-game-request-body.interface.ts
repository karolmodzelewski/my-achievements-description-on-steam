import type { AddGameGroupRequestBody } from './add-game-group-request-body.interface';
import type { CategoryType } from '../enums/category-type.enum';

export interface AddGameRequestBody {
    name: string;
    categories: CategoryType[];
    hasNewAchievements: boolean;
    groups: AddGameGroupRequestBody[];
}

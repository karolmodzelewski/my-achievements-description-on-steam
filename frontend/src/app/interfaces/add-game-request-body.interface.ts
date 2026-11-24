import type { AddGameGroupRequestBody } from './add-game-group-request-body.interface';

export interface AddGameRequestBody {
    name: string;
    // Ids of the categories
    categories: number[];
    hasNewAchievements: boolean;
    groups: AddGameGroupRequestBody[];
}

import { GameCategory } from './game-category.interface';

export interface Game {
    id: number;
    hasNewAchievements: boolean;
    oneHundredPercentIconName: string;
    name: string;
    categories?: GameCategory[];
}

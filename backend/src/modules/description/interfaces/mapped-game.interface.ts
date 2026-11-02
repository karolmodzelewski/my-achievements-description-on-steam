import type { GameCategory } from './game-category.interface';

export interface MappedGame {
    id: number;
    name: string;
    hasNewAchievements: boolean;
    categories: GameCategory[];
    oneHundredPercentIconName: string;
}

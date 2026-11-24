import type { GameCategory } from './game-category.interface';
import type { GameGroup } from './game-group.interface';

export interface Game {
    id: number;
    hasNewAchievements: boolean;
    oneHundredPercentIconName: string;
    name: string;
    categories?: GameCategory[];
    groups: GameGroup[];
}

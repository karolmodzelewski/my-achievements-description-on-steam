import type { GameCategory } from './game-category.interface';
import type { MappedGroup } from './mapped-group.interface';

export interface MappedGame {
    id: number;
    name: string;
    hasNewAchievements: boolean;
    categories: GameCategory[];
    oneHundredPercentIconName: string;
    groups: MappedGroup[];
}

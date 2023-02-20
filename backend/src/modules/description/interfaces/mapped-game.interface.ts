import { GameCategory } from './game-category.interface';

export interface MappedGame {
    id: number;
    name: string;
    categories: GameCategory[];
    oneHundredPercentIconName: string;
}

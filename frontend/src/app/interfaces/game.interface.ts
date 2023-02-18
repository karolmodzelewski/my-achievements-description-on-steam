import { GameCategory } from './game-category.interface';

export interface Game {
    id: number;
    oneHundredPercentIconName: string;
    name: string;
    categories?: GameCategory[];
}

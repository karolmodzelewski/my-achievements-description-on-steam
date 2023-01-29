import { CategoryType } from '../enums/category-type.enum';
import { GameCategory } from './game-category.interface';

export interface Game {
    oneHundredPercentIconName: string;
    name: string;
    categories?: GameCategory[];
}

import { CategoryType } from '../enums/category-type.enum';

export interface AddGameRequestBody {
    name: string;
    length?: CategoryType.LONG_GAME | CategoryType.VERY_LONG_GAME | CategoryType.ULTRA_LONG_GAME;
    difficulty?: CategoryType.HARD_GAME | CategoryType.VERY_HARD_GAME | CategoryType.ULTRA_HARD_GAME;
    lovedGame?: boolean;
    badGame?: boolean;
    doesntCount?: boolean;
    buggedGame?: boolean;
}

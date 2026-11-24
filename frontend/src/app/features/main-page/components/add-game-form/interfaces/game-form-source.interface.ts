import type { Category } from '../../../../../interfaces/category.interface';
import type { Game } from '../../../../../interfaces/game.interface';

export interface GameFormSource {
    game: Game | null;
    mainCategories: Category[];
    lengthCategories: Category[];
    difficultyCategories: Category[];
}

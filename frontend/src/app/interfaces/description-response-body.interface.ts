import type { Category } from './category.interface';
import type { Game } from './game.interface';

export interface DescriptionResponseBody {
    categories: Category[];
    completedGames: Game[];
    gamesWithNewAchievements: Game[];
}

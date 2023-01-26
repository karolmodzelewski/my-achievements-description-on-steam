import { Category } from './category.interface';
import { Game } from './game.interface';

export interface DescriptionResponseBody {
    categories: Category[];
    completedGames: Game[];
    gamesWithNewAchievements: Game[];
}

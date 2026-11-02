import type { CategoryWithAmount } from './category-with-amount.interface';
import type { MappedGame } from './mapped-game.interface';

export interface Description {
    categories: CategoryWithAmount[];
    completedGames: MappedGame[];
    gamesWithNewAchievements: MappedGame[];
}

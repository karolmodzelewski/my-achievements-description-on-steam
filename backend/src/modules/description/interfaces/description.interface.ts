import { CategoryWithAmount } from './category-with-amount.interface';
import { MappedGame } from './mapped-game.interface';

export interface Description {
    categories: CategoryWithAmount[];
    completedGames: MappedGame[];
    gamesWithNewAchievements: MappedGame[];
}

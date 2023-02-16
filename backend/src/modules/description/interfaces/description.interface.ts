import { GamesWithNewAchievements } from './../../add-game/entities/games-with-new-achievements.entity';
import { CompletedGames } from './../../add-game/entities/completed-games.entity';
import { CategoryWithAmount } from './category-with-amount.interface';

export interface Description {
    categories: CategoryWithAmount[];
    completedGames: CompletedGames[];
    gamesWithNewAchievements: GamesWithNewAchievements[];
}

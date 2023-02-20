import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { map, Observable, take, tap, zip } from 'rxjs';

import { Repository } from 'typeorm';

import { Description } from './../interfaces/description.interface';
import { Category } from '../../../entities/category.entity';
import { Game } from '../../../entities/game.entity';
import { CategoryType } from '../../../enums/category-type.enum';
import { CategoryWithAmount } from '../interfaces/category-with-amount.interface';
import { MappedGame } from '../interfaces/mapped-game.interface';
import { GameCategory } from '../interfaces/game-category.interface';

@Injectable()
export class DescriptionService {
    private readonly logger: Logger = new Logger(DescriptionService.name, { timestamp: true });
    private categoriesSortOrder: CategoryType[] = [
        CategoryType.LOVED_GAME,
        CategoryType.BAD_GAME,
        CategoryType.DOESNT_COUNT,
        CategoryType.BUGGED_GAME,
        CategoryType.LONG_GAME,
        CategoryType.VERY_LONG_GAME,
        CategoryType.ULTRA_LONG_GAME,
        CategoryType.HARD_GAME,
        CategoryType.VERY_HARD_GAME,
        CategoryType.ULTRA_HARD_GAME,
    ];

    constructor(
        @InjectRepository(Game)
        private readonly gameRepository: Repository<Game>,
        @InjectRepository(Category)
        private readonly categoriesRepository: Repository<Category>
    ) {}

    public getDescription(): Observable<Description> {
        return zip(this.categoriesRepository.find(), this.gameRepository.find()).pipe(
            take(1),
            tap(() => this.logger.log(`Get description`)),
            map((data: [Category[], Game[]]) => this.getMappedDescription(data))
        );
    }

    private getMappedDescription(data: [Category[], Game[]]): Description {
        const [categories, games] = data;

        let description: Description = {
            categories: [],
            completedGames: [],
            gamesWithNewAchievements: [],
        };

        if (!categories.length) {
            return description;
        }

        const completedGames: Game[] = games.filter((game: Game) => !game.hasNewAchievements);
        const gamesWithNewAchievements: Game[] = games.filter((game: Game) => game.hasNewAchievements);

        const mappedCategories: CategoryWithAmount[] = this.getMappedCategories(categories, games);
        const mappedCompletedGames: MappedGame[] = this.getMappedGames(categories, completedGames);
        const mappedGamesWithNewAchievements: MappedGame[] = this.getMappedGames(categories, gamesWithNewAchievements);

        description = {
            categories: mappedCategories,
            completedGames: mappedCompletedGames,
            gamesWithNewAchievements: mappedGamesWithNewAchievements,
        };

        return description;
    }

    private getMappedCategories(categories: Category[], games: Game[]): CategoryWithAmount[] {
        const categoriesWithAmount: CategoryWithAmount[] = categories
            .filter((category: Category) => category.type !== CategoryType.ONE_HUNDRED_PERCENT)
            .map((category: Category) => ({ ...category, amount: 0 }));

        return Object.keys(CategoryType)
            .filter((categoryType: string) => categoryType !== CategoryType.ONE_HUNDRED_PERCENT)
            .map((categoryType: string) => {
                let categoryFound: CategoryWithAmount = categoriesWithAmount.find((category: CategoryWithAmount) => category.type === categoryType);

                games
                    .flatMap((game: Game) => game.categories)
                    .forEach((category) => {
                        if (category === categoryType) {
                            categoryFound = { ...categoryFound, amount: (categoryFound.amount += 1) };
                        }
                    });

                return categoryFound;
            })
            .sort((a: CategoryWithAmount, b: CategoryWithAmount) => this.categoriesSortOrder.indexOf(a.type) - this.categoriesSortOrder.indexOf(b.type));
    }

    private getMappedGames(categories: Category[], games: Game[]): MappedGame[] {
        const oneHundredPercentIconName: string = categories.find((category: Category) => category.type === CategoryType.ONE_HUNDRED_PERCENT).iconName;

        const mappedGames: MappedGame[] = games
            .map((game: Game) => {
                const mappedGame: MappedGame = { ...game, categories: this.getMappedGameCategories(game.categories, categories), oneHundredPercentIconName };

                return mappedGame;
            })
            .sort((a: MappedGame, b: MappedGame) => a.name.localeCompare(b.name));

        return mappedGames;
    }

    private getMappedGameCategories(gameCategories: CategoryType[], categories: Category[]): GameCategory[] {
        return gameCategories
            .map((categoryType: CategoryType) => ({ type: categoryType, iconName: categories.find((category: Category) => category.type === categoryType).iconName }))
            .sort((a: GameCategory, b: GameCategory) => this.categoriesSortOrder.indexOf(a.type) - this.categoriesSortOrder.indexOf(b.type));
    }
}

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { map, Observable, take, tap, zip } from 'rxjs';

import { Repository } from 'typeorm';

import { Description } from '../interfaces/description.interface';
import { Category } from '../../../entities/category.entity';
import { Game } from '../../../entities/game.entity';
import { CategoryType } from '../../../enums/category-type.enum';
import { CategoryWithAmount } from '../interfaces/category-with-amount.interface';
import { MappedGame } from '../interfaces/mapped-game.interface';
import { GameCategory } from '../interfaces/game-category.interface';

@Injectable()
export class DescriptionService {
    private readonly logger = new Logger(DescriptionService.name, { timestamp: true });
    private readonly categoriesSortOrder = [
        CategoryType.LOVED_GAME,
        CategoryType.BAD_GAME,
        CategoryType.DOESNT_COUNT,
        CategoryType.BUGGED_GAME,
        CategoryType.ADULT_GAME,
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
            map(([categories, games]) => this.getMappedDescription(categories, games))
        );
    }

    private getMappedDescription(categories: Category[], games: Game[]): Description {
        if (!categories.length) {
            return {
                categories: [],
                completedGames: [],
                gamesWithNewAchievements: [],
            };
        }

        const completedGames = games.filter((game) => !game.hasNewAchievements);
        const gamesWithNewAchievements = games.filter((game) => game.hasNewAchievements);

        return {
            categories: this.getMappedCategories(categories, games),
            completedGames: this.getMappedGames(categories, completedGames),
            gamesWithNewAchievements: this.getMappedGames(categories, gamesWithNewAchievements),
        };
    }

    private getMappedCategories(categories: Category[], games: Game[]): CategoryWithAmount[] {
        const gamesCategoryTypes = games.flatMap((game) => game.categories);

        return categories
            .filter((category) => category.type !== CategoryType.ONE_HUNDRED_PERCENT)
            .map((category) => ({
                id: category.id,
                type: category.type,
                iconName: category.iconName,
                description: category.description,
                amount: gamesCategoryTypes.filter((categoryType) => categoryType === category.type).length,
            }))
            .sort((a, b) => this.compareBySortOrder(a.type, b.type));
    }

    private getMappedGames(categories: Category[], games: Game[]): MappedGame[] {
        const oneHundredPercentIconName = categories.find((category) => category.type === CategoryType.ONE_HUNDRED_PERCENT)?.iconName ?? '';

        return games
            .map((game) => ({
                id: game.id,
                name: game.name,
                hasNewAchievements: game.hasNewAchievements,
                categories: this.getMappedGameCategories(game.categories, categories),
                oneHundredPercentIconName,
            }))
            .sort((a, b) => a.name.localeCompare(b.name));
    }

    private getMappedGameCategories(gameCategoryTypes: CategoryType[], categories: Category[]): GameCategory[] {
        return gameCategoryTypes
            .flatMap((categoryType) => {
                const category = categories.find(({ type }) => type === categoryType);

                return category ? [{ type: categoryType, iconName: category.iconName }] : [];
            })
            .sort((a, b) => this.compareBySortOrder(a.type, b.type));
    }

    private compareBySortOrder(a: CategoryType, b: CategoryType): number {
        return this.categoriesSortOrder.indexOf(a) - this.categoriesSortOrder.indexOf(b);
    }
}

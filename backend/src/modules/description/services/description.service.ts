import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { map, Observable, take, tap, zip } from 'rxjs';

import { Repository } from 'typeorm';

import { Description } from '../interfaces/description.interface';
import { Category } from '../../../entities/category.entity';
import { Game } from '../../../entities/game.entity';
import { GameGroup } from '../../../entities/game-group.entity';
import { CategoryType } from '../../../enums/category-type.enum';
import { CategoryWithAmount } from '../interfaces/category-with-amount.interface';
import { DescriptionEntry } from '../interfaces/description-entry.interface';
import { DescriptionSection } from '../interfaces/description-section.interface';
import { MappedGame } from '../interfaces/mapped-game.interface';
import { MappedGroup } from '../interfaces/mapped-group.interface';
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
        return zip(this.categoriesRepository.find(), this.gameRepository.find({ relations: { groups: true } })).pipe(
            take(1),
            tap(() => this.logger.log(`Get description`)),
            map(([categories, games]) => this.getMappedDescription(categories, games))
        );
    }

    private getMappedDescription(categories: Category[], games: Game[]): Description {
        if (!categories.length) {
            return {
                categories: [],
                completed: this.getSection([]),
                newAchievements: this.getSection([]),
            };
        }

        const mappedGames = this.getMappedGames(categories, games);

        return {
            categories: this.getMappedCategories(categories, games),
            completed: this.getSection(mappedGames.flatMap((game) => this.getCompletedEntries(game))),
            newAchievements: this.getSection(mappedGames.flatMap((game) => this.getNewAchievementsEntries(game))),
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
                groups: this.getMappedGroups(game.groups),
            }))
            .sort((a, b) => a.name.localeCompare(b.name));
    }

    private getMappedGroups(groups: GameGroup[]): MappedGroup[] {
        return groups.map(({ id, name, hasNewAchievements }) => ({ id, name, hasNewAchievements })).sort((a, b) => a.name.localeCompare(b.name));
    }

    private getMappedGameCategories(gameCategoryTypes: CategoryType[], categories: Category[]): GameCategory[] {
        return gameCategoryTypes
            .flatMap((categoryType) => {
                const category = categories.find(({ type }) => type === categoryType);

                return category ? [{ type: categoryType, iconName: category.iconName }] : [];
            })
            .sort((a, b) => this.compareBySortOrder(a.type, b.type));
    }

    // A completed base game lists its completed groups below itself, otherwise each completed group is a separate entry
    private getCompletedEntries(game: MappedGame): DescriptionEntry[] {
        const completedGroups = game.groups.filter((group) => !group.hasNewAchievements);

        if (!game.hasNewAchievements) {
            return [{ game, group: null, listedGroups: completedGroups }];
        }

        return completedGroups.map((group) => ({ game, group, listedGroups: [] }));
    }

    private getNewAchievementsEntries(game: MappedGame): DescriptionEntry[] {
        const groupEntries = game.groups.filter((group) => group.hasNewAchievements).map((group) => ({ game, group, listedGroups: [] }));

        return game.hasNewAchievements ? [{ game, group: null, listedGroups: [] }, ...groupEntries] : groupEntries;
    }

    private getSection(entries: DescriptionEntry[]): DescriptionSection {
        const gamesAmount = entries.filter(({ group }) => group === null).length;
        const groupsAmount = entries.reduce((amount, { group, listedGroups }) => amount + (group ? 1 : 0) + listedGroups.length, 0);

        return {
            amount: gamesAmount + groupsAmount,
            gamesAmount,
            groupsAmount,
            entries,
        };
    }

    private compareBySortOrder(a: CategoryType, b: CategoryType): number {
        return this.categoriesSortOrder.indexOf(a) - this.categoriesSortOrder.indexOf(b);
    }
}

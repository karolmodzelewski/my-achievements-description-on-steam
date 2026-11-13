import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { map, Observable, take, tap, zip } from 'rxjs';

import { Repository } from 'typeorm';

import { Description } from '../interfaces/description.interface';
import { Category } from '../../../entities/category.entity';
import { Game } from '../../../entities/game.entity';
import { GameGroup } from '../../../entities/game-group.entity';
import { CategoryKind } from '../../../enums/category-kind.enum';
import { compareCategories } from '../../../utils/category-order.util';
import { CategoryWithAmount } from '../interfaces/category-with-amount.interface';
import { DescriptionEntry } from '../interfaces/description-entry.interface';
import { DescriptionSection } from '../interfaces/description-section.interface';
import { MappedGame } from '../interfaces/mapped-game.interface';
import { MappedGroup } from '../interfaces/mapped-group.interface';
import { GameCategory } from '../interfaces/game-category.interface';

@Injectable()
export class DescriptionService {
    private readonly logger = new Logger(DescriptionService.name, { timestamp: true });

    constructor(
        @InjectRepository(Game)
        private readonly gameRepository: Repository<Game>,
        @InjectRepository(Category)
        private readonly categoriesRepository: Repository<Category>
    ) {}

    public getDescription(): Observable<Description> {
        return zip(this.categoriesRepository.find(), this.gameRepository.find({ relations: { groups: true, categories: true } })).pipe(
            take(1),
            map(([categories, games]) => this.getMappedDescription(categories.sort(compareCategories), games)),
            tap(({ categories, completed, newAchievements }) =>
                this.logger.debug(`Built description: ${categories.length} categories, ${completed.amount} completed and ${newAchievements.amount} with new achievements`)
            )
        );
    }

    // Categories are sorted, so both the listed categories and the icons of every game go from the first main to the last difficulty category
    private getMappedDescription(sortedCategories: Category[], games: Game[]): Description {
        const mappedGames = this.getMappedGames(sortedCategories, games);

        return {
            categories: this.getMappedCategories(sortedCategories, games),
            completed: this.getSection(mappedGames.flatMap((game) => this.getCompletedEntries(game))),
            newAchievements: this.getSection(mappedGames.flatMap((game) => this.getNewAchievementsEntries(game))),
        };
    }

    private getMappedCategories(sortedCategories: Category[], games: Game[]): CategoryWithAmount[] {
        const gamesCategoriesIds = games.flatMap((game) => game.categories.map(({ id }) => id));

        return sortedCategories
            .filter((category) => category.kind !== CategoryKind.ONE_HUNDRED_PERCENT)
            .map(({ id, kind, name, description, iconName, shouldHideGames }) => ({
                id,
                kind,
                name,
                description,
                iconName,
                shouldHideGames,
                amount: gamesCategoriesIds.filter((categoryId) => categoryId === id).length,
            }));
    }

    private getMappedGames(sortedCategories: Category[], games: Game[]): MappedGame[] {
        const oneHundredPercentIconName = sortedCategories.find((category) => category.kind === CategoryKind.ONE_HUNDRED_PERCENT)?.iconName ?? '';

        return games
            .map((game) => ({
                id: game.id,
                name: game.name,
                hasNewAchievements: game.hasNewAchievements,
                categories: this.getMappedGameCategories(
                    game.categories.map(({ id }) => id),
                    sortedCategories
                ),
                oneHundredPercentIconName,
                groups: this.getMappedGroups(game.groups),
            }))
            .sort((a, b) => a.name.localeCompare(b.name));
    }

    private getMappedGroups(groups: GameGroup[]): MappedGroup[] {
        return groups.map(({ id, name, hasNewAchievements }) => ({ id, name, hasNewAchievements })).sort((a, b) => a.name.localeCompare(b.name));
    }

    private getMappedGameCategories(gameCategoriesIds: number[], sortedCategories: Category[]): GameCategory[] {
        return sortedCategories
            .filter((category) => category.kind !== CategoryKind.ONE_HUNDRED_PERCENT && gameCategoriesIds.includes(category.id))
            .map(({ id, kind, iconName, shouldHideGames }) => ({ id, kind, iconName, shouldHideGames }));
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
}

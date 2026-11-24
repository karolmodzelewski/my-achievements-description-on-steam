import { HttpStatus } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';

import request from 'supertest';
import type { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { createE2eApplication } from './helpers/app.helpers';
import { getOneHundredPercentCategory, insertCategory, insertGame, resetDatabase } from './helpers/database.helpers';
import { Category } from '../src/entities/category.entity';
import type { Game } from '../src/entities/game.entity';
import { CategoryKind } from '../src/enums/category-kind.enum';
import type { Description } from '../src/modules/description/interfaces/description.interface';
import type { GameCategory } from '../src/modules/description/interfaces/game-category.interface';
import type { MappedGame } from '../src/modules/description/interfaces/mapped-game.interface';

describe('description', () => {
    let app: INestApplication<App>;
    let dataSource: DataSource;
    let oneHundredPercentCategory: Category;

    const ONE_HUNDRED_PERCENT_ICON_NAME = ':100:';

    const getDescription = (): request.Test => request(app.getHttpServer()).get('/api/description');

    const toGameCategory = ({ id, kind, iconName, shouldHideGames }: Category): GameCategory => ({ id, kind, iconName, shouldHideGames });

    const toMappedGame = ({ id, name, hasNewAchievements, groups }: Game, categories: Category[] = []): MappedGame => ({
        id,
        name,
        hasNewAchievements,
        categories: categories.map(toGameCategory),
        oneHundredPercentIconName: ONE_HUNDRED_PERCENT_ICON_NAME,
        groups,
    });

    beforeAll(async () => {
        app = await createE2eApplication();
        dataSource = app.get(DataSource);
    });

    beforeEach(async () => {
        await resetDatabase(dataSource);

        oneHundredPercentCategory = await getOneHundredPercentCategory(dataSource);

        await dataSource.getRepository(Category).update(oneHundredPercentCategory.id, { iconName: ONE_HUNDRED_PERCENT_ICON_NAME });
    });

    afterAll(async () => {
        await app.close();
    });

    describe('GET /api/description', () => {
        it('should return an empty description when only the 100% category is saved', async () => {
            // Arrange
            const emptySection = { amount: 0, gamesAmount: 0, groupsAmount: 0, entries: [] };

            // Act
            const response = await getDescription();

            // Assert
            expect(response.status).toBe(HttpStatus.OK);
            expect(response.body).toEqual({ categories: [], completed: emptySection, newAchievements: emptySection });
        });

        it('should return the categories from the first main to the last difficulty category with amounts of their games', async () => {
            // Arrange
            const hardCategory = await insertCategory(dataSource, { kind: CategoryKind.DIFFICULTY, name: 'Hard', position: 0 });
            const shortCategory = await insertCategory(dataSource, { kind: CategoryKind.LENGTH, name: 'Short', position: 0 });
            const hatedCategory = await insertCategory(dataSource, { name: 'Hated game', shouldHideGames: true, position: 1 });
            const lovedCategory = await insertCategory(dataSource, { name: 'Loved game', position: 0 });

            await insertGame(dataSource, { name: 'Celeste', categories: [lovedCategory, shortCategory] });
            await insertGame(dataSource, { name: 'Hades', categories: [lovedCategory] });

            // Act
            const response = await getDescription();

            // Assert
            const { categories } = response.body as Description;

            expect(response.status).toBe(HttpStatus.OK);
            expect(categories).toEqual([
                { id: lovedCategory.id, kind: CategoryKind.MAIN, name: 'Loved game', description: lovedCategory.description, iconName: lovedCategory.iconName, shouldHideGames: false, amount: 2 },
                { id: hatedCategory.id, kind: CategoryKind.MAIN, name: 'Hated game', description: hatedCategory.description, iconName: hatedCategory.iconName, shouldHideGames: true, amount: 0 },
                { id: shortCategory.id, kind: CategoryKind.LENGTH, name: 'Short', description: shortCategory.description, iconName: shortCategory.iconName, shouldHideGames: false, amount: 1 },
                { id: hardCategory.id, kind: CategoryKind.DIFFICULTY, name: 'Hard', description: hardCategory.description, iconName: hardCategory.iconName, shouldHideGames: false, amount: 0 },
            ]);
        });

        it('should split games and groups sorted by name into completed ones and ones with new achievements', async () => {
            // Arrange
            const hades = await insertGame(dataSource, { name: 'Hades', hasNewAchievements: true }, [{ name: 'Extra', hasNewAchievements: false }]);
            const celeste = await insertGame(dataSource, { name: 'Celeste', hasNewAchievements: false }, [
                { name: 'Farewell', hasNewAchievements: false },
                { name: 'B-Sides', hasNewAchievements: true },
            ]);
            const brotato = await insertGame(dataSource, { name: 'Brotato', hasNewAchievements: false });
            const [extraGroup] = hades.groups;
            const [farewellGroup, bSidesGroup] = celeste.groups;
            const mappedHades = toMappedGame(hades);
            const mappedCeleste = { ...toMappedGame(celeste), groups: [bSidesGroup, farewellGroup] };
            const mappedBrotato = toMappedGame(brotato);

            // Act
            const response = await getDescription();

            // Assert
            const { completed, newAchievements } = response.body as Description;

            expect(response.status).toBe(HttpStatus.OK);
            expect(completed).toEqual({
                amount: 4,
                gamesAmount: 2,
                groupsAmount: 2,
                entries: [
                    { game: mappedBrotato, group: null, listedGroups: [] },
                    { game: mappedCeleste, group: null, listedGroups: [farewellGroup] },
                    { game: mappedHades, group: extraGroup, listedGroups: [] },
                ],
            });
            expect(newAchievements).toEqual({
                amount: 2,
                gamesAmount: 1,
                groupsAmount: 1,
                entries: [
                    { game: mappedCeleste, group: bSidesGroup, listedGroups: [] },
                    { game: mappedHades, group: null, listedGroups: [] },
                ],
            });
        });

        it('should give games their categories from the first main to the last difficulty category without the 100% category', async () => {
            // Arrange
            const hardCategory = await insertCategory(dataSource, { kind: CategoryKind.DIFFICULTY, name: 'Hard' });
            const lovedCategory = await insertCategory(dataSource, { name: 'Loved game', shouldHideGames: true });
            const game = await insertGame(dataSource, { categories: [hardCategory, oneHundredPercentCategory, lovedCategory] });

            // Act
            const response = await getDescription();

            // Assert
            const { categories, completed } = response.body as Description;

            expect(response.status).toBe(HttpStatus.OK);
            expect(completed.entries).toEqual([{ game: toMappedGame(game, [lovedCategory, hardCategory]), group: null, listedGroups: [] }]);
            expect(categories.map(({ id }) => id)).toEqual([lovedCategory.id, hardCategory.id]);
        });
    });
});

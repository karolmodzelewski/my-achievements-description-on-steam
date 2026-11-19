import { HttpStatus } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';

import request from 'supertest';
import type { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { createE2eApplication } from './helpers/app.helpers';
import { findGames, getOneHundredPercentCategory, insertCategory, insertGame, resetDatabase } from './helpers/database.helpers';
import { CATEGORIES_MAX_AMOUNT, GROUPS_MAX_AMOUNT, NAME_MAX_LENGTH } from '../src/constants/validation.constants';
import type { Category } from '../src/entities/category.entity';
import type { Game } from '../src/entities/game.entity';
import { GameGroup } from '../src/entities/game-group.entity';
import { CategoryKind } from '../src/enums/category-kind.enum';
import { ErrorCode } from '../src/enums/error-code.enum';
import type { GameDto } from '../src/modules/game/dtos/game.dto';
import { buildGame, buildGameDto, buildGameGroupDto } from '../src/testing/builders/game.builders';

describe('game', () => {
    let app: INestApplication<App>;
    let dataSource: DataSource;
    let lovedCategory: Category;
    let shortCategory: Category;
    let longCategory: Category;
    let easyCategory: Category;
    let hardCategory: Category;

    const emptyNameResponseBody = { message: 'Game or group name has to be provided', errorCode: ErrorCode.EMPTY_NAME, statusCode: HttpStatus.BAD_REQUEST };

    const getUnassignableCategoriesResponseBody = (reason: string): object => ({
        message: `Game can belong only to saved categories, with at most one length and one difficulty category (${reason})`,
        error: 'Bad Request',
        statusCode: HttpStatus.BAD_REQUEST,
    });

    // Every case gets the categories once they're saved
    const unassignableCategoriesCases: [string, () => Promise<number[]>, string][] = [
        ['a category which is not saved', () => Promise.resolve([999]), 'unknown category ids: 999'],
        ['the 100% category', async () => [(await getOneHundredPercentCategory(dataSource)).id], `the 100% category can't be assigned`],
        ['two length categories', () => Promise.resolve([shortCategory.id, longCategory.id]), '2 length categories'],
        ['two difficulty categories', () => Promise.resolve([easyCategory.id, hardCategory.id]), '2 difficulty categories'],
    ];

    const invalidGameCases: [string, Partial<GameDto> & Record<string, unknown>, string][] = [
        ['a too long name', { name: 'a'.repeat(NAME_MAX_LENGTH + 1) }, `name must be shorter than or equal to ${NAME_MAX_LENGTH} characters`],
        ['a category id which is not an integer', { categories: [1.5] }, 'each value in categories must be an integer number'],
        ['duplicated categories', { categories: [1, 1] }, `All categories's elements must be unique`],
        [
            `more than ${CATEGORIES_MAX_AMOUNT} categories`,
            { categories: Array.from({ length: CATEGORIES_MAX_AMOUNT + 1 }, (_categoryId, index) => index + 1) },
            `categories must contain no more than ${CATEGORIES_MAX_AMOUNT} elements`,
        ],
        ['a hasNewAchievements which is not a boolean', { hasNewAchievements: 'yes' as unknown as boolean }, 'hasNewAchievements must be a boolean value'],
        ['groups with duplicated names', { groups: [buildGameGroupDto(), buildGameGroupDto({ hasNewAchievements: true })] }, `All groups's elements must be unique`],
        [
            `more than ${GROUPS_MAX_AMOUNT} groups`,
            { groups: Array.from({ length: GROUPS_MAX_AMOUNT + 1 }, (_group, index) => buildGameGroupDto({ name: `DLC ${index}` })) },
            `groups must contain no more than ${GROUPS_MAX_AMOUNT} elements`,
        ],
        ['a group with a too long name', { groups: [buildGameGroupDto({ name: 'a'.repeat(NAME_MAX_LENGTH + 1) })] }, `groups.0.name must be shorter than or equal to ${NAME_MAX_LENGTH} characters`],
        ['a group without hasNewAchievements', { groups: [buildGameGroupDto({ hasNewAchievements: undefined })] }, 'groups.0.hasNewAchievements must be a boolean value'],
        ['an unknown property', { isFavourite: true }, 'property isFavourite should not exist'],
    ];

    beforeAll(async () => {
        app = await createE2eApplication();
        dataSource = app.get(DataSource);
    });

    beforeEach(async () => {
        await resetDatabase(dataSource);

        lovedCategory = await insertCategory(dataSource, { kind: CategoryKind.MAIN, name: 'Loved game' });
        shortCategory = await insertCategory(dataSource, { kind: CategoryKind.LENGTH, name: 'Short', position: 0 });
        longCategory = await insertCategory(dataSource, { kind: CategoryKind.LENGTH, name: 'Long', position: 1 });
        easyCategory = await insertCategory(dataSource, { kind: CategoryKind.DIFFICULTY, name: 'Easy', position: 0 });
        hardCategory = await insertCategory(dataSource, { kind: CategoryKind.DIFFICULTY, name: 'Hard', position: 1 });
    });

    afterAll(async () => {
        await app.close();
    });

    describe('POST /api/game', () => {
        const createGame = (body: object): request.Test => request(app.getHttpServer()).post('/api/game').send(body);

        it('should create the game with trimmed names, its categories and its groups', async () => {
            // Act
            const response = await createGame(
                buildGameDto({
                    name: ' Hollow Knight ',
                    categories: [hardCategory.id, lovedCategory.id, shortCategory.id],
                    hasNewAchievements: true,
                    groups: [buildGameGroupDto({ name: ' Godmaster ', hasNewAchievements: true }), buildGameGroupDto({ name: 'Hidden Dreams' })],
                })
            );

            // Assert
            expect(response.status).toBe(HttpStatus.NO_CONTENT);
            expect(response.body).toEqual({});
            expect(await findGames(dataSource)).toEqual([
                {
                    id: 1,
                    name: 'Hollow Knight',
                    hasNewAchievements: true,
                    categories: [lovedCategory, shortCategory, hardCategory],
                    groups: [
                        { id: 1, name: 'Godmaster', hasNewAchievements: true },
                        { id: 2, name: 'Hidden Dreams', hasNewAchievements: false },
                    ],
                },
            ]);
        });

        it.each<[string, Partial<GameDto>]>([
            ['an empty name', { name: '' }],
            ['a blank name', { name: '   ' }],
            ['a group with a blank name', { groups: [buildGameGroupDto({ name: ' ' })] }],
        ])('should reject a game with %s with an error code', async (_description, overrides) => {
            // Act
            const response = await createGame(buildGameDto(overrides));

            // Assert
            expect(response.status).toBe(HttpStatus.BAD_REQUEST);
            expect(response.body).toEqual(emptyNameResponseBody);
            expect(await findGames(dataSource)).toEqual([]);
        });

        it('should reject a game with the name of a saved game', async () => {
            // Arrange
            const savedGame = await insertGame(dataSource, { name: 'Game' });

            // Act
            const response = await createGame(buildGameDto({ name: ' Game ' }));

            // Assert
            expect(response.status).toBe(HttpStatus.CONFLICT);
            expect(response.body).toEqual({ message: `Game with name 'Game' already exists`, error: 'Conflict', statusCode: HttpStatus.CONFLICT });
            expect(await findGames(dataSource)).toEqual([savedGame]);
        });

        it.each(unassignableCategoriesCases)('should reject a game which belongs to %s', async (_description, getCategoriesIds, reason) => {
            // Arrange
            const categoriesIds = await getCategoriesIds();

            // Act
            const response = await createGame(buildGameDto({ categories: categoriesIds }));

            // Assert
            expect(response.status).toBe(HttpStatus.BAD_REQUEST);
            expect(response.body).toEqual(getUnassignableCategoriesResponseBody(reason));
            expect(await findGames(dataSource)).toEqual([]);
        });

        it.each(invalidGameCases)('should reject a game with %s', async (_description, overrides, message) => {
            // Act
            const response = await createGame(buildGameDto(overrides));

            // Assert
            expect(response.status).toBe(HttpStatus.BAD_REQUEST);
            expect(response.body).toEqual({ message: [message], error: 'Bad Request', statusCode: HttpStatus.BAD_REQUEST });
            expect(await findGames(dataSource)).toEqual([]);
        });
    });

    describe('PUT /api/game/:id', () => {
        let savedGame: Game;
        let otherGame: Game;

        const updateGame = (id: number | string, body: object): request.Test => request(app.getHttpServer()).put(`/api/game/${id}`).send(body);

        beforeEach(async () => {
            savedGame = await insertGame(dataSource, { name: 'Game', categories: [lovedCategory, shortCategory] }, [{ name: 'DLC' }, { name: 'Expansion', hasNewAchievements: true }]);
            otherGame = await insertGame(dataSource, { name: 'Other game' });
        });

        it('should replace the game with its categories and groups', async () => {
            // Act
            const response = await updateGame(
                savedGame.id,
                buildGameDto({ name: ' Renamed game ', categories: [longCategory.id, easyCategory.id], hasNewAchievements: true, groups: [buildGameGroupDto({ name: ' Season pass ' })] })
            );

            // Assert
            expect(response.status).toBe(HttpStatus.NO_CONTENT);
            expect(await findGames(dataSource)).toEqual([
                { id: savedGame.id, name: 'Renamed game', hasNewAchievements: true, categories: [longCategory, easyCategory], groups: [{ id: 3, name: 'Season pass', hasNewAchievements: false }] },
                otherGame,
            ]);
        });

        it('should keep the name of the game', async () => {
            // Act
            const response = await updateGame(savedGame.id, buildGameDto({ name: 'Game', hasNewAchievements: true }));

            // Assert
            expect(response.status).toBe(HttpStatus.NO_CONTENT);
            expect(await findGames(dataSource)).toEqual([{ id: savedGame.id, name: 'Game', hasNewAchievements: true, categories: [], groups: [] }, otherGame]);
        });

        it('should reject a game which is not saved', async () => {
            // Act
            const response = await updateGame(999, buildGameDto());

            // Assert
            expect(response.status).toBe(HttpStatus.NOT_FOUND);
            expect(response.body).toEqual({ message: `Game with id '999' doesn't exist`, error: 'Not Found', statusCode: HttpStatus.NOT_FOUND });
            expect(await findGames(dataSource)).toEqual([savedGame, otherGame]);
        });

        it('should reject an id which is not a number', async () => {
            // Act
            const response = await updateGame('game', buildGameDto());

            // Assert
            expect(response.status).toBe(HttpStatus.BAD_REQUEST);
            expect(response.body).toEqual({ message: 'Validation failed (numeric string is expected)', error: 'Bad Request', statusCode: HttpStatus.BAD_REQUEST });
            expect(await findGames(dataSource)).toEqual([savedGame, otherGame]);
        });

        it('should reject a game with an empty name with an error code', async () => {
            // Act
            const response = await updateGame(savedGame.id, buildGameDto({ name: '' }));

            // Assert
            expect(response.status).toBe(HttpStatus.BAD_REQUEST);
            expect(response.body).toEqual(emptyNameResponseBody);
            expect(await findGames(dataSource)).toEqual([savedGame, otherGame]);
        });

        it('should reject renaming the game to the name of another saved game', async () => {
            // Act
            const response = await updateGame(savedGame.id, buildGameDto({ name: 'Other game' }));

            // Assert
            expect(response.status).toBe(HttpStatus.CONFLICT);
            expect(response.body).toEqual({ message: `Game with name 'Other game' already exists`, error: 'Conflict', statusCode: HttpStatus.CONFLICT });
            expect(await findGames(dataSource)).toEqual([savedGame, otherGame]);
        });

        it.each(unassignableCategoriesCases)('should reject a game which belongs to %s', async (_description, getCategoriesIds, reason) => {
            // Arrange
            const categoriesIds = await getCategoriesIds();

            // Act
            const response = await updateGame(savedGame.id, buildGameDto({ categories: categoriesIds }));

            // Assert
            expect(response.status).toBe(HttpStatus.BAD_REQUEST);
            expect(response.body).toEqual(getUnassignableCategoriesResponseBody(reason));
            expect(await findGames(dataSource)).toEqual([savedGame, otherGame]);
        });

        it.each(invalidGameCases)('should reject a game with %s', async (_description, overrides, message) => {
            // Act
            const response = await updateGame(savedGame.id, buildGameDto(overrides));

            // Assert
            expect(response.status).toBe(HttpStatus.BAD_REQUEST);
            expect(response.body).toEqual({ message: [message], error: 'Bad Request', statusCode: HttpStatus.BAD_REQUEST });
            expect(await findGames(dataSource)).toEqual([savedGame, otherGame]);
        });
    });

    describe('DELETE /api/game/:id', () => {
        let savedGame: Game;
        let otherGame: Game;

        const deleteGame = (id: number | string): request.Test => request(app.getHttpServer()).delete(`/api/game/${id}`);

        beforeEach(async () => {
            savedGame = await insertGame(dataSource, { name: 'Game', categories: [lovedCategory] }, [{ name: 'DLC' }]);
            otherGame = await insertGame(dataSource, { name: 'Other game', categories: [lovedCategory] }, [{ name: 'Other DLC' }]);
        });

        it('should delete the game with its groups', async () => {
            // Act
            const response = await deleteGame(savedGame.id);

            // Assert
            expect(response.status).toBe(HttpStatus.NO_CONTENT);
            expect(await findGames(dataSource)).toEqual([otherGame]);
            expect(await dataSource.getRepository(GameGroup).count()).toBe(1);
        });

        it('should reject a game which is not saved', async () => {
            // Act
            const response = await deleteGame(999);

            // Assert
            expect(response.status).toBe(HttpStatus.NOT_FOUND);
            expect(response.body).toEqual({ message: `Game with id '999' doesn't exist`, error: 'Not Found', statusCode: HttpStatus.NOT_FOUND });
            expect(await findGames(dataSource)).toEqual([savedGame, otherGame]);
        });

        it('should reject an id which is not a number', async () => {
            // Act
            const response = await deleteGame('game');

            // Assert
            expect(response.status).toBe(HttpStatus.BAD_REQUEST);
            expect(response.body).toEqual({ message: 'Validation failed (numeric string is expected)', error: 'Bad Request', statusCode: HttpStatus.BAD_REQUEST });
            expect(await findGames(dataSource)).toEqual([savedGame, otherGame]);
        });
    });

    describe('DELETE /api/game/:id/group/:groupId', () => {
        let savedGame: Game;
        let otherGame: Game;

        const deleteGroup = (id: number | string, groupId: number | string): request.Test => request(app.getHttpServer()).delete(`/api/game/${id}/group/${groupId}`);

        beforeEach(async () => {
            savedGame = await insertGame(dataSource, { name: 'Game' }, [{ name: 'DLC' }, { name: 'Expansion' }]);
            otherGame = await insertGame(dataSource, { name: 'Other game' }, [{ name: 'Other DLC' }]);
        });

        it('should delete only the group of the game', async () => {
            // Arrange
            const [dlcGroup, expansionGroup] = savedGame.groups;

            // Act
            const response = await deleteGroup(savedGame.id, dlcGroup.id);

            // Assert
            expect(response.status).toBe(HttpStatus.NO_CONTENT);
            expect(await findGames(dataSource)).toEqual([buildGame({ id: savedGame.id, name: 'Game', groups: [expansionGroup] }), otherGame]);
        });

        it('should reject a group of another game', async () => {
            // Arrange
            const [otherDlcGroup] = otherGame.groups;

            // Act
            const response = await deleteGroup(savedGame.id, otherDlcGroup.id);

            // Assert
            expect(response.status).toBe(HttpStatus.NOT_FOUND);
            expect(response.body).toEqual({
                message: `Group with id '${otherDlcGroup.id}' of game with id '${savedGame.id}' doesn't exist`,
                error: 'Not Found',
                statusCode: HttpStatus.NOT_FOUND,
            });
            expect(await findGames(dataSource)).toEqual([savedGame, otherGame]);
        });

        it('should reject a group which is not saved', async () => {
            // Act
            const response = await deleteGroup(savedGame.id, 999);

            // Assert
            expect(response.status).toBe(HttpStatus.NOT_FOUND);
            expect(response.body).toEqual({ message: `Group with id '999' of game with id '${savedGame.id}' doesn't exist`, error: 'Not Found', statusCode: HttpStatus.NOT_FOUND });
            expect(await findGames(dataSource)).toEqual([savedGame, otherGame]);
        });

        it('should reject a group id which is not a number', async () => {
            // Act
            const response = await deleteGroup(savedGame.id, 'dlc');

            // Assert
            expect(response.status).toBe(HttpStatus.BAD_REQUEST);
            expect(response.body).toEqual({ message: 'Validation failed (numeric string is expected)', error: 'Bad Request', statusCode: HttpStatus.BAD_REQUEST });
            expect(await findGames(dataSource)).toEqual([savedGame, otherGame]);
        });
    });
});

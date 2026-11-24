import { HttpStatus } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';

import request from 'supertest';
import type { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { createE2eApplication } from './helpers/app.helpers';
import { findCategories, findGames, getOneHundredPercentCategory, insertCategory, insertGame, resetDatabase } from './helpers/database.helpers';
import { CATEGORIES_MAX_AMOUNT, DESCRIPTION_MAX_LENGTH, ICON_NAME_MAX_LENGTH, NAME_MAX_LENGTH } from '../src/constants/validation.constants';
import type { Category } from '../src/entities/category.entity';
import { CategoryKind } from '../src/enums/category-kind.enum';
import { ErrorCode } from '../src/enums/error-code.enum';
import type { CategoryDto } from '../src/modules/categories/dtos/category.dto';
import { buildCategory, buildCategoryDto } from '../src/testing/builders/category.builders';

describe('categories', () => {
    let app: INestApplication<App>;
    let dataSource: DataSource;
    let oneHundredPercentCategory: Category;

    beforeAll(async () => {
        app = await createE2eApplication();
        dataSource = app.get(DataSource);
    });

    beforeEach(async () => {
        await resetDatabase(dataSource);

        oneHundredPercentCategory = await getOneHundredPercentCategory(dataSource);
    });

    afterAll(async () => {
        await app.close();
    });

    describe('GET /api/categories', () => {
        const getCategories = (): request.Test => request(app.getHttpServer()).get('/api/categories');

        it('should return only the 100% category when no category is saved', async () => {
            // Act
            const response = await getCategories();

            // Assert
            expect(response.status).toBe(HttpStatus.OK);
            expect(response.body).toEqual([oneHundredPercentCategory]);
        });

        it('should return the categories from the first main to the last difficulty category', async () => {
            // Arrange
            const hardCategory = await insertCategory(dataSource, { kind: CategoryKind.DIFFICULTY, name: 'Hard', position: 0 });
            const longCategory = await insertCategory(dataSource, { kind: CategoryKind.LENGTH, name: 'Long', position: 1 });
            const shortCategory = await insertCategory(dataSource, { kind: CategoryKind.LENGTH, name: 'Short', position: 0 });
            const hatedCategory = await insertCategory(dataSource, { kind: CategoryKind.MAIN, name: 'Hated game', position: 1 });
            const lovedCategory = await insertCategory(dataSource, { kind: CategoryKind.MAIN, name: 'Loved game', position: 0 });

            // Act
            const response = await getCategories();

            // Assert
            expect(response.status).toBe(HttpStatus.OK);
            expect(response.body).toEqual([oneHundredPercentCategory, lovedCategory, hatedCategory, shortCategory, longCategory, hardCategory]);
        });
    });

    describe('PUT /api/categories/:kind', () => {
        const saveCategories = (kind: string, body: object): request.Test => request(app.getHttpServer()).put(`/api/categories/${kind}`).send(body);

        it('should create the categories in the order of the request with trimmed texts', async () => {
            // Act
            const response = await saveCategories(CategoryKind.MAIN, [
                buildCategoryDto({ id: undefined, name: ' Loved game ', description: ' The game I fell in love with ', iconName: ' :heart: ', shouldHideGames: true }),
                buildCategoryDto({ id: undefined, name: 'Hated game', description: 'The game I hated', iconName: ':broken_heart:' }),
            ]);

            // Assert
            expect(response.status).toBe(HttpStatus.NO_CONTENT);
            expect(await findCategories(dataSource, CategoryKind.MAIN)).toEqual([
                { id: 2, kind: CategoryKind.MAIN, name: 'Loved game', description: 'The game I fell in love with', iconName: ':heart:', shouldHideGames: true, position: 0 },
                { id: 3, kind: CategoryKind.MAIN, name: 'Hated game', description: 'The game I hated', iconName: ':broken_heart:', shouldHideGames: false, position: 1 },
            ]);
        });

        it('should update the saved categories and order them like the request', async () => {
            // Arrange
            const lovedCategory = await insertCategory(dataSource, { name: 'Loved game', position: 0 });
            const hatedCategory = await insertCategory(dataSource, { name: 'Hated game', position: 1 });

            // Act
            const response = await saveCategories(CategoryKind.MAIN, [
                buildCategoryDto({ id: hatedCategory.id, name: 'Disliked game', description: 'The game I disliked', iconName: ':thumbsdown:' }),
                buildCategoryDto({ id: lovedCategory.id, name: 'Loved game' }),
            ]);

            // Assert
            expect(response.status).toBe(HttpStatus.NO_CONTENT);
            expect(await findCategories(dataSource, CategoryKind.MAIN)).toEqual([
                buildCategory({ id: hatedCategory.id, name: 'Disliked game', description: 'The game I disliked', iconName: ':thumbsdown:', position: 0 }),
                buildCategory({ id: lovedCategory.id, name: 'Loved game', position: 1 }),
            ]);
        });

        it('should delete the categories missing in the request and unassign them from games', async () => {
            // Arrange
            const lovedCategory = await insertCategory(dataSource, { name: 'Loved game', position: 0 });
            const hatedCategory = await insertCategory(dataSource, { name: 'Hated game', position: 1 });

            await insertGame(dataSource, { categories: [lovedCategory, hatedCategory] });

            // Act
            const response = await saveCategories(CategoryKind.MAIN, [buildCategoryDto({ id: lovedCategory.id })]);

            // Assert
            expect(response.status).toBe(HttpStatus.NO_CONTENT);
            expect(await findCategories(dataSource, CategoryKind.MAIN)).toEqual([lovedCategory]);
            expect(await findGames(dataSource)).toMatchObject([{ categories: [lovedCategory] }]);
        });

        it('should keep the categories of other kinds', async () => {
            // Arrange
            const shortCategory = await insertCategory(dataSource, { kind: CategoryKind.LENGTH, name: 'Short' });

            await insertCategory(dataSource);

            // Act
            const response = await saveCategories(CategoryKind.MAIN, []);

            // Assert
            expect(response.status).toBe(HttpStatus.NO_CONTENT);
            expect(await findCategories(dataSource, CategoryKind.MAIN)).toEqual([]);
            expect(await findCategories(dataSource, CategoryKind.LENGTH)).toEqual([shortCategory]);
        });

        it('should change only the icon of the 100% category', async () => {
            // Act
            const response = await saveCategories(CategoryKind.ONE_HUNDRED_PERCENT, [
                buildCategoryDto({ id: oneHundredPercentCategory.id, name: 'Completed', description: undefined, iconName: ':100:', shouldHideGames: true }),
            ]);

            // Assert
            expect(response.status).toBe(HttpStatus.NO_CONTENT);
            expect(await findCategories(dataSource, CategoryKind.ONE_HUNDRED_PERCENT)).toEqual([
                { id: oneHundredPercentCategory.id, kind: CategoryKind.ONE_HUNDRED_PERCENT, name: '100%', description: null, iconName: ':100:', shouldHideGames: false, position: 0 },
            ]);
        });

        describe('when the request is invalid', () => {
            let savedCategory: Category;

            beforeEach(async () => {
                savedCategory = await insertCategory(dataSource);
            });

            const expectSavedCategoriesUnchanged = async (): Promise<void> => {
                expect(await findCategories(dataSource, CategoryKind.MAIN)).toEqual([savedCategory]);
                expect(await findCategories(dataSource, CategoryKind.ONE_HUNDRED_PERCENT)).toEqual([oneHundredPercentCategory]);
            };

            it('should reject an unknown kind of categories', async () => {
                // Act
                const response = await saveCategories('FAVOURITE', []);

                // Assert
                expect(response.status).toBe(HttpStatus.BAD_REQUEST);
                expect(response.body).toEqual({ message: 'Validation failed (enum string is expected)', error: 'Bad Request', statusCode: HttpStatus.BAD_REQUEST });
                await expectSavedCategoriesUnchanged();
            });

            it('should reject a request body which is not a list of categories', async () => {
                // Act
                const response = await saveCategories(CategoryKind.MAIN, buildCategoryDto());

                // Assert
                expect(response.status).toBe(HttpStatus.BAD_REQUEST);
                expect(response.body).toEqual({ message: 'Validation failed (parsable array expected)', error: 'Bad Request', statusCode: HttpStatus.BAD_REQUEST });
                await expectSavedCategoriesUnchanged();
            });

            it.each<[string, Partial<CategoryDto> & Record<string, unknown>, string]>([
                ['an id which is not an integer', { id: 1.5 }, 'id must be an integer number'],
                ['a blank name', { name: '   ' }, 'name should not be empty'],
                ['a too long name', { name: 'a'.repeat(NAME_MAX_LENGTH + 1) }, `name must be shorter than or equal to ${NAME_MAX_LENGTH} characters`],
                ['a blank description', { description: ' ' }, 'description should not be empty'],
                ['a too long description', { description: 'a'.repeat(DESCRIPTION_MAX_LENGTH + 1) }, `description must be shorter than or equal to ${DESCRIPTION_MAX_LENGTH} characters`],
                ['a blank icon name', { iconName: '' }, 'iconName should not be empty'],
                ['a too long icon name', { iconName: 'a'.repeat(ICON_NAME_MAX_LENGTH + 1) }, `iconName must be shorter than or equal to ${ICON_NAME_MAX_LENGTH} characters`],
                ['a shouldHideGames which is not a boolean', { shouldHideGames: 'yes' as unknown as boolean }, 'shouldHideGames must be a boolean value'],
                ['an unknown property', { isFavourite: true }, 'property isFavourite should not exist'],
            ])('should reject a category with %s', async (_description, overrides, message) => {
                // Act
                const response = await saveCategories(CategoryKind.MAIN, [buildCategoryDto({ id: undefined, ...overrides })]);

                // Assert
                expect(response.status).toBe(HttpStatus.BAD_REQUEST);
                expect(response.body).toEqual({ message: [message], error: 'Bad Request', statusCode: HttpStatus.BAD_REQUEST });
                await expectSavedCategoriesUnchanged();
            });

            it('should reject a category without a description', async () => {
                // Act
                const response = await saveCategories(CategoryKind.MAIN, [buildCategoryDto({ id: undefined, description: undefined })]);

                // Assert
                expect(response.status).toBe(HttpStatus.BAD_REQUEST);
                expect(response.body).toEqual({ message: 'Category description has to be provided', error: 'Bad Request', statusCode: HttpStatus.BAD_REQUEST });
                await expectSavedCategoriesUnchanged();
            });

            it('should reject a length category which hides games', async () => {
                // Act
                const response = await saveCategories(CategoryKind.LENGTH, [buildCategoryDto({ id: undefined, name: 'Short', shouldHideGames: true })]);

                // Assert
                expect(response.status).toBe(HttpStatus.BAD_REQUEST);
                expect(response.body).toEqual({ message: 'Only main categories can hide games', error: 'Bad Request', statusCode: HttpStatus.BAD_REQUEST });
                expect(await findCategories(dataSource, CategoryKind.LENGTH)).toEqual([]);
            });

            it('should reject categories with duplicated names with an error code', async () => {
                // Act
                const response = await saveCategories(CategoryKind.MAIN, [buildCategoryDto({ id: savedCategory.id }), buildCategoryDto({ id: undefined, name: ' Loved game ' })]);

                // Assert
                expect(response.status).toBe(HttpStatus.BAD_REQUEST);
                expect(response.body).toEqual({ message: 'Category names have to be unique', errorCode: ErrorCode.DUPLICATED_CATEGORY_NAME, statusCode: HttpStatus.BAD_REQUEST });
                await expectSavedCategoriesUnchanged();
            });

            it('should reject a saved category of another kind', async () => {
                // Arrange
                const shortCategory = await insertCategory(dataSource, { kind: CategoryKind.LENGTH, name: 'Short' });

                // Act
                const response = await saveCategories(CategoryKind.MAIN, [buildCategoryDto({ id: shortCategory.id })]);

                // Assert
                expect(response.status).toBe(HttpStatus.BAD_REQUEST);
                expect(response.body).toEqual({
                    message: `Only saved categories of the same kind can be updated (unknown MAIN category ids: ${shortCategory.id})`,
                    error: 'Bad Request',
                    statusCode: HttpStatus.BAD_REQUEST,
                });
                await expectSavedCategoriesUnchanged();
                expect(await findCategories(dataSource, CategoryKind.LENGTH)).toEqual([shortCategory]);
            });

            it('should reject a category which is not saved', async () => {
                // Act
                const response = await saveCategories(CategoryKind.MAIN, [buildCategoryDto({ id: 999 })]);

                // Assert
                expect(response.status).toBe(HttpStatus.BAD_REQUEST);
                expect(response.body).toEqual({
                    message: 'Only saved categories of the same kind can be updated (unknown MAIN category ids: 999)',
                    error: 'Bad Request',
                    statusCode: HttpStatus.BAD_REQUEST,
                });
                await expectSavedCategoriesUnchanged();
            });

            it(`should reject more than ${CATEGORIES_MAX_AMOUNT} categories`, async () => {
                // Arrange
                const categoriesDto = Array.from({ length: CATEGORIES_MAX_AMOUNT + 1 }, (_category, index) => buildCategoryDto({ id: undefined, name: `Category ${index}` }));

                // Act
                const response = await saveCategories(CategoryKind.MAIN, categoriesDto);

                // Assert
                expect(response.status).toBe(HttpStatus.BAD_REQUEST);
                expect(response.body).toEqual({
                    message: `At most ${CATEGORIES_MAX_AMOUNT} MAIN categories can be saved (requested ${CATEGORIES_MAX_AMOUNT + 1})`,
                    error: 'Bad Request',
                    statusCode: HttpStatus.BAD_REQUEST,
                });
                await expectSavedCategoriesUnchanged();
            });

            it('should reject deleting the 100% category', async () => {
                // Act
                const response = await saveCategories(CategoryKind.ONE_HUNDRED_PERCENT, []);

                // Assert
                expect(response.status).toBe(HttpStatus.BAD_REQUEST);
                expect(response.body).toEqual({
                    message: `The 100% category can't be created or deleted (saved ids: ${oneHundredPercentCategory.id}, requested ids: none)`,
                    error: 'Bad Request',
                    statusCode: HttpStatus.BAD_REQUEST,
                });
                await expectSavedCategoriesUnchanged();
            });

            it('should reject replacing the 100% category with a new one', async () => {
                // Act
                const response = await saveCategories(CategoryKind.ONE_HUNDRED_PERCENT, [buildCategoryDto({ id: undefined, name: '100%', description: undefined })]);

                // Assert
                expect(response.status).toBe(HttpStatus.BAD_REQUEST);
                expect(response.body).toEqual({
                    message: `The 100% category can't be created or deleted (saved ids: ${oneHundredPercentCategory.id}, requested ids: new)`,
                    error: 'Bad Request',
                    statusCode: HttpStatus.BAD_REQUEST,
                });
                await expectSavedCategoriesUnchanged();
            });

            it('should reject creating another 100% category', async () => {
                // Act
                const response = await saveCategories(CategoryKind.ONE_HUNDRED_PERCENT, [
                    buildCategoryDto({ id: oneHundredPercentCategory.id, name: '100%', description: undefined }),
                    buildCategoryDto({ id: undefined, name: '100%', description: undefined }),
                ]);

                // Assert
                expect(response.status).toBe(HttpStatus.BAD_REQUEST);
                expect(response.body).toEqual({
                    message: `The 100% category can't be created or deleted (saved ids: ${oneHundredPercentCategory.id}, requested ids: ${oneHundredPercentCategory.id}, new)`,
                    error: 'Bad Request',
                    statusCode: HttpStatus.BAD_REQUEST,
                });
                await expectSavedCategoriesUnchanged();
            });
        });
    });
});

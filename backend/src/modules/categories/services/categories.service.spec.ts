import { BadRequestException, Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { In } from 'typeorm';
import type { EntityManager, Repository } from 'typeorm';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CategoriesService } from './categories.service';
import { Category } from '../../../entities/category.entity';
import { CategoryKind } from '../../../enums/category-kind.enum';
import { ErrorCode } from '../../../enums/error-code.enum';
import { buildCategory, buildCategoryDto } from '../../../testing/builders/category.builders';
import { buildDeleteResult, buildUpdateResult } from '../../../testing/builders/query-result.builders';
import { createEntityManager, provideRepository, spyOnTransaction } from '../../../testing/helpers/repository.helpers';

describe('CategoriesService', () => {
    let service: CategoriesService;
    let categoriesRepository: Repository<Category>;
    let manager: EntityManager;

    const oneHundredPercentCategory = buildCategory({ id: 1, kind: CategoryKind.ONE_HUNDRED_PERCENT, name: '100%', description: null, iconName: ':100:' });
    const firstCategory = buildCategory({ id: 2, name: 'Loved game', position: 0 });
    const secondCategory = buildCategory({ id: 3, name: 'Funny game', position: 1 });
    const thirdCategory = buildCategory({ id: 4, name: 'Hated game', position: 2 });

    beforeEach(async () => {
        manager = createEntityManager();

        const module = await Test.createTestingModule({
            providers: [CategoriesService, provideRepository(Category, manager)],
        }).compile();

        categoriesRepository = module.get(getRepositoryToken(Category));

        spyOnTransaction(manager);
        vi.spyOn(categoriesRepository, 'find').mockResolvedValue([]);
        vi.spyOn(manager, 'findBy').mockResolvedValue([]);
        vi.spyOn(manager, 'save').mockResolvedValue([]);
        vi.spyOn(manager, 'update').mockResolvedValue(buildUpdateResult());
        vi.spyOn(manager, 'delete').mockResolvedValue(buildDeleteResult());

        service = module.get(CategoriesService);
    });

    it('should create a service', () => {
        // Assert
        expect(service).toBeTruthy();
    });

    describe('getCategories', () => {
        it('should return the categories sorted by kind and position', async () => {
            // Arrange
            const lengthCategory = buildCategory({ id: 5, kind: CategoryKind.LENGTH, position: 0 });
            const difficultyCategory = buildCategory({ id: 6, kind: CategoryKind.DIFFICULTY, position: 0 });

            vi.mocked(categoriesRepository.find).mockResolvedValue([difficultyCategory, secondCategory, lengthCategory, oneHundredPercentCategory, firstCategory]);

            // Act
            const categories = await service.getCategories();

            // Assert
            expect(categories).toEqual([oneHundredPercentCategory, firstCategory, secondCategory, lengthCategory, difficultyCategory]);
        });
    });

    describe('saveCategories', () => {
        it('should look up the saved categories of the given kind', async () => {
            // Act
            await service.saveCategories(CategoryKind.LENGTH, []);

            // Assert
            expect(manager.findBy).toHaveBeenCalledWith(Category, { kind: CategoryKind.LENGTH });
        });

        it('should save the categories in the requested order', async () => {
            // Arrange
            const newCategoryDto = buildCategoryDto({ id: undefined, name: 'New game', description: 'The game I have just played', iconName: ':new:' });

            vi.mocked(manager.findBy).mockResolvedValue([firstCategory, secondCategory]);

            // Act
            await service.saveCategories(CategoryKind.MAIN, [buildCategoryDto({ id: 3, name: 'Funny game' }), newCategoryDto, buildCategoryDto({ id: 2, shouldHideGames: true })]);

            // Assert
            expect(manager.save).toHaveBeenCalledWith(Category, [
                { id: 3, kind: CategoryKind.MAIN, name: 'Funny game', description: 'The game I fell in love with', iconName: ':heart:', shouldHideGames: false, position: 0 },
                { id: undefined, kind: CategoryKind.MAIN, name: 'New game', description: 'The game I have just played', iconName: ':new:', shouldHideGames: false, position: 1 },
                { id: 2, kind: CategoryKind.MAIN, name: 'Loved game', description: 'The game I fell in love with', iconName: ':heart:', shouldHideGames: true, position: 2 },
            ]);
        });

        it('should delete the saved categories missing in the request', async () => {
            // Arrange
            vi.mocked(manager.findBy).mockResolvedValue([firstCategory, secondCategory, thirdCategory]);

            // Act
            await service.saveCategories(CategoryKind.MAIN, [buildCategoryDto({ id: 3, name: 'Funny game' })]);

            // Assert
            expect(manager.delete).toHaveBeenCalledWith(Category, { id: In([2, 4]) });
        });

        it('should not delete any category when all saved categories are requested', async () => {
            // Arrange
            vi.mocked(manager.findBy).mockResolvedValue([firstCategory]);

            // Act
            await service.saveCategories(CategoryKind.MAIN, [buildCategoryDto({ id: 2 })]);

            // Assert
            expect(manager.delete).not.toHaveBeenCalled();
        });

        it('should log the summary of the saved categories', async () => {
            // Arrange
            const logSpy = vi.spyOn(Logger.prototype, 'log');

            vi.mocked(manager.findBy).mockResolvedValue([firstCategory, secondCategory]);

            // Act
            await service.saveCategories(CategoryKind.MAIN, [buildCategoryDto({ id: 2 }), buildCategoryDto({ id: undefined, name: 'New game' })]);

            // Assert
            expect(logSpy).toHaveBeenCalledWith('Saved MAIN categories: 1 created, 1 updated, 1 deleted and unassigned from games (ids: 3)');
        });

        it.each([
            {
                reason: 'more than 100 categories',
                kind: CategoryKind.MAIN,
                categoriesDto: Array.from({ length: 101 }, (_, index) => buildCategoryDto({ id: undefined, name: `Game ${index}` })),
                message: 'At most 100 MAIN categories can be saved (requested 101)',
            },
            {
                reason: 'categories that are not saved',
                kind: CategoryKind.MAIN,
                categoriesDto: [buildCategoryDto({ id: 2 }), buildCategoryDto({ id: 9, name: 'Funny game' })],
                message: 'Only saved categories of the same kind can be updated (unknown MAIN category ids: 9)',
            },
            {
                reason: 'a category without a description',
                kind: CategoryKind.MAIN,
                categoriesDto: [buildCategoryDto({ id: undefined, description: undefined })],
                message: 'Category description has to be provided',
            },
            {
                reason: 'a length category hiding games',
                kind: CategoryKind.LENGTH,
                categoriesDto: [buildCategoryDto({ id: undefined, shouldHideGames: true })],
                message: 'Only main categories can hide games',
            },
        ])('should reject $reason', async ({ kind, categoriesDto, message }) => {
            // Arrange
            vi.mocked(manager.findBy).mockResolvedValue([firstCategory]);

            // Act
            const saving = service.saveCategories(kind, categoriesDto);

            // Assert
            await expect(saving).rejects.toThrow(new BadRequestException(message));
            expect(manager.save).not.toHaveBeenCalled();
        });

        it('should reject categories with duplicated names', async () => {
            // Act
            const saving = service.saveCategories(CategoryKind.MAIN, [buildCategoryDto({ id: undefined }), buildCategoryDto({ id: undefined })]);

            // Assert
            await expect(saving).rejects.toBeInstanceOf(BadRequestException);
            await expect(saving).rejects.toMatchObject({ response: { errorCode: ErrorCode.DUPLICATED_CATEGORY_NAME } });
            expect(manager.save).not.toHaveBeenCalled();
        });

        describe('of the 100% kind', () => {
            beforeEach(() => {
                vi.mocked(manager.findBy).mockResolvedValue([oneHundredPercentCategory]);
            });

            it('should update only the icon of the category', async () => {
                // Act
                await service.saveCategories(CategoryKind.ONE_HUNDRED_PERCENT, [buildCategoryDto({ id: 1, name: 'Changed name', iconName: ':star:' })]);

                // Assert
                expect(manager.update).toHaveBeenCalledWith(Category, 1, { iconName: ':star:' });
                expect(manager.save).not.toHaveBeenCalled();
                expect(manager.delete).not.toHaveBeenCalled();
            });

            it.each([
                { reason: 'creating another category', categoriesDto: [buildCategoryDto({ id: 1 }), buildCategoryDto({ id: undefined })] },
                { reason: 'deleting the category', categoriesDto: [] },
                { reason: 'replacing the category', categoriesDto: [buildCategoryDto({ id: 2 })] },
            ])('should reject $reason', async ({ categoriesDto }) => {
                // Act
                const saving = service.saveCategories(CategoryKind.ONE_HUNDRED_PERCENT, categoriesDto);

                // Assert
                await expect(saving).rejects.toThrow(BadRequestException);
                expect(manager.update).not.toHaveBeenCalled();
            });
        });
    });
});

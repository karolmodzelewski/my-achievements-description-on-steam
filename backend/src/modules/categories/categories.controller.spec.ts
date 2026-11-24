import { Test } from '@nestjs/testing';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CategoriesController } from './categories.controller';
import { CategoriesService } from './services/categories.service';
import { Category } from '../../entities/category.entity';
import { CategoryKind } from '../../enums/category-kind.enum';
import { buildCategory, buildCategoryDto } from '../../testing/builders/category.builders';
import { createEntityManager, provideRepository } from '../../testing/helpers/repository.helpers';

describe('CategoriesController', () => {
    let controller: CategoriesController;
    let categoriesService: CategoriesService;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            controllers: [CategoriesController],
            providers: [CategoriesService, provideRepository(Category, createEntityManager())],
        }).compile();

        categoriesService = module.get(CategoriesService);

        vi.spyOn(categoriesService, 'getCategories').mockResolvedValue([buildCategory()]);
        vi.spyOn(categoriesService, 'saveCategories').mockResolvedValue();

        controller = module.get(CategoriesController);
    });

    it('should create a controller', () => {
        // Assert
        expect(controller).toBeTruthy();
    });

    it('should return the categories', async () => {
        // Act
        const categories = await controller.getCategories();

        // Assert
        expect(categories).toEqual([buildCategory()]);
    });

    it('should save the categories of the given kind', async () => {
        // Arrange
        const categoriesDto = [buildCategoryDto(), buildCategoryDto({ id: undefined, name: 'Hated game' })];

        // Act
        await controller.saveCategories(CategoryKind.LENGTH, categoriesDto);

        // Assert
        expect(categoriesService.saveCategories).toHaveBeenCalledWith(CategoryKind.LENGTH, categoriesDto);
    });
});

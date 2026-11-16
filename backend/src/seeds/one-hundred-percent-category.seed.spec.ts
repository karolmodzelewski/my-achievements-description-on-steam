import { DataSource, Repository } from 'typeorm';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { seedOneHundredPercentCategory } from './one-hundred-percent-category.seed';
import { Category } from '../entities/category.entity';
import { CategoryKind } from '../enums/category-kind.enum';
import { buildInsertResult } from '../testing/builders/query-result.builders';

describe('seedOneHundredPercentCategory', () => {
    let dataSource: DataSource;
    let categoriesRepository: Repository<Category>;

    beforeEach(() => {
        dataSource = new DataSource({ type: 'postgres' });
        categoriesRepository = new Repository(Category, dataSource.manager);

        vi.spyOn(dataSource, 'getRepository').mockReturnValue(categoriesRepository);
        vi.spyOn(categoriesRepository, 'exists').mockResolvedValue(false);
        vi.spyOn(categoriesRepository, 'insert').mockResolvedValue(buildInsertResult());
    });

    it('should look for the 100% category', async () => {
        // Act
        await seedOneHundredPercentCategory(dataSource);

        // Assert
        expect(dataSource.getRepository).toHaveBeenCalledWith(Category);
        expect(categoriesRepository.exists).toHaveBeenCalledWith({ where: { kind: CategoryKind.ONE_HUNDRED_PERCENT } });
    });

    it('should create the 100% category when it is missing', async () => {
        // Act
        await seedOneHundredPercentCategory(dataSource);

        // Assert
        expect(categoriesRepository.insert).toHaveBeenCalledWith({
            kind: CategoryKind.ONE_HUNDRED_PERCENT,
            name: '100%',
            description: null,
            iconName: '',
            shouldHideGames: false,
            position: 0,
        });
    });

    it('should not create the 100% category when it already exists', async () => {
        // Arrange
        vi.mocked(categoriesRepository.exists).mockResolvedValue(true);

        // Act
        await seedOneHundredPercentCategory(dataSource);

        // Assert
        expect(categoriesRepository.insert).not.toHaveBeenCalled();
    });
});

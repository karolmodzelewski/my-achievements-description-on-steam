import { Logger } from '@nestjs/common';

import type { DataSource } from 'typeorm';

import { Category } from '../entities/category.entity';
import { CategoryKind } from '../enums/category-kind.enum';

const ONE_HUNDRED_PERCENT_CATEGORY_NAME = '100%';

const logger = new Logger('OneHundredPercentCategorySeed', { timestamp: true });

// The 100% category can't be created or deleted by the user, so it's created once with an icon to be set in the application
export const seedOneHundredPercentCategory = async (dataSource: DataSource): Promise<void> => {
    const categoriesRepository = dataSource.getRepository(Category);

    if (await categoriesRepository.exists({ where: { kind: CategoryKind.ONE_HUNDRED_PERCENT } })) {
        return;
    }

    await categoriesRepository.insert({
        kind: CategoryKind.ONE_HUNDRED_PERCENT,
        name: ONE_HUNDRED_PERCENT_CATEGORY_NAME,
        description: null,
        iconName: '',
        shouldHideGames: false,
        position: 0,
    });

    logger.log('Created the 100% category');
};

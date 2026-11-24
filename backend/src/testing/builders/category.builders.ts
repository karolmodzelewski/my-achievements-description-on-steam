import { Category } from '../../entities/category.entity';
import { CategoryKind } from '../../enums/category-kind.enum';
import { CategoryDto } from '../../modules/categories/dtos/category.dto';

export const buildCategory = (overrides: Partial<Category> = {}): Category =>
    Object.assign(new Category(), {
        id: 1,
        kind: CategoryKind.MAIN,
        name: 'Loved game',
        description: 'The game I fell in love with',
        iconName: ':heart:',
        shouldHideGames: false,
        position: 0,
        ...overrides,
    });

export const buildCategoryDto = (overrides: Partial<CategoryDto> = {}): CategoryDto =>
    Object.assign(new CategoryDto(), {
        id: 1,
        name: 'Loved game',
        description: 'The game I fell in love with',
        iconName: ':heart:',
        shouldHideGames: false,
        ...overrides,
    });

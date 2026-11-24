import { CategoryKind } from '../../app/enums/category-kind.enum';
import type { Category } from '../../app/interfaces/category.interface';
import type { DescriptionCategory } from '../../app/interfaces/description-category.interface';
import type { GameCategory } from '../../app/interfaces/game-category.interface';

export const buildCategory = (overrides: Partial<Category> = {}): Category => ({
    id: 1,
    kind: CategoryKind.MAIN,
    name: 'Loved game',
    description: 'The game I fell in love with',
    iconName: ':heart:',
    shouldHideGames: false,
    position: 0,
    ...overrides,
});

export const buildDescriptionCategory = (overrides: Partial<DescriptionCategory> = {}): DescriptionCategory => ({
    id: 1,
    kind: CategoryKind.MAIN,
    name: 'Loved game',
    description: 'The game I fell in love with',
    iconName: ':heart:',
    shouldHideGames: false,
    amount: 1,
    ...overrides,
});

export const buildGameCategory = (overrides: Partial<GameCategory> = {}): GameCategory => ({
    id: 1,
    kind: CategoryKind.MAIN,
    iconName: ':heart:',
    shouldHideGames: false,
    ...overrides,
});

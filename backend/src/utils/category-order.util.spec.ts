import { describe, expect, it } from 'vitest';

import { compareCategories } from './category-order.util';
import { CategoryKind } from '../enums/category-kind.enum';

describe('category-order.util', () => {
    describe('compareCategories', () => {
        it('should order the categories from the 100% to the difficulty kind', () => {
            // Arrange
            const categories = [
                { kind: CategoryKind.DIFFICULTY, position: 0 },
                { kind: CategoryKind.MAIN, position: 0 },
                { kind: CategoryKind.LENGTH, position: 0 },
                { kind: CategoryKind.ONE_HUNDRED_PERCENT, position: 0 },
            ];

            // Act
            const sortedCategories = categories.sort(compareCategories);

            // Assert
            expect(sortedCategories.map(({ kind }) => kind)).toEqual([CategoryKind.ONE_HUNDRED_PERCENT, CategoryKind.MAIN, CategoryKind.LENGTH, CategoryKind.DIFFICULTY]);
        });

        it('should order the categories of the same kind by position', () => {
            // Arrange
            const categories = [
                { kind: CategoryKind.MAIN, position: 2 },
                { kind: CategoryKind.MAIN, position: 0 },
                { kind: CategoryKind.MAIN, position: 1 },
            ];

            // Act
            const sortedCategories = categories.sort(compareCategories);

            // Assert
            expect(sortedCategories.map(({ position }) => position)).toEqual([0, 1, 2]);
        });

        it('should order the categories by kind before position', () => {
            // Arrange
            const categories = [
                { kind: CategoryKind.LENGTH, position: 0 },
                { kind: CategoryKind.MAIN, position: 5 },
            ];

            // Act
            const sortedCategories = categories.sort(compareCategories);

            // Assert
            expect(sortedCategories).toEqual([
                { kind: CategoryKind.MAIN, position: 5 },
                { kind: CategoryKind.LENGTH, position: 0 },
            ]);
        });
    });
});

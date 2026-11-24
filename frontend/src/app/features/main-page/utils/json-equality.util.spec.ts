import { describe, expect, it } from 'vitest';

import { areJsonEqual } from './json-equality.util';

describe('json-equality.util', () => {
    it('should treat different objects with the same values as equal', () => {
        // Act
        const areEqual = areJsonEqual({ id: 1, names: ['a'] }, { id: 1, names: ['a'] });

        // Assert
        expect(areEqual).toBe(true);
    });

    it('should treat objects with different values as not equal', () => {
        // Act
        const areEqual = areJsonEqual({ id: 1 }, { id: 2 });

        // Assert
        expect(areEqual).toBe(false);
    });

    it('should treat arrays in a different order as not equal', () => {
        // Act
        const areEqual = areJsonEqual([1, 2], [2, 1]);

        // Assert
        expect(areEqual).toBe(false);
    });
});

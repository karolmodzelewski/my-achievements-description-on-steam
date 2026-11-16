import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { describe, expect, it } from 'vitest';

import { CategoryDto } from './category.dto';
import { buildCategoryDto } from '../../../testing/builders/category.builders';

describe('CategoryDto', () => {
    const toCategoryDto = (overrides: Record<string, unknown>): CategoryDto => plainToInstance(CategoryDto, Object.assign(buildCategoryDto(), overrides));

    const getInvalidProperties = async (overrides: Record<string, unknown>): Promise<string[]> => {
        const errors = await validate(toCategoryDto(overrides));

        return errors.map(({ property }) => property);
    };

    it.each([
        { reason: 'a saved category', overrides: {} },
        { reason: 'a new category without an id', overrides: { id: undefined } },
        { reason: 'the 100% category without a description', overrides: { description: undefined } },
    ])('should accept $reason', async ({ overrides }) => {
        // Act
        const invalidProperties = await getInvalidProperties(overrides);

        // Assert
        expect(invalidProperties).toEqual([]);
    });

    it('should trim the texts', () => {
        // Act
        const categoryDto = toCategoryDto({ name: '  Loved game ', description: ' The game I fell in love with  ', iconName: ' :heart: ' });

        // Assert
        expect(categoryDto).toMatchObject({ name: 'Loved game', description: 'The game I fell in love with', iconName: ':heart:' });
    });

    it.each([
        { reason: 'a non-integer id', overrides: { id: 1.5 }, property: 'id' },
        { reason: 'a blank name', overrides: { name: '   ' }, property: 'name' },
        { reason: 'a too long name', overrides: { name: 'a'.repeat(256) }, property: 'name' },
        { reason: 'a blank description', overrides: { description: '   ' }, property: 'description' },
        { reason: 'a null description', overrides: { description: null }, property: 'description' },
        { reason: 'a too long description', overrides: { description: 'a'.repeat(256) }, property: 'description' },
        { reason: 'a blank icon name', overrides: { iconName: '   ' }, property: 'iconName' },
        { reason: 'a too long icon name', overrides: { iconName: 'a'.repeat(76) }, property: 'iconName' },
        { reason: 'a non-boolean games hiding', overrides: { shouldHideGames: 'true' }, property: 'shouldHideGames' },
    ])('should reject $reason', async ({ overrides, property }) => {
        // Act
        const invalidProperties = await getInvalidProperties(overrides);

        // Assert
        expect(invalidProperties).toEqual([property]);
    });
});

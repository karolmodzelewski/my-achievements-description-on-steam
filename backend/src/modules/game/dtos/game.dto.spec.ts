import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { describe, expect, it } from 'vitest';

import { GameDto } from './game.dto';
import { GameGroupDto } from './game-group.dto';
import { buildGameDto, buildGameGroupDto } from '../../../testing/builders/game.builders';

describe('GameDto', () => {
    const toGameDto = (overrides: Record<string, unknown>): GameDto => plainToInstance(GameDto, Object.assign(buildGameDto({ categories: [1, 2], groups: [buildGameGroupDto()] }), overrides));

    const getInvalidProperties = async (overrides: Record<string, unknown>): Promise<string[]> => {
        const errors = await validate(toGameDto(overrides));

        return errors.map(({ property }) => property);
    };

    it.each([
        { reason: 'a game with categories and groups', overrides: {} },
        { reason: 'a game without categories and groups', overrides: { categories: [], groups: [] } },
        { reason: 'empty names, which are validated by the service', overrides: { name: '', groups: [{ name: '', hasNewAchievements: false }] } },
    ])('should accept $reason', async ({ overrides }) => {
        // Act
        const invalidProperties = await getInvalidProperties(overrides);

        // Assert
        expect(invalidProperties).toEqual([]);
    });

    it('should trim the names of the game and its groups', () => {
        // Act
        const gameDto = toGameDto({ name: ' Game  ', groups: [{ name: '  DLC ', hasNewAchievements: false }] });

        // Assert
        expect(gameDto.name).toBe('Game');
        expect(gameDto.groups).toEqual([buildGameGroupDto()]);
        expect(gameDto.groups[0]).toBeInstanceOf(GameGroupDto);
    });

    it.each([
        { reason: 'a too long name', overrides: { name: 'a'.repeat(256) }, property: 'name' },
        { reason: 'non-integer category ids', overrides: { categories: [1, 1.5] }, property: 'categories' },
        { reason: 'duplicated category ids', overrides: { categories: [1, 1] }, property: 'categories' },
        { reason: 'more than 100 categories', overrides: { categories: Array.from({ length: 101 }, (_, index) => index + 1) }, property: 'categories' },
        { reason: 'non-boolean new achievements', overrides: { hasNewAchievements: 'false' }, property: 'hasNewAchievements' },
        { reason: 'groups that are not a list', overrides: { groups: buildGameGroupDto() }, property: 'groups' },
        { reason: 'duplicated group names', overrides: { groups: [buildGameGroupDto(), buildGameGroupDto({ hasNewAchievements: true })] }, property: 'groups' },
        {
            reason: 'more than 100 groups',
            overrides: { groups: Array.from({ length: 101 }, (_, index) => buildGameGroupDto({ name: `DLC ${index}` })) },
            property: 'groups',
        },
        { reason: 'a group with a too long name', overrides: { groups: [buildGameGroupDto({ name: 'a'.repeat(256) })] }, property: 'groups' },
        { reason: 'a group with non-boolean new achievements', overrides: { groups: [{ name: 'DLC', hasNewAchievements: 1 }] }, property: 'groups' },
    ])('should reject $reason', async ({ overrides, property }) => {
        // Act
        const invalidProperties = await getInvalidProperties(overrides);

        // Assert
        expect(invalidProperties).toEqual([property]);
    });
});

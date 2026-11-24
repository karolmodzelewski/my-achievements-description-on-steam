import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { describe, expect, it } from 'vitest';

import { WallpaperSettingsDto } from './wallpaper-settings.dto';
import { buildWallpaperSettingsDto } from '../../../testing/builders/wallpaper.builders';

describe('WallpaperSettingsDto', () => {
    const getInvalidProperties = async (overrides: Record<string, unknown>): Promise<string[]> => {
        const errors = await validate(plainToInstance(WallpaperSettingsDto, Object.assign(buildWallpaperSettingsDto(), overrides)));

        return errors.map(({ property }) => property);
    };

    it.each([
        { reason: 'settings without an excluded category', overrides: {} },
        { reason: 'settings with an excluded category', overrides: { excludedCategoryId: 3 } },
        { reason: 'settings with every option turned on', overrides: { isAutoGenerateEnabled: true, isDesktopUpdateEnabled: true } },
    ])('should accept $reason', async ({ overrides }) => {
        // Act
        const invalidProperties = await getInvalidProperties(overrides);

        // Assert
        expect(invalidProperties).toEqual([]);
    });

    it.each([
        { reason: 'a non-integer excluded category id', overrides: { excludedCategoryId: 1.5 }, property: 'excludedCategoryId' },
        { reason: 'a missing excluded category id', overrides: { excludedCategoryId: undefined }, property: 'excludedCategoryId' },
        { reason: 'a non-boolean automatic generation', overrides: { isAutoGenerateEnabled: 'true' }, property: 'isAutoGenerateEnabled' },
        { reason: 'a missing desktop update', overrides: { isDesktopUpdateEnabled: undefined }, property: 'isDesktopUpdateEnabled' },
    ])('should reject $reason', async ({ overrides, property }) => {
        // Act
        const invalidProperties = await getInvalidProperties(overrides);

        // Assert
        expect(invalidProperties).toEqual([property]);
    });
});

import { HttpStatus } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';

import request from 'supertest';
import type { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { createE2eApplication } from './helpers/app.helpers';
import { findWallpaper, getOneHundredPercentCategory, insertCategory, resetDatabase, updateWallpaper } from './helpers/database.helpers';
import type { Category } from '../src/entities/category.entity';
import { CategoryKind } from '../src/enums/category-kind.enum';
import { ErrorCode } from '../src/enums/error-code.enum';
import { WALLPAPER_AUTO_UPDATE_DELAY, WALLPAPER_MAX_FILE_SIZE } from '../src/modules/wallpaper/constants/wallpaper.constants';
import type { WallpaperSettingsDto } from '../src/modules/wallpaper/dtos/wallpaper-settings.dto';
import { buildWallpaperSettingsDto } from '../src/testing/builders/wallpaper.builders';

describe('wallpaper', () => {
    let app: INestApplication<App>;
    let dataSource: DataSource;
    let lovedCategory: Category;

    const invalidFileResponseBody = { message: 'Only XCF files can be uploaded', errorCode: ErrorCode.INVALID_WALLPAPER_FILE, statusCode: HttpStatus.BAD_REQUEST };

    const invalidSettingsCases: [string, Partial<WallpaperSettingsDto> & Record<string, unknown>, string][] = [
        ['an excluded category id which is not an integer', { excludedCategoryId: 1.5 }, 'excludedCategoryId must be an integer number'],
        ['no excluded category id', { excludedCategoryId: undefined }, 'excludedCategoryId must be an integer number'],
        ['an automatic generation which is not a boolean', { isAutoGenerateEnabled: 'yes' as unknown as boolean }, 'isAutoGenerateEnabled must be a boolean value'],
        ['no desktop update', { isDesktopUpdateEnabled: undefined }, 'isDesktopUpdateEnabled must be a boolean value'],
        ['an unknown property', { isFavourite: true }, 'property isFavourite should not exist'],
    ];

    const getWallpaper = (path = ''): request.Test => request(app.getHttpServer()).get(`/api/wallpaper${path}`);

    const saveSettings = (settings: object): request.Test => request(app.getHttpServer()).put('/api/wallpaper/settings').send(settings);

    const uploadXcf = (): request.Test => request(app.getHttpServer()).put('/api/wallpaper/xcf');

    beforeAll(async () => {
        app = await createE2eApplication();
        dataSource = app.get(DataSource);
    });

    beforeEach(async () => {
        await resetDatabase(dataSource);

        lovedCategory = await insertCategory(dataSource, { name: 'Loved game' });
    });

    afterAll(async () => {
        await app.close();
    });

    describe('GET /api/wallpaper', () => {
        it('should return the saved settings with the generated text while nothing is generated', async () => {
            // Arrange
            await updateWallpaper(dataSource, { text: '7 (5)', excludedCategoryId: lovedCategory.id });

            // Act
            const response = await getWallpaper();

            // Assert
            expect(response.status).toBe(HttpStatus.OK);
            expect(response.body).toMatchObject({
                excludedCategoryId: lovedCategory.id,
                isAutoGenerateEnabled: false,
                isDesktopUpdateEnabled: false,
                canUpdateDesktop: false,
                text: '7 (5)',
                isUpdating: false,
                isGenerating: false,
            });
        });
    });

    describe('GET /api/wallpaper/updated', () => {
        it('should answer with the wallpaper once no update is scheduled', { timeout: WALLPAPER_AUTO_UPDATE_DELAY * 2 }, async () => {
            // Act
            const response = await getWallpaper('/updated');

            // Assert
            expect(response.status).toBe(HttpStatus.OK);
            expect(response.body).toMatchObject({ isAutoGenerateEnabled: false, isUpdating: false, isGenerating: false });
        });
    });

    describe('PUT /api/wallpaper/settings', () => {
        it('should save the category excluded from the number in brackets', async () => {
            // Act
            const response = await saveSettings(buildWallpaperSettingsDto({ excludedCategoryId: lovedCategory.id }));

            // Assert
            expect(response.status).toBe(HttpStatus.NO_CONTENT);
            expect(await findWallpaper(dataSource)).toMatchObject({ excludedCategoryId: lovedCategory.id, isAutoGenerateEnabled: false, isDesktopUpdateEnabled: false });
        });

        it('should stop excluding the category', async () => {
            // Arrange
            await updateWallpaper(dataSource, { excludedCategoryId: lovedCategory.id });

            // Act
            const response = await saveSettings(buildWallpaperSettingsDto({ excludedCategoryId: null }));

            // Assert
            expect(response.status).toBe(HttpStatus.NO_CONTENT);
            expect(await findWallpaper(dataSource)).toMatchObject({ excludedCategoryId: null });
        });

        it('should reject turning the desktop update on outside production', async () => {
            // Act
            const response = await saveSettings(buildWallpaperSettingsDto({ isDesktopUpdateEnabled: true }));

            // Assert
            expect(response.status).toBe(HttpStatus.BAD_REQUEST);
            expect(response.body).toEqual({
                message: `The desktop wallpaper can be updated only in production on Windows (stage: e2e, platform: ${process.platform})`,
                error: 'Bad Request',
                statusCode: HttpStatus.BAD_REQUEST,
            });
            expect(await findWallpaper(dataSource)).toMatchObject({ isDesktopUpdateEnabled: false });
        });

        it('should reject excluding a category which is not saved', async () => {
            // Act
            const response = await saveSettings(buildWallpaperSettingsDto({ excludedCategoryId: 999 }));

            // Assert
            expect(response.status).toBe(HttpStatus.BAD_REQUEST);
            expect(response.body).toEqual({ message: `Category 999 doesn't exist`, error: 'Bad Request', statusCode: HttpStatus.BAD_REQUEST });
            expect(await findWallpaper(dataSource)).toMatchObject({ excludedCategoryId: null });
        });

        it('should reject excluding the 100% category', async () => {
            // Arrange
            const oneHundredPercentCategory = await getOneHundredPercentCategory(dataSource);

            // Act
            const response = await saveSettings(buildWallpaperSettingsDto({ excludedCategoryId: oneHundredPercentCategory.id }));

            // Assert
            expect(response.status).toBe(HttpStatus.BAD_REQUEST);
            expect(response.body).toEqual({ message: `The 100% category can't be excluded from the wallpaper`, error: 'Bad Request', statusCode: HttpStatus.BAD_REQUEST });
            expect(await findWallpaper(dataSource)).toMatchObject({ excludedCategoryId: null });
        });

        it.each(invalidSettingsCases)('should reject settings with %s', async (_description, overrides, message) => {
            // Arrange
            const settings = Object.assign(buildWallpaperSettingsDto(), overrides);

            // Act
            const response = await saveSettings(settings);

            // Assert
            expect(response.status).toBe(HttpStatus.BAD_REQUEST);
            expect(response.body).toEqual({ message: [message], error: 'Bad Request', statusCode: HttpStatus.BAD_REQUEST });
        });
    });

    describe('PUT /api/categories/:kind', () => {
        it('should stop excluding the category from the wallpaper once it is deleted', async () => {
            // Arrange
            await updateWallpaper(dataSource, { excludedCategoryId: lovedCategory.id });

            // Act
            const response = await request(app.getHttpServer()).put(`/api/categories/${CategoryKind.MAIN}`).send([]);

            // Assert
            expect(response.status).toBe(HttpStatus.NO_CONTENT);
            expect(await findWallpaper(dataSource)).toMatchObject({ excludedCategoryId: null });
        });
    });

    describe('PUT /api/wallpaper/xcf', () => {
        it('should reject a request without a file', async () => {
            // Act
            const response = await uploadXcf();

            // Assert
            expect(response.status).toBe(HttpStatus.BAD_REQUEST);
            expect(response.body).toEqual(invalidFileResponseBody);
        });

        it.each([
            ['without the XCF extension', 'wallpaper.png', Buffer.from('gimp xcf v011')],
            ['without the XCF signature', 'wallpaper.xcf', Buffer.from('not an xcf')],
        ])('should reject a file %s', async (_description, fileName, content) => {
            // Act
            const response = await uploadXcf().attach('file', content, fileName);

            // Assert
            expect(response.status).toBe(HttpStatus.BAD_REQUEST);
            expect(response.body).toEqual(invalidFileResponseBody);
        });

        it('should reject a file larger than the limit', async () => {
            // Arrange
            const content = Buffer.alloc(WALLPAPER_MAX_FILE_SIZE + 1);

            // Act
            const response = await uploadXcf().attach('file', content, 'wallpaper.xcf');

            // Assert
            expect(response.status).toBe(HttpStatus.PAYLOAD_TOO_LARGE);
            expect(response.body).toEqual({ message: 'File too large', error: 'Payload Too Large', statusCode: HttpStatus.PAYLOAD_TOO_LARGE });
        });
    });
});

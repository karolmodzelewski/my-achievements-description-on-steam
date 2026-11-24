import { StreamableFile } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { WallpaperResponse } from './interfaces/wallpaper-response.interface';
import { WallpaperService } from './services/wallpaper.service';
import { WallpaperController } from './wallpaper.controller';
import { Category } from '../../entities/category.entity';
import { Game } from '../../entities/game.entity';
import { Wallpaper } from '../../entities/wallpaper.entity';
import { buildWallpaperSettingsDto } from '../../testing/builders/wallpaper.builders';
import { stubEnvironment } from '../../testing/helpers/environment.helpers';
import { createEntityManager, provideRepository } from '../../testing/helpers/repository.helpers';
import { DescriptionService } from '../description/services/description.service';

import { Readable } from 'node:stream';

describe('WallpaperController', () => {
    let controller: WallpaperController;
    let wallpaperService: WallpaperService;

    const wallpaperResponse: WallpaperResponse = {
        excludedCategoryId: null,
        isAutoGenerateEnabled: true,
        isDesktopUpdateEnabled: false,
        isGimpInstalled: true,
        canUpdateDesktop: false,
        text: '10',
        png: { width: 1920, height: 1080, size: 2048, modifiedAt: 1000 },
        isUpdating: false,
        isGenerating: false,
    };
    const png = new StreamableFile(Readable.from([]));

    beforeEach(async () => {
        stubEnvironment();

        const manager = createEntityManager();
        const module = await Test.createTestingModule({
            controllers: [WallpaperController],
            providers: [WallpaperService, DescriptionService, ConfigService, provideRepository(Wallpaper, manager), provideRepository(Category, manager), provideRepository(Game, manager)],
        }).compile();

        wallpaperService = module.get(WallpaperService);
        controller = module.get(WallpaperController);

        vi.spyOn(wallpaperService, 'getWallpaper').mockResolvedValue(wallpaperResponse);
        vi.spyOn(wallpaperService, 'waitForUpdate').mockResolvedValue(wallpaperResponse);
        vi.spyOn(wallpaperService, 'getPng').mockReturnValue(png);
        vi.spyOn(wallpaperService, 'restoreDefaultWallpaper').mockResolvedValue();
        vi.spyOn(wallpaperService, 'generateWallpaper').mockResolvedValue();
        vi.spyOn(wallpaperService, 'saveSettings').mockResolvedValue();
        vi.spyOn(wallpaperService, 'uploadXcf').mockResolvedValue();
    });

    it('should create a controller', () => {
        // Assert
        expect(controller).toBeTruthy();
    });

    it('should return the wallpaper', async () => {
        // Act
        const wallpaper = await controller.getWallpaper();

        // Assert
        expect(wallpaper).toEqual(wallpaperResponse);
    });

    it('should return the wallpaper once it is updated', async () => {
        // Act
        const wallpaper = await controller.waitForUpdate();

        // Assert
        expect(wallpaper).toEqual(wallpaperResponse);
        expect(wallpaperService.waitForUpdate).toHaveBeenCalledOnce();
    });

    it('should return the PNG', () => {
        // Act
        const file = controller.getPng();

        // Assert
        expect(file).toBe(png);
    });

    it('should restore the default wallpaper', async () => {
        // Act
        await controller.restoreDefaultWallpaper();

        // Assert
        expect(wallpaperService.restoreDefaultWallpaper).toHaveBeenCalledOnce();
    });

    it('should generate the wallpaper', async () => {
        // Act
        await controller.generateWallpaper();

        // Assert
        expect(wallpaperService.generateWallpaper).toHaveBeenCalledOnce();
    });

    it('should save the settings', async () => {
        // Arrange
        const wallpaperSettingsDto = buildWallpaperSettingsDto({ excludedCategoryId: 3 });

        // Act
        await controller.saveSettings(wallpaperSettingsDto);

        // Assert
        expect(wallpaperService.saveSettings).toHaveBeenCalledWith(wallpaperSettingsDto);
    });

    it('should upload the XCF file', async () => {
        // Arrange
        const file = { originalname: 'wallpaper.xcf', buffer: Buffer.from('gimp xcf ') };

        // Act
        await controller.uploadXcf(file);

        // Assert
        expect(wallpaperService.uploadXcf).toHaveBeenCalledWith(file);
    });
});

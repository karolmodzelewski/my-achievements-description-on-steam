import type { MiddlewareConsumer } from '@nestjs/common';

import { describe, expect, it, vi } from 'vitest';

import { WallpaperAutoUpdateMiddleware } from './middlewares/wallpaper-auto-update.middleware';
import { WallpaperModule } from './wallpaper.module';
import { CategoriesController } from '../categories/categories.controller';
import { GameController } from '../game/game.controller';

describe('WallpaperModule', () => {
    it('should follow and block the changes of categories, games and groups with the automatic update', () => {
        // Arrange
        const forRoutes = vi.fn();
        const consumer = { apply: vi.fn(() => ({ forRoutes })) } as unknown as MiddlewareConsumer;

        // Act
        new WallpaperModule().configure(consumer);

        // Assert
        expect(consumer.apply).toHaveBeenCalledWith(WallpaperAutoUpdateMiddleware);
        expect(forRoutes).toHaveBeenCalledWith(CategoriesController, GameController);
    });
});

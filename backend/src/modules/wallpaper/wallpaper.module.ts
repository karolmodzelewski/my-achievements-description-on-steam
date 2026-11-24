import { Module } from '@nestjs/common';
import type { MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WallpaperAutoUpdateMiddleware } from './middlewares/wallpaper-auto-update.middleware';
import { WallpaperService } from './services/wallpaper.service';
import { WallpaperController } from './wallpaper.controller';
import { Category } from '../../entities/category.entity';
import { Wallpaper } from '../../entities/wallpaper.entity';
import { CategoriesController } from '../categories/categories.controller';
import { DescriptionModule } from '../description/description.module';
import { GameController } from '../game/game.controller';

@Module({
    imports: [ConfigModule, TypeOrmModule.forFeature([Wallpaper, Category]), DescriptionModule],
    controllers: [WallpaperController],
    providers: [WallpaperService],
})
export class WallpaperModule implements NestModule {
    public configure(consumer: MiddlewareConsumer): void {
        consumer.apply(WallpaperAutoUpdateMiddleware).forRoutes(CategoriesController, GameController);
    }
}

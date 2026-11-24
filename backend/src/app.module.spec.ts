import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';

import { DataSource, Repository } from 'typeorm';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CategoryKind } from './enums/category-kind.enum';
import { buildInsertResult } from './testing/builders/query-result.builders';
import { stubEnvironment } from './testing/helpers/environment.helpers';

describe('AppModule', () => {
    let module: TestingModule | undefined;

    const compileAppModule = async (): Promise<TestingModule> => {
        const { AppModule } = await import('./app.module.js');

        module = await Test.createTestingModule({ imports: [AppModule] }).compile();

        return module;
    };

    beforeEach(() => {
        vi.resetModules();
        stubEnvironment();

        vi.spyOn(DataSource.prototype, 'initialize').mockImplementation(function (this: DataSource) {
            return Promise.resolve(Object.assign(this, { isInitialized: true }));
        });
        vi.spyOn(DataSource.prototype, 'destroy').mockResolvedValue();
        vi.spyOn(Repository.prototype, 'exists').mockResolvedValue(true);
        vi.spyOn(Repository.prototype, 'insert').mockResolvedValue(buildInsertResult());
        vi.spyOn(Logger.prototype, 'log');

        module = undefined;
    });

    afterEach(async () => {
        await module?.close();
    });

    it('should connect to the database from the environment', async () => {
        // Act
        const dataSource = (await compileAppModule()).get(DataSource);

        // Assert
        expect(dataSource.options).toMatchObject({ type: 'postgres', host: 'localhost', port: 5433, username: 'user', password: 'password', database: 'mados_test' });
        expect(DataSource.prototype.initialize).toHaveBeenCalledOnce();
        expect(Logger.prototype.log).toHaveBeenCalledWith(`Connected to database 'mados_test' at localhost:5433`);
    });

    it('should synchronize the database schema outside production', async () => {
        // Act
        const dataSource = (await compileAppModule()).get(DataSource);

        // Assert
        expect(dataSource.options.synchronize).toBe(true);
    });

    it('should load the entities of all modules', async () => {
        // Act
        const dataSource = (await compileAppModule()).get(DataSource);

        // Assert
        const [{ Category }, { Game }, { GameGroup }, { Wallpaper }] = await Promise.all([
            import('./entities/category.entity.js'),
            import('./entities/game.entity.js'),
            import('./entities/game-group.entity.js'),
            import('./entities/wallpaper.entity.js'),
        ]);

        expect(dataSource.options.entities).toEqual(expect.arrayContaining([Category, Game, GameGroup, Wallpaper]));
    });

    it('should create the 100% category once connected when it is missing', async () => {
        // Arrange
        vi.mocked(Repository.prototype.exists).mockResolvedValue(false);

        // Act
        await compileAppModule();

        // Assert
        expect(Repository.prototype.insert).toHaveBeenCalledOnce();
        expect(vi.mocked(Repository.prototype.insert).mock.calls[0][0]).toMatchObject({ kind: CategoryKind.ONE_HUNDRED_PERCENT });
    });

    it('should provide the controllers of all modules with their dependencies', async () => {
        // Act
        const appModule = await compileAppModule();

        // Assert
        const [{ CategoriesController }, { DescriptionController }, { GameController }, { WallpaperController }] = await Promise.all([
            import('./modules/categories/categories.controller.js'),
            import('./modules/description/description.controller.js'),
            import('./modules/game/game.controller.js'),
            import('./modules/wallpaper/wallpaper.controller.js'),
        ]);

        expect(appModule.get(CategoriesController)).toBeInstanceOf(CategoriesController);
        expect(appModule.get(DescriptionController)).toBeInstanceOf(DescriptionController);
        expect(appModule.get(GameController)).toBeInstanceOf(GameController);
        expect(appModule.get(WallpaperController)).toBeInstanceOf(WallpaperController);
    });
});

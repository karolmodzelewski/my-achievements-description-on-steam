import type { EntityMetadata } from 'typeorm';
import { beforeEach, describe, expect, it } from 'vitest';

import { Category } from './category.entity';
import { Game } from './game.entity';
import { GameGroup } from './game-group.entity';
import { Wallpaper } from './wallpaper.entity';
import { initializeDataSource } from '../testing/helpers/repository.helpers';

describe('Wallpaper', () => {
    let metadata: EntityMetadata;

    beforeEach(async () => {
        const dataSource = await initializeDataSource([Wallpaper, Category, Game, GameGroup]);

        metadata = dataSource.getMetadata(Wallpaper);
    });

    it('should allow settings without a generated text and without an excluded category', () => {
        // Act
        const nullableColumns = metadata.columns.filter(({ isNullable }) => isNullable).map(({ propertyName }) => propertyName);

        // Assert
        expect(nullableColumns).toEqual(['text', 'excludedCategoryId']);
    });

    it('should stop excluding the category once it is deleted', () => {
        // Act
        const excludedCategoryRelation = metadata.findRelationWithPropertyPath('excludedCategory');

        // Assert
        expect(excludedCategoryRelation?.onDelete).toBe('SET NULL');
    });

    it('should generate the wallpaper automatically and leave the desktop wallpaper unchanged by default', () => {
        // Act
        const autoGenerateColumn = metadata.findColumnWithPropertyName('isAutoGenerateEnabled');
        const desktopUpdateColumn = metadata.findColumnWithPropertyName('isDesktopUpdateEnabled');

        // Assert
        expect(autoGenerateColumn?.default).toBe(true);
        expect(desktopUpdateColumn?.default).toBe(false);
    });
});

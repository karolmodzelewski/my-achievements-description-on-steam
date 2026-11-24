import type { EntityMetadata } from 'typeorm';
import { beforeEach, describe, expect, it } from 'vitest';

import { Category } from './category.entity';
import { Game } from './game.entity';
import { GameGroup } from './game-group.entity';
import { initializeDataSource } from '../testing/helpers/repository.helpers';

describe('Category', () => {
    let metadata: EntityMetadata;

    beforeEach(async () => {
        const dataSource = await initializeDataSource([Category, Game, GameGroup]);

        metadata = dataSource.getMetadata(Category);
    });

    it('should allow a category without a description, like the 100% category', () => {
        // Act
        const descriptionColumn = metadata.findColumnWithPropertyName('description');

        // Assert
        expect(descriptionColumn?.isNullable).toBe(true);
    });

    it('should require the other texts of the category', () => {
        // Act
        const nullableColumns = metadata.columns.filter(({ isNullable }) => isNullable).map(({ propertyName }) => propertyName);

        // Assert
        expect(nullableColumns).toEqual(['description']);
    });
});

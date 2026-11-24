import type { EntityMetadata } from 'typeorm';
import { beforeEach, describe, expect, it } from 'vitest';

import { Category } from './category.entity';
import { Game } from './game.entity';
import { GameGroup } from './game-group.entity';
import { initializeDataSource } from '../testing/helpers/repository.helpers';

describe('Game', () => {
    let metadata: EntityMetadata;

    beforeEach(async () => {
        const dataSource = await initializeDataSource([Category, Game, GameGroup]);

        metadata = dataSource.getMetadata(Game);
    });

    it('should keep the names of the games unique', () => {
        // Act
        const uniqueColumns = metadata.uniques.map(({ columns }) => columns.map(({ propertyName }) => propertyName));

        // Assert
        expect(uniqueColumns).toEqual([['name']]);
    });

    it('should belong to many categories, unassigned when either the game or the category is deleted', () => {
        // Act
        const categoriesRelation = metadata.findRelationWithPropertyPath('categories');

        // Assert
        expect(categoriesRelation?.isManyToMany).toBe(true);
        expect(categoriesRelation?.inverseEntityMetadata.target).toBe(Category);
        expect(categoriesRelation?.junctionEntityMetadata?.foreignKeys.map(({ referencedEntityMetadata, onDelete }) => [referencedEntityMetadata.target, onDelete])).toEqual([
            [Game, 'CASCADE'],
            [Category, 'CASCADE'],
        ]);
    });

    it('should have many groups', () => {
        // Act
        const groupsRelation = metadata.findRelationWithPropertyPath('groups');

        // Assert
        expect(groupsRelation?.isOneToMany).toBe(true);
        expect(groupsRelation?.inverseEntityMetadata.target).toBe(GameGroup);
    });
});

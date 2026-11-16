import type { EntityMetadata } from 'typeorm';
import { beforeEach, describe, expect, it } from 'vitest';

import { Category } from './category.entity';
import { Game } from './game.entity';
import { GameGroup } from './game-group.entity';
import { initializeDataSource } from '../testing/helpers/repository.helpers';

describe('GameGroup', () => {
    let metadata: EntityMetadata;

    beforeEach(async () => {
        const dataSource = await initializeDataSource([Category, Game, GameGroup]);

        metadata = dataSource.getMetadata(GameGroup);
    });

    it('should belong to the game as one of its groups and be deleted together with it', () => {
        // Act
        const gameRelation = metadata.findRelationWithPropertyPath('game');

        // Assert
        expect(gameRelation?.isManyToOne).toBe(true);
        expect(gameRelation?.inverseEntityMetadata.target).toBe(Game);
        expect(gameRelation?.inverseRelation?.propertyName).toBe('groups');
        expect(gameRelation?.onDelete).toBe('CASCADE');
    });
});

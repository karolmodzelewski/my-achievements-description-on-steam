import { TestBed } from '@angular/core/testing';

import { beforeEach, describe, expect, it } from 'vitest';

import { EditGameService } from './edit-game.service';
import { buildGame } from '../../../../testing/builders/description.builders';

describe('EditGameService', () => {
    let service: EditGameService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [EditGameService],
        });

        service = TestBed.inject(EditGameService);
    });

    it('should create a service', () => {
        // Assert
        expect(service).toBeTruthy();
    });

    it('should not edit any game initially', () => {
        // Assert
        expect(service.editedGame()).toBeNull();
    });

    it('should present the game which editing was started', () => {
        // Arrange
        const game = buildGame();

        // Act
        service.startEditing(game);

        // Assert
        expect(service.editedGame()).toBe(game);
    });

    it('should not edit any game after editing was stopped', () => {
        // Arrange
        service.startEditing(buildGame());

        // Act
        service.stopEditing();

        // Assert
        expect(service.editedGame()).toBeNull();
    });
});

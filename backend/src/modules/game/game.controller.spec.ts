import { Test } from '@nestjs/testing';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GameController } from './game.controller';
import { GameService } from './services/game.service';
import { Game } from '../../entities/game.entity';
import { GameGroup } from '../../entities/game-group.entity';
import { buildGameDto, buildGameGroupDto } from '../../testing/builders/game.builders';
import { createEntityManager, provideRepository } from '../../testing/helpers/repository.helpers';

describe('GameController', () => {
    let controller: GameController;
    let gameService: GameService;

    const gameDto = buildGameDto({ categories: [1, 2], groups: [buildGameGroupDto()] });

    beforeEach(async () => {
        const manager = createEntityManager();
        const module = await Test.createTestingModule({
            controllers: [GameController],
            providers: [GameService, provideRepository(Game, manager), provideRepository(GameGroup, manager)],
        }).compile();

        gameService = module.get(GameService);

        vi.spyOn(gameService, 'createGame').mockResolvedValue();
        vi.spyOn(gameService, 'updateGame').mockResolvedValue();
        vi.spyOn(gameService, 'deleteGame').mockResolvedValue();
        vi.spyOn(gameService, 'deleteGroup').mockResolvedValue();

        controller = module.get(GameController);
    });

    it('should create a controller', () => {
        // Assert
        expect(controller).toBeTruthy();
    });

    it('should create the game', async () => {
        // Act
        await controller.createGame(gameDto);

        // Assert
        expect(gameService.createGame).toHaveBeenCalledWith(gameDto);
    });

    it('should update the game with the given id', async () => {
        // Act
        await controller.updateGame(5, gameDto);

        // Assert
        expect(gameService.updateGame).toHaveBeenCalledWith(5, gameDto);
    });

    it('should delete the game with the given id', async () => {
        // Act
        await controller.deleteGame(5);

        // Assert
        expect(gameService.deleteGame).toHaveBeenCalledWith(5);
    });

    it('should delete the group with the given id of the game', async () => {
        // Act
        await controller.deleteGroup(5, 9);

        // Assert
        expect(gameService.deleteGroup).toHaveBeenCalledWith(5, 9);
    });
});

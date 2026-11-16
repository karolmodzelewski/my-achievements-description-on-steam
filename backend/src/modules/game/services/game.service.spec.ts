import { BadRequestException, ConflictException, Logger, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { In, QueryFailedError } from 'typeorm';
import type { EntityManager, Repository } from 'typeorm';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GameService } from './game.service';
import { Category } from '../../../entities/category.entity';
import { Game } from '../../../entities/game.entity';
import { GameGroup } from '../../../entities/game-group.entity';
import { CategoryKind } from '../../../enums/category-kind.enum';
import { ErrorCode } from '../../../enums/error-code.enum';
import { buildCategory } from '../../../testing/builders/category.builders';
import { buildGame, buildGameDto, buildGameGroupDto } from '../../../testing/builders/game.builders';
import { buildDeleteResult, buildInsertResult, buildUpdateResult } from '../../../testing/builders/query-result.builders';
import { createEntityManager, provideRepository, spyOnCreate, spyOnTransaction } from '../../../testing/helpers/repository.helpers';

describe('GameService', () => {
    let service: GameService;
    let gameRepository: Repository<Game>;
    let gameGroupRepository: Repository<GameGroup>;
    let manager: EntityManager;

    const mainCategory = buildCategory({ id: 1, kind: CategoryKind.MAIN });
    const lengthCategory = buildCategory({ id: 2, kind: CategoryKind.LENGTH, name: 'Short game' });
    const createdGame = buildGame({ id: 7 });
    const gameDto = buildGameDto({
        categories: [1, 2],
        groups: [buildGameGroupDto({ name: 'First DLC' }), buildGameGroupDto({ name: 'Second DLC', hasNewAchievements: true })],
    });

    const buildQueryFailedError = (code: string): QueryFailedError => new QueryFailedError('INSERT INTO "game"', [], Object.assign(new Error('Query failed'), { code }));

    beforeEach(async () => {
        manager = createEntityManager();

        const module = await Test.createTestingModule({
            providers: [GameService, provideRepository(Game, manager), provideRepository(GameGroup, manager)],
        }).compile();

        gameRepository = module.get(getRepositoryToken(Game));
        gameGroupRepository = module.get(getRepositoryToken(GameGroup));

        spyOnTransaction(manager);
        spyOnCreate(manager);
        vi.spyOn(manager, 'findBy').mockResolvedValue([mainCategory, lengthCategory]);
        vi.spyOn(manager, 'save').mockResolvedValue(createdGame);
        vi.spyOn(manager, 'insert').mockResolvedValue(buildInsertResult());
        vi.spyOn(manager, 'update').mockResolvedValue(buildUpdateResult());
        vi.spyOn(manager, 'delete').mockResolvedValue(buildDeleteResult());
        vi.spyOn(gameRepository, 'delete').mockResolvedValue(buildDeleteResult());
        vi.spyOn(gameGroupRepository, 'delete').mockResolvedValue(buildDeleteResult());

        service = module.get(GameService);
    });

    it('should create a service', () => {
        // Assert
        expect(service).toBeTruthy();
    });

    describe('createGame', () => {
        it('should create the game with its categories', async () => {
            // Act
            await service.createGame(gameDto);

            // Assert
            expect(manager.findBy).toHaveBeenCalledWith(Category, { id: In([1, 2]) });
            expect(manager.create).toHaveBeenCalledWith(Game, { name: 'Game', hasNewAchievements: false, categories: [mainCategory, lengthCategory] });
            expect(manager.save).toHaveBeenCalledWith({ name: 'Game', hasNewAchievements: false, categories: [mainCategory, lengthCategory] });
        });

        it('should create the groups of the created game', async () => {
            // Act
            await service.createGame(gameDto);

            // Assert
            expect(manager.insert).toHaveBeenCalledWith(GameGroup, [
                { name: 'First DLC', hasNewAchievements: false, game: { id: 7 } },
                { name: 'Second DLC', hasNewAchievements: true, game: { id: 7 } },
            ]);
        });

        it('should create the game without looking up categories and creating groups when it has none', async () => {
            // Act
            await service.createGame(buildGameDto());

            // Assert
            expect(manager.findBy).not.toHaveBeenCalled();
            expect(manager.create).toHaveBeenCalledWith(Game, { name: 'Game', hasNewAchievements: false, categories: [] });
            expect(manager.insert).not.toHaveBeenCalled();
        });

        it('should log the created game', async () => {
            // Arrange
            const logSpy = vi.spyOn(Logger.prototype, 'log');

            // Act
            await service.createGame(gameDto);

            // Assert
            expect(logSpy).toHaveBeenCalledWith(`Created game 'Game' (id 7) with 2 groups and 2 categories`);
        });

        it.each([
            { reason: 'an empty game name', emptyNameGameDto: buildGameDto({ name: '' }) },
            { reason: 'an empty group name', emptyNameGameDto: buildGameDto({ groups: [buildGameGroupDto(), buildGameGroupDto({ name: '' })] }) },
        ])('should reject $reason', async ({ emptyNameGameDto }) => {
            // Act
            const creation = service.createGame(emptyNameGameDto);

            // Assert
            await expect(creation).rejects.toBeInstanceOf(BadRequestException);
            await expect(creation).rejects.toMatchObject({ response: { errorCode: ErrorCode.EMPTY_NAME } });
            expect(manager.transaction).not.toHaveBeenCalled();
        });

        it.each([
            { reason: 'categories that are not saved', categoriesIds: [1, 8, 9], categories: [mainCategory], message: 'unknown category ids: 8, 9' },
            {
                reason: 'the 100% category',
                categoriesIds: [3],
                categories: [buildCategory({ id: 3, kind: CategoryKind.ONE_HUNDRED_PERCENT })],
                message: `the 100% category can't be assigned`,
            },
            {
                reason: 'more than one length category',
                categoriesIds: [2, 3],
                categories: [lengthCategory, buildCategory({ id: 3, kind: CategoryKind.LENGTH })],
                message: '2 length categories',
            },
            {
                reason: 'more than one difficulty category',
                categoriesIds: [3, 4],
                categories: [buildCategory({ id: 3, kind: CategoryKind.DIFFICULTY }), buildCategory({ id: 4, kind: CategoryKind.DIFFICULTY })],
                message: '2 difficulty categories',
            },
        ])('should reject $reason', async ({ categoriesIds, categories, message }) => {
            // Arrange
            vi.mocked(manager.findBy).mockResolvedValue(categories);

            // Act
            const creation = service.createGame(buildGameDto({ categories: categoriesIds }));

            // Assert
            await expect(creation).rejects.toThrow(new BadRequestException(`Game can belong only to saved categories, with at most one length and one difficulty category (${message})`));
            expect(manager.save).not.toHaveBeenCalled();
        });

        it('should reject a game name that already exists', async () => {
            // Arrange
            vi.mocked(manager.transaction).mockRejectedValue(buildQueryFailedError('23505'));

            // Act
            const creation = service.createGame(gameDto);

            // Assert
            await expect(creation).rejects.toThrow(new ConflictException(`Game with name 'Game' already exists`));
        });

        it.each([
            { reason: 'another database error', error: buildQueryFailedError('23503') },
            { reason: 'an unexpected error', error: new Error('Connection lost') },
        ])('should rethrow $reason', async ({ error }) => {
            // Arrange
            vi.mocked(manager.transaction).mockRejectedValue(error);

            // Act
            const creation = service.createGame(gameDto);

            // Assert
            await expect(creation).rejects.toBe(error);
        });
    });

    describe('updateGame', () => {
        it('should update the game with its categories', async () => {
            // Act
            await service.updateGame(5, gameDto);

            // Assert
            expect(manager.update).toHaveBeenCalledWith(Game, 5, { name: 'Game', hasNewAchievements: false });
            expect(manager.save).toHaveBeenCalledWith(Game, { id: 5, categories: [mainCategory, lengthCategory] });
        });

        it('should replace the groups of the game', async () => {
            // Act
            await service.updateGame(5, gameDto);

            // Assert
            expect(manager.delete).toHaveBeenCalledWith(GameGroup, { game: { id: 5 } });
            expect(manager.insert).toHaveBeenCalledWith(GameGroup, [
                { name: 'First DLC', hasNewAchievements: false, game: { id: 5 } },
                { name: 'Second DLC', hasNewAchievements: true, game: { id: 5 } },
            ]);
            expect(vi.mocked(manager.delete).mock.invocationCallOrder[0]).toBeLessThan(vi.mocked(manager.insert).mock.invocationCallOrder[0]);
        });

        it('should only delete the groups of the game when it has none', async () => {
            // Act
            await service.updateGame(5, buildGameDto());

            // Assert
            expect(manager.delete).toHaveBeenCalledWith(GameGroup, { game: { id: 5 } });
            expect(manager.insert).not.toHaveBeenCalled();
        });

        it('should log the updated game', async () => {
            // Arrange
            const logSpy = vi.spyOn(Logger.prototype, 'log');

            // Act
            await service.updateGame(5, gameDto);

            // Assert
            expect(logSpy).toHaveBeenCalledWith(`Updated game 'Game' (id 5) with 2 groups and 2 categories`);
        });

        it('should reject a game that does not exist', async () => {
            // Arrange
            vi.mocked(manager.update).mockResolvedValue(buildUpdateResult(0));

            // Act
            const update = service.updateGame(5, gameDto);

            // Assert
            await expect(update).rejects.toThrow(new NotFoundException(`Game with id '5' doesn't exist`));
            expect(manager.save).not.toHaveBeenCalled();
            expect(manager.delete).not.toHaveBeenCalled();
        });

        it('should reject an empty game name', async () => {
            // Act
            const update = service.updateGame(5, buildGameDto({ name: '' }));

            // Assert
            await expect(update).rejects.toMatchObject({ response: { errorCode: ErrorCode.EMPTY_NAME } });
            expect(manager.transaction).not.toHaveBeenCalled();
        });

        it('should reject a game name that already exists', async () => {
            // Arrange
            vi.mocked(manager.transaction).mockRejectedValue(buildQueryFailedError('23505'));

            // Act
            const update = service.updateGame(5, gameDto);

            // Assert
            await expect(update).rejects.toThrow(new ConflictException(`Game with name 'Game' already exists`));
        });
    });

    describe('deleteGame', () => {
        it('should delete the game with the given id', async () => {
            // Act
            await service.deleteGame(5);

            // Assert
            expect(gameRepository.delete).toHaveBeenCalledWith(5);
        });

        it('should reject a game that does not exist', async () => {
            // Arrange
            vi.mocked(gameRepository.delete).mockResolvedValue(buildDeleteResult(0));

            // Act
            const deletion = service.deleteGame(5);

            // Assert
            await expect(deletion).rejects.toThrow(new NotFoundException(`Game with id '5' doesn't exist`));
        });
    });

    describe('deleteGroup', () => {
        it('should delete the group with the given id of the game', async () => {
            // Act
            await service.deleteGroup(5, 9);

            // Assert
            expect(gameGroupRepository.delete).toHaveBeenCalledWith({ id: 9, game: { id: 5 } });
        });

        it('should reject a group that does not exist in the game', async () => {
            // Arrange
            vi.mocked(gameGroupRepository.delete).mockResolvedValue(buildDeleteResult(0));

            // Act
            const deletion = service.deleteGroup(5, 9);

            // Assert
            await expect(deletion).rejects.toThrow(new NotFoundException(`Group with id '9' of game with id '5' doesn't exist`));
        });
    });
});

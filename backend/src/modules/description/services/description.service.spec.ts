import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import type { Repository } from 'typeorm';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DescriptionService } from './description.service';
import { Category } from '../../../entities/category.entity';
import { Game } from '../../../entities/game.entity';
import { CategoryKind } from '../../../enums/category-kind.enum';
import { buildCategory } from '../../../testing/builders/category.builders';
import { buildGame, buildGameGroup } from '../../../testing/builders/game.builders';
import { createEntityManager, provideRepository } from '../../../testing/helpers/repository.helpers';

describe('DescriptionService', () => {
    let service: DescriptionService;
    let gameRepository: Repository<Game>;
    let categoriesRepository: Repository<Category>;

    const oneHundredPercentCategory = buildCategory({ id: 1, kind: CategoryKind.ONE_HUNDRED_PERCENT, name: '100%', description: null, iconName: ':100:' });
    const firstMainCategory = buildCategory({ id: 2, kind: CategoryKind.MAIN, iconName: ':heart:', position: 0 });
    const secondMainCategory = buildCategory({ id: 3, kind: CategoryKind.MAIN, name: 'Funny game', iconName: ':joy:', shouldHideGames: true, position: 1 });
    const lengthCategory = buildCategory({ id: 4, kind: CategoryKind.LENGTH, name: 'Short game', iconName: ':clock:' });
    const difficultyCategory = buildCategory({ id: 5, kind: CategoryKind.DIFFICULTY, name: 'Hard game', iconName: ':skull:' });
    const completedGroup = buildGameGroup({ id: 1, name: 'Completed DLC' });
    const anotherCompletedGroup = buildGameGroup({ id: 2, name: 'Another completed DLC' });
    const newAchievementsGroup = buildGameGroup({ id: 3, name: 'New DLC', hasNewAchievements: true });

    beforeEach(async () => {
        const manager = createEntityManager();
        const module = await Test.createTestingModule({
            providers: [DescriptionService, provideRepository(Game, manager), provideRepository(Category, manager)],
        }).compile();

        gameRepository = module.get(getRepositoryToken(Game));
        categoriesRepository = module.get(getRepositoryToken(Category));

        vi.spyOn(gameRepository, 'find').mockResolvedValue([]);
        vi.spyOn(categoriesRepository, 'find').mockResolvedValue([difficultyCategory, secondMainCategory, oneHundredPercentCategory, lengthCategory, firstMainCategory]);

        service = module.get(DescriptionService);
    });

    it('should create a service', () => {
        // Assert
        expect(service).toBeTruthy();
    });

    it('should request the games with their groups and categories', async () => {
        // Act
        await service.getDescription();

        // Assert
        expect(gameRepository.find).toHaveBeenCalledWith({ relations: { groups: true, categories: true } });
    });

    it('should list the sorted categories without the 100% category and count their games', async () => {
        // Arrange
        vi.mocked(gameRepository.find).mockResolvedValue([
            buildGame({ id: 1, categories: [firstMainCategory, difficultyCategory] }),
            buildGame({ id: 2, name: 'Another game', categories: [firstMainCategory] }),
        ]);

        // Act
        const { categories } = await service.getDescription();

        // Assert
        expect(categories).toEqual([
            { id: 2, kind: CategoryKind.MAIN, name: 'Loved game', description: 'The game I fell in love with', iconName: ':heart:', shouldHideGames: false, amount: 2 },
            { id: 3, kind: CategoryKind.MAIN, name: 'Funny game', description: 'The game I fell in love with', iconName: ':joy:', shouldHideGames: true, amount: 0 },
            { id: 4, kind: CategoryKind.LENGTH, name: 'Short game', description: 'The game I fell in love with', iconName: ':clock:', shouldHideGames: false, amount: 0 },
            { id: 5, kind: CategoryKind.DIFFICULTY, name: 'Hard game', description: 'The game I fell in love with', iconName: ':skull:', shouldHideGames: false, amount: 1 },
        ]);
    });

    it('should map the game with its categories in the order of categories and with the 100% icon', async () => {
        // Arrange
        vi.mocked(gameRepository.find).mockResolvedValue([buildGame({ categories: [difficultyCategory, lengthCategory, secondMainCategory] })]);

        // Act
        const { completed } = await service.getDescription();

        // Assert
        expect(completed.entries[0].game).toEqual({
            id: 1,
            name: 'Game',
            hasNewAchievements: false,
            categories: [
                { id: 3, kind: CategoryKind.MAIN, iconName: ':joy:', shouldHideGames: true },
                { id: 4, kind: CategoryKind.LENGTH, iconName: ':clock:', shouldHideGames: false },
                { id: 5, kind: CategoryKind.DIFFICULTY, iconName: ':skull:', shouldHideGames: false },
            ],
            oneHundredPercentIconName: ':100:',
            groups: [],
        });
    });

    it('should map the game with an empty 100% icon when there is no 100% category', async () => {
        // Arrange
        vi.mocked(categoriesRepository.find).mockResolvedValue([firstMainCategory]);
        vi.mocked(gameRepository.find).mockResolvedValue([buildGame()]);

        // Act
        const { completed } = await service.getDescription();

        // Assert
        expect(completed.entries[0].game.oneHundredPercentIconName).toBe('');
    });

    it('should sort the games and their groups by name', async () => {
        // Arrange
        vi.mocked(gameRepository.find).mockResolvedValue([buildGame({ id: 1, name: 'Zelda', groups: [completedGroup, anotherCompletedGroup] }), buildGame({ id: 2, name: 'Asterix' })]);

        // Act
        const { completed } = await service.getDescription();

        // Assert
        expect(completed.entries.map(({ game }) => game.name)).toEqual(['Asterix', 'Zelda']);
        expect(completed.entries[1].listedGroups).toEqual([anotherCompletedGroup, completedGroup]);
    });

    describe('completed section', () => {
        it('should list the completed groups below the completed game', async () => {
            // Arrange
            vi.mocked(gameRepository.find).mockResolvedValue([buildGame({ groups: [completedGroup, newAchievementsGroup] })]);

            // Act
            const { completed } = await service.getDescription();

            // Assert
            expect(completed).toMatchObject({
                amount: 2,
                gamesAmount: 1,
                groupsAmount: 1,
                entries: [{ game: { id: 1 }, group: null, listedGroups: [completedGroup] }],
            });
        });

        it('should list each completed group of the game with new achievements separately', async () => {
            // Arrange
            vi.mocked(gameRepository.find).mockResolvedValue([buildGame({ hasNewAchievements: true, groups: [completedGroup, anotherCompletedGroup, newAchievementsGroup] })]);

            // Act
            const { completed } = await service.getDescription();

            // Assert
            expect(completed).toMatchObject({
                amount: 2,
                gamesAmount: 0,
                groupsAmount: 2,
                entries: [
                    { game: { id: 1 }, group: anotherCompletedGroup, listedGroups: [] },
                    { game: { id: 1 }, group: completedGroup, listedGroups: [] },
                ],
            });
        });
    });

    describe('new achievements section', () => {
        it('should list the game with new achievements followed by its groups with new achievements', async () => {
            // Arrange
            vi.mocked(gameRepository.find).mockResolvedValue([buildGame({ hasNewAchievements: true, groups: [completedGroup, newAchievementsGroup] })]);

            // Act
            const { newAchievements } = await service.getDescription();

            // Assert
            expect(newAchievements).toMatchObject({
                amount: 2,
                gamesAmount: 1,
                groupsAmount: 1,
                entries: [
                    { game: { id: 1 }, group: null, listedGroups: [] },
                    { game: { id: 1 }, group: newAchievementsGroup, listedGroups: [] },
                ],
            });
        });

        it('should list only the groups with new achievements of the completed game', async () => {
            // Arrange
            vi.mocked(gameRepository.find).mockResolvedValue([buildGame({ groups: [completedGroup, newAchievementsGroup] })]);

            // Act
            const { newAchievements } = await service.getDescription();

            // Assert
            expect(newAchievements).toMatchObject({
                amount: 1,
                gamesAmount: 0,
                groupsAmount: 1,
                entries: [{ game: { id: 1 }, group: newAchievementsGroup, listedGroups: [] }],
            });
        });
    });
});

import { Game } from '../../entities/game.entity';
import { GameGroup } from '../../entities/game-group.entity';
import { GameDto } from '../../modules/game/dtos/game.dto';
import { GameGroupDto } from '../../modules/game/dtos/game-group.dto';

export const buildGameGroup = (overrides: Partial<GameGroup> = {}): GameGroup =>
    Object.assign(new GameGroup(), {
        id: 1,
        name: 'DLC',
        hasNewAchievements: false,
        ...overrides,
    });

export const buildGame = (overrides: Partial<Game> = {}): Game =>
    Object.assign(new Game(), {
        id: 1,
        name: 'Game',
        hasNewAchievements: false,
        categories: [],
        groups: [],
        ...overrides,
    });

export const buildGameGroupDto = (overrides: Partial<GameGroupDto> = {}): GameGroupDto =>
    Object.assign(new GameGroupDto(), {
        name: 'DLC',
        hasNewAchievements: false,
        ...overrides,
    });

export const buildGameDto = (overrides: Partial<GameDto> = {}): GameDto =>
    Object.assign(new GameDto(), {
        name: 'Game',
        categories: [],
        hasNewAchievements: false,
        groups: [],
        ...overrides,
    });

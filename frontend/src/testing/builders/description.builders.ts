import type { DescriptionEntry } from '../../app/interfaces/description-entry.interface';
import type { DescriptionResponseBody } from '../../app/interfaces/description-response-body.interface';
import type { DescriptionSection } from '../../app/interfaces/description-section.interface';
import type { GameGroup } from '../../app/interfaces/game-group.interface';
import type { Game } from '../../app/interfaces/game.interface';

export const buildGameGroup = (overrides: Partial<GameGroup> = {}): GameGroup => ({
    id: 1,
    name: 'DLC',
    hasNewAchievements: false,
    ...overrides,
});

export const buildGame = (overrides: Partial<Game> = {}): Game => ({
    id: 1,
    name: 'Game',
    oneHundredPercentIconName: ':100:',
    hasNewAchievements: false,
    groups: [],
    ...overrides,
});

export const buildDescriptionEntry = (overrides: Partial<DescriptionEntry> = {}): DescriptionEntry => ({
    game: buildGame(),
    group: null,
    listedGroups: [],
    ...overrides,
});

export const buildDescriptionSection = (overrides: Partial<DescriptionSection> = {}): DescriptionSection => ({
    amount: 0,
    gamesAmount: 0,
    groupsAmount: 0,
    entries: [],
    ...overrides,
});

export const buildDescriptionResponseBody = (overrides: Partial<DescriptionResponseBody> = {}): DescriptionResponseBody => ({
    categories: [],
    completed: buildDescriptionSection(),
    newAchievements: buildDescriptionSection(),
    ...overrides,
});

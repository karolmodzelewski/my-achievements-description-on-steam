import { expect } from '@playwright/test';
import type { APIRequestContext } from '@playwright/test';

import { CategoryKind } from '../../src/app/enums/category-kind.enum';
import type { AddGameRequestBody } from '../../src/app/interfaces/add-game-request-body.interface';
import type { Category } from '../../src/app/interfaces/category.interface';
import type { CategoryRequestBody } from '../../src/app/interfaces/category-request-body.interface';
import type { DescriptionResponseBody } from '../../src/app/interfaces/description-response-body.interface';
import type { Game } from '../../src/app/interfaces/game.interface';
import { ONE_HUNDRED_PERCENT_ICON } from '../constants/test-data.constants';

export const getCategories = async (request: APIRequestContext): Promise<Category[]> => {
    const response = await request.get('api/categories');

    await expect(response).toBeOK();

    return (await response.json()) as Category[];
};

export const saveCategories = async (request: APIRequestContext, kind: CategoryKind, categories: CategoryRequestBody[]): Promise<Category[]> => {
    const response = await request.put(`api/categories/${kind}`, { data: categories });

    await expect(response).toBeOK();

    return (await getCategories(request)).filter((category) => category.kind === kind);
};

export const deleteCategories = async (request: APIRequestContext, kinds: CategoryKind[]): Promise<void> => {
    for (const kind of kinds) {
        await saveCategories(request, kind, []);
    }
};

// The 100% category always exists and only its icon can be changed (never to an empty one)
export const setOneHundredPercentIcon = async (request: APIRequestContext, iconName: string): Promise<void> => {
    const oneHundredPercentCategories = (await getCategories(request)).filter(({ kind }) => kind === CategoryKind.ONE_HUNDRED_PERCENT);

    await saveCategories(
        request,
        CategoryKind.ONE_HUNDRED_PERCENT,
        oneHundredPercentCategories.map(({ id, name }) => ({ id, name, iconName, shouldHideGames: false }))
    );
};

export const addGame = async (request: APIRequestContext, game: AddGameRequestBody): Promise<void> => {
    const response = await request.post('api/game', { data: game });

    await expect(response).toBeOK();
};

// Games of hidden categories are listed in the description too, so it contains every game
const deleteGamesMatching = async (request: APIRequestContext, shouldDelete: (game: Game) => boolean): Promise<void> => {
    const response = await request.get('api/description');

    await expect(response).toBeOK();

    const { completed, newAchievements } = (await response.json()) as DescriptionResponseBody;
    const gamesIds = new Set([...completed.entries, ...newAchievements.entries].filter(({ game }) => shouldDelete(game)).map(({ game }) => game.id));

    for (const gameId of gamesIds) {
        const deleteResponse = await request.delete(`api/game/${gameId}`);

        await expect(deleteResponse).toBeOK();
    }
};

export const deleteGames = async (request: APIRequestContext, names: string[]): Promise<void> => deleteGamesMatching(request, ({ name }) => names.includes(name));

const deleteAllGames = async (request: APIRequestContext): Promise<void> => deleteGamesMatching(request, () => true);

// Called before every test, so everything is properly cleaned up before running any test
export const resetData = async (request: APIRequestContext): Promise<void> => {
    await deleteAllGames(request);
    await deleteCategories(request, [CategoryKind.MAIN, CategoryKind.LENGTH, CategoryKind.DIFFICULTY]);
    await setOneHundredPercentIcon(request, ONE_HUNDRED_PERCENT_ICON);
};

import { expect } from '@playwright/test';
import type { Locator, Page, Response } from '@playwright/test';

import { waitForApiResponse } from './network.helpers';
import { CategoryKind } from '../../src/app/enums/category-kind.enum';
import { HttpRequestMethod } from '../../src/app/enums/http-request-method.enum';
import en from '../../src/app/i18n/en.json';
import type { CategoryRequestBody } from '../../src/app/interfaces/category-request-body.interface';

export const getCategoriesRegion = (page: Page): Locator => page.getByRole('region', { name: 'Manage categories' });

export const expandCategories = async (page: Page): Promise<void> => {
    await getCategoriesRegion(page).getByRole('button', { name: 'Expand' }).click();
};

export const getOneHundredPercentIconInput = (page: Page): Locator => getCategoriesRegion(page).getByRole('group', { name: '100% category' }).getByLabel('Icon name:');

export const getSaveOneHundredPercentButton = (page: Page): Locator => getCategoriesRegion(page).getByRole('button', { name: 'Save 100% category' });

// Texts of a kind come from the same translations the form of the kind uses
const getKindTexts = (kind: CategoryKind): (typeof en.categoryKind)[keyof typeof en.categoryKind] => en.categoryKind[kind as keyof typeof en.categoryKind];

export const getKindGroup = (page: Page, kind: CategoryKind): Locator => getCategoriesRegion(page).getByRole('group', { name: getKindTexts(kind).legend, exact: true });

export const getSaveCategoriesButton = (page: Page, kind: CategoryKind): Locator => getCategoriesRegion(page).getByRole('button', { name: getKindTexts(kind).save });

export const saveOneHundredPercentForm = async (page: Page): Promise<Response> => {
    const saveResponse = waitForApiResponse(page, HttpRequestMethod.PUT, `categories/${CategoryKind.ONE_HUNDRED_PERCENT}`);

    await getSaveOneHundredPercentButton(page).click();

    return saveResponse;
};

export const saveCategoriesForm = async (page: Page, kind: CategoryKind): Promise<Response> => {
    const saveResponse = waitForApiResponse(page, HttpRequestMethod.PUT, `categories/${kind}`);

    await getSaveCategoriesButton(page, kind).click();

    return saveResponse;
};

export const getAddCategoryBelowButton = (page: Page, kind: CategoryKind, position: number): Locator =>
    getKindGroup(page, kind).getByRole('button', { name: `Add category below category ${position}`, exact: true });

export const getRemoveCategoryButton = (page: Page, kind: CategoryKind, position: number): Locator =>
    getKindGroup(page, kind).getByRole('button', { name: `Remove category ${position}`, exact: true });

export const getMoveCategoryHandle = (page: Page, kind: CategoryKind, position: number): Locator => getKindGroup(page, kind).getByRole('button', { name: `Move category ${position}`, exact: true });

export const getCategoryNameInput = (page: Page, kind: CategoryKind, position: number): Locator => getKindGroup(page, kind).getByLabel(`Category name (category ${position})`, { exact: true });

export const getCategoryDescriptionInput = (page: Page, kind: CategoryKind, position: number): Locator =>
    getKindGroup(page, kind).getByLabel(`Category description (category ${position})`, { exact: true });

export const getCategoryIconNameInput = (page: Page, kind: CategoryKind, position: number): Locator => getKindGroup(page, kind).getByLabel(`Icon name (category ${position})`, { exact: true });

export const getHideGamesCheckbox = (page: Page, kind: CategoryKind, position: number): Locator =>
    getKindGroup(page, kind).getByRole('checkbox', { name: `Hide games (category ${position})`, exact: true });

export const addCategories = async (page: Page, kind: CategoryKind, categories: CategoryRequestBody[]): Promise<void> => {
    for (const [index, { name, description, iconName, shouldHideGames }] of categories.entries()) {
        const position = index + 1;

        await (position === 1 ? getKindGroup(page, kind).getByRole('button', { name: 'Add category', exact: true }) : getAddCategoryBelowButton(page, kind, index)).click();
        await getCategoryNameInput(page, kind, position).fill(name);
        await getCategoryDescriptionInput(page, kind, position).fill(description ?? '');
        await getCategoryIconNameInput(page, kind, position).fill(iconName);

        // Only main categories can hide games, so only their rows have the checkbox
        if (shouldHideGames) {
            await getHideGamesCheckbox(page, kind, position).check();
        }
    }
};

export const expectCategoryNames = async (page: Page, kind: CategoryKind, names: string[]): Promise<void> => {
    const nameInputs = getKindGroup(page, kind).getByLabel(/^Category name \(category \d+\)$/);

    await expect(nameInputs).toHaveCount(names.length);

    for (const [index, name] of names.entries()) {
        await expect(nameInputs.nth(index)).toHaveValue(name);
    }
};

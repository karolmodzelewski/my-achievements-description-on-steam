import type { Locator, Page } from '@playwright/test';

import { CategoryKind } from '../../src/app/enums/category-kind.enum';
import type { Category } from '../../src/app/interfaces/category.interface';

export const openMainPage = async (page: Page): Promise<void> => {
    await page.goto('/');
    await page.getByRole('region', { name: 'Manage categories' }).waitFor();
};

export const reloadMainPage = async (page: Page): Promise<void> => {
    await page.reload();
    await page.getByRole('region', { name: 'Manage categories' }).waitFor();
};

export const mockEmptyOneHundredPercentIcon = async (page: Page): Promise<void> => {
    await page.route(
        '**/api/categories',
        async (route) => {
            const response = await route.fetch();
            const categories = (await response.json()) as Category[];

            await route.fulfill({ response, json: categories.map((category) => (category.kind === CategoryKind.ONE_HUNDRED_PERCENT ? { ...category, iconName: '' } : category)) });
        },
        { times: 1 }
    );
};

export const getInfobar = (page: Page): Locator => page.getByText('To add a game and see the description, please set the 100% icon in Manage categories');

export const getSnackbar = (page: Page, message: string): Locator => page.getByText(message, { exact: true });

export const getLanguageButton = (page: Page, languageName: string): Locator => page.getByRole('button', { name: languageName, exact: true });

export const getConfirmationDialog = (page: Page): Locator => page.getByRole('alertdialog');

export const getConfirmationButton = (page: Page, name: 'Yes' | 'No'): Locator => getConfirmationDialog(page).getByRole('button', { name, exact: true });

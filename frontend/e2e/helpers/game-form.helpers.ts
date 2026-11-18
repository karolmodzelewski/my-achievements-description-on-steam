import type { Locator, Page } from '@playwright/test';

export const getGameFormRegion = (page: Page): Locator => page.getByRole('region', { name: 'Manage game' });

export const getGameNameInput = (page: Page): Locator => getGameFormRegion(page).getByLabel('Game name:');

export const getLengthSelect = (page: Page): Locator => getGameFormRegion(page).getByRole('combobox', { name: 'Length:' });

export const getDifficultySelect = (page: Page): Locator => getGameFormRegion(page).getByRole('combobox', { name: 'Difficulty:' });

export const getMainCategoryCheckbox = (page: Page, name: string): Locator => getGameFormRegion(page).getByRole('group', { name: 'Main categories' }).getByRole('checkbox', { name, exact: true });

export const getClearButton = (page: Page, name: 'Clear game name' | 'Clear length' | 'Clear difficulty'): Locator => getGameFormRegion(page).getByRole('button', { name, exact: true });

export const getBaseGameNewAchievementsCheckbox = (page: Page): Locator => getGameFormRegion(page).getByRole('checkbox', { name: 'New achievements (Base game)', exact: true });

export const getAddBaseGameGroupButton = (page: Page): Locator => getGameFormRegion(page).getByRole('button', { name: 'Add group below Base game' });

export const getAddGroupBelowButton = (page: Page, position: number): Locator => getGameFormRegion(page).getByRole('button', { name: `Add group below group ${position}`, exact: true });

export const getRemoveGroupButton = (page: Page, position: number): Locator => getGameFormRegion(page).getByRole('button', { name: `Remove group ${position}`, exact: true });

export const getGroupNameInput = (page: Page, position: number): Locator => getGameFormRegion(page).getByLabel(`Group name (group ${position})`, { exact: true });

export const getGroupNewAchievementsCheckbox = (page: Page, position: number): Locator => getGameFormRegion(page).getByRole('checkbox', { name: `New achievements (group ${position})`, exact: true });

export const getGameFormButton = (page: Page, name: 'Add game' | 'Edit game' | 'Cancel editing'): Locator => getGameFormRegion(page).getByRole('button', { name, exact: true });

export const selectOption = async (page: Page, select: Locator, optionName: string): Promise<void> => {
    await select.click();
    await page.getByRole('option', { name: optionName, exact: true }).click();
};

import { expect, test } from '../fixtures/test.fixtures';
import { CategoryKind } from '../../src/app/enums/category-kind.enum';
import { HttpRequestMethod } from '../../src/app/enums/http-request-method.enum';
import type { Category } from '../../src/app/interfaces/category.interface';
import { ADULT_CATEGORY, EASY_CATEGORY, HARD_CATEGORY, LONG_CATEGORY, LOVED_CATEGORY, SHORT_CATEGORY } from '../constants/test-data.constants';
import { addGame, deleteCategories, deleteGames, saveCategories } from '../helpers/api.helpers';
import { getCategoryLines, getDescriptionRegion, getEditModeButton, getEntryButton, getGameLines } from '../helpers/description.helpers';
import {
    getAddBaseGameGroupButton,
    getAddGroupBelowButton,
    getBaseGameNewAchievementsCheckbox,
    getClearButton,
    getDifficultySelect,
    getGameFormButton,
    getGameFormRegion,
    getGameNameInput,
    getGroupNameInput,
    getGroupNewAchievementsCheckbox,
    getLengthSelect,
    getMainCategoryCheckbox,
    getRemoveGroupButton,
    selectOption,
} from '../helpers/game-form.helpers';
import { getConfirmationButton, getConfirmationDialog, getSnackbar, openMainPage, reloadMainPage } from '../helpers/main-page.helpers';
import { waitForApiResponse } from '../helpers/network.helpers';

const EDITED_GAME_PATH = /^game\/\d+$/;

test.describe('Game', () => {
    let lengthCategories: Category[];

    test.beforeEach(async ({ request }) => {
        await saveCategories(request, CategoryKind.MAIN, [LOVED_CATEGORY, ADULT_CATEGORY]);
        lengthCategories = await saveCategories(request, CategoryKind.LENGTH, [SHORT_CATEGORY, LONG_CATEGORY]);
        await saveCategories(request, CategoryKind.DIFFICULTY, [EASY_CATEGORY, HARD_CATEGORY]);
    });

    test.afterEach(async ({ request }) => {
        await deleteGames(request, ['Portal', 'Portal 2']);
        await deleteCategories(request, [CategoryKind.MAIN, CategoryKind.LENGTH, CategoryKind.DIFFICULTY]);
    });

    test.describe('when adding a game', () => {
        test.beforeEach(async ({ page }) => {
            await openMainPage(page);
        });

        test('should add a game with its categories and groups to the description', async ({ page }) => {
            await getGameNameInput(page).fill('Portal 2');
            await getMainCategoryCheckbox(page, LOVED_CATEGORY.name).check();
            await selectOption(page, getLengthSelect(page), SHORT_CATEGORY.name);
            await selectOption(page, getDifficultySelect(page), HARD_CATEGORY.name);
            await getAddBaseGameGroupButton(page).click();
            await getGroupNameInput(page, 1).fill('Peer Review');
            await getGroupNewAchievementsCheckbox(page, 1).check();

            const addResponsePromise = waitForApiResponse(page, HttpRequestMethod.POST, 'game');

            await getGameFormButton(page, 'Add game').click();

            const addResponse = await addResponsePromise;

            expect(addResponse.ok()).toBe(true);
            await expect(getSnackbar(page, 'Successfully saved game')).toBeVisible();
            await expect(getGameNameInput(page)).toHaveValue('');
            await expect(getGroupNameInput(page, 1)).toBeHidden();
            await expect(getGameLines(page)).toHaveText(['ː100ftː Portal 2 ːheartːːshortːːhardː', 'ː100ftː Portal 2 - Peer Review']);
            await expect(getCategoryLines(page)).toHaveText([
                'ːheartː Games I loved (1)',
                'ːadultː Adult games (0) (not copied)',
                'ːshortː Short games (1)',
                'ːlongː Long games (0) (not copied)',
                'ːeasyː Easy games (0) (not copied)',
                'ːhardː Hard games (1)',
            ]);

            await test.step('keeps the game after reload', async () => {
                await reloadMainPage(page);

                await expect(getGameLines(page)).toHaveText(['ː100ftː Portal 2 ːheartːːshortːːhardː', 'ː100ftː Portal 2 - Peer Review']);
            });
        });

        test('should not allow adding a game without a name', async ({ page }) => {
            await getGameNameInput(page).fill('   ');
            await getGameNameInput(page).blur();

            await expect(getGameFormRegion(page).getByText("Game name can't contain only whitespaces")).toBeVisible();
            await expect(getGameFormButton(page, 'Add game')).toBeDisabled();

            await getGameNameInput(page).clear();

            await expect(getGameFormRegion(page).getByText('Game name is required')).toBeVisible();
            await expect(getGameFormButton(page, 'Add game')).toBeDisabled();
        });

        test('should not allow adding a group without a name', async ({ page }) => {
            await getGameNameInput(page).fill('Celeste');
            await getAddBaseGameGroupButton(page).click();
            await getGroupNameInput(page, 1).focus();
            await getGroupNameInput(page, 1).blur();

            await expect(getGameFormRegion(page).getByText('Group name is required')).toBeVisible();
            await expect(getGameFormButton(page, 'Add game')).toBeDisabled();
        });

        test('should remove a group which is not saved yet without confirmation', async ({ page }) => {
            await getAddBaseGameGroupButton(page).click();
            await getGroupNameInput(page, 1).fill('Farewell');
            await getAddGroupBelowButton(page, 1).click();
            await getGroupNameInput(page, 2).fill('Core');
            await getRemoveGroupButton(page, 1).click();

            await expect(getConfirmationDialog(page)).toBeHidden();
            await expect(getGroupNameInput(page, 1)).toHaveValue('Core');
            await expect(getGroupNameInput(page, 2)).toBeHidden();
        });

        test('should clear the fields with their clear buttons', async ({ page }) => {
            await getGameNameInput(page).fill('Portal 2');
            await selectOption(page, getLengthSelect(page), SHORT_CATEGORY.name);
            await selectOption(page, getDifficultySelect(page), HARD_CATEGORY.name);

            await getClearButton(page, 'Clear game name').click();

            await expect(getGameNameInput(page)).toHaveValue('');
            await expect(getGameNameInput(page)).toBeFocused();
            await expect(getClearButton(page, 'Clear game name')).toBeHidden();

            await getClearButton(page, 'Clear length').click();

            await expect(getLengthSelect(page)).toHaveText('');
            await expect(getClearButton(page, 'Clear length')).toBeHidden();

            await getClearButton(page, 'Clear difficulty').click();

            await expect(getDifficultySelect(page)).toHaveText('');
            await expect(getClearButton(page, 'Clear difficulty')).toBeHidden();
        });

        test('should show an error when a game with the same name already exists', async ({ page, request }) => {
            await addGame(request, { name: 'Portal 2', categories: [], hasNewAchievements: false, groups: [] });
            await reloadMainPage(page);

            await getGameNameInput(page).fill('Portal 2');

            const addResponsePromise = waitForApiResponse(page, HttpRequestMethod.POST, 'game');

            await getGameFormButton(page, 'Add game').click();

            const addResponse = await addResponsePromise;

            expect(addResponse.status()).toBe(409);
            await expect(getSnackbar(page, 'An error has occurred while saving game')).toBeVisible();
            await expect(getGameNameInput(page)).toHaveValue('Portal 2');
            await expect(getGameLines(page)).toHaveText(['ː100ftː Portal 2']);
        });
    });

    test.describe('when a game is added', () => {
        test.beforeEach(async ({ page, request }) => {
            await addGame(request, { name: 'Portal', categories: [lengthCategories[0].id], hasNewAchievements: false, groups: [{ name: 'Peer Review', hasNewAchievements: false }] });
            await openMainPage(page);
            await getEditModeButton(page).click();
        });

        test('should edit the game from the description', async ({ page }) => {
            await expect(getEditModeButton(page)).toHaveAttribute('aria-pressed', 'true');

            await getEntryButton(page, 'Edit', 'Portal').click();

            await expect(getGameNameInput(page)).toBeFocused();
            await expect(getGameNameInput(page)).toHaveValue('Portal');
            await expect(getLengthSelect(page)).toHaveText(SHORT_CATEGORY.name);
            await expect(getGroupNameInput(page, 1)).toHaveValue('Peer Review');
            await expect(getGameFormButton(page, 'Add game')).toBeHidden();

            await getGameNameInput(page).fill('Portal 2');
            await getMainCategoryCheckbox(page, LOVED_CATEGORY.name).check();
            await selectOption(page, getLengthSelect(page), LONG_CATEGORY.name);
            await selectOption(page, getDifficultySelect(page), HARD_CATEGORY.name);
            await getBaseGameNewAchievementsCheckbox(page).check();
            await getGroupNewAchievementsCheckbox(page, 1).check();

            const editResponsePromise = waitForApiResponse(page, HttpRequestMethod.PUT, EDITED_GAME_PATH);

            await getGameFormButton(page, 'Edit game').click();

            const editResponse = await editResponsePromise;

            expect(editResponse.ok()).toBe(true);
            await expect(getSnackbar(page, 'Successfully saved game')).toBeVisible();
            await expect(getGameFormButton(page, 'Add game')).toBeVisible();
            await expect(getDescriptionRegion(page).getByText('NEW ACHIEVEMENTS (2) - GAMES (1) & GROUPS (1):')).toBeVisible();
            await expect(getDescriptionRegion(page).getByText(/^COMPLETED/)).toBeHidden();
            await expect(getGameLines(page)).toHaveText(['ː100ftː Portal 2 ːheartːːlongːːhardː', 'ː100ftː Portal 2 - Peer Review']);

            await test.step('keeps the changes after reload', async () => {
                await reloadMainPage(page);
                await getEditModeButton(page).click();
                await getEntryButton(page, 'Edit', 'Portal 2').click();

                await expect(getGameLines(page)).toHaveText(['ː100ftː Portal 2 ːheartːːlongːːhardː', 'ː100ftː Portal 2 - Peer Review']);
                await expect(getMainCategoryCheckbox(page, LOVED_CATEGORY.name)).toBeChecked();
                await expect(getDifficultySelect(page)).toHaveText(HARD_CATEGORY.name);
                await expect(getBaseGameNewAchievementsCheckbox(page)).toBeChecked();
                await expect(getGroupNewAchievementsCheckbox(page, 1)).toBeChecked();
            });
        });

        test('should remove a saved group only after confirmation', async ({ page }) => {
            await getEntryButton(page, 'Edit', 'Portal').click();
            await getRemoveGroupButton(page, 1).click();

            await expect(getConfirmationDialog(page)).toHaveAccessibleName('Delete group');
            await expect(getConfirmationDialog(page)).toContainText('Are you sure you want to delete Peer Review group?');

            await getConfirmationButton(page, 'No').click();

            await expect(getConfirmationDialog(page)).toBeHidden();
            await expect(getGroupNameInput(page, 1)).toHaveValue('Peer Review');

            await getRemoveGroupButton(page, 1).click();
            await getConfirmationButton(page, 'Yes').click();

            await expect(getGroupNameInput(page, 1)).toBeHidden();

            const editResponsePromise = waitForApiResponse(page, HttpRequestMethod.PUT, EDITED_GAME_PATH);

            await getGameFormButton(page, 'Edit game').click();

            const editResponse = await editResponsePromise;

            expect(editResponse.ok()).toBe(true);
            await expect(getSnackbar(page, 'Successfully saved game')).toBeVisible();
            await expect(getGameLines(page)).toHaveText(['ː100ftː Portal ːshortː']);

            await test.step('keeps the group removed after reload', async () => {
                await reloadMainPage(page);

                await expect(getGameLines(page)).toHaveText(['ː100ftː Portal ːshortː']);
            });
        });

        test('should not allow renaming the game to the name of another game', async ({ page, request }) => {
            await addGame(request, { name: 'Portal 2', categories: [], hasNewAchievements: false, groups: [] });
            await reloadMainPage(page);
            await getEditModeButton(page).click();

            await getEntryButton(page, 'Edit', 'Portal').click();
            await getGameNameInput(page).fill('Portal 2');

            const editResponsePromise = waitForApiResponse(page, HttpRequestMethod.PUT, EDITED_GAME_PATH);

            await getGameFormButton(page, 'Edit game').click();

            const editResponse = await editResponsePromise;

            expect(editResponse.status()).toBe(409);
            await expect(getSnackbar(page, 'An error has occurred while saving game')).toBeVisible();
            await expect(getGameNameInput(page)).toHaveValue('Portal 2');
            await expect(getGameFormButton(page, 'Edit game')).toBeVisible();
            await expect(getGameLines(page)).toHaveText(['ː100ftː Portal (+ 1 group) ːshortː', 'ː100ftː Portal 2']);
        });

        test('should leave editing without saving the changes', async ({ page }) => {
            await getEntryButton(page, 'Edit', 'Portal').click();
            await getGameNameInput(page).fill('Portal 2');
            await getGameFormButton(page, 'Cancel editing').click();

            await expect(getGameNameInput(page)).toHaveValue('');
            await expect(getGameFormButton(page, 'Add game')).toBeVisible();
            await expect(getGameFormButton(page, 'Cancel editing')).toBeHidden();
            await expect(getGameLines(page)).toHaveText(['ː100ftː Portal (+ 1 group) ːshortː']);
        });

        test('should delete the game only after confirmation', async ({ page }) => {
            await getEntryButton(page, 'Delete', 'Portal').click();

            await expect(getConfirmationDialog(page)).toHaveAccessibleName('Delete game');
            await expect(getConfirmationDialog(page)).toContainText('Are you sure you want to delete Portal game?');

            await getConfirmationButton(page, 'No').click();

            await expect(getConfirmationDialog(page)).toBeHidden();
            await expect(getGameLines(page)).toHaveText(['ː100ftː Portal (+ 1 group) ːshortː']);

            await getEntryButton(page, 'Delete', 'Portal').click();

            const deleteResponsePromise = waitForApiResponse(page, HttpRequestMethod.DELETE, EDITED_GAME_PATH);

            await getConfirmationButton(page, 'Yes').click();

            const deleteResponse = await deleteResponsePromise;

            expect(deleteResponse.ok()).toBe(true);
            await expect(getSnackbar(page, 'Successfully deleted game')).toBeVisible();
            await expect(getGameLines(page)).toHaveCount(0);
            await expect(getEditModeButton(page)).toBeFocused();

            await test.step('keeps the game deleted after reload', async () => {
                await reloadMainPage(page);

                await expect(getGameLines(page)).toHaveCount(0);
                await expect(getCategoryLines(page).filter({ hasText: SHORT_CATEGORY.description ?? '' })).toHaveText('ːshortː Short games (0) (not copied)');
            });
        });

        test('should delete a group of the game only after confirmation', async ({ page }) => {
            await getEntryButton(page, 'Delete', 'Portal - Peer Review').click();

            await expect(getConfirmationDialog(page)).toHaveAccessibleName('Delete group');
            await expect(getConfirmationDialog(page)).toContainText('Are you sure you want to delete Portal - Peer Review group?');

            const deleteResponsePromise = waitForApiResponse(page, HttpRequestMethod.DELETE, /^game\/\d+\/group\/\d+$/);

            await getConfirmationButton(page, 'Yes').click();

            const deleteResponse = await deleteResponsePromise;

            expect(deleteResponse.ok()).toBe(true);
            await expect(getSnackbar(page, 'Successfully deleted group')).toBeVisible();
            await expect(getGameLines(page)).toHaveText(['ː100ftː Portal ːshortː']);

            await test.step('keeps the group deleted after reload', async () => {
                await reloadMainPage(page);

                await expect(getGameLines(page)).toHaveText(['ː100ftː Portal ːshortː']);
            });
        });
    });
});

import { expect, test } from '../fixtures/test.fixtures';
import { CategoryKind } from '../../src/app/enums/category-kind.enum';
import { ADULT_CATEGORY, EASY_CATEGORY, LONG_CATEGORY, LOVED_CATEGORY, MULTIPLAYER_CATEGORY, ONE_HUNDRED_PERCENT_ICON, SHORT_CATEGORY } from '../constants/test-data.constants';
import type { Category } from '../../src/app/interfaces/category.interface';
import { addGame, deleteCategories, deleteGames, saveCategories, setOneHundredPercentIcon } from '../helpers/api.helpers';
import {
    addCategories,
    expandCategories,
    expectCategoryNames,
    getAddCategoryBelowButton,
    getCategoryDescriptionInput,
    getCategoryIconNameInput,
    getCategoryNameInput,
    getHideGamesCheckbox,
    getKindGroup,
    getMoveCategoryHandle,
    getOneHundredPercentIconInput,
    getRemoveCategoryButton,
    getSaveCategoriesButton,
    getSaveOneHundredPercentButton,
    saveCategoriesForm,
    saveOneHundredPercentForm,
} from '../helpers/categories.helpers';
import { getCategoryLines, getDescriptionRegion, getGameLines } from '../helpers/description.helpers';
import { getDifficultySelect, getGameFormRegion, getLengthSelect, getMainCategoryCheckbox, selectOption } from '../helpers/game-form.helpers';
import { getConfirmationButton, getConfirmationDialog, getInfobar, getSnackbar, mockEmptyOneHundredPercentIcon, openMainPage, reloadMainPage } from '../helpers/main-page.helpers';

test.describe('Categories', () => {
    test.describe('when the 100% icon is not set', () => {
        const iconName = 'ːtrophyː';

        test.afterEach(async ({ request }) => {
            await setOneHundredPercentIcon(request, ONE_HUNDRED_PERCENT_ICON);
        });

        test('should unlock the game form and the description after setting the 100% icon', async ({ page }) => {
            await mockEmptyOneHundredPercentIcon(page);
            await openMainPage(page);
            await expect(getInfobar(page)).toBeVisible();

            await expandCategories(page);
            await expect(getSaveOneHundredPercentButton(page)).toBeDisabled();

            await getOneHundredPercentIconInput(page).fill(iconName);
            const saveResponse = await saveOneHundredPercentForm(page);

            expect(saveResponse.ok()).toBe(true);

            await expect(getSnackbar(page, 'Successfully saved 100% category')).toBeVisible();
            await expect(getInfobar(page)).toBeHidden();
            await expect(getGameFormRegion(page)).toBeVisible();
            await expect(getDescriptionRegion(page)).toBeVisible();

            await test.step('keeps the icon after reload', async () => {
                await reloadMainPage(page);
                await expandCategories(page);

                await expect(getOneHundredPercentIconInput(page)).toHaveValue(iconName);
            });
        });
    });

    test.describe('when the 100% icon is set', () => {
        test.beforeEach(async ({ page }) => {
            await openMainPage(page);
            await expandCategories(page);
        });

        test.afterEach(async ({ request }) => {
            await deleteCategories(request, [CategoryKind.MAIN, CategoryKind.LENGTH, CategoryKind.DIFFICULTY]);
        });

        test('should save categories of every kind and offer them in the game form', async ({ page }) => {
            await addCategories(page, CategoryKind.MAIN, [LOVED_CATEGORY, ADULT_CATEGORY]);
            const mainSaveResponse = await saveCategoriesForm(page, CategoryKind.MAIN);

            expect(mainSaveResponse.ok()).toBe(true);
            await expect(getSnackbar(page, 'Successfully saved main categories')).toBeVisible();

            await addCategories(page, CategoryKind.LENGTH, [SHORT_CATEGORY]);
            const lengthSaveResponse = await saveCategoriesForm(page, CategoryKind.LENGTH);

            expect(lengthSaveResponse.ok()).toBe(true);
            await expect(getSnackbar(page, 'Successfully saved length categories')).toBeVisible();

            await addCategories(page, CategoryKind.DIFFICULTY, [EASY_CATEGORY]);
            const difficultySaveResponse = await saveCategoriesForm(page, CategoryKind.DIFFICULTY);

            expect(difficultySaveResponse.ok()).toBe(true);
            await expect(getSnackbar(page, 'Successfully saved difficulty categories')).toBeVisible();

            await test.step('keeps the categories after reload', async () => {
                await reloadMainPage(page);
                await expandCategories(page);

                await expectCategoryNames(page, CategoryKind.MAIN, [LOVED_CATEGORY.name, ADULT_CATEGORY.name]);
                await expect(getCategoryDescriptionInput(page, CategoryKind.MAIN, 1)).toHaveValue(LOVED_CATEGORY.description ?? '');
                await expect(getCategoryIconNameInput(page, CategoryKind.MAIN, 1)).toHaveValue(LOVED_CATEGORY.iconName);
                await expect(getHideGamesCheckbox(page, CategoryKind.MAIN, 1)).not.toBeChecked();
                await expect(getHideGamesCheckbox(page, CategoryKind.MAIN, 2)).toBeChecked();
                await expectCategoryNames(page, CategoryKind.LENGTH, [SHORT_CATEGORY.name]);
                await expectCategoryNames(page, CategoryKind.DIFFICULTY, [EASY_CATEGORY.name]);
            });

            await test.step('offers the categories in the game form', async () => {
                await expect(getMainCategoryCheckbox(page, LOVED_CATEGORY.name)).toBeVisible();
                await expect(getMainCategoryCheckbox(page, ADULT_CATEGORY.name)).toBeVisible();

                await selectOption(page, getLengthSelect(page), SHORT_CATEGORY.name);
                await expect(getLengthSelect(page)).toHaveText(SHORT_CATEGORY.name);

                await selectOption(page, getDifficultySelect(page), EASY_CATEGORY.name);
                await expect(getDifficultySelect(page)).toHaveText(EASY_CATEGORY.name);
            });
        });

        test('should not allow saving categories with the same name', async ({ page }) => {
            await addCategories(page, CategoryKind.MAIN, [LOVED_CATEGORY, { ...MULTIPLAYER_CATEGORY, name: ` ${LOVED_CATEGORY.name} ` }]);

            await expect(getKindGroup(page, CategoryKind.MAIN).getByText('Category name has to be unique')).toHaveCount(2);
            await expect(getSaveCategoriesButton(page, CategoryKind.MAIN)).toBeDisabled();

            await getCategoryNameInput(page, CategoryKind.MAIN, 2).fill(MULTIPLAYER_CATEGORY.name);

            await expect(getKindGroup(page, CategoryKind.MAIN).getByText('Category name has to be unique')).toHaveCount(0);
            await expect(getSaveCategoriesButton(page, CategoryKind.MAIN)).toBeEnabled();
        });

        test('should require every field of a category', async ({ page }) => {
            await getKindGroup(page, CategoryKind.LENGTH).getByRole('button', { name: 'Add category', exact: true }).click();
            await getCategoryNameInput(page, CategoryKind.LENGTH, 1).fill('   ');
            await getCategoryDescriptionInput(page, CategoryKind.LENGTH, 1).focus();
            await getCategoryIconNameInput(page, CategoryKind.LENGTH, 1).focus();
            await getCategoryNameInput(page, CategoryKind.LENGTH, 1).focus();

            await expect(getKindGroup(page, CategoryKind.LENGTH).getByText("Category name can't contain only whitespaces")).toBeVisible();
            await expect(getKindGroup(page, CategoryKind.LENGTH).getByText('Category description is required')).toBeVisible();
            await expect(getKindGroup(page, CategoryKind.LENGTH).getByText('Icon name is required')).toBeVisible();
            await expect(getSaveCategoriesButton(page, CategoryKind.LENGTH)).toBeDisabled();
        });
    });

    test.describe('when categories are saved', () => {
        let lengthCategories: Category[];

        test.beforeEach(async ({ page, request }) => {
            await saveCategories(request, CategoryKind.MAIN, [LOVED_CATEGORY, ADULT_CATEGORY, MULTIPLAYER_CATEGORY]);
            lengthCategories = await saveCategories(request, CategoryKind.LENGTH, [SHORT_CATEGORY, LONG_CATEGORY]);
            await openMainPage(page);
            await expandCategories(page);
        });

        test.afterEach(async ({ request }) => {
            await deleteGames(request, ['Portal']);
            await deleteCategories(request, [CategoryKind.MAIN, CategoryKind.LENGTH]);
        });

        test('should reorder categories with the keyboard', async ({ page }) => {
            await expect(getSaveCategoriesButton(page, CategoryKind.MAIN)).toBeDisabled();

            await getMoveCategoryHandle(page, CategoryKind.MAIN, 1).press('ArrowDown');

            await expectCategoryNames(page, CategoryKind.MAIN, [ADULT_CATEGORY.name, LOVED_CATEGORY.name, MULTIPLAYER_CATEGORY.name]);

            const saveResponse = await saveCategoriesForm(page, CategoryKind.MAIN);

            expect(saveResponse.ok()).toBe(true);
            await expect(getSnackbar(page, 'Successfully saved main categories')).toBeVisible();

            await test.step('keeps the order after reload', async () => {
                await reloadMainPage(page);
                await expandCategories(page);

                await expectCategoryNames(page, CategoryKind.MAIN, [ADULT_CATEGORY.name, LOVED_CATEGORY.name, MULTIPLAYER_CATEGORY.name]);
                await expect(getCategoryLines(page).first()).toContainText(ADULT_CATEGORY.description ?? '');
            });
        });

        test('should delete a saved category only after confirmation', async ({ page }) => {
            await getRemoveCategoryButton(page, CategoryKind.LENGTH, 1).click();

            await expect(getConfirmationDialog(page)).toHaveAccessibleName('Delete category');
            await expect(getConfirmationDialog(page)).toContainText(`Are you sure you want to delete ${SHORT_CATEGORY.name} category?`);

            await getConfirmationButton(page, 'No').click();

            await expect(getConfirmationDialog(page)).toBeHidden();
            await expectCategoryNames(page, CategoryKind.LENGTH, [SHORT_CATEGORY.name, LONG_CATEGORY.name]);

            await getRemoveCategoryButton(page, CategoryKind.LENGTH, 1).click();
            await getConfirmationButton(page, 'Yes').click();

            await expectCategoryNames(page, CategoryKind.LENGTH, [LONG_CATEGORY.name]);

            const saveResponse = await saveCategoriesForm(page, CategoryKind.LENGTH);

            expect(saveResponse.ok()).toBe(true);
            await expect(getSnackbar(page, 'Successfully saved length categories')).toBeVisible();

            await test.step('keeps the category deleted after reload', async () => {
                await reloadMainPage(page);
                await expandCategories(page);

                await expectCategoryNames(page, CategoryKind.LENGTH, [LONG_CATEGORY.name]);
            });
        });

        test('should unassign a deleted category from games', async ({ page, request }) => {
            await addGame(request, { name: 'Portal', categories: [lengthCategories[0].id], hasNewAchievements: false, groups: [] });
            await reloadMainPage(page);
            await expandCategories(page);

            await expect(getGameLines(page)).toHaveText(['ː100ftː Portal ːshortː']);

            await getRemoveCategoryButton(page, CategoryKind.LENGTH, 1).click();
            await getConfirmationButton(page, 'Yes').click();

            const saveResponse = await saveCategoriesForm(page, CategoryKind.LENGTH);

            expect(saveResponse.ok()).toBe(true);
            await expect(getSnackbar(page, 'Successfully saved length categories')).toBeVisible();
            await expect(getGameLines(page)).toHaveText(['ː100ftː Portal']);
            await expect(getCategoryLines(page).filter({ hasText: SHORT_CATEGORY.description ?? '' })).toHaveCount(0);

            await test.step('keeps the game without the category after reload', async () => {
                await reloadMainPage(page);

                await expect(getGameLines(page)).toHaveText(['ː100ftː Portal']);
            });
        });

        test('should remove a category which is not saved yet without confirmation', async ({ page }) => {
            await getAddCategoryBelowButton(page, CategoryKind.LENGTH, 2).click();
            await getRemoveCategoryButton(page, CategoryKind.LENGTH, 3).click();

            await expect(getConfirmationDialog(page)).toBeHidden();
            await expectCategoryNames(page, CategoryKind.LENGTH, [SHORT_CATEGORY.name, LONG_CATEGORY.name]);
            await expect(getSaveCategoriesButton(page, CategoryKind.LENGTH)).toBeDisabled();
        });
    });
});

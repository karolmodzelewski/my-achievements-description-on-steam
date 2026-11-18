import { expect, test } from '../fixtures/test.fixtures';
import { getCategoriesRegion } from '../helpers/categories.helpers';
import { getDescriptionRegion } from '../helpers/description.helpers';
import { getGameFormRegion } from '../helpers/game-form.helpers';
import { getInfobar, mockEmptyOneHundredPercentIcon, openMainPage } from '../helpers/main-page.helpers';

test.describe('Main page', () => {
    test('should ask to set the 100% icon before showing the game form and the description', async ({ page }) => {
        await mockEmptyOneHundredPercentIcon(page);
        await openMainPage(page);

        await expect(getInfobar(page)).toBeVisible();
        await expect(getGameFormRegion(page)).toBeHidden();
        await expect(getDescriptionRegion(page)).toBeHidden();
    });

    test('should show an error when the data can not be loaded', async ({ page }) => {
        await page.route('**/api/description', (route) => route.abort());

        await page.goto('/');

        await expect(page.getByRole('alert')).toHaveText('Something went wrong. Try again.');
        await expect(getCategoriesRegion(page)).toBeHidden();
    });
});

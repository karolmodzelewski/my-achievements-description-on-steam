import { expect, test } from '../fixtures/test.fixtures';
import { getLanguageButton, openMainPage } from '../helpers/main-page.helpers';

test.describe('Language', () => {
    test.beforeEach(async ({ page }) => {
        await openMainPage(page);
    });

    test('should show the application in English by default', async ({ page }) => {
        await expect(getLanguageButton(page, 'English')).toHaveAttribute('aria-pressed', 'true');
        await expect(getLanguageButton(page, 'Polski')).toHaveAttribute('aria-pressed', 'false');
        await expect(page.getByRole('heading', { name: 'Manage categories' })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Manage game' })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Description', exact: true })).toBeVisible();
    });

    test('should switch the application to Polish and remember it', async ({ page }) => {
        await getLanguageButton(page, 'Polski').click();

        await expect(getLanguageButton(page, 'Polski')).toHaveAttribute('aria-pressed', 'true');
        await expect(page.getByRole('group', { name: 'Język' })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Zarządzaj kategoriami' })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Zarządzaj grą' })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Opis', exact: true })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Dodaj grę' })).toBeVisible();
        await expect(page.getByText('0 / 8000 znaków')).toBeVisible();

        await test.step('keeps Polish after reload', async () => {
            await page.reload();

            await expect(page.getByRole('heading', { name: 'Zarządzaj grą' })).toBeVisible();
            await expect(getLanguageButton(page, 'Polski')).toHaveAttribute('aria-pressed', 'true');
        });

        await test.step('switches back to English', async () => {
            await getLanguageButton(page, 'English').click();

            await expect(page.getByRole('heading', { name: 'Manage game' })).toBeVisible();
            await expect(getLanguageButton(page, 'English')).toHaveAttribute('aria-pressed', 'true');
        });
    });
});

import type { Locator, Page } from '@playwright/test';

export const getDescriptionRegion = (page: Page): Locator => page.getByRole('region', { name: 'Description', exact: true });

export const getCharactersCounter = (page: Page): Locator => getDescriptionRegion(page).getByTestId('charactersCounter');

export const getEditModeButton = (page: Page): Locator => getDescriptionRegion(page).getByRole('button', { name: 'Edit mode' });

export const getCopyDescriptionButton = (page: Page): Locator => getDescriptionRegion(page).getByRole('button', { name: 'Copy description' });

export const getCategoryLines = (page: Page): Locator => getDescriptionRegion(page).getByTestId('categoryLine');

export const getGameLines = (page: Page): Locator => getDescriptionRegion(page).getByTestId('gameLine');

export const getCutOffTexts = (page: Page): Locator => getDescriptionRegion(page).getByTestId('cutOffText');

export const getEntryButton = (page: Page, action: 'Edit' | 'Delete', entryName: string): Locator => getDescriptionRegion(page).getByRole('button', { name: `${action} ${entryName}`, exact: true });

// Returns the text copied by the action, as reading the clipboard is supported only by Chromium.
// The listener is registered before the action, and the promise is wrapped in an object so registering it doesn't wait for the copy
export const getCopiedText = async (page: Page, copy: () => Promise<void>): Promise<string> => {
    const copyListener = await page.evaluateHandle(() => ({
        copiedText: new Promise<string>((resolve) => {
            document.addEventListener('copy', ({ target }) => resolve(target instanceof HTMLTextAreaElement ? target.value : (document.getSelection()?.toString() ?? '')), { once: true });
        }),
    }));

    await copy();

    return copyListener.evaluate(async ({ copiedText }) => copiedText);
};

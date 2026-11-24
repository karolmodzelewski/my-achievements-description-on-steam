import type { FileChooser, Locator, Page } from '@playwright/test';

import type { HttpRequestMethod } from '../../src/app/enums/http-request-method.enum';
import en from '../../src/app/i18n/en.json';
import type { ErrorResponseBody } from '../../src/app/interfaces/error-response-body.interface';
import type { Wallpaper } from '../../src/app/interfaces/wallpaper.interface';
import { WALLPAPER_PNG } from '../constants/test-data.constants';

export const getWallpaperRegion = (page: Page): Locator => page.getByRole('region', { name: en.manageWallpaper.heading });

export const expandWallpaper = async (page: Page): Promise<void> => {
    await getWallpaperRegion(page).getByRole('button', { name: en.expandableSection.expand }).click();
};

export const getExcludedCategorySelect = (page: Page): Locator => getWallpaperRegion(page).getByRole('combobox', { name: en.manageWallpaper.categoryLabel });

export const getClearExcludedCategoryButton = (page: Page): Locator => getWallpaperRegion(page).getByRole('button', { name: en.manageWallpaper.clearCategoryAriaLabel });

export const getAutoGenerateCheckbox = (page: Page): Locator => getWallpaperRegion(page).getByRole('checkbox', { name: en.manageWallpaper.autoGenerate });

export const getDesktopUpdateCheckbox = (page: Page): Locator => getWallpaperRegion(page).getByRole('checkbox', { name: en.manageWallpaper.desktopUpdate });

export const getWallpaperButton = (page: Page, name: 'Choose XCF file' | 'Restore default wallpaper' | 'Generate' | 'Download'): Locator =>
    getWallpaperRegion(page).getByRole('button', { name, exact: true });

export const getPreviewImage = (page: Page, text: string): Locator => getWallpaperRegion(page).getByRole('img', { name: en.manageWallpaper.previewAlt.replace('{{ text }}', text) });

export const getPreviewCaption = (page: Page, text: string): Locator => getWallpaperRegion(page).getByText(en.manageWallpaper.previewCaption.replace('{{ text }}', text), { exact: true });

// The wallpaper of the real backend with some of its properties replaced, e.g. a generated one, as the e2e tests never run GIMP
export const mockWallpaper = async (page: Page, overrides: Partial<Wallpaper>, times?: number): Promise<void> => {
    await page.route(
        '**/api/wallpaper',
        async (route) => {
            const response = await route.fetch();
            const wallpaper = (await response.json()) as Wallpaper;

            await route.fulfill({ response, json: { ...wallpaper, ...overrides } });
        },
        { times }
    );
};

export const mockWallpaperPng = async (page: Page): Promise<void> => {
    await page.route('**/api/wallpaper/png', (route) => route.fulfill({ contentType: 'image/png', body: WALLPAPER_PNG }));
};

// Answers a request which would run GIMP on the real backend, or which it would reject only while generating
export const mockApiResponse = async (page: Page, method: HttpRequestMethod, path: string, status = 204, json?: ErrorResponseBody & { statusCode: number }): Promise<void> => {
    await page.route(`**/api/${path}`, async (route) => {
        const expectedMethod: string = method;

        if (route.request().method() !== expectedMethod) {
            await route.fallback();

            return;
        }

        await route.fulfill(json ? { status, json } : { status });
    });
};

// Keeps generating the wallpaper pending until the returned function is called
export const holdWallpaperGeneration = async (page: Page): Promise<() => void> => {
    let finishGeneration: () => void = () => undefined;

    const generationFinished = new Promise<void>((resolve) => {
        finishGeneration = resolve;
    });

    await page.route('**/api/wallpaper/generate', async (route) => {
        await generationFinished;
        await route.fulfill({ status: 204 });
    });

    return finishGeneration;
};

export const chooseWallpaperFile = async (page: Page, file: Parameters<FileChooser['setFiles']>[0]): Promise<void> => {
    const fileChooserPromise = page.waitForEvent('filechooser');

    await getWallpaperButton(page, 'Choose XCF file').click();

    const fileChooser = await fileChooserPromise;

    await fileChooser.setFiles(file);
};

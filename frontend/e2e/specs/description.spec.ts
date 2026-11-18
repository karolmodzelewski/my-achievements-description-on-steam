import { expect, test } from '../fixtures/test.fixtures';
import { CategoryKind } from '../../src/app/enums/category-kind.enum';
import { ADULT_CATEGORY, EASY_CATEGORY, LONG_CATEGORY, LOVED_CATEGORY, MULTIPLAYER_CATEGORY, SHORT_CATEGORY } from '../constants/test-data.constants';
import { addGame, deleteCategories, deleteGames, saveCategories } from '../helpers/api.helpers';
import { getCategoryLines, getCharactersCounter, getCopiedText, getCopyDescriptionButton, getCutOffTexts, getDescriptionRegion, getGameLines } from '../helpers/description.helpers';
import { getSnackbar, openMainPage } from '../helpers/main-page.helpers';

test.describe('Description', () => {
    test.describe('when games are added', () => {
        test.beforeEach(async ({ page, request }) => {
            const [loved, adult] = await saveCategories(request, CategoryKind.MAIN, [LOVED_CATEGORY, ADULT_CATEGORY, MULTIPLAYER_CATEGORY]);
            const [short] = await saveCategories(request, CategoryKind.LENGTH, [SHORT_CATEGORY, LONG_CATEGORY]);
            const [easy] = await saveCategories(request, CategoryKind.DIFFICULTY, [EASY_CATEGORY]);

            await addGame(request, { name: 'Portal 2', categories: [loved.id, short.id, easy.id], hasNewAchievements: false, groups: [{ name: 'Peer Review', hasNewAchievements: false }] });
            await addGame(request, {
                name: 'Celeste',
                categories: [short.id],
                hasNewAchievements: true,
                groups: [
                    { name: 'Farewell', hasNewAchievements: false },
                    { name: 'Core', hasNewAchievements: true },
                ],
            });
            await addGame(request, { name: 'Adult Thing', categories: [adult.id], hasNewAchievements: false, groups: [] });
            await openMainPage(page);
        });

        test.afterEach(async ({ request }) => {
            await deleteGames(request, ['Portal 2', 'Celeste', 'Adult Thing']);
            await deleteCategories(request, [CategoryKind.MAIN, CategoryKind.LENGTH, CategoryKind.DIFFICULTY]);
        });

        test('should show the amount of games in every category and mark empty categories as not copied', async ({ page }) => {
            await expect(getCategoryLines(page)).toHaveText([
                'ːheartː Games I loved (1)',
                'ːadultː Adult games (1)',
                'ːmultiplayerː Multiplayer games (0) (not copied)',
                'ːshortː Short games (2)',
                'ːlongː Long games (0) (not copied)',
                'ːeasyː Easy games (1)',
            ]);
        });

        test('should split games alphabetically into completed ones and ones with new achievements', async ({ page }) => {
            await expect(getDescriptionRegion(page).getByText('COMPLETED (4) - GAMES (2) & GROUPS (2):')).toBeVisible();
            await expect(getDescriptionRegion(page).getByText('NEW ACHIEVEMENTS (2) - GAMES (1) & GROUPS (1):')).toBeVisible();
            await expect(getGameLines(page)).toHaveText([
                'ː100ftː Adult Thing ːadultː (not copied)',
                'ː100ftː Celeste - Farewell',
                'ː100ftː Portal 2 (+ 1 group) ːheartːːshortːːeasyː',
                'ː100ftː Celeste ːshortː',
                'ː100ftː Celeste - Core',
            ]);
            await expect(getDescriptionRegion(page).getByText('- Peer Review (not copied)')).toBeVisible();
            await expect(getDescriptionRegion(page).getByText('... and (1) ːadultː games')).toBeVisible();
        });

        test('should copy the description without the information which is not copied', async ({ page }) => {
            const separator = '_______________________________';
            const copiedText = await getCopiedText(page, async () => getCopyDescriptionButton(page).click());

            await expect(getSnackbar(page, 'Description copied to clipboard')).toBeVisible();
            expect(copiedText).toBe(
                [
                    'ːheartː Games I loved (1)',
                    'ːadultː Adult games (1)',
                    '',
                    'ːshortː Short games (2)',
                    '',
                    'ːeasyː Easy games (1)',
                    '',
                    separator,
                    '',
                    'COMPLETED (4) - GAMES (2) & GROUPS (2):',
                    separator,
                    '',
                    'ː100ftː Celeste - Farewell',
                    'ː100ftː Portal 2 (+ 1 group) ːheartːːshortːːeasyː',
                    '',
                    '... and (1) ːadultː games',
                    '',
                    separator,
                    '',
                    'NEW ACHIEVEMENTS (2) - GAMES (1) & GROUPS (1):',
                    separator,
                    '',
                    'ː100ftː Celeste ːshortː',
                    'ː100ftː Celeste - Core',
                ].join('\n')
            );
        });
    });

    test.describe('when the description exceeds the Steam limit', () => {
        // Every game takes about 220 of 8000 characters, so the last games don't fit in the limit
        const gamesNames = Array.from({ length: 40 }, (_, index) => `Game ${String(index + 1).padStart(2, '0')} ${'a'.repeat(200)}`);

        test.beforeEach(async ({ page, request }) => {
            for (const name of gamesNames) {
                await addGame(request, { name, categories: [], hasNewAchievements: false, groups: [] });
            }

            await openMainPage(page);
        });

        test.afterEach(async ({ request }) => {
            await deleteGames(request, gamesNames);
        });

        test('should mark the text which does not fit in the Steam limit', async ({ page }) => {
            await expect(getCharactersCounter(page)).toHaveText('8898 / 8000 characters');
            await expect(getCharactersCounter(page)).toHaveClass(/limit-reached/);
            await expect(getGameLines(page).first()).not.toContainText('(exceeds Steam limit)');
            await expect(getGameLines(page).last()).toContainText('(exceeds Steam limit)');
            await expect(getCutOffTexts(page).last()).toBeVisible();
        });
    });

    test.describe('when no game is added', () => {
        test.beforeEach(async ({ page }) => {
            await openMainPage(page);
        });

        test('should show an empty description', async ({ page }) => {
            await expect(getCharactersCounter(page)).toHaveText('0 / 8000 characters');
            await expect(getCharactersCounter(page)).not.toHaveClass(/limit-reached/);
            await expect(getGameLines(page)).toHaveCount(0);
        });
    });
});

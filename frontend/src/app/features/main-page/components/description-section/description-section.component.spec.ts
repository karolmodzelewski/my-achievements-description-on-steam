import { provideHttpClient } from '@angular/common/http';
import type { Clipboard } from '@angular/cdk/clipboard';
import type { DebugElement } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import type { Mock } from 'vitest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TranslocoService } from '@jsverse/transloco';

import { DescriptionSectionComponent } from './description-section.component';
import { ConfirmationService } from '../../../../components/confirmation/confirmation.service';
import { SnackbarType } from '../../../../components/snackbar/enums/snackbar-type.enum';
import { SnackbarService } from '../../../../components/snackbar/snackbar.service';
import { CategoryKind } from '../../../../enums/category-kind.enum';
import type { DescriptionResponseBody } from '../../../../interfaces/description-response-body.interface';
import { buildDescriptionCategory, buildGameCategory } from '../../../../../testing/builders/category.builders';
import { buildDescriptionEntry, buildDescriptionResponseBody, buildDescriptionSection, buildGame } from '../../../../../testing/builders/description.builders';
import { clickByTestId, emitByTestId, getElementByTestId, getTextByTestId, getTextsByTestId, queryByTestId } from '../../../../../testing/helpers/dom.helpers';
import { spyOnClipboard, spyOnSnackbarService } from '../../../../../testing/helpers/service-spy.helpers';
import { EditGameService } from '../../services/edit-game.service';
import { GameApiService } from '../../services/game-api.service';
import { WallpaperApiService } from '../../services/wallpaper-api.service';
import { WallpaperStatusService } from '../../services/wallpaper-status.service';
import { getSteamTextSize, STEAM_DESCRIPTION_MAX_SIZE } from '../../utils/steam-size.util';

describe('DescriptionSectionComponent', () => {
    let component: DescriptionSectionComponent;
    let fixture: ComponentFixture<DescriptionSectionComponent>;
    let debugElement: DebugElement;
    let translocoService: TranslocoService;
    let snackbarService: SnackbarService;
    let clipboard: Clipboard;
    let reloadDescriptionMock: Mock<() => void>;

    const separator = '_______________________________';
    const hidingCategory = buildDescriptionCategory({ id: 3, name: 'Adult', description: 'Adult game', iconName: ':adult:', shouldHideGames: true, amount: 1 });
    const descriptionData = buildDescriptionResponseBody({
        categories: [
            buildDescriptionCategory({ id: 1, description: 'Loved game', iconName: ':heart:', amount: 1 }),
            buildDescriptionCategory({ id: 2, description: 'Empty category', iconName: ':empty:', amount: 0 }),
            hidingCategory,
            buildDescriptionCategory({ id: 4, kind: CategoryKind.LENGTH, description: 'Short game', iconName: ':short:', amount: 0 }),
            buildDescriptionCategory({ id: 5, kind: CategoryKind.LENGTH, description: 'Long game', iconName: ':long:', amount: 1 }),
        ],
        completed: buildDescriptionSection({
            amount: 2,
            gamesAmount: 2,
            entries: [
                buildDescriptionEntry({ game: buildGame({ id: 1, name: 'Game', categories: [buildGameCategory({ id: 1, iconName: ':heart:' }), buildGameCategory({ id: 5, iconName: ':long:' })] }) }),
                buildDescriptionEntry({ game: buildGame({ id: 2, name: 'Secret game', categories: [buildGameCategory({ id: 3, iconName: ':adult:', shouldHideGames: true })] }) }),
            ],
        }),
    });

    const setDescriptionData = async (data: DescriptionResponseBody): Promise<void> => {
        fixture.componentRef.setInput('descriptionData', data);
        await fixture.whenStable();
    };

    const copyDescription = async (): Promise<string | undefined> => {
        await clickByTestId(fixture, 'copyDescriptionButton');

        return vi.mocked(clipboard.copy).mock.lastCall?.[0];
    };

    beforeEach(async () => {
        TestBed.configureTestingModule({
            imports: [DescriptionSectionComponent],
            providers: [provideHttpClient(), WallpaperApiService, WallpaperStatusService, EditGameService, GameApiService, SnackbarService, ConfirmationService],
        });

        reloadDescriptionMock = vi.fn();
        snackbarService = spyOnSnackbarService();
        clipboard = spyOnClipboard();
        translocoService = TestBed.inject(TranslocoService);
        fixture = TestBed.createComponent(DescriptionSectionComponent);
        component = fixture.componentInstance;
        debugElement = fixture.debugElement;

        component.reloadDescription.subscribe(reloadDescriptionMock);

        await setDescriptionData(descriptionData);
    });

    it('should create a component', () => {
        // Assert
        expect(component).toBeTruthy();
    });

    it('should copy the description without hidden information', async () => {
        // Arrange
        const expectedDescription = [
            ':heart: Loved game (1)',
            ':adult: Adult game (1)',
            '',
            ':long: Long game (1)',
            '',
            separator,
            '',
            'COMPLETED (2) - GAMES (2):',
            separator,
            '',
            ':100: Game :heart::long:',
            '',
            '... and (1) :adult: games',
        ].join('\n');

        // Act
        const copiedDescription = await copyDescription();

        // Assert
        expect(copiedDescription).toBe(expectedDescription);
    });

    it('should copy the description starting with a section when no category is listed', async () => {
        // Arrange
        await setDescriptionData(buildDescriptionResponseBody({ newAchievements: buildDescriptionSection({ amount: 1, groupsAmount: 1, entries: [buildDescriptionEntry()] }) }));

        // Act
        const copiedDescription = await copyDescription();

        // Assert
        expect(copiedDescription).toBe([separator, '', 'NEW ACHIEVEMENTS (1) - GROUPS (1):', separator, '', ':100: Game'].join('\n'));
    });

    it('should copy an empty description when there is nothing to list', async () => {
        // Arrange
        await setDescriptionData(buildDescriptionResponseBody({ categories: [buildDescriptionCategory({ amount: 0 })] }));

        // Act
        const copiedDescription = await copyDescription();

        // Assert
        expect(copiedDescription).toBe('');
    });

    it('should inform about the copied description', async () => {
        // Act
        await copyDescription();

        // Assert
        expect(snackbarService.openSnackbar).toHaveBeenCalledWith(translocoService.translate('descriptionSection.copySuccess'), SnackbarType.SUCCESS);
    });

    it('should inform about an error while copying the description', async () => {
        // Arrange
        vi.mocked(clipboard.copy).mockReturnValue(false);

        // Act
        await copyDescription();

        // Assert
        expect(snackbarService.openSnackbar).toHaveBeenCalledWith(translocoService.translate('descriptionSection.copyError'), SnackbarType.ERROR);
    });

    it('should present the Steam size of the copied description', async () => {
        // Act
        const copiedDescription = await copyDescription();

        // Assert
        expect(getTextByTestId(debugElement, 'charactersCounter')).toBe(
            translocoService.translate('descriptionSection.charactersCounter', { size: getSteamTextSize(copiedDescription ?? ''), max: STEAM_DESCRIPTION_MAX_SIZE })
        );
    });

    it('should present the text exceeding the Steam limit as cut off', async () => {
        // Arrange
        const longGameLine = `:100: ${'x'.repeat(STEAM_DESCRIPTION_MAX_SIZE)}`;

        await setDescriptionData(
            buildDescriptionResponseBody({
                completed: buildDescriptionSection({
                    amount: 2,
                    gamesAmount: 2,
                    entries: [
                        buildDescriptionEntry({ game: buildGame({ id: 1, name: 'x'.repeat(STEAM_DESCRIPTION_MAX_SIZE) }) }),
                        buildDescriptionEntry({ game: buildGame({ id: 2, name: 'Short' }) }),
                    ],
                }),
            })
        );

        // Act
        const copiedDescription = (await copyDescription()) ?? '';

        // Assert
        const [longGameCutOffText, shortGameCutOffText] = getTextsByTestId(debugElement, 'cutOffText');
        const keptDescription = copiedDescription.slice(0, copiedDescription.indexOf(longGameLine) + longGameLine.length - longGameCutOffText.length);

        expect(longGameLine.endsWith(longGameCutOffText)).toBe(true);
        expect(getSteamTextSize(keptDescription)).toBe(STEAM_DESCRIPTION_MAX_SIZE);
        expect(shortGameCutOffText).toBe(':100: Short');
    });

    it('should not present any text as cut off within the Steam limit', () => {
        // Assert
        expect(queryByTestId(debugElement, 'cutOffText')).toBeNull();
    });

    it('should switch the edition mode of games after clicking the edit mode button', async () => {
        // Act
        await clickByTestId(fixture, 'editModeButton');

        // Assert
        expect(getElementByTestId(debugElement, 'editModeButton').getAttribute('aria-pressed')).toBe('true');
        expect(queryByTestId(debugElement, 'gameEditButton')).not.toBeNull();
    });

    it('should switch the edition mode of games off after clicking the edit mode button again', async () => {
        // Arrange
        await clickByTestId(fixture, 'editModeButton');

        // Act
        await clickByTestId(fixture, 'editModeButton');

        // Assert
        expect(getElementByTestId(debugElement, 'editModeButton').getAttribute('aria-pressed')).toBe('false');
        expect(queryByTestId(debugElement, 'gameEditButton')).toBeNull();
    });

    it('should focus the edit mode button and reload the description after deleting an entry', async () => {
        // Act
        await emitByTestId(fixture, 'descriptionGame', 'reloadDescription');

        // Assert
        expect(document.activeElement).toBe(getElementByTestId(debugElement, 'editModeButton'));
        expect(reloadDescriptionMock).toHaveBeenCalledTimes(1);
    });
});

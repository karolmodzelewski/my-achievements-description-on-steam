import { provideHttpClient } from '@angular/common/http';
import type { ViewportScroller } from '@angular/common';
import type { DebugElement } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { MatCheckboxHarness } from '@angular/material/checkbox/testing';
import { MatSelectHarness } from '@angular/material/select/testing';

import { of } from 'rxjs';

import type { Mock } from 'vitest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TranslocoService } from '@jsverse/transloco';

import { AddGameFormComponent } from './add-game-form.component';
import { EditGameService } from '../../services/edit-game.service';
import { GameApiService } from '../../services/game-api.service';
import { WallpaperApiService } from '../../services/wallpaper-api.service';
import { WallpaperStatusService } from '../../services/wallpaper-status.service';
import { ConfirmationService } from '../../../../components/confirmation/confirmation.service';
import { SnackbarType } from '../../../../components/snackbar/enums/snackbar-type.enum';
import { SnackbarService } from '../../../../components/snackbar/snackbar.service';
import { CategoryKind } from '../../../../enums/category-kind.enum';
import { ErrorCode } from '../../../../enums/error-code.enum';
import type { AddGameRequestBody } from '../../../../interfaces/add-game-request-body.interface';
import { buildCategory, buildGameCategory } from '../../../../../testing/builders/category.builders';
import { buildGame, buildGameGroup } from '../../../../../testing/builders/description.builders';
import { clickByTestId, getElementByTestId, getInputValuesByTestId, isDisabledByTestId, queryByTestId, typeByTestId } from '../../../../../testing/helpers/dom.helpers';
import { getAllHarnessesByTestId, getHarnessByTestId } from '../../../../../testing/helpers/harness.helpers';
import { mockErrorResponse } from '../../../../../testing/mocks/error-response.mocks';
import { spyOnConfirmationService, spyOnGameApiService, spyOnSnackbarService, spyOnViewportScroller } from '../../../../../testing/helpers/service-spy.helpers';

describe('AddGameFormComponent', () => {
    let component: AddGameFormComponent;
    let fixture: ComponentFixture<AddGameFormComponent>;
    let debugElement: DebugElement;
    let gameApiService: GameApiService;
    let editGameService: EditGameService;
    let translocoService: TranslocoService;
    let snackbarService: SnackbarService;
    let confirmationService: ConfirmationService;
    let viewportScroller: ViewportScroller;
    let wallpaperStatusService: WallpaperStatusService;
    let reloadDescriptionMock: Mock<() => void>;

    const lovedCategory = buildCategory({ id: 7, name: 'Loved' });
    const badCategory = buildCategory({ id: 8, name: 'Bad' });
    const longCategory = buildCategory({ id: 1, kind: CategoryKind.LENGTH, name: 'Long' });
    const veryLongCategory = buildCategory({ id: 2, kind: CategoryKind.LENGTH, name: 'Very long' });
    const easyCategory = buildCategory({ id: 3, kind: CategoryKind.DIFFICULTY, name: 'Easy' });
    const editedGame = buildGame({
        id: 5,
        name: 'Edited game',
        hasNewAchievements: true,
        categories: [buildGameCategory({ id: 7 }), buildGameCategory({ id: 1, kind: CategoryKind.LENGTH })],
        groups: [buildGameGroup({ id: 9, name: 'DLC' })],
    });

    const getGameName = (): string => getElementByTestId<HTMLInputElement>(debugElement, 'gameNameInput').value;

    const getMainCategoriesCheckedStates = async (): Promise<boolean[]> => {
        const checkboxes = await getAllHarnessesByTestId(fixture, MatCheckboxHarness, 'mainCategoryCheckbox');

        return Promise.all(checkboxes.map(async (checkbox) => checkbox.isChecked()));
    };

    const selectOption = async (testId: string, optionText: string): Promise<void> => {
        const select = await getHarnessByTestId(fixture, MatSelectHarness, testId);

        await select.clickOptions({ text: optionText });
    };

    const getSelectedOption = async (testId: string): Promise<string> => (await getHarnessByTestId(fixture, MatSelectHarness, testId)).getValueText();

    const isSelectDisabled = async (testId: string): Promise<boolean> => (await getHarnessByTestId(fixture, MatSelectHarness, testId)).isDisabled();

    const checkCheckbox = async (testId: string, index = 0): Promise<void> => {
        const checkboxes = await getAllHarnessesByTestId(fixture, MatCheckboxHarness, testId);

        await checkboxes[index].check();
    };

    const isCheckboxChecked = async (testId: string): Promise<boolean> => (await getHarnessByTestId(fixture, MatCheckboxHarness, testId)).isChecked();

    const startEditing = async (): Promise<void> => {
        editGameService.startEditing(editedGame);
        await fixture.whenStable();
    };

    beforeEach(async () => {
        TestBed.configureTestingModule({
            imports: [AddGameFormComponent],
            providers: [provideHttpClient(), WallpaperApiService, WallpaperStatusService, EditGameService, GameApiService, SnackbarService, ConfirmationService],
        });

        reloadDescriptionMock = vi.fn();
        snackbarService = spyOnSnackbarService();
        viewportScroller = spyOnViewportScroller();
        gameApiService = spyOnGameApiService();
        confirmationService = spyOnConfirmationService();
        editGameService = TestBed.inject(EditGameService);
        translocoService = TestBed.inject(TranslocoService);
        wallpaperStatusService = TestBed.inject(WallpaperStatusService);
        fixture = TestBed.createComponent(AddGameFormComponent);
        component = fixture.componentInstance;
        debugElement = fixture.debugElement;

        component.reloadDescription.subscribe(reloadDescriptionMock);
        fixture.componentRef.setInput('mainCategories', [lovedCategory, badCategory]);
        fixture.componentRef.setInput('lengthCategories', [longCategory, veryLongCategory]);
        fixture.componentRef.setInput('difficultyCategories', [easyCategory]);

        await fixture.whenStable();
    });

    it('should create a component', () => {
        // Assert
        expect(component).toBeTruthy();
    });

    it('should not allow adding a game without name', () => {
        // Assert
        expect(isDisabledByTestId(debugElement, 'gameSubmitButton')).toBe(true);
        expect(queryByTestId(debugElement, 'cancelEditingButton')).toBeNull();
    });

    it('should not allow adding a game with a name containing only whitespaces', async () => {
        // Act
        await typeByTestId(fixture, 'gameNameInput', '   ');

        // Assert
        expect(isDisabledByTestId(debugElement, 'gameSubmitButton')).toBe(true);
    });

    it('should not allow adding a game with a group without name', async () => {
        // Arrange
        await typeByTestId(fixture, 'gameNameInput', 'Game');

        // Act
        await clickByTestId(fixture, 'addBaseGameGroupButton');

        // Assert
        expect(isDisabledByTestId(debugElement, 'gameSubmitButton')).toBe(true);
    });

    it('should not allow selecting categories of a kind without categories', async () => {
        // Arrange
        fixture.componentRef.setInput('lengthCategories', []);
        fixture.componentRef.setInput('difficultyCategories', []);

        // Act
        await fixture.whenStable();

        // Assert
        expect(await isSelectDisabled('lengthSelect')).toBe(true);
        expect(await isSelectDisabled('difficultySelect')).toBe(true);
    });

    it('should add the filled game, inform about it, reset the form and reload the description', async () => {
        // Arrange
        await typeByTestId(fixture, 'gameNameInput', ' Game ');
        await selectOption('lengthSelect', 'Very long');
        await selectOption('difficultySelect', 'Easy');
        await checkCheckbox('mainCategoryCheckbox', 1);
        await checkCheckbox('baseGameNewAchievementsCheckbox');
        await clickByTestId(fixture, 'addBaseGameGroupButton');
        await typeByTestId(fixture, 'groupNameInput', ' DLC ');
        await checkCheckbox('groupNewAchievementsCheckbox');

        // Act
        await clickByTestId(fixture, 'gameSubmitButton');

        // Assert
        expect(gameApiService.addGame).toHaveBeenCalledWith({
            name: 'Game',
            hasNewAchievements: true,
            groups: [{ name: 'DLC', hasNewAchievements: true }],
            categories: [8, 2, 3],
        } satisfies AddGameRequestBody);
        expect(snackbarService.openSnackbar).toHaveBeenCalledWith(translocoService.translate('addGameForm.saveSuccess'), SnackbarType.SUCCESS);
        expect(reloadDescriptionMock).toHaveBeenCalledTimes(1);
        expect(getGameName()).toBe('');
        expect(getInputValuesByTestId(debugElement, 'groupNameInput')).toEqual([]);
    });

    it('should inform about an empty name rejected while saving', async () => {
        // Arrange
        vi.mocked(gameApiService.addGame).mockReturnValue(mockErrorResponse({ message: 'Empty name', errorCode: ErrorCode.EMPTY_NAME }));
        await typeByTestId(fixture, 'gameNameInput', 'Game');

        // Act
        await clickByTestId(fixture, 'gameSubmitButton');

        // Assert
        expect(snackbarService.openSnackbar).toHaveBeenCalledWith(translocoService.translate('addGameForm.emptyName'), SnackbarType.ERROR);
        expect(reloadDescriptionMock).not.toHaveBeenCalled();
        expect(getGameName()).toBe('Game');
    });

    it('should inform about an error while saving', async () => {
        // Arrange
        vi.mocked(gameApiService.addGame).mockReturnValue(mockErrorResponse());
        await typeByTestId(fixture, 'gameNameInput', 'Game');

        // Act
        await clickByTestId(fixture, 'gameSubmitButton');

        // Assert
        expect(snackbarService.openSnackbar).toHaveBeenCalledWith(translocoService.translate('addGameForm.saveError'), SnackbarType.ERROR);
        expect(reloadDescriptionMock).not.toHaveBeenCalled();
    });

    it('should not allow saving the game while the wallpaper is generated', async () => {
        // Arrange
        await typeByTestId(fixture, 'gameNameInput', 'Game');
        wallpaperStatusService.setGeneratingInSection(true);

        // Act
        await fixture.whenStable();

        // Assert
        expect(isDisabledByTestId(debugElement, 'gameSubmitButton')).toBe(true);
    });

    it('should inform about the generated wallpaper instead of saving the game', async () => {
        // Arrange
        await typeByTestId(fixture, 'gameNameInput', 'Game');
        wallpaperStatusService.setGeneratingInSection(true);
        await fixture.whenStable();

        // Act
        await clickByTestId(fixture, 'gameSubmitButton');

        // Assert
        expect(gameApiService.addGame).not.toHaveBeenCalled();
        expect(snackbarService.openSnackbar).toHaveBeenCalledWith(translocoService.translate('common.wallpaperGenerating'), SnackbarType.ERROR);
    });

    it('should inform about the generated wallpaper rejecting the game while saving', async () => {
        // Arrange
        vi.mocked(gameApiService.addGame).mockReturnValue(mockErrorResponse({ message: 'The wallpaper is being generated', errorCode: ErrorCode.WALLPAPER_GENERATING }));
        await typeByTestId(fixture, 'gameNameInput', 'Game');

        // Act
        await clickByTestId(fixture, 'gameSubmitButton');

        // Assert
        expect(snackbarService.openSnackbar).toHaveBeenCalledWith(translocoService.translate('common.wallpaperGenerating'), SnackbarType.ERROR);
        expect(reloadDescriptionMock).not.toHaveBeenCalled();
        expect(getGameName()).toBe('Game');
    });

    it('should fill the form with the edited game', async () => {
        // Act
        await startEditing();

        // Assert
        expect(getGameName()).toBe('Edited game');
        expect(await getSelectedOption('lengthSelect')).toBe('Long');
        expect(await getSelectedOption('difficultySelect')).toBe('');
        expect(await getMainCategoriesCheckedStates()).toEqual([true, false]);
        expect(await isCheckboxChecked('baseGameNewAchievementsCheckbox')).toBe(true);
        expect(getInputValuesByTestId(debugElement, 'groupNameInput')).toEqual(['DLC']);
        expect(queryByTestId(debugElement, 'cancelEditingButton')).not.toBeNull();
    });

    it('should scroll to the form again when editing of the same game is started again', async () => {
        // Arrange
        await startEditing();

        // Act
        await startEditing();

        // Assert
        expect(viewportScroller.scrollToAnchor).toHaveBeenCalledTimes(2);
        expect(viewportScroller.scrollToAnchor).toHaveBeenCalledWith(component.headingId);
    });

    it('should save the edited game', async () => {
        // Arrange
        await startEditing();
        await typeByTestId(fixture, 'gameNameInput', 'Renamed game');

        // Act
        await clickByTestId(fixture, 'gameSubmitButton');

        // Assert
        expect(gameApiService.editGame).toHaveBeenCalledWith(5, {
            name: 'Renamed game',
            hasNewAchievements: true,
            groups: [{ name: 'DLC', hasNewAchievements: false }],
            categories: [7, 1],
        } satisfies AddGameRequestBody);
        expect(editGameService.editedGame()).toBeNull();
    });

    it('should stop editing and clear the form after clicking the cancel button', async () => {
        // Arrange
        await startEditing();

        // Act
        await clickByTestId(fixture, 'cancelEditingButton');

        // Assert
        expect(editGameService.editedGame()).toBeNull();
        expect(getGameName()).toBe('');
        expect(getInputValuesByTestId(debugElement, 'groupNameInput')).toEqual([]);
        expect(queryByTestId(debugElement, 'cancelEditingButton')).toBeNull();
    });

    it('should add a group after the group of the clicked add button', async () => {
        // Arrange
        await startEditing();

        // Act
        await clickByTestId(fixture, 'addGroupButton', 0);

        // Assert
        expect(getInputValuesByTestId(debugElement, 'groupNameInput')).toEqual(['DLC', '']);
    });

    it('should remove a not saved group without confirmation', async () => {
        // Arrange
        await clickByTestId(fixture, 'addBaseGameGroupButton');

        // Act
        await clickByTestId(fixture, 'removeGroupButton');

        // Assert
        expect(confirmationService.openConfirmation).not.toHaveBeenCalled();
        expect(getInputValuesByTestId(debugElement, 'groupNameInput')).toEqual([]);
    });

    it('should remove a saved group after confirmation', async () => {
        // Arrange
        await startEditing();

        // Act
        await clickByTestId(fixture, 'removeGroupButton');

        // Assert
        expect(confirmationService.openConfirmation).toHaveBeenCalledWith(expect.objectContaining({ title: translocoService.translate('confirmation.delete.group.title'), identifier: 'DLC' }));
        expect(getInputValuesByTestId(debugElement, 'groupNameInput')).toEqual([]);
    });

    it('should keep a saved group when its removal is not confirmed', async () => {
        // Arrange
        vi.mocked(confirmationService.openConfirmation).mockReturnValue(of(false));
        await startEditing();

        // Act
        await clickByTestId(fixture, 'removeGroupButton');

        // Assert
        expect(getInputValuesByTestId(debugElement, 'groupNameInput')).toEqual(['DLC']);
    });

    it('should keep the filled values after saving categories and drop only deleted categories', async () => {
        // Arrange
        await typeByTestId(fixture, 'gameNameInput', 'Game');
        await selectOption('lengthSelect', 'Very long');
        await selectOption('difficultySelect', 'Easy');
        await checkCheckbox('mainCategoryCheckbox', 1);

        fixture.componentRef.setInput('mainCategories', [lovedCategory, badCategory, buildCategory({ id: 10, name: 'New' })]);
        fixture.componentRef.setInput('lengthCategories', [longCategory]);

        // Act
        await fixture.whenStable();

        // Assert
        expect(getGameName()).toBe('Game');
        expect(await getSelectedOption('lengthSelect')).toBe('');
        expect(await getSelectedOption('difficultySelect')).toBe('Easy');
        expect(await getMainCategoriesCheckedStates()).toEqual([false, true, false]);
    });

    it('should clear the filled fields after clicking their clear buttons', async () => {
        // Arrange
        await typeByTestId(fixture, 'gameNameInput', 'Game');
        await selectOption('lengthSelect', 'Long');
        await selectOption('difficultySelect', 'Easy');

        // Act
        await clickByTestId(fixture, 'gameNameClearButton');
        await clickByTestId(fixture, 'lengthClearButton');
        await clickByTestId(fixture, 'difficultyClearButton');

        // Assert
        expect(getGameName()).toBe('');
        expect(await getSelectedOption('lengthSelect')).toBe('');
        expect(await getSelectedOption('difficultySelect')).toBe('');
    });
});

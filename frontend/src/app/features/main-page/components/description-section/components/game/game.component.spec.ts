import { provideHttpClient } from '@angular/common/http';
import type { DebugElement } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { of } from 'rxjs';

import type { Mock } from 'vitest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TranslocoService } from '@jsverse/transloco';

import { GameComponent } from './game.component';
import { EditGameService } from '../../../../services/edit-game.service';
import { GameApiService } from '../../../../services/game-api.service';
import { WallpaperApiService } from '../../../../services/wallpaper-api.service';
import { WallpaperStatusService } from '../../../../services/wallpaper-status.service';
import { ConfirmationService } from '../../../../../../components/confirmation/confirmation.service';
import { SnackbarType } from '../../../../../../components/snackbar/enums/snackbar-type.enum';
import { SnackbarService } from '../../../../../../components/snackbar/snackbar.service';
import { ErrorCode } from '../../../../../../enums/error-code.enum';
import { buildDescriptionEntry, buildGame, buildGameGroup } from '../../../../../../../testing/builders/description.builders';
import { clickByTestId, getTextByTestId, isDisabledByTestId, queryByTestId } from '../../../../../../../testing/helpers/dom.helpers';
import { mockErrorResponse } from '../../../../../../../testing/mocks/error-response.mocks';
import { spyOnConfirmationService, spyOnGameApiService, spyOnSnackbarService } from '../../../../../../../testing/helpers/service-spy.helpers';

describe('GameComponent', () => {
    let component: GameComponent;
    let fixture: ComponentFixture<GameComponent>;
    let debugElement: DebugElement;
    let gameApiService: GameApiService;
    let editGameService: EditGameService;
    let snackbarService: SnackbarService;
    let confirmationService: ConfirmationService;
    let translocoService: TranslocoService;
    let wallpaperStatusService: WallpaperStatusService;
    let reloadDescriptionMock: Mock<() => void>;

    const game = buildGame({ id: 1, name: 'Game' });
    const group = buildGameGroup({ id: 2, name: 'DLC' });

    beforeEach(async () => {
        TestBed.configureTestingModule({
            imports: [GameComponent],
            providers: [provideHttpClient(), WallpaperApiService, WallpaperStatusService, EditGameService, GameApiService, SnackbarService, ConfirmationService],
        });

        reloadDescriptionMock = vi.fn();
        gameApiService = spyOnGameApiService();
        snackbarService = spyOnSnackbarService();
        confirmationService = spyOnConfirmationService();
        editGameService = TestBed.inject(EditGameService);
        translocoService = TestBed.inject(TranslocoService);
        wallpaperStatusService = TestBed.inject(WallpaperStatusService);

        fixture = TestBed.createComponent(GameComponent);
        component = fixture.componentInstance;
        debugElement = fixture.debugElement;

        component.reloadDescription.subscribe(reloadDescriptionMock);
        fixture.componentRef.setInput('entry', buildDescriptionEntry({ game }));
        fixture.componentRef.setInput('shouldShowEdition', true);

        await fixture.whenStable();
    });

    it('should create a component', () => {
        // Assert
        expect(component).toBeTruthy();
    });

    it('should present the line of the entry', () => {
        // Assert
        expect(getTextByTestId(debugElement, 'gameLine')).toBe(':100: Game');
    });

    it('should hide the edition buttons outside of the edition mode', async () => {
        // Arrange
        fixture.componentRef.setInput('shouldShowEdition', false);

        // Act
        await fixture.whenStable();

        // Assert
        expect(queryByTestId(debugElement, 'gameEditButton')).toBeNull();
        expect(queryByTestId(debugElement, 'gameDeleteButton')).toBeNull();
    });

    it('should start editing the game after clicking the edit button', async () => {
        // Act
        await clickByTestId(fixture, 'gameEditButton');

        // Assert
        expect(editGameService.editedGame()).toBe(game);
    });

    it('should delete the confirmed game and reload the description', async () => {
        // Act
        await clickByTestId(fixture, 'gameDeleteButton');

        // Assert
        expect(confirmationService.openConfirmation).toHaveBeenCalledWith(expect.objectContaining({ title: translocoService.translate('confirmation.delete.game.title'), identifier: 'Game' }));
        expect(gameApiService.deleteGame).toHaveBeenCalledWith(1);
        expect(snackbarService.openSnackbar).toHaveBeenCalledWith(translocoService.translate('game.deleteSuccess.game'), SnackbarType.SUCCESS);
        expect(reloadDescriptionMock).toHaveBeenCalledTimes(1);
    });

    it('should delete the confirmed group of a group entry', async () => {
        // Arrange
        fixture.componentRef.setInput('entry', buildDescriptionEntry({ game, group }));
        await fixture.whenStable();

        // Act
        await clickByTestId(fixture, 'gameDeleteButton');

        // Assert
        expect(confirmationService.openConfirmation).toHaveBeenCalledWith(expect.objectContaining({ title: translocoService.translate('confirmation.delete.group.title'), identifier: 'Game - DLC' }));
        expect(gameApiService.deleteGroup).toHaveBeenCalledWith(1, 2);
        expect(snackbarService.openSnackbar).toHaveBeenCalledWith(translocoService.translate('game.deleteSuccess.group'), SnackbarType.SUCCESS);
        expect(reloadDescriptionMock).toHaveBeenCalledTimes(1);
    });

    it('should delete the confirmed listed group', async () => {
        // Arrange
        fixture.componentRef.setInput('entry', buildDescriptionEntry({ game, listedGroups: [group] }));
        await fixture.whenStable();

        // Act
        await clickByTestId(fixture, 'listedGroupDeleteButton');

        // Assert
        expect(confirmationService.openConfirmation).toHaveBeenCalledWith(expect.objectContaining({ identifier: 'Game - DLC' }));
        expect(gameApiService.deleteGroup).toHaveBeenCalledWith(1, 2);
        expect(reloadDescriptionMock).toHaveBeenCalledTimes(1);
    });

    it('should not delete the game when the deletion is not confirmed', async () => {
        // Arrange
        vi.mocked(confirmationService.openConfirmation).mockReturnValue(of(false));

        // Act
        await clickByTestId(fixture, 'gameDeleteButton');

        // Assert
        expect(gameApiService.deleteGame).not.toHaveBeenCalled();
        expect(reloadDescriptionMock).not.toHaveBeenCalled();
    });

    it('should inform about an error while deleting the game', async () => {
        // Arrange
        vi.mocked(gameApiService.deleteGame).mockReturnValue(mockErrorResponse());

        // Act
        await clickByTestId(fixture, 'gameDeleteButton');

        // Assert
        expect(snackbarService.openSnackbar).toHaveBeenCalledWith(translocoService.translate('game.deleteError.game'), SnackbarType.ERROR);
        expect(reloadDescriptionMock).not.toHaveBeenCalled();
    });

    it('should inform about the generated wallpaper rejecting the deletion', async () => {
        // Arrange
        vi.mocked(gameApiService.deleteGame).mockReturnValue(mockErrorResponse({ message: 'The wallpaper is being generated', errorCode: ErrorCode.WALLPAPER_GENERATING }));

        // Act
        await clickByTestId(fixture, 'gameDeleteButton');

        // Assert
        expect(snackbarService.openSnackbar).toHaveBeenCalledWith(translocoService.translate('common.wallpaperGenerating'), SnackbarType.ERROR);
        expect(reloadDescriptionMock).not.toHaveBeenCalled();
    });

    it('should not allow deleting the game nor its listed groups while the wallpaper is generated', async () => {
        // Arrange
        fixture.componentRef.setInput('entry', buildDescriptionEntry({ game, listedGroups: [group] }));
        wallpaperStatusService.setGeneratingInSection(true);

        // Act
        await fixture.whenStable();

        // Assert
        expect(isDisabledByTestId(debugElement, 'gameDeleteButton')).toBe(true);
        expect(isDisabledByTestId(debugElement, 'listedGroupDeleteButton')).toBe(true);
        expect(isDisabledByTestId(debugElement, 'gameEditButton')).toBe(false);
    });

    it('should neither ask for confirmation nor delete while the wallpaper is generated', async () => {
        // Arrange
        wallpaperStatusService.setGeneratingInSection(true);
        await fixture.whenStable();

        // Act
        await clickByTestId(fixture, 'gameDeleteButton');

        // Assert
        expect(confirmationService.openConfirmation).not.toHaveBeenCalled();
        expect(gameApiService.deleteGame).not.toHaveBeenCalled();
    });

    it('should stop editing the deleted game', async () => {
        // Arrange
        editGameService.startEditing(game);

        // Act
        await clickByTestId(fixture, 'gameDeleteButton');

        // Assert
        expect(editGameService.editedGame()).toBeNull();
    });

    it('should keep editing another game after deleting the game', async () => {
        // Arrange
        const editedGame = buildGame({ id: 3 });

        editGameService.startEditing(editedGame);

        // Act
        await clickByTestId(fixture, 'gameDeleteButton');

        // Assert
        expect(editGameService.editedGame()).toBe(editedGame);
    });
});

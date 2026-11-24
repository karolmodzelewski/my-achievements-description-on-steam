import type { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, input, output } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';

import type { Observable } from 'rxjs';
import { catchError, EMPTY, filter, switchMap, take, tap } from 'rxjs';

import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { DeletedEntryType } from './enums/deleted-entry-type.enum';
import { ConfirmationService } from '../../../../../../components/confirmation/confirmation.service';
import { SnackbarType } from '../../../../../../components/snackbar/enums/snackbar-type.enum';
import { SnackbarService } from '../../../../../../components/snackbar/snackbar.service';
import { ErrorCode } from '../../../../../../enums/error-code.enum';
import type { DescriptionEntry } from '../../../../../../interfaces/description-entry.interface';
import type { ErrorResponseBody } from '../../../../../../interfaces/error-response-body.interface';
import type { GameGroup } from '../../../../../../interfaces/game-group.interface';
import { EditGameService } from '../../../../services/edit-game.service';
import { GameApiService } from '../../../../services/game-api.service';
import { WallpaperStatusService } from '../../../../services/wallpaper-status.service';
import { checkIfGameIsHidden, getEntryLine, getEntryName } from '../../../../utils/description-text.util';
import { CutOffTextComponent } from '../cut-off-text/cut-off-text.component';

@Component({
    selector: 'mados-game',
    templateUrl: './game.component.html',
    styleUrl: './game.component.scss',
    imports: [MatIconButton, MatIcon, MatTooltip, CutOffTextComponent, TranslocoPipe],
})
export class GameComponent {
    private readonly confirmationService = inject(ConfirmationService);
    private readonly editGameService = inject(EditGameService);
    private readonly gameApiService = inject(GameApiService);
    private readonly snackbarService = inject(SnackbarService);
    private readonly translocoService = inject(TranslocoService);
    private readonly wallpaperStatusService = inject(WallpaperStatusService);

    public readonly entry = input.required<DescriptionEntry>();
    public readonly shouldShowEdition = input.required<boolean>();
    public readonly cutOffIndex = input<number>();

    public readonly reloadDescription = output();

    public readonly isWallpaperGenerating = this.wallpaperStatusService.isGenerating;

    public readonly entryLine = computed<string>(() => getEntryLine(this.entry()));
    public readonly entryName = computed<string>(() => getEntryName(this.entry()));
    public readonly isHidden = computed<boolean>(() => checkIfGameIsHidden(this.entry().game));

    public editGame(): void {
        this.editGameService.startEditing(this.entry().game);
    }

    public deleteEntry(): void {
        const { group } = this.entry();

        if (group) {
            this.deleteGroup(group);

            return;
        }

        this.sendDeleteRequest(() => this.gameApiService.deleteGame(this.entry().game.id), DeletedEntryType.GAME, this.entryName());
    }

    public deleteGroup(group: GameGroup): void {
        this.sendDeleteRequest(() => this.gameApiService.deleteGroup(this.entry().game.id, group.id), DeletedEntryType.GROUP, getEntryName({ ...this.entry(), group }));
    }

    // The request is created and sent only after the deletion is confirmed
    private sendDeleteRequest(deleteRequest: () => Observable<void>, deletedEntryType: DeletedEntryType, identifier: string): void {
        if (this.isWallpaperGenerating()) {
            return;
        }

        const gameId = this.entry().game.id;

        this.confirmationService
            .openConfirmation({
                title: this.translocoService.translate(`confirmation.delete.${deletedEntryType}.title`),
                questionStart: this.translocoService.translate(`confirmation.delete.${deletedEntryType}.questionStart`),
                identifier,
                questionEnd: this.translocoService.translate(`confirmation.delete.${deletedEntryType}.questionEnd`),
            })
            .pipe(
                take(1),
                filter(Boolean),
                switchMap(deleteRequest),
                tap(() => {
                    // Edited game would be outdated after deleting it or one of its groups
                    if (this.editGameService.editedGame()?.id === gameId) {
                        this.editGameService.stopEditing();
                    }

                    this.snackbarService.openSnackbar(this.translocoService.translate(`game.deleteSuccess.${deletedEntryType}`), SnackbarType.SUCCESS);
                    this.reloadDescription.emit();
                }),
                catchError(({ error }: HttpErrorResponse) => {
                    const isWallpaperGenerating = (error as ErrorResponseBody | null)?.errorCode === ErrorCode.WALLPAPER_GENERATING;
                    const messageKey = isWallpaperGenerating ? 'common.wallpaperGenerating' : `game.deleteError.${deletedEntryType}`;

                    this.snackbarService.openSnackbar(this.translocoService.translate(messageKey), SnackbarType.ERROR);

                    return EMPTY;
                })
            )
            .subscribe();
    }
}

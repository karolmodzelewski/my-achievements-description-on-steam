import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, input, output } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

import { catchError, EMPTY, filter, switchMap, take, tap } from 'rxjs';

import { ConfirmationService } from '../../../../../../components/confirmation/confirmation.service';
import { SnackbarType } from '../../../../../../components/snackbar/enums/snackbar-type.enum';
import { SnackbarService } from '../../../../../../components/snackbar/snackbar.service';
import { CategoryType } from '../../../../../../enums/category-type.enum';
import type { DescriptionEntry } from '../../../../../../interfaces/description-entry.interface';
import type { GameGroup } from '../../../../../../interfaces/game-group.interface';
import { EditGameService } from '../../../../services/edit-game.service';
import { getEntryLine, getEntryName } from '../../../../utils/description-text.util';

@Component({
    selector: 'mados-game',
    templateUrl: './game.component.html',
    styleUrl: './game.component.scss',
    imports: [MatIconButton, MatIcon],
})
export class GameComponent {
    private readonly confirmationService = inject(ConfirmationService);
    private readonly editGameService = inject(EditGameService);
    private readonly httpClient = inject(HttpClient);
    private readonly snackbarService = inject(SnackbarService);

    public readonly entry = input.required<DescriptionEntry>();
    public readonly shouldShowEdition = input.required<boolean>();

    public readonly reloadDescription = output();

    public readonly entryLine = computed<string>(() => getEntryLine(this.entry()));
    public readonly entryName = computed<string>(() => getEntryName(this.entry()));
    public readonly isAdultGame = computed<boolean>(() => this.entry().game.categories?.some((category) => category.type === CategoryType.ADULT_GAME) === true);

    public editGame(): void {
        this.editGameService.startEditing(this.entry().game);
    }

    public deleteEntry(): void {
        const { group } = this.entry();

        if (group) {
            this.deleteGroup(group);

            return;
        }

        this.sendDeleteRequest(`game/${this.entry().game.id}`, 'game', this.entryName());
    }

    public deleteGroup(group: GameGroup): void {
        this.sendDeleteRequest(`game/${this.entry().game.id}/group/${group.id}`, 'group', getEntryName({ ...this.entry(), group }));
    }

    private sendDeleteRequest(url: string, identifierType: string, identifier: string): void {
        const gameId = this.entry().game.id;

        this.confirmationService
            .openConfirmation({
                title: `Delete ${identifierType}`,
                question: 'Are you sure you want to delete',
                identifier,
                identifierType,
            })
            .pipe(
                take(1),
                filter(Boolean),
                switchMap(() => this.httpClient.delete<void>(url)),
                tap(() => {
                    // Edited game would be outdated after deleting it or one of its groups
                    if (this.editGameService.editedGame()?.id === gameId) {
                        this.editGameService.stopEditing();
                    }

                    this.snackbarService.openSnackbar(`Successfully deleted ${identifierType}`, SnackbarType.SUCCESS);
                    this.reloadDescription.emit();
                }),
                catchError(() => {
                    this.snackbarService.openSnackbar(`An error has occurred while deleting ${identifierType}`, SnackbarType.ERROR);

                    return EMPTY;
                })
            )
            .subscribe();
    }
}

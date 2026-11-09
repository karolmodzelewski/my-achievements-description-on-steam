import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, input, output } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

import { catchError, EMPTY, take, tap } from 'rxjs';

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

        this.sendDeleteRequest(`game/${this.entry().game.id}`, 'game');
    }

    public deleteGroup({ id }: GameGroup): void {
        this.sendDeleteRequest(`game/${this.entry().game.id}/group/${id}`, 'group');
    }

    private sendDeleteRequest(url: string, deletedItemName: string): void {
        const gameId = this.entry().game.id;

        this.httpClient
            .delete<void>(url)
            .pipe(
                take(1),
                tap(() => {
                    // Edited game would be outdated after deleting it or one of its groups
                    if (this.editGameService.editedGame()?.id === gameId) {
                        this.editGameService.stopEditing();
                    }

                    this.snackbarService.openSnackbar(`Successfully deleted ${deletedItemName}`, SnackbarType.SUCCESS);
                    this.reloadDescription.emit();
                }),
                catchError(() => {
                    this.snackbarService.openSnackbar(`An error has occurred while deleting ${deletedItemName}`, SnackbarType.ERROR);

                    return EMPTY;
                })
            )
            .subscribe();
    }
}

import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, input, output } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

import { catchError, EMPTY, take, tap } from 'rxjs';

import { SnackbarType } from '../../../../../../components/snackbar/enums/snackbar-type.enum';
import { SnackbarService } from '../../../../../../components/snackbar/snackbar.service';
import { CategoryType } from '../../../../../../enums/category-type.enum';
import type { Game } from '../../../../../../interfaces/game.interface';
import { EditGameService } from '../../../../services/edit-game.service';

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

    public readonly game = input.required<Game>();
    public readonly shouldShowEdition = input.required<boolean>();

    public readonly reloadDescription = output();

    public readonly isAdultGame = computed<boolean>(() => this.game().categories?.some((category) => category.type === CategoryType.ADULT_GAME) === true);

    public editGame(): void {
        this.editGameService.startEditing(this.game());
    }

    public deleteGame(): void {
        const { id } = this.game();

        this.httpClient
            .delete<void>(`game/${id}`)
            .pipe(
                take(1),
                tap(() => {
                    if (this.editGameService.editedGame()?.id === id) {
                        this.editGameService.stopEditing();
                    }

                    this.snackbarService.openSnackbar('Successfully deleted game', SnackbarType.SUCCESS);
                    this.reloadDescription.emit();
                }),
                catchError(() => {
                    this.snackbarService.openSnackbar('An error has occurred while deleting game', SnackbarType.ERROR);

                    return EMPTY;
                })
            )
            .subscribe();
    }
}

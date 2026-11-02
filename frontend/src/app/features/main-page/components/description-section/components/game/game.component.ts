import { HttpClient } from '@angular/common/http';
import type { InputSignal, OutputEmitterRef, Signal } from '@angular/core';
import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { catchError, EMPTY, take } from 'rxjs';

import type { DeleteGameRequestBody } from './interfaces/delete-game-request-body.interface';
import { SnackbarService } from '../../../../../../components/snackbar/snackbar.service';
import { CategoryType } from '../../../../../../enums/category-type.enum';
import type { GameCategory } from '../../../../../../interfaces/game-category.interface';
import { EditGameService } from '../../../../services/edit-game.service';

@Component({
    selector: 'mados-game',
    templateUrl: './game.component.html',
    styleUrl: './game.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatIconModule],
})
export class GameComponent {
    private readonly editGameService: EditGameService = inject(EditGameService);
    private readonly httpClient: HttpClient = inject(HttpClient);
    private readonly snackbarService: SnackbarService = inject(SnackbarService);

    public readonly oneHundredPercentIconName: InputSignal<string> = input.required<string>();
    public readonly name: InputSignal<string> = input.required<string>();
    public readonly categories: InputSignal<GameCategory[] | undefined> = input<GameCategory[]>();
    public readonly shouldShowEdition: InputSignal<boolean> = input.required<boolean>();

    public readonly reloadDescription: OutputEmitterRef<void> = output();

    public readonly isAdultGame: Signal<boolean> = computed(() => this.categories()?.some((category: GameCategory) => category.type === CategoryType.ADULT_GAME) === true);

    public editGame(): void {
        this.editGameService.editingGameName$.next(this.name());
    }

    public deleteGame(): void {
        const requestBody: DeleteGameRequestBody = { name: this.name() };

        this.httpClient
            .delete('game', { body: requestBody })
            .pipe(
                take(1),
                catchError(() => {
                    this.snackbarService.openSnackbar('An error has occurred while deleting game', 'error');

                    return EMPTY;
                })
            )
            .subscribe(() => {
                this.snackbarService.openSnackbar('Successfully deleted game', 'success');
                this.reloadDescription.emit();
            });
    }
}

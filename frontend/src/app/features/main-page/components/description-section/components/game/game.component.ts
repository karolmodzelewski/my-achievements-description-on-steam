import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { catchError, EMPTY, take } from 'rxjs';

import { GameCategory } from '../../../../../../interfaces/game-category.interface';
import { EditGameService } from '../../../../services/edit-game.service';
import { SnackbarService } from './../../../../../../components/snackbar/snackbar.service';
import { DeleteGameRequestBody } from './interfaces/delete-game-request-body.interface';

@Component({
    selector: 'mados-game',
    templateUrl: './game.component.html',
    styleUrls: ['./game.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameComponent {
    @Input()
    public oneHundredPercentIconName: string;
    @Input()
    public name: string;
    @Input()
    public categories: GameCategory[] | undefined;
    @Input()
    public shouldShowEdition: boolean;

    @Output()
    public reloadDescription: EventEmitter<void> = new EventEmitter<void>();

    constructor(
        private editGameService: EditGameService,
        private httpClient: HttpClient,
        private snackbarService: SnackbarService,
    ) {}

    public editGame(): void {
        this.editGameService.editingGameName$.next(this.name);
    }

    public deleteGame(): void {
        const requestBody: DeleteGameRequestBody = { name: this.name };

        this.httpClient.delete('game', { body: requestBody })
            .pipe(
                take(1),
                catchError(() => {
                    this.snackbarService.openSnackbar('An error has occurred while deleting game', 'error');

                    return EMPTY;
                })
            ).subscribe(() => {
                this.snackbarService.openSnackbar('Successfully deleted game', 'success');
                this.reloadDescription.emit();
            });
    }
}

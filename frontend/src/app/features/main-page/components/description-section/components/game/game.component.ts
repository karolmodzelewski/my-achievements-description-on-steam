import { GameCategory } from '../../../../../../interfaces/game-category.interface';
import { EditGameService } from '../../../../services/edit-game.service';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

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

    constructor(private editGameService: EditGameService) { }

    public editGame(): void {
        this.editGameService.editingGameName$.next(this.name);
    }
}

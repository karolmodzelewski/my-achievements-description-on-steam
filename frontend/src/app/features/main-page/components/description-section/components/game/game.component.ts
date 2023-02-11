import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { GameCategory } from '../../../../../../interfaces/game-category.interface';
import { EditGameService } from '../../../../services/edit-game.service';

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

    constructor(private editGameService: EditGameService) {}

    public editGame(): void {
        this.editGameService.editingGameName$.next(this.name);
    }
}

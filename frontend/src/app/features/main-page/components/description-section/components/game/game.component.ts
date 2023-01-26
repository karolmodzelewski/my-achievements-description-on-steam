import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'mados-game',
  templateUrl: './game.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameComponent {
    @Input()
    public oneHundredPercentIconName: string;
    @Input()
    public name: string;
    @Input()
    public iconNames: string[] | null;
}

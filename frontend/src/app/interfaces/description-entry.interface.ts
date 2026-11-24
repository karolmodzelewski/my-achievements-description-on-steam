import type { Game } from './game.interface';
import type { GameGroup } from './game-group.interface';

export interface DescriptionEntry {
    game: Game;
    group: GameGroup | null;
    listedGroups: GameGroup[];
}

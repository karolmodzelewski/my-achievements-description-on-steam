import type { MappedGame } from './mapped-game.interface';
import type { MappedGroup } from './mapped-group.interface';

export interface DescriptionEntry {
    game: MappedGame;
    group: MappedGroup | null;
    listedGroups: MappedGroup[];
}

import type { DescriptionEntry } from './description-entry.interface';

export interface DescriptionSection {
    amount: number;
    gamesAmount: number;
    groupsAmount: number;
    entries: DescriptionEntry[];
}

import type { CategoryKind } from '../../../enums/category-kind.enum';

export interface GameCategory {
    id: number;
    kind: CategoryKind;
    iconName: string;
    shouldHideGames: boolean;
}

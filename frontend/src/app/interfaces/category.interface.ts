import type { CategoryKind } from '../enums/category-kind.enum';

export interface Category {
    id: number;
    kind: CategoryKind;
    name: string;
    description: string | null;
    iconName: string;
    shouldHideGames: boolean;
    position: number;
}

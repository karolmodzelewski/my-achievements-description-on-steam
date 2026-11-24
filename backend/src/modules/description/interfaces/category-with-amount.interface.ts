import type { CategoryKind } from '../../../enums/category-kind.enum';

export interface CategoryWithAmount {
    id: number;
    kind: CategoryKind;
    name: string;
    description: string | null;
    iconName: string;
    shouldHideGames: boolean;
    amount: number;
}

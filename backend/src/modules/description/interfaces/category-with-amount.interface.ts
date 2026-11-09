import type { CategoryType } from '../../../enums/category-type.enum';

export interface CategoryWithAmount {
    id: number;
    type: CategoryType;
    iconName: string;
    description: string | null;
    amount: number;
}

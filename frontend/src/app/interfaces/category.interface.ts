import { CategoryType } from '../enums/category-type.enum';

export interface Category {
    type: CategoryType;
    iconName: string;
    description: string | null;
    amount: number | null;
}

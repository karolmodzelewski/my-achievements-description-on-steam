import { CategoryType } from './../../../enums/category-type.enum';

export interface CategoryWithAmount {
    type: CategoryType;
    iconName: string;
    description: string;
    amount: number;
}

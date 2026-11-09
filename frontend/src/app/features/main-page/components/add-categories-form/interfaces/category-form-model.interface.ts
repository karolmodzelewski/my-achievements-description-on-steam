import type { CategoryType } from '../../../../../enums/category-type.enum';

export interface CategoryFormModel {
    type: CategoryType;
    iconName: string;
    description: string;
}

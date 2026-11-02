import type { CategoryType } from '../enums/category-type.enum';

export interface CategoryRequestBody {
    type: CategoryType;
    iconName: string;
    description?: string | null;
}

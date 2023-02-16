import { CategoryType } from './../../../enums/category-type.enum';

export interface Game {
    oneHundredPercentIconName: string;
    name: string;
    categories: Category[];
}

interface Category {
    type: CategoryType;
    iconName: string;
}

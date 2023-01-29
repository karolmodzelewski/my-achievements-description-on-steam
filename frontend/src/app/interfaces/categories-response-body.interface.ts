import { Category } from './category.interface';

export interface CategoriesResponseBody {
    categories: Omit<Category, 'amount'>[];
}

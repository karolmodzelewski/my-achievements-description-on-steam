import type { Category } from '../../../interfaces/category.interface';
import type { DescriptionResponseBody } from '../../../interfaces/description-response-body.interface';

export interface MainPageData {
    categories: Category[];
    description: DescriptionResponseBody;
}

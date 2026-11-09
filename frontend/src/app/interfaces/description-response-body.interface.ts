import type { Category } from './category.interface';
import type { DescriptionSection } from './description-section.interface';

export interface DescriptionResponseBody {
    categories: Category[];
    completed: DescriptionSection;
    newAchievements: DescriptionSection;
}

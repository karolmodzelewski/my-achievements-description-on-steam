import type { DescriptionCategory } from './description-category.interface';
import type { DescriptionSection } from './description-section.interface';

export interface DescriptionResponseBody {
    categories: DescriptionCategory[];
    completed: DescriptionSection;
    newAchievements: DescriptionSection;
}

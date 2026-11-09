import type { CategoryWithAmount } from './category-with-amount.interface';
import type { DescriptionSection } from './description-section.interface';

export interface Description {
    categories: CategoryWithAmount[];
    completed: DescriptionSection;
    newAchievements: DescriptionSection;
}

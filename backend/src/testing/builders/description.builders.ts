import type { DescriptionSection } from '../../modules/description/interfaces/description-section.interface';
import type { Description } from '../../modules/description/interfaces/description.interface';

export const buildDescriptionSection = (overrides: Partial<DescriptionSection> = {}): DescriptionSection => ({
    amount: 0,
    gamesAmount: 0,
    groupsAmount: 0,
    entries: [],
    ...overrides,
});

export const buildDescription = (overrides: Partial<Description> = {}): Description => ({
    categories: [],
    completed: buildDescriptionSection(),
    newAchievements: buildDescriptionSection(),
    ...overrides,
});

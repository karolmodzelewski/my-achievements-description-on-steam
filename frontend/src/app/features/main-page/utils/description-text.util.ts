import type { DescriptionEntry } from '../../../interfaces/description-entry.interface';
import type { DescriptionSection } from '../../../interfaces/description-section.interface';

// Shared by the rendered and the copied description, so both always present the same text

export const getSectionHeading = (title: string, { amount, gamesAmount, groupsAmount }: DescriptionSection): string => {
    const amountParts = [gamesAmount ? `GAMES (${gamesAmount})` : null, groupsAmount ? `GROUPS (${groupsAmount})` : null].filter((amountPart) => amountPart !== null);
    const amountPartsText = amountParts.length ? ` - ${amountParts.join(' & ')}` : '';

    return `${title.toUpperCase()} (${amount})${amountPartsText}:`;
};

export const getEntryName = ({ game, group }: DescriptionEntry): string => (group ? `${game.name} - ${group.name}` : game.name);

export const getEntryLine = (entry: DescriptionEntry): string => {
    const { game, group, listedGroups } = entry;

    if (group) {
        return `${game.oneHundredPercentIconName} ${getEntryName(entry)}`;
    }

    const groupsText = listedGroups.length ? ` (+ ${listedGroups.length} ${listedGroups.length === 1 ? 'group' : 'groups'})` : '';
    const categoriesIconNames = game.categories?.map(({ iconName }) => iconName).join('') ?? '';

    return `${game.oneHundredPercentIconName} ${game.name}${groupsText} ${categoriesIconNames}`.trim();
};

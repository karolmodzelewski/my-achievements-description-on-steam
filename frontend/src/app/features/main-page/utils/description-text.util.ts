import type { DescriptionEntry } from '../../../interfaces/description-entry.interface';
import type { DescriptionSection } from '../../../interfaces/description-section.interface';
import type { Game } from '../../../interfaces/game.interface';

// Games of a category hiding games are hidden information, summarised at the end of each section without revealing their names
export const checkIfGameIsHidden = (game: Game): boolean => game.categories?.some((category) => category.shouldHideGames) === true;

// Shared by the rendered and the copied description, so both always present the same text

export const getSectionHeading = (title: string, { amount, gamesAmount, groupsAmount }: DescriptionSection): string => {
    const amountParts = [gamesAmount ? `GAMES (${gamesAmount})` : null, groupsAmount ? `GROUPS (${groupsAmount})` : null].filter((amountPart) => amountPart !== null);
    const amountPartsText = amountParts.length ? ` - ${amountParts.join(' & ')}` : '';

    return `${title.toUpperCase()} (${amount})${amountPartsText}:`;
};

// Trims every part and skips empty ones, so untrimmed or empty values never leave extra spaces
export const joinDescriptionParts = (...parts: string[]): string =>
    parts
        .map((part) => part.trim())
        .filter((part) => part !== '')
        .join(' ');

export const getEntryName = ({ game, group }: DescriptionEntry): string => (group ? `${game.name.trim()} - ${group.name.trim()}` : game.name.trim());

export const getEntryLine = (entry: DescriptionEntry): string => {
    const { game, group, listedGroups } = entry;

    if (group) {
        return joinDescriptionParts(game.oneHundredPercentIconName, getEntryName(entry));
    }

    const groupsText = listedGroups.length ? ` (+ ${listedGroups.length} ${listedGroups.length === 1 ? 'group' : 'groups'})` : '';
    const categoriesIconNames = game.categories?.map(({ iconName }) => iconName.trim()).join('') ?? '';

    return joinDescriptionParts(game.oneHundredPercentIconName, `${getEntryName(entry)}${groupsText}`, categoriesIconNames);
};

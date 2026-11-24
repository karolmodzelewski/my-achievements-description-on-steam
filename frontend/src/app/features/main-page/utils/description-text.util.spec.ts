import { describe, expect, it } from 'vitest';

import { checkIfGameIsHidden, getEntryLine, getEntryName, getSectionHeading, joinDescriptionParts } from './description-text.util';
import { buildGameCategory } from '../../../../testing/builders/category.builders';
import { buildDescriptionEntry, buildDescriptionSection, buildGame, buildGameGroup } from '../../../../testing/builders/description.builders';

describe('description-text.util', () => {
    describe('checkIfGameIsHidden', () => {
        it('should be hidden when any of its categories hides games', () => {
            // Arrange
            const game = buildGame({ categories: [buildGameCategory({ id: 1 }), buildGameCategory({ id: 2, shouldHideGames: true })] });

            // Act
            const isHidden = checkIfGameIsHidden(game);

            // Assert
            expect(isHidden).toBe(true);
        });

        it('should not be hidden when none of its categories hides games', () => {
            // Arrange
            const game = buildGame({ categories: [buildGameCategory()] });

            // Act
            const isHidden = checkIfGameIsHidden(game);

            // Assert
            expect(isHidden).toBe(false);
        });

        it('should not be hidden without categories', () => {
            // Arrange
            const game = buildGame();

            // Act
            const isHidden = checkIfGameIsHidden(game);

            // Assert
            expect(isHidden).toBe(false);
        });
    });

    describe('getSectionHeading', () => {
        it('should present the uppercased title with games and groups amounts', () => {
            // Arrange
            const section = buildDescriptionSection({ amount: 5, gamesAmount: 3, groupsAmount: 2 });

            // Act
            const heading = getSectionHeading('Completed', section);

            // Assert
            expect(heading).toBe('COMPLETED (5) - GAMES (3) & GROUPS (2):');
        });

        it('should present only games amount when there are no groups', () => {
            // Arrange
            const section = buildDescriptionSection({ amount: 3, gamesAmount: 3 });

            // Act
            const heading = getSectionHeading('Completed', section);

            // Assert
            expect(heading).toBe('COMPLETED (3) - GAMES (3):');
        });

        it('should present only groups amount when there are no games', () => {
            // Arrange
            const section = buildDescriptionSection({ amount: 2, groupsAmount: 2 });

            // Act
            const heading = getSectionHeading('New achievements', section);

            // Assert
            expect(heading).toBe('NEW ACHIEVEMENTS (2) - GROUPS (2):');
        });

        it('should present only the total amount when there are neither games nor groups', () => {
            // Arrange
            const section = buildDescriptionSection();

            // Act
            const heading = getSectionHeading('Completed', section);

            // Assert
            expect(heading).toBe('COMPLETED (0):');
        });
    });

    describe('joinDescriptionParts', () => {
        it('should join trimmed parts with single spaces and skip empty ones', () => {
            // Act
            const text = joinDescriptionParts('  :icon: ', '', '   ', 'Description ', '(2)');

            // Assert
            expect(text).toBe(':icon: Description (2)');
        });

        it('should return an empty text when all parts are empty', () => {
            // Act
            const text = joinDescriptionParts('', '  ');

            // Assert
            expect(text).toBe('');
        });
    });

    describe('getEntryName', () => {
        it('should present the trimmed game name for a base game', () => {
            // Arrange
            const entry = buildDescriptionEntry({ game: buildGame({ name: ' Game ' }) });

            // Act
            const name = getEntryName(entry);

            // Assert
            expect(name).toBe('Game');
        });

        it('should present the trimmed game and group names for a group', () => {
            // Arrange
            const entry = buildDescriptionEntry({ game: buildGame({ name: ' Game ' }), group: buildGameGroup({ name: ' DLC ' }) });

            // Act
            const name = getEntryName(entry);

            // Assert
            expect(name).toBe('Game - DLC');
        });
    });

    describe('getEntryLine', () => {
        it('should present the 100% icon, the name and icons of the categories for a base game', () => {
            // Arrange
            const game = buildGame({ categories: [buildGameCategory({ iconName: ' :a: ' }), buildGameCategory({ id: 2, iconName: ':b:' })] });
            const entry = buildDescriptionEntry({ game });

            // Act
            const line = getEntryLine(entry);

            // Assert
            expect(line).toBe(':100: Game :a::b:');
        });

        it('should present a single listed group', () => {
            // Arrange
            const entry = buildDescriptionEntry({ listedGroups: [buildGameGroup()] });

            // Act
            const line = getEntryLine(entry);

            // Assert
            expect(line).toBe(':100: Game (+ 1 group)');
        });

        it('should present the amount of several listed groups', () => {
            // Arrange
            const entry = buildDescriptionEntry({ listedGroups: [buildGameGroup(), buildGameGroup({ id: 2 })] });

            // Act
            const line = getEntryLine(entry);

            // Assert
            expect(line).toBe(':100: Game (+ 2 groups)');
        });

        it('should present only the 100% icon and the name for a group, without categories', () => {
            // Arrange
            const game = buildGame({ categories: [buildGameCategory()] });
            const entry = buildDescriptionEntry({ game, group: buildGameGroup() });

            // Act
            const line = getEntryLine(entry);

            // Assert
            expect(line).toBe(':100: Game - DLC');
        });
    });
});

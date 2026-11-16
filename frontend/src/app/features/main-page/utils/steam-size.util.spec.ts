import { describe, expect, it } from 'vitest';

import { getSteamCutOffIndex, getSteamTextSize } from './steam-size.util';

describe('steam-size.util', () => {
    describe('getSteamTextSize', () => {
        it('should count one byte per ASCII character', () => {
            // Act
            const size = getSteamTextSize('Game');

            // Assert
            expect(size).toBe(4);
        });

        it('should count a line break as two bytes', () => {
            // Act
            const size = getSteamTextSize('a\nb');

            // Assert
            expect(size).toBe(4);
        });

        it('should count the UTF-8 size of multibyte characters', () => {
            // Act
            const size = getSteamTextSize('ą€😀');

            // Assert
            expect(size).toBe(2 + 3 + 4);
        });
    });

    describe('getSteamCutOffIndex', () => {
        it('should return the text length when the whole text fits', () => {
            // Act
            const cutOffIndex = getSteamCutOffIndex('Game', 4);

            // Assert
            expect(cutOffIndex).toBe(4);
        });

        it('should return the index of the first character exceeding the available size', () => {
            // Act
            const cutOffIndex = getSteamCutOffIndex('Game', 2);

            // Assert
            expect(cutOffIndex).toBe(2);
        });

        it('should cut at a multibyte character not fully fitting in the available size', () => {
            // Act
            const cutOffIndex = getSteamCutOffIndex('a€', 3);

            // Assert
            expect(cutOffIndex).toBe(1);
        });

        it('should count characters outside of the Basic Multilingual Plane as two UTF-16 code units', () => {
            // Act
            const cutOffIndex = getSteamCutOffIndex('😀ab', 5);

            // Assert
            expect(cutOffIndex).toBe(3);
        });

        it('should return 0 when nothing fits', () => {
            // Act
            const cutOffIndex = getSteamCutOffIndex('Game', 0);

            // Assert
            expect(cutOffIndex).toBe(0);
        });
    });
});

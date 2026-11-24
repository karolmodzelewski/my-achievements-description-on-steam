import { beforeEach, describe, expect, it, vi } from 'vitest';

import { findGimpConsolePath, runGimpScript } from './gimp.util';
import { runProcess } from './process.util';
import { GIMP_CONSOLE_PATHS, GIMP_SCRIPT_PATH, GIMP_TIMEOUT } from '../constants/wallpaper.constants';
import type { GimpResult } from '../interfaces/gimp-result.interface';

import { existsSync } from 'node:fs';
import { readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';

vi.mock('node:fs', { spy: true });
vi.mock('node:fs/promises', { spy: true });
vi.mock('./process.util', { spy: true });

describe('gimp.util', () => {
    const [userGimpConsolePath, allUsersGimpConsolePath] = GIMP_CONSOLE_PATHS;

    describe('findGimpConsolePath', () => {
        it('should prefer GIMP installed for the current user', () => {
            // Arrange
            vi.mocked(existsSync).mockReturnValue(true);

            // Act
            const gimpConsolePath = findGimpConsolePath();

            // Assert
            expect(gimpConsolePath).toBe(userGimpConsolePath);
        });

        it('should find GIMP installed for all users', () => {
            // Arrange
            vi.mocked(existsSync).mockImplementation((path) => path === allUsersGimpConsolePath);

            // Act
            const gimpConsolePath = findGimpConsolePath();

            // Assert
            expect(gimpConsolePath).toBe(allUsersGimpConsolePath);
        });

        it('should find nothing when GIMP is not installed', () => {
            // Arrange
            vi.mocked(existsSync).mockReturnValue(false);

            // Act
            const gimpConsolePath = findGimpConsolePath();

            // Assert
            expect(gimpConsolePath).toBeNull();
        });
    });

    describe('runGimpScript', () => {
        const gimpConsolePath = 'C:\\GIMP 3\\bin\\gimp-console-3.exe';
        const directory = join('C:', 'wallpaper', 'test');
        const sourcePath = join(directory, 'source.xcf');
        const xcfPath = join(directory, 'wallpaper.tmp.xcf');
        const pngPath = join(directory, 'wallpaper.tmp.png');
        const resultPath = join(directory, 'gimp-result.json');
        const result: GimpResult = { error: 'TEXT_LAYERS', textLayersAmount: 2 };

        beforeEach(() => {
            vi.mocked(runProcess).mockResolvedValue();
            vi.mocked(readFile).mockResolvedValue(JSON.stringify(result));
            vi.mocked(rm).mockResolvedValue();
        });

        it('should run the script in GIMP with the paths and the text in the environment', async () => {
            // Act
            await runGimpScript(gimpConsolePath, sourcePath, xcfPath, pngPath, '10 (8)');

            // Assert
            expect(runProcess).toHaveBeenCalledWith(
                gimpConsolePath,
                ['-i', '--batch-interpreter=python-fu-eval', '-b', `exec(open(r'${GIMP_SCRIPT_PATH}', encoding='utf-8').read())`, '--quit'],
                expect.objectContaining({ WALLPAPER_SOURCE: sourcePath, WALLPAPER_XCF: xcfPath, WALLPAPER_PNG: pngPath, WALLPAPER_TEXT: '10 (8)', WALLPAPER_RESULT: resultPath }),
                GIMP_TIMEOUT
            );
        });

        it('should return the result written by the script', async () => {
            // Act
            const gimpResult = await runGimpScript(gimpConsolePath, sourcePath, xcfPath, pngPath, '10');

            // Assert
            expect(readFile).toHaveBeenCalledWith(resultPath, 'utf8');
            expect(gimpResult).toEqual(result);
        });

        it('should remove the result of the previous run before running GIMP and the read result afterwards', async () => {
            // Act
            await runGimpScript(gimpConsolePath, sourcePath, xcfPath, pngPath, '10');

            // Assert
            expect(rm).toHaveBeenCalledTimes(2);
            expect(rm).toHaveBeenNthCalledWith(1, resultPath, { force: true });
            expect(vi.mocked(rm).mock.invocationCallOrder[0]).toBeLessThan(vi.mocked(runProcess).mock.invocationCallOrder[0]);
            expect(vi.mocked(rm).mock.invocationCallOrder[1]).toBeGreaterThan(vi.mocked(readFile).mock.invocationCallOrder[0]);
        });

        it('should fail when GIMP fails', async () => {
            // Arrange
            vi.mocked(runProcess).mockRejectedValue(new Error('GIMP timed out'));

            // Act
            const gimpResult = runGimpScript(gimpConsolePath, sourcePath, xcfPath, pngPath, '10');

            // Assert
            await expect(gimpResult).rejects.toThrow('GIMP timed out');
        });
    });
});

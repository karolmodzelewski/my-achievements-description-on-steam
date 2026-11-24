import { beforeEach, describe, expect, it, vi } from 'vitest';

import { isDesktopWallpaperSupported, setDesktopWallpaper } from './desktop-wallpaper.util';
import { runProcess } from './process.util';
import { DESKTOP_WALLPAPER_SCRIPT_PATH } from '../constants/wallpaper.constants';

import { release } from 'node:os';

vi.mock('node:os', { spy: true });
vi.mock('./process.util', { spy: true });

describe('desktop-wallpaper.util', () => {
    describe('isDesktopWallpaperSupported', () => {
        it.each([
            { reason: 'Windows 10 and 11', platform: 'win32', osRelease: '10.0.19045', isSupported: true },
            { reason: 'an older Windows', platform: 'win32', osRelease: '6.1.7601', isSupported: false },
            { reason: 'other systems', platform: 'linux', osRelease: '10.0.0', isSupported: false },
        ])('should tell whether $reason are supported', ({ platform, osRelease, isSupported }) => {
            // Arrange
            vi.spyOn(process, 'platform', 'get').mockReturnValue(platform as NodeJS.Platform);
            vi.mocked(release).mockReturnValue(osRelease);

            // Act
            const result = isDesktopWallpaperSupported();

            // Assert
            expect(result).toBe(isSupported);
        });
    });

    describe('setDesktopWallpaper', () => {
        beforeEach(() => {
            vi.mocked(runProcess).mockResolvedValue();
        });

        it('should run the bundled script in PowerShell with the path in the environment', async () => {
            // Act
            await setDesktopWallpaper('C:\\wallpaper\\prod\\wallpaper.png');

            // Assert
            expect(runProcess).toHaveBeenCalledWith(
                'powershell.exe',
                ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', DESKTOP_WALLPAPER_SCRIPT_PATH],
                expect.objectContaining({ MADOS_WALLPAPER_PATH: 'C:\\wallpaper\\prod\\wallpaper.png' })
            );
        });

        it('should fail when the script fails', async () => {
            // Arrange
            vi.mocked(runProcess).mockRejectedValue(new Error('SystemParametersInfo failed'));

            // Act
            const result = setDesktopWallpaper('C:\\wallpaper\\prod\\wallpaper.png');

            // Assert
            await expect(result).rejects.toThrow('SystemParametersInfo failed');
        });
    });
});

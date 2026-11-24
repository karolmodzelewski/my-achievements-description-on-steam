import { runProcess } from './process.util';
import { DESKTOP_WALLPAPER_SCRIPT_PATH } from '../constants/wallpaper.constants';

import { release } from 'node:os';

// Windows 10 and 11 both report version 10
export const isDesktopWallpaperSupported = (): boolean => process.platform === 'win32' && release().startsWith('10.');

// Bypass applies only to this process, so the bundled script runs under any execution policy
export const setDesktopWallpaper = (path: string): Promise<void> =>
    runProcess('powershell.exe', ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', DESKTOP_WALLPAPER_SCRIPT_PATH], { ...process.env, MADOS_WALLPAPER_PATH: path });

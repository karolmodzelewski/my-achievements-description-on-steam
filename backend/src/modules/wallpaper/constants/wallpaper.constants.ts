import { join, resolve } from 'node:path';

// The backend runs from its own folder, the wallpaper folder is next to it in the repository root
export const WALLPAPER_ROOT_DIRECTORY = resolve(process.cwd(), '..', 'wallpaper');
export const WALLPAPER_XCF_EXTENSION = '.xcf';
export const WALLPAPER_XCF_FILE_NAME = `wallpaper${WALLPAPER_XCF_EXTENSION}`;
export const WALLPAPER_PNG_FILE_NAME = 'wallpaper.png';
export const WALLPAPER_MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 MB
export const WALLPAPER_AUTO_UPDATE_DELAY = 5000;
export const DEFAULT_WALLPAPER_PATH = join(WALLPAPER_ROOT_DIRECTORY, 'default', WALLPAPER_XCF_FILE_NAME);
export const DEFAULT_WALLPAPER_DESCRIPTION = 'default XCF';
export const DESKTOP_WALLPAPER_SCRIPT_PATH = resolve(process.cwd(), 'scripts', 'set-desktop-wallpaper.ps1');

export const GIMP_SCRIPT_PATH = resolve(process.cwd(), 'scripts', 'update-xcf-wallpaper.py');
export const GIMP_RESULT_FILE_NAME = 'gimp-result.json';
export const GIMP_TIMEOUT = 5 * 60 * 1000;
// GIMP 3 installed for the current user or for all users
export const GIMP_CONSOLE_PATHS = [
    join(process.env.LOCALAPPDATA ?? '', 'Programs', 'GIMP 3', 'bin', 'gimp-console-3.exe'),
    join(process.env.ProgramFiles ?? 'C:\\Program Files', 'GIMP 3', 'bin', 'gimp-console-3.exe'),
];

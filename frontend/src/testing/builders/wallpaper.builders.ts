import type { WallpaperPng } from '../../app/interfaces/wallpaper-png.interface';
import type { Wallpaper } from '../../app/interfaces/wallpaper.interface';

export const buildWallpaperPng = (overrides: Partial<WallpaperPng> = {}): WallpaperPng => ({
    width: 1920,
    height: 1080,
    size: 2048,
    modifiedAt: 1000,
    ...overrides,
});

export const buildWallpaper = (overrides: Partial<Wallpaper> = {}): Wallpaper => ({
    excludedCategoryId: null,
    isAutoGenerateEnabled: false,
    isDesktopUpdateEnabled: false,
    isGimpInstalled: true,
    canUpdateDesktop: false,
    text: '10',
    png: buildWallpaperPng(),
    isUpdating: false,
    isGenerating: false,
    ...overrides,
});

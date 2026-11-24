import type { WallpaperPng } from './wallpaper-png.interface';
import type { WallpaperSettings } from './wallpaper-settings.interface';

export interface Wallpaper extends WallpaperSettings {
    isGimpInstalled: boolean;
    // Only production on Windows can change the desktop wallpaper
    canUpdateDesktop: boolean;
    text: string | null;
    // Null until the wallpaper is generated
    png: WallpaperPng | null;
    // A generation is scheduled or running, so the wallpaper is about to change
    isUpdating: boolean;
    // A generation is queued or running, during which games, groups and categories can't be changed
    isGenerating: boolean;
}

import { Wallpaper } from '../../entities/wallpaper.entity';
import { WallpaperSettingsDto } from '../../modules/wallpaper/dtos/wallpaper-settings.dto';

export const buildWallpaper = (overrides: Partial<Wallpaper> = {}): Wallpaper =>
    Object.assign(new Wallpaper(), {
        id: 1,
        text: null,
        excludedCategoryId: null,
        isAutoGenerateEnabled: false,
        isDesktopUpdateEnabled: false,
        ...overrides,
    });

export const buildWallpaperSettingsDto = (overrides: Partial<WallpaperSettingsDto> = {}): WallpaperSettingsDto =>
    Object.assign(new WallpaperSettingsDto(), {
        excludedCategoryId: null,
        isAutoGenerateEnabled: false,
        isDesktopUpdateEnabled: false,
        ...overrides,
    });

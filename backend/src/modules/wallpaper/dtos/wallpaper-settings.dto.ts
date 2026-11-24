import { IsBoolean, IsInt, ValidateIf } from 'class-validator';

export class WallpaperSettingsDto {
    // Null when no category is left out
    @ValidateIf((_wallpaperSettingsDto: WallpaperSettingsDto, excludedCategoryId: unknown) => excludedCategoryId !== null)
    @IsInt()
    public excludedCategoryId: number | null;

    @IsBoolean()
    public isAutoGenerateEnabled: boolean;

    @IsBoolean()
    public isDesktopUpdateEnabled: boolean;
}

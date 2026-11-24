export interface WallpaperPng {
    width: number;
    height: number;
    // In bytes
    size: number;
    // In milliseconds since the epoch, changed by every generation, so the PNG is fetched again only then
    modifiedAt: number;
}

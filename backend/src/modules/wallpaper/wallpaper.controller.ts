import { Body, Controller, Get, Header, HttpCode, HttpStatus, Post, Put, StreamableFile, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { WALLPAPER_MAX_FILE_SIZE } from './constants/wallpaper.constants';
import { WallpaperSettingsDto } from './dtos/wallpaper-settings.dto';
import type { UploadedFile as UploadedXcfFile } from './interfaces/uploaded-file.interface';
import type { WallpaperResponse } from './interfaces/wallpaper-response.interface';
import { WallpaperService } from './services/wallpaper.service';

@Controller('wallpaper')
export class WallpaperController {
    constructor(private readonly wallpaperService: WallpaperService) {}

    @Get()
    public getWallpaper(): Promise<WallpaperResponse> {
        return this.wallpaperService.getWallpaper();
    }

    @Get('updated')
    public waitForUpdate(): Promise<WallpaperResponse> {
        return this.wallpaperService.waitForUpdate();
    }

    @Get('png')
    @Header('Content-Type', 'image/png')
    @Header('Cache-Control', 'no-store')
    public getPng(): StreamableFile {
        return this.wallpaperService.getPng();
    }

    @Post('restore')
    @HttpCode(HttpStatus.NO_CONTENT)
    public restoreDefaultWallpaper(): Promise<void> {
        return this.wallpaperService.restoreDefaultWallpaper();
    }

    @Post('generate')
    @HttpCode(HttpStatus.NO_CONTENT)
    public generateWallpaper(): Promise<void> {
        return this.wallpaperService.generateWallpaper();
    }

    @Put('settings')
    @HttpCode(HttpStatus.NO_CONTENT)
    public saveSettings(@Body() wallpaperSettingsDto: WallpaperSettingsDto): Promise<void> {
        return this.wallpaperService.saveSettings(wallpaperSettingsDto);
    }

    @Put('xcf')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseInterceptors(FileInterceptor('file', { limits: { fileSize: WALLPAPER_MAX_FILE_SIZE } }))
    public uploadXcf(@UploadedFile() file: UploadedXcfFile | undefined): Promise<void> {
        return this.wallpaperService.uploadXcf(file);
    }
}

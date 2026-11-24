import { HttpClient, provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { EMPTY } from 'rxjs';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { WallpaperApiService } from './wallpaper-api.service';
import type { WallpaperSettings } from '../../../interfaces/wallpaper-settings.interface';

describe('WallpaperApiService', () => {
    let service: WallpaperApiService;
    let httpClient: HttpClient;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [provideHttpClient(), WallpaperApiService],
        });

        service = TestBed.inject(WallpaperApiService);
        httpClient = TestBed.inject(HttpClient);

        vi.spyOn(httpClient, 'get').mockReturnValue(EMPTY);
        vi.spyOn(httpClient, 'post').mockReturnValue(EMPTY);
        vi.spyOn(httpClient, 'put').mockReturnValue(EMPTY);
    });

    it('should request the wallpaper', () => {
        // Act
        service.getWallpaper().subscribe();

        // Assert
        expect(httpClient.get).toHaveBeenCalledWith('wallpaper');
    });

    it('should request the wallpaper which is answered once it is updated', () => {
        // Act
        service.waitForUpdate().subscribe();

        // Assert
        expect(httpClient.get).toHaveBeenCalledWith('wallpaper/updated');
    });

    it('should request the PNG as a blob', () => {
        // Act
        service.getPng().subscribe();

        // Assert
        expect(httpClient.get).toHaveBeenCalledWith('wallpaper/png', { responseType: 'blob' });
    });

    it('should request restoring the default wallpaper', () => {
        // Act
        service.restoreDefaultWallpaper().subscribe();

        // Assert
        expect(httpClient.post).toHaveBeenCalledWith('wallpaper/restore', null);
    });

    it('should request generating the wallpaper', () => {
        // Act
        service.generateWallpaper().subscribe();

        // Assert
        expect(httpClient.post).toHaveBeenCalledWith('wallpaper/generate', null);
    });

    it('should request saving the settings', () => {
        // Arrange
        const settings: WallpaperSettings = { excludedCategoryId: 3, isAutoGenerateEnabled: true, isDesktopUpdateEnabled: false };

        // Act
        service.saveSettings(settings).subscribe();

        // Assert
        expect(httpClient.put).toHaveBeenCalledWith('wallpaper/settings', settings);
    });

    it('should request uploading the file as form data', () => {
        // Arrange
        const file = new File(['gimp xcf '], 'wallpaper.xcf');

        // Act
        service.uploadXcf(file).subscribe();

        // Assert
        const formData = vi.mocked(httpClient.put).mock.lastCall?.[1] as FormData;

        expect(httpClient.put).toHaveBeenCalledWith('wallpaper/xcf', expect.any(FormData));
        expect(formData.get('file')).toBe(file);
    });
});

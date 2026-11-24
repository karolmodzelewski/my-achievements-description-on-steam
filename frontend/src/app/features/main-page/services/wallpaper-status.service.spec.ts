import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { of, Subject } from 'rxjs';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { WallpaperApiService } from './wallpaper-api.service';
import { WallpaperStatusService } from './wallpaper-status.service';
import type { Wallpaper } from '../../../interfaces/wallpaper.interface';
import { buildWallpaper } from '../../../../testing/builders/wallpaper.builders';
import { spyOnWallpaperApiService } from '../../../../testing/helpers/service-spy.helpers';
import { mockErrorResponse } from '../../../../testing/mocks/error-response.mocks';

describe('WallpaperStatusService', () => {
    let service: WallpaperStatusService;
    let wallpaperApiService: WallpaperApiService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [provideHttpClient(), WallpaperApiService, WallpaperStatusService],
        });

        wallpaperApiService = spyOnWallpaperApiService();

        service = TestBed.inject(WallpaperStatusService);
    });

    it('should create a service', () => {
        // Assert
        expect(service).toBeTruthy();
    });

    it('should not know the wallpaper nor generate it initially', () => {
        // Assert
        expect(service.wallpaper()).toBeNull();
        expect(service.isGenerating()).toBe(false);
        expect(wallpaperApiService.getWallpaper).not.toHaveBeenCalled();
    });

    it('should present the refreshed wallpaper', () => {
        // Arrange
        const wallpaper = buildWallpaper({ text: '12' });

        vi.mocked(wallpaperApiService.getWallpaper).mockReturnValue(of(wallpaper));

        // Act
        service.refreshStatus();

        // Assert
        expect(service.wallpaper()).toEqual(wallpaper);
        expect(wallpaperApiService.waitForUpdate).not.toHaveBeenCalled();
    });

    it('should present the updating wallpaper until it is updated', () => {
        // Arrange
        const updatingWallpaper = buildWallpaper({ isUpdating: true, isGenerating: true });
        const updatedWallpaper = new Subject<Wallpaper>();

        vi.mocked(wallpaperApiService.getWallpaper).mockReturnValue(of(updatingWallpaper));
        vi.mocked(wallpaperApiService.waitForUpdate).mockReturnValue(updatedWallpaper);

        // Act
        service.refreshStatus();

        // Assert
        expect(service.wallpaper()).toEqual(updatingWallpaper);
        expect(service.isGenerating()).toBe(true);
    });

    it('should present the wallpaper the backend answers with once it is updated', () => {
        // Arrange
        const updatedWallpaper = buildWallpaper({ text: '13' });

        vi.mocked(wallpaperApiService.getWallpaper).mockReturnValue(of(buildWallpaper({ isUpdating: true, isGenerating: true })));
        vi.mocked(wallpaperApiService.waitForUpdate).mockReturnValue(of(updatedWallpaper));

        // Act
        service.refreshStatus();

        // Assert
        expect(service.wallpaper()).toEqual(updatedWallpaper);
        expect(service.isGenerating()).toBe(false);
    });

    it('should stop waiting for the previous update when the status is refreshed again', () => {
        // Arrange
        const latestWallpaper = buildWallpaper({ text: '14' });

        vi.mocked(wallpaperApiService.getWallpaper)
            .mockReturnValueOnce(of(buildWallpaper({ isUpdating: true })))
            .mockReturnValueOnce(of(latestWallpaper));
        vi.mocked(wallpaperApiService.waitForUpdate).mockReturnValue(new Subject<Wallpaper>());

        // Act
        service.refreshStatus();
        service.refreshStatus();

        // Assert
        expect(service.wallpaper()).toEqual(latestWallpaper);
    });

    it('should forget the status which could not be loaded', () => {
        // Arrange
        vi.mocked(wallpaperApiService.getWallpaper)
            .mockReturnValueOnce(of(buildWallpaper({ isGenerating: true })))
            .mockReturnValueOnce(mockErrorResponse());
        service.refreshStatus();

        // Act
        service.refreshStatus();

        // Assert
        expect(service.wallpaper()).toBeNull();
        expect(service.isGenerating()).toBe(false);
    });

    it('should keep refreshing the status after it could not be loaded', () => {
        // Arrange
        const wallpaper = buildWallpaper({ text: '15' });

        vi.mocked(wallpaperApiService.getWallpaper).mockReturnValueOnce(mockErrorResponse()).mockReturnValueOnce(of(wallpaper));
        service.refreshStatus();

        // Act
        service.refreshStatus();

        // Assert
        expect(service.wallpaper()).toEqual(wallpaper);
    });

    it('should be generating while the section generates the wallpaper', () => {
        // Act
        service.setGeneratingInSection(true);

        // Assert
        expect(service.isGenerating()).toBe(true);
    });

    it('should stop generating once the section is done', () => {
        // Arrange
        service.setGeneratingInSection(true);

        // Act
        service.setGeneratingInSection(false);

        // Assert
        expect(service.isGenerating()).toBe(false);
    });
});

import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import type { Observable } from 'rxjs';

import type { WallpaperSettings } from '../../../interfaces/wallpaper-settings.interface';
import type { Wallpaper } from '../../../interfaces/wallpaper.interface';

@Injectable()
export class WallpaperApiService {
    private readonly httpClient = inject(HttpClient);

    public getWallpaper(): Observable<Wallpaper> {
        return this.httpClient.get<Wallpaper>('wallpaper');
    }

    // Answered by the backend only once the wallpaper updated in the background is generated
    public waitForUpdate(): Observable<Wallpaper> {
        return this.httpClient.get<Wallpaper>('wallpaper/updated');
    }

    public getPng(): Observable<Blob> {
        return this.httpClient.get('wallpaper/png', { responseType: 'blob' });
    }

    public restoreDefaultWallpaper(): Observable<void> {
        return this.httpClient.post<void>('wallpaper/restore', null);
    }

    public generateWallpaper(): Observable<void> {
        return this.httpClient.post<void>('wallpaper/generate', null);
    }

    public saveSettings(settings: WallpaperSettings): Observable<void> {
        return this.httpClient.put<void>('wallpaper/settings', settings);
    }

    public uploadXcf(file: File): Observable<void> {
        const formData = new FormData();

        formData.append('file', file);

        return this.httpClient.put<void>('wallpaper/xcf', formData);
    }
}

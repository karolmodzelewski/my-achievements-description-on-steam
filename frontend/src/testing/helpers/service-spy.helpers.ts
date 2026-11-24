import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Clipboard } from '@angular/cdk/clipboard';
import { ViewportScroller } from '@angular/common';
import { TestBed } from '@angular/core/testing';

import { of } from 'rxjs';

import { vi } from 'vitest';

import { ConfirmationService } from '../../app/components/confirmation/confirmation.service';
import { SnackbarService } from '../../app/components/snackbar/snackbar.service';
import { CategoriesApiService } from '../../app/features/main-page/services/categories-api.service';
import { DescriptionApiService } from '../../app/features/main-page/services/description-api.service';
import { GameApiService } from '../../app/features/main-page/services/game-api.service';
import { WallpaperApiService } from '../../app/features/main-page/services/wallpaper-api.service';
import { buildDescriptionResponseBody } from '../builders/description.builders';
import { buildWallpaper } from '../builders/wallpaper.builders';

export const spyOnCategoriesApiService = (): CategoriesApiService => {
    const categoriesApiService = TestBed.inject(CategoriesApiService);

    vi.spyOn(categoriesApiService, 'getCategories').mockReturnValue(of([]));
    vi.spyOn(categoriesApiService, 'saveCategories').mockReturnValue(of(undefined));

    return categoriesApiService;
};

export const spyOnDescriptionApiService = (): DescriptionApiService => {
    const descriptionApiService = TestBed.inject(DescriptionApiService);

    vi.spyOn(descriptionApiService, 'getDescription').mockReturnValue(of(buildDescriptionResponseBody()));

    return descriptionApiService;
};

export const spyOnGameApiService = (): GameApiService => {
    const gameApiService = TestBed.inject(GameApiService);

    vi.spyOn(gameApiService, 'addGame').mockReturnValue(of(undefined));
    vi.spyOn(gameApiService, 'editGame').mockReturnValue(of(undefined));
    vi.spyOn(gameApiService, 'deleteGame').mockReturnValue(of(undefined));
    vi.spyOn(gameApiService, 'deleteGroup').mockReturnValue(of(undefined));

    return gameApiService;
};

export const spyOnWallpaperApiService = (): WallpaperApiService => {
    const wallpaperApiService = TestBed.inject(WallpaperApiService);

    vi.spyOn(wallpaperApiService, 'getWallpaper').mockImplementation(() => of(buildWallpaper()));
    vi.spyOn(wallpaperApiService, 'waitForUpdate').mockImplementation(() => of(buildWallpaper()));
    vi.spyOn(wallpaperApiService, 'getPng').mockImplementation(() => of(new Blob(['png'], { type: 'image/png' })));
    vi.spyOn(wallpaperApiService, 'saveSettings').mockReturnValue(of(undefined));
    vi.spyOn(wallpaperApiService, 'uploadXcf').mockReturnValue(of(undefined));
    vi.spyOn(wallpaperApiService, 'restoreDefaultWallpaper').mockReturnValue(of(undefined));
    vi.spyOn(wallpaperApiService, 'generateWallpaper').mockReturnValue(of(undefined));

    return wallpaperApiService;
};

export const spyOnSnackbarService = (): SnackbarService => {
    const snackbarService = TestBed.inject(SnackbarService);

    vi.spyOn(snackbarService, 'openSnackbar').mockImplementation(() => undefined);

    return snackbarService;
};

export const spyOnConfirmationService = (): ConfirmationService => {
    const confirmationService = TestBed.inject(ConfirmationService);

    vi.spyOn(confirmationService, 'openConfirmation').mockReturnValue(of(true));

    return confirmationService;
};

export const spyOnViewportScroller = (): ViewportScroller => {
    const viewportScroller = TestBed.inject(ViewportScroller);

    vi.spyOn(viewportScroller, 'scrollToAnchor').mockImplementation(() => undefined);

    return viewportScroller;
};

export const spyOnLiveAnnouncer = (): LiveAnnouncer => {
    const liveAnnouncer = TestBed.inject(LiveAnnouncer);

    vi.spyOn(liveAnnouncer, 'announce').mockResolvedValue();

    return liveAnnouncer;
};

export const spyOnClipboard = (): Clipboard => {
    const clipboard = TestBed.inject(Clipboard);

    vi.spyOn(clipboard, 'copy').mockReturnValue(true);

    return clipboard;
};

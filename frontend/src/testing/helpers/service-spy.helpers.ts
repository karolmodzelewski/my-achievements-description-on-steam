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
import { buildDescriptionResponseBody } from '../builders/description.builders';

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

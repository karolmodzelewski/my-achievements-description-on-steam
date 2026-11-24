import { provideHttpClient } from '@angular/common/http';
import type { DebugElement } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { beforeEach, describe, expect, it } from 'vitest';

import type { WallpaperFormComponent } from './components/wallpaper-form/wallpaper-form.component';
import { ManageWallpaperComponent } from './manage-wallpaper.component';
import { WallpaperApiService } from '../../services/wallpaper-api.service';
import { WallpaperStatusService } from '../../services/wallpaper-status.service';
import { ConfirmationService } from '../../../../components/confirmation/confirmation.service';
import { SnackbarService } from '../../../../components/snackbar/snackbar.service';
import { CategoryKind } from '../../../../enums/category-kind.enum';
import { buildCategory } from '../../../../../testing/builders/category.builders';
import { clickByTestId, getTextByTestId, queryByTestId } from '../../../../../testing/helpers/dom.helpers';
import { spyOnViewportScroller, spyOnWallpaperApiService } from '../../../../../testing/helpers/service-spy.helpers';

describe('ManageWallpaperComponent', () => {
    let component: ManageWallpaperComponent;
    let fixture: ComponentFixture<ManageWallpaperComponent>;
    let debugElement: DebugElement;
    let wallpaperApiService: WallpaperApiService;

    const mainCategories = [buildCategory({ id: 1 })];
    const lengthCategories = [buildCategory({ id: 2, kind: CategoryKind.LENGTH, name: 'Short' })];
    const difficultyCategories = [buildCategory({ id: 3, kind: CategoryKind.DIFFICULTY, name: 'Hard' })];

    beforeEach(async () => {
        TestBed.configureTestingModule({
            imports: [ManageWallpaperComponent],
            providers: [provideHttpClient(), WallpaperApiService, WallpaperStatusService, SnackbarService, ConfirmationService],
        });

        spyOnViewportScroller();

        wallpaperApiService = spyOnWallpaperApiService();
        fixture = TestBed.createComponent(ManageWallpaperComponent);
        component = fixture.componentInstance;
        debugElement = fixture.debugElement;

        fixture.componentRef.setInput('mainCategories', mainCategories);
        fixture.componentRef.setInput('lengthCategories', lengthCategories);
        fixture.componentRef.setInput('difficultyCategories', difficultyCategories);

        await fixture.whenStable();
    });

    it('should create a component', () => {
        // Assert
        expect(component).toBeTruthy();
    });

    it('should present the heading of the section', () => {
        // Assert
        expect(getTextByTestId(debugElement, 'expandableSectionHeading')).toBe('Manage wallpaper');
    });

    it('should neither present nor load the wallpaper before the section is expanded', () => {
        // Assert
        expect(queryByTestId(debugElement, 'wallpaperForm')).toBeNull();
        expect(wallpaperApiService.getWallpaper).not.toHaveBeenCalled();
    });

    it('should present the wallpaper form with the categories after expanding the section', async () => {
        // Act
        await clickByTestId(fixture, 'bottomExpansionButton');

        // Assert
        const wallpaperForm = queryByTestId(debugElement, 'wallpaperForm')?.componentInstance as WallpaperFormComponent;

        expect(wallpaperForm.mainCategories()).toBe(mainCategories);
        expect(wallpaperForm.lengthCategories()).toBe(lengthCategories);
        expect(wallpaperForm.difficultyCategories()).toBe(difficultyCategories);
        expect(wallpaperApiService.getWallpaper).toHaveBeenCalledOnce();
    });
});

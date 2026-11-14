import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { beforeEach, describe, expect, it } from 'vitest';

import { MainPageComponent } from './main-page.component';
import { EditGameService } from './services/edit-game.service';
import { ConfirmationService } from '../../components/confirmation/confirmation.service';
import { SnackbarService } from '../../components/snackbar/snackbar.service';

describe('MainPageComponent', () => {
    let component: MainPageComponent;
    let fixture: ComponentFixture<MainPageComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [MainPageComponent],
            providers: [provideHttpClient(), provideHttpClientTesting(), EditGameService, SnackbarService, ConfirmationService],
        });

        fixture = TestBed.createComponent(MainPageComponent);
        component = fixture.componentInstance;

        // whenStable would wait for the categories and description requests, which are never flushed by HttpTestingController
        fixture.detectChanges();
    });

    it('Should create a component', () => {
        // Assert
        expect(component, 'Component should be created').toBeTruthy();
    });
});

import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { SnackbarData } from './interfaces/snackbar-data.interface';
import { SnackbarComponent } from './snackbar.component';

describe('SnackbarComponent', () => {
    let component: SnackbarComponent;
    let fixture: ComponentFixture<SnackbarComponent>;

    beforeEach(async () => {
        const data: SnackbarData = { snackbarMessage: 'Snackbar message' };

        await TestBed.configureTestingModule({
            imports: [SnackbarComponent],
            providers: [
                { provide: MAT_SNACK_BAR_DATA, useValue: data },
                { provide: MatSnackBarRef, useValue: { dismiss: vi.fn() } },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(SnackbarComponent);
        component = fixture.componentInstance;

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

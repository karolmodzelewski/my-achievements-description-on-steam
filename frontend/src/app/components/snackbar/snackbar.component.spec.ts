import type { DebugElement } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';

import type { Mock } from 'vitest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { SnackbarData } from './interfaces/snackbar-data.interface';
import { SnackbarComponent } from './snackbar.component';
import { clickByTestId, getTextByTestId } from '../../../testing/helpers/dom.helpers';

describe('SnackbarComponent', () => {
    let component: SnackbarComponent;
    let fixture: ComponentFixture<SnackbarComponent>;
    let debugElement: DebugElement;
    let dismissMock: Mock<() => void>;

    beforeEach(async () => {
        const data = { snackbarMessage: 'Snackbar message' } satisfies SnackbarData;

        dismissMock = vi.fn();

        TestBed.configureTestingModule({
            imports: [SnackbarComponent],
            providers: [
                { provide: MAT_SNACK_BAR_DATA, useValue: data },
                { provide: MatSnackBarRef, useValue: { dismiss: dismissMock } },
            ],
        });

        fixture = TestBed.createComponent(SnackbarComponent);
        component = fixture.componentInstance;
        debugElement = fixture.debugElement;

        await fixture.whenStable();
    });

    it('should create a component', () => {
        // Assert
        expect(component).toBeTruthy();
    });

    it('should present the given message', () => {
        // Assert
        expect(getTextByTestId(debugElement, 'snackbarMessage')).toBe('Snackbar message');
    });

    it('should dismiss the snackbar after clicking the close button', async () => {
        // Act
        await clickByTestId(fixture, 'snackbarCloseButton');

        // Assert
        expect(dismissMock).toHaveBeenCalledTimes(1);
    });
});

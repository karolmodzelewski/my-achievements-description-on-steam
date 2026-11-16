import type { DebugElement } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import type { Mock } from 'vitest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ConfirmationComponent } from './confirmation.component';
import type { ConfirmationData } from './interfaces/confirmation-data.interface';
import { clickByTestId, getTextByTestId } from '../../../testing/helpers/dom.helpers';

describe('ConfirmationComponent', () => {
    let fixture: ComponentFixture<ConfirmationComponent>;
    let debugElement: DebugElement;
    let closeMock: Mock<(isConfirmed: boolean) => void>;

    beforeEach(async () => {
        const data: ConfirmationData = { title: 'Delete game', questionStart: 'Do you want to delete', identifier: 'Game', questionEnd: '?' };

        closeMock = vi.fn();

        TestBed.configureTestingModule({
            imports: [ConfirmationComponent],
            providers: [
                { provide: MAT_DIALOG_DATA, useValue: data },
                { provide: MatDialogRef, useValue: { close: closeMock } },
            ],
        });

        fixture = TestBed.createComponent(ConfirmationComponent);
        debugElement = fixture.debugElement;

        await fixture.whenStable();
    });

    it('should present the given title and question', () => {
        // Assert
        expect(getTextByTestId(debugElement, 'confirmationTitle')).toBe('Delete game');
        expect(getTextByTestId(debugElement, 'confirmationMessage')).toBe('Do you want to delete Game?');
    });

    it('should close with confirmation after clicking the yes button', async () => {
        // Act
        await clickByTestId(fixture, 'confirmationYesButton');

        // Assert
        expect(closeMock).toHaveBeenCalledWith(true);
    });

    it('should close without confirmation after clicking the no button', async () => {
        // Act
        await clickByTestId(fixture, 'confirmationNoButton');

        // Assert
        expect(closeMock).toHaveBeenCalledWith(false);
    });

    it('should close without confirmation after clicking the close button', async () => {
        // Act
        await clickByTestId(fixture, 'confirmationCloseButton');

        // Assert
        expect(closeMock).toHaveBeenCalledWith(false);
    });
});

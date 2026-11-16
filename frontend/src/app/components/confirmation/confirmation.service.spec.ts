import { TestBed } from '@angular/core/testing';
import type { MatDialogRef } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';

import { firstValueFrom, of } from 'rxjs';

import type { MockInstance } from 'vitest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ConfirmationComponent } from './confirmation.component';
import { ConfirmationService } from './confirmation.service';
import { CONFIRMATION_MESSAGE_ID } from './constants/confirmation.constants';
import type { ConfirmationData } from './interfaces/confirmation-data.interface';

describe('ConfirmationService', () => {
    let service: ConfirmationService;
    let openSpy: MockInstance<MatDialog['open']>;

    const data: ConfirmationData = { title: 'Delete game', questionStart: 'Do you want to delete', identifier: 'Game', questionEnd: '?' };

    const mockClosingValue = (closingValue: boolean | undefined): void => {
        openSpy.mockReturnValue({ afterClosed: () => of(closingValue) } as MatDialogRef<unknown>);
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [ConfirmationService],
        });

        service = TestBed.inject(ConfirmationService);
        openSpy = vi.spyOn(TestBed.inject(MatDialog), 'open');
        mockClosingValue(true);
    });

    it('should open the confirmation dialog described by its message', async () => {
        // Act
        await firstValueFrom(service.openConfirmation(data));

        // Assert
        expect(openSpy).toHaveBeenCalledWith(ConfirmationComponent, expect.objectContaining({ data, role: 'alertdialog', ariaDescribedBy: CONFIRMATION_MESSAGE_ID }));
    });

    it('should be confirmed when the dialog is closed with confirmation', async () => {
        // Act
        const isConfirmed = await firstValueFrom(service.openConfirmation(data));

        // Assert
        expect(isConfirmed).toBe(true);
    });

    it('should not be confirmed when the dialog is closed with cancellation', async () => {
        // Arrange
        mockClosingValue(false);

        // Act
        const isConfirmed = await firstValueFrom(service.openConfirmation(data));

        // Assert
        expect(isConfirmed).toBe(false);
    });

    it('should not be confirmed when the dialog is closed by clicking the backdrop', async () => {
        // Arrange
        mockClosingValue(undefined);

        // Act
        const isConfirmed = await firstValueFrom(service.openConfirmation(data));

        // Assert
        expect(isConfirmed).toBe(false);
    });
});

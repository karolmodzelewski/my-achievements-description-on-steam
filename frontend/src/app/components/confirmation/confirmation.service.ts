import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import type { Observable } from 'rxjs';
import { map } from 'rxjs';

import { ConfirmationComponent } from './confirmation.component';
import { CONFIRMATION_MESSAGE_ID } from './constants/confirmation.constants';
import type { ConfirmationData } from './interfaces/confirmation-data.interface';

@Injectable()
export class ConfirmationService {
    private readonly matDialog = inject(MatDialog);

    public openConfirmation(data: ConfirmationData): Observable<boolean> {
        return this.matDialog
            .open<ConfirmationComponent, ConfirmationData, boolean>(ConfirmationComponent, {
                data,
                role: 'alertdialog',
                ariaDescribedBy: CONFIRMATION_MESSAGE_ID,
                width: '450px',
                // Keeps the same 20px side gutter as the page wrapper on mobile
                maxWidth: 'calc(100vw - 40px)',
                panelClass: 'confirmation-dialog',
                backdropClass: 'confirmation-backdrop',
            })
            .afterClosed()
            .pipe(map((isConfirmed) => isConfirmed === true)); // Closing by clicking the backdrop returns undefined
    }
}

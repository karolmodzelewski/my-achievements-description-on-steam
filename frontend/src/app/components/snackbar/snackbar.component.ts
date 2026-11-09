import { Component, inject } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';

import type { SnackbarData } from './interfaces/snackbar-data.interface';

@Component({
    selector: 'mados-snackbar',
    templateUrl: './snackbar.component.html',
    styleUrl: './snackbar.component.scss',
    imports: [MatIconButton, MatIcon],
})
export class SnackbarComponent {
    private readonly data = inject<SnackbarData>(MAT_SNACK_BAR_DATA);
    private readonly matSnackBarRef = inject<MatSnackBarRef<SnackbarComponent>>(MatSnackBarRef);

    public readonly snackbarMessage = this.data.snackbarMessage;

    public closeSnackbar(): void {
        this.matSnackBarRef.dismiss();
    }
}

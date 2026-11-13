import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import { SnackbarType } from './enums/snackbar-type.enum';
import type { SnackbarData } from './interfaces/snackbar-data.interface';
import { SnackbarComponent } from './snackbar.component';

@Injectable()
export class SnackbarService {
    private readonly matSnackBar = inject(MatSnackBar);

    public openSnackbar(snackbarMessage: string, snackbarType: SnackbarType): void {
        this.matSnackBar.openFromComponent(SnackbarComponent, {
            duration: snackbarType === SnackbarType.ERROR ? undefined : 6000,
            panelClass: snackbarType,
            data: { snackbarMessage } satisfies SnackbarData,
        });
    }
}

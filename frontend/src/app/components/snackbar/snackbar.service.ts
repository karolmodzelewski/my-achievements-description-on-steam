import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import { SnackbarComponent } from './snackbar.component';
import type { SnackbarData } from './interfaces/snackbar-data.interface';

@Injectable()
export class SnackbarService {
    private readonly matSnackBar: MatSnackBar = inject(MatSnackBar);

    public openSnackbar(snackbarMessage: string, panelClass: string): void {
        const data: SnackbarData = { snackbarMessage };

        this.matSnackBar.openFromComponent(SnackbarComponent, {
            duration: 3000,
            panelClass,
            data,
        });
    }
}

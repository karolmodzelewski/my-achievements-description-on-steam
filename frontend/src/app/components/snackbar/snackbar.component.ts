import type { OnInit } from '@angular/core';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';

import type { SnackbarData } from './interfaces/snackbar-data.interface';

@Component({
    selector: 'mados-snackbar',
    templateUrl: './snackbar.component.html',
    styleUrl: './snackbar.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatIconModule],
})
export class SnackbarComponent implements OnInit {
    private readonly data: SnackbarData = inject<SnackbarData>(MAT_SNACK_BAR_DATA);
    private readonly matSnackBarRef: MatSnackBarRef<SnackbarComponent> = inject<MatSnackBarRef<SnackbarComponent>>(MatSnackBarRef);

    public snackbarMessage: string;

    public ngOnInit(): void {
        this.snackbarMessage = this.data.snackbarMessage;
    }

    public closeSnackbar(): void {
        this.matSnackBarRef.dismiss();
    }
}

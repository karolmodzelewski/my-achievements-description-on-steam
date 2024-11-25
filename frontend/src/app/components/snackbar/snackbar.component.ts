import { Component, Inject, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarRef, MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

import { SnackbarData } from './interfaces/snackbar-data.interface';

@Component({
  selector: 'mados-snackbar',
  templateUrl: './snackbar.component.html',
  styleUrls: ['./snackbar.component.scss'],
  standalone: true,
  imports: [MatIconModule],
})
export class SnackbarComponent implements OnInit {
    public snackbarMessage: string;

    constructor(
        @Inject(MAT_SNACK_BAR_DATA) private data: SnackbarData,
        private matSnackBarRef: MatSnackBarRef<SnackbarComponent>,
    ) { }

    public ngOnInit(): void {
        this.snackbarMessage = this.data.snackbarMessage;
    }

    public closeSnackbar(): void {
        this.matSnackBarRef.dismiss();
    }
}

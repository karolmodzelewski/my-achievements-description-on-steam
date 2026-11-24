import { Component, inject } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';

import { TranslocoPipe } from '@jsverse/transloco';

import { CONFIRMATION_MESSAGE_ID } from './constants/confirmation.constants';
import type { ConfirmationData } from './interfaces/confirmation-data.interface';

@Component({
    selector: 'mados-confirmation',
    templateUrl: './confirmation.component.html',
    styleUrl: './confirmation.component.scss',
    imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatButton, MatIconButton, MatIcon, TranslocoPipe],
})
export class ConfirmationComponent {
    private readonly data = inject<ConfirmationData>(MAT_DIALOG_DATA);
    private readonly matDialogRef = inject<MatDialogRef<ConfirmationComponent, boolean>>(MatDialogRef);

    public readonly messageId = CONFIRMATION_MESSAGE_ID;
    public readonly title = this.data.title;
    public readonly questionStart = this.data.questionStart;
    public readonly identifier = this.data.identifier;
    public readonly questionEnd = this.data.questionEnd;

    public cancelAction(): void {
        this.matDialogRef.close(false);
    }

    public confirmAction(): void {
        this.matDialogRef.close(true);
    }
}

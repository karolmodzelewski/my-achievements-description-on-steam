import { Component, input, output, signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

import { TranslocoPipe } from '@jsverse/transloco';

@Component({
    selector: 'mados-file-drop-zone',
    templateUrl: './file-drop-zone.component.html',
    styleUrl: './file-drop-zone.component.scss',
    imports: [MatButton, MatIcon, TranslocoPipe],
})
export class FileDropZoneComponent {
    public readonly hintId = input.required<string>();
    public readonly accept = input.required<string>();
    public readonly buttonText = input.required<string>();
    public readonly hintText = input.required<string>();
    public readonly isDisabled = input<boolean>(false);

    public readonly fileSelected = output<File>();
    public readonly fileRejected = output();

    public readonly isDragging = signal<boolean>(false);

    public handleDragOver(event: DragEvent): void {
        if (this.isDisabled()) {
            return;
        }

        event.preventDefault();
        this.isDragging.set(true);
    }

    public handleDrop(event: DragEvent): void {
        event.preventDefault();
        this.isDragging.set(false);

        const file = event.dataTransfer?.files.item(0);

        if (this.isDisabled() || !file) {
            return;
        }

        this.selectFile(file);
    }

    public openFilePicker(fileInput: HTMLInputElement): void {
        fileInput.click();
    }

    public handleInputChange(fileInput: HTMLInputElement): void {
        const file = fileInput.files?.item(0);

        fileInput.value = '';

        if (!file) {
            return;
        }

        this.selectFile(file);
    }

    private selectFile(file: File): void {
        if (!this.isAccepted(file)) {
            this.fileRejected.emit();

            return;
        }

        this.fileSelected.emit(file);
    }

    private isAccepted(file: File): boolean {
        const fileName = file.name.toLowerCase();

        return this.accept()
            .split(',')
            .some((extension) => fileName.endsWith(extension.trim().toLowerCase()));
    }
}

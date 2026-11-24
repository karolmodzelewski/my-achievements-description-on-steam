import type { DebugElement } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import type { Mock } from 'vitest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { FileDropZoneComponent } from './file-drop-zone.component';
import { clickByTestId, emitByTestId, getElementByTestId, getTextByTestId } from '../../../testing/helpers/dom.helpers';

describe('FileDropZoneComponent', () => {
    let component: FileDropZoneComponent;
    let fixture: ComponentFixture<FileDropZoneComponent>;
    let debugElement: DebugElement;
    let fileSelectedMock: Mock<(file: File) => void>;
    let fileRejectedMock: Mock<() => void>;

    const xcfFile = new File(['gimp xcf '], 'wallpaper.xcf');
    const pngFile = new File(['png'], 'wallpaper.png');

    const buildFileList = (files: File[]): FileList => Object.assign(files, { item: (index: number): File | null => files.at(index) ?? null });

    const buildDragEvent = (files: File[] = []): DragEvent => ({ preventDefault: vi.fn(), dataTransfer: { files: buildFileList(files) } }) as unknown as DragEvent;

    const chooseFiles = async (files: File[]): Promise<void> => {
        const fileInput = getElementByTestId<HTMLInputElement>(debugElement, 'fileDropZoneInput');

        Object.defineProperty(fileInput, 'files', { value: buildFileList(files), configurable: true });
        fileInput.dispatchEvent(new Event('change'));
        await fixture.whenStable();
    };

    const isButtonDisabled = (): boolean => getElementByTestId<HTMLButtonElement>(debugElement, 'fileDropZoneButton').disabled;

    beforeEach(async () => {
        TestBed.configureTestingModule({
            imports: [FileDropZoneComponent],
        });

        fileSelectedMock = vi.fn();
        fileRejectedMock = vi.fn();

        fixture = TestBed.createComponent(FileDropZoneComponent);
        component = fixture.componentInstance;
        debugElement = fixture.debugElement;

        component.fileSelected.subscribe(fileSelectedMock);
        component.fileRejected.subscribe(fileRejectedMock);
        fixture.componentRef.setInput('hintId', 'wallpaperDropHint');
        fixture.componentRef.setInput('accept', '.xcf');
        fixture.componentRef.setInput('buttonText', 'Choose XCF file');
        fixture.componentRef.setInput('hintText', 'Drop an .xcf file here or choose it');

        await fixture.whenStable();
    });

    it('should create a component', () => {
        // Assert
        expect(component).toBeTruthy();
    });

    it('should present the hint describing the button', () => {
        // Assert
        const hint = getElementByTestId(debugElement, 'fileDropZoneHint');

        expect(hint.textContent.trim()).toBe('Drop an .xcf file here or choose it');
        expect(hint.id).toBe('wallpaperDropHint');
        expect(getElementByTestId(debugElement, 'fileDropZoneButton').getAttribute('aria-describedby')).toBe('wallpaperDropHint');
        expect(getTextByTestId(debugElement, 'fileDropZoneButton')).toBe('Choose XCF file');
    });

    it('should limit the files offered by the picker to the accepted ones', () => {
        // Assert
        expect(getElementByTestId<HTMLInputElement>(debugElement, 'fileDropZoneInput').accept).toBe('.xcf');
    });

    it('should open the file picker after clicking the button', async () => {
        // Arrange
        const fileInput = getElementByTestId<HTMLInputElement>(debugElement, 'fileDropZoneInput');

        vi.spyOn(fileInput, 'click').mockImplementation(() => undefined);

        // Act
        await clickByTestId(fixture, 'fileDropZoneButton');

        // Assert
        expect(fileInput.click).toHaveBeenCalledOnce();
    });

    it('should select the chosen file', async () => {
        // Act
        await chooseFiles([xcfFile]);

        // Assert
        expect(fileSelectedMock).toHaveBeenCalledExactlyOnceWith(xcfFile);
        expect(fileRejectedMock).not.toHaveBeenCalled();
    });

    it('should reject the chosen file of another type', async () => {
        // Act
        await chooseFiles([pngFile]);

        // Assert
        expect(fileRejectedMock).toHaveBeenCalledOnce();
        expect(fileSelectedMock).not.toHaveBeenCalled();
    });

    it('should accept a file of any listed type regardless of the case', async () => {
        // Arrange
        const upperCasePngFile = new File(['png'], 'WALLPAPER.PNG');

        fixture.componentRef.setInput('accept', '.xcf, .png');
        await fixture.whenStable();

        // Act
        await chooseFiles([upperCasePngFile]);

        // Assert
        expect(fileSelectedMock).toHaveBeenCalledExactlyOnceWith(upperCasePngFile);
    });

    it('should do nothing when the picker is closed without a file', async () => {
        // Act
        await chooseFiles([]);

        // Assert
        expect(fileSelectedMock).not.toHaveBeenCalled();
        expect(fileRejectedMock).not.toHaveBeenCalled();
    });

    it('should ask to drop the file while it is dragged over', async () => {
        // Arrange
        const dragEvent = buildDragEvent();

        // Act
        await emitByTestId(fixture, 'fileDropZone', 'dragover', dragEvent);

        // Assert
        expect(dragEvent.preventDefault).toHaveBeenCalledOnce();
        expect(getTextByTestId(debugElement, 'fileDropZoneHint')).toBe('Drop the file here');
    });

    it('should present the hint again once the file is dragged away', async () => {
        // Arrange
        await emitByTestId(fixture, 'fileDropZone', 'dragover', buildDragEvent());

        // Act
        await emitByTestId(fixture, 'fileDropZone', 'dragleave');

        // Assert
        expect(getTextByTestId(debugElement, 'fileDropZoneHint')).toBe('Drop an .xcf file here or choose it');
    });

    it('should select the first dropped file and present the hint again', async () => {
        // Arrange
        await emitByTestId(fixture, 'fileDropZone', 'dragover', buildDragEvent());

        // Act
        await emitByTestId(fixture, 'fileDropZone', 'drop', buildDragEvent([xcfFile, pngFile]));

        // Assert
        expect(fileSelectedMock).toHaveBeenCalledExactlyOnceWith(xcfFile);
        expect(getTextByTestId(debugElement, 'fileDropZoneHint')).toBe('Drop an .xcf file here or choose it');
    });

    it('should reject the dropped file of another type', async () => {
        // Act
        await emitByTestId(fixture, 'fileDropZone', 'drop', buildDragEvent([pngFile]));

        // Assert
        expect(fileRejectedMock).toHaveBeenCalledOnce();
        expect(fileSelectedMock).not.toHaveBeenCalled();
    });

    describe('when disabled', () => {
        beforeEach(async () => {
            fixture.componentRef.setInput('isDisabled', true);

            await fixture.whenStable();
        });

        it('should disable the button', () => {
            // Assert
            expect(isButtonDisabled()).toBe(true);
        });

        it('should not let the file be dropped', async () => {
            // Arrange
            const dragEvent = buildDragEvent();

            // Act
            await emitByTestId(fixture, 'fileDropZone', 'dragover', dragEvent);

            // Assert
            expect(dragEvent.preventDefault).not.toHaveBeenCalled();
            expect(getTextByTestId(debugElement, 'fileDropZoneHint')).toBe('Drop an .xcf file here or choose it');
        });

        it('should ignore the dropped file', async () => {
            // Act
            await emitByTestId(fixture, 'fileDropZone', 'drop', buildDragEvent([xcfFile]));

            // Assert
            expect(fileSelectedMock).not.toHaveBeenCalled();
            expect(fileRejectedMock).not.toHaveBeenCalled();
        });
    });
});

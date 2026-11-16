import type { DebugElement } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { beforeEach, describe, expect, it } from 'vitest';

import { CutOffTextComponent } from './cut-off-text.component';
import { getTextByTestId, queryByTestId } from '../../../../../../../testing/helpers/dom.helpers';

describe('CutOffTextComponent', () => {
    let fixture: ComponentFixture<CutOffTextComponent>;
    let debugElement: DebugElement;

    const text = 'Game name';

    beforeEach(async () => {
        TestBed.configureTestingModule({
            imports: [CutOffTextComponent],
        });

        fixture = TestBed.createComponent(CutOffTextComponent);
        debugElement = fixture.debugElement;

        fixture.componentRef.setInput('text', text);

        await fixture.whenStable();
    });

    it('should present the whole text without cutting it off when there is no cut off index', () => {
        // Assert
        expect((fixture.nativeElement as HTMLElement).textContent.trim()).toBe(text);
        expect(queryByTestId(debugElement, 'cutOffText')).toBeNull();
    });

    it('should present the text from the cut off index as cut off', async () => {
        // Arrange
        fixture.componentRef.setInput('cutOffIndex', 4);

        // Act
        await fixture.whenStable();

        // Assert
        expect((fixture.nativeElement as HTMLElement).textContent.trim()).toMatch(/^Game name/);
        expect(getTextByTestId(debugElement, 'cutOffText')).toBe('name');
    });

    it('should present the whole text as cut off when the cut off index is 0', async () => {
        // Arrange
        fixture.componentRef.setInput('cutOffIndex', 0);

        // Act
        await fixture.whenStable();

        // Assert
        expect(getTextByTestId(debugElement, 'cutOffText')).toBe(text);
    });
});

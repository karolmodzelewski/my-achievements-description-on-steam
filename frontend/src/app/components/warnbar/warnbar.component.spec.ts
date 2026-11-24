import type { DebugElement } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { beforeEach, describe, expect, it } from 'vitest';

import { WarnbarComponent } from './warnbar.component';
import { getTextByTestId } from '../../../testing/helpers/dom.helpers';

describe('WarnbarComponent', () => {
    let component: WarnbarComponent;
    let fixture: ComponentFixture<WarnbarComponent>;
    let debugElement: DebugElement;

    beforeEach(async () => {
        TestBed.configureTestingModule({
            imports: [WarnbarComponent],
        });

        fixture = TestBed.createComponent(WarnbarComponent);
        component = fixture.componentInstance;
        debugElement = fixture.debugElement;

        fixture.componentRef.setInput('message', '');

        await fixture.whenStable();
    });

    it('should create a component', () => {
        // Assert
        expect(component).toBeTruthy();
    });

    it('should present the given message', async () => {
        // Arrange
        const testMessage = 'GIMP 3 has to be installed';

        fixture.componentRef.setInput('message', testMessage);

        // Act
        await fixture.whenStable();

        // Assert
        expect(getTextByTestId(debugElement, 'warnbarMessage')).toBe(testMessage);
    });
});

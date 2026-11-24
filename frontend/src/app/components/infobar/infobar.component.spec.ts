import type { DebugElement } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { beforeEach, describe, expect, it } from 'vitest';

import { InfobarComponent } from './infobar.component';
import { getTextsByTestId, queryAllByTestId } from '../../../testing/helpers/dom.helpers';

describe('InfobarComponent', () => {
    let component: InfobarComponent;
    let fixture: ComponentFixture<InfobarComponent>;
    let debugElement: DebugElement;

    beforeEach(async () => {
        TestBed.configureTestingModule({
            imports: [InfobarComponent],
        });

        fixture = TestBed.createComponent(InfobarComponent);
        component = fixture.componentInstance;
        debugElement = fixture.debugElement;

        fixture.componentRef.setInput('message', '');

        await fixture.whenStable();
    });

    it('should create a component', () => {
        // Assert
        expect(component).toBeTruthy();
    });

    it(`should render 1 'mat-icon' component`, () => {
        // Assert
        expect(queryAllByTestId(debugElement, 'infobarIcon').length).toEqual(1);
    });

    it(`should render paragraph with given message`, async () => {
        // Arrange
        const message = 'Some test message';

        fixture.componentRef.setInput('message', message);

        // Act
        await fixture.whenStable();

        // Assert
        expect(getTextsByTestId(debugElement, 'infobarMessage')).toEqual([message]);
    });
});

import type { DebugElement } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { beforeEach, describe, expect, it } from 'vitest';

import { WrapperFixtureComponent } from './fixtures/wrapper-fixture.component';
import { WrapperComponent } from './wrapper.component';
import { getTextByTestId, queryByTestId } from '../../../testing/helpers/dom.helpers';

describe('WrapperComponent', () => {
    let component: WrapperComponent;
    let fixture: ComponentFixture<WrapperComponent>;
    let debugElement: DebugElement;

    beforeEach(async () => {
        TestBed.configureTestingModule({
            imports: [WrapperComponent, WrapperFixtureComponent],
        });

        fixture = TestBed.createComponent(WrapperComponent);
        component = fixture.componentInstance;
        debugElement = fixture.debugElement;

        await fixture.whenStable();
    });

    it('should create a component', () => {
        // Assert
        expect(component).toBeTruthy();
    });

    it('should have wrapper container', () => {
        // Assert
        expect(queryByTestId(debugElement, 'wrapper')).toBeTruthy();
    });

    it('should show ng-content content', async () => {
        // Arrange
        const componentFixture = TestBed.createComponent(WrapperFixtureComponent);

        // Act
        await componentFixture.whenStable();

        // Assert
        expect(getTextByTestId(componentFixture.debugElement, 'wrapperHost')).toEqual('Test');
    });
});

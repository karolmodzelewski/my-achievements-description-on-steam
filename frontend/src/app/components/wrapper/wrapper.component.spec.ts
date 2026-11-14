import type { DebugElement } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { beforeEach, describe, expect, it } from 'vitest';

import { WrapperFixtureComponent } from './fixtures/wrapper-fixture.component';
import { WrapperComponent } from './wrapper.component';

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

    it('Should create a component', () => {
        // Assert
        expect(component, 'Component should be created').toBeTruthy();
    });

    it('Should have wrapper container', () => {
        // Assert
        const wrapper = debugElement.query(By.css('[data-testId="wrapper"]'));

        expect(wrapper, 'There should be a wrapper container').toBeTruthy();
    });

    it('Should show ng-content content', async () => {
        // Arrange
        const componentFixture = TestBed.createComponent(WrapperFixtureComponent);

        // Act
        await componentFixture.whenStable();

        // Assert
        const wrapperFixtureComponent = componentFixture.debugElement.query(By.css('[data-testId="wrapperHost"]'));

        expect((wrapperFixtureComponent.nativeElement as HTMLElement).textContent, `Should show a text from 'TestComponent' inside a mados-wrapper`).toEqual('Test');
    });
});

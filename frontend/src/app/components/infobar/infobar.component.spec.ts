import type { DebugElement } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { beforeEach, describe, expect, it } from 'vitest';

import { InfobarComponent } from './infobar.component';

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

    it('Should create a component', () => {
        // Assert
        expect(component, 'Component should be created').toBeTruthy();
    });

    it(`Should render 1 'mat-icon' component`, () => {
        // Assert
        const components = debugElement.queryAll(By.css('[data-testId="infobarIcon"]'));

        expect(components.length, `Should be only 1 'mat-icon' component`).toEqual(1);
    });

    it(`Should render paragraph with given message`, async () => {
        // Arrange
        const message = 'Some test message';

        fixture.componentRef.setInput('message', message);

        // Act
        await fixture.whenStable();

        // Assert
        const paragraphs = debugElement.queryAll(By.css('[data-testId="infobarMessage"]'));

        expect(paragraphs.length, `Should be only 1 'message' paragraph`).toEqual(1);
        expect((paragraphs[0].nativeElement as HTMLElement).textContent, `Should contain given 'message' text`).toEqual(message);
    });
});

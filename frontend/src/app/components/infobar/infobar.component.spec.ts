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
        await TestBed.configureTestingModule({
            imports: [InfobarComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(InfobarComponent);
        component = fixture.componentInstance;
        debugElement = fixture.debugElement;
        fixture.componentRef.setInput('message', '');

        fixture.detectChanges();
    });

    it('Should create a component', () => {
        expect(component, 'Component should be created').toBeTruthy();
    });

    it(`Should render 1 'mat-icon' component`, () => {
        const components: DebugElement[] = debugElement.queryAll(By.css('mat-icon'));

        expect(components.length, `Should be only 1 'mat-icon' component`).toEqual(1);
    });

    it(`Should render paragraph with given message`, () => {
        const message: string = 'Some test message';

        fixture.componentRef.setInput('message', message);
        fixture.detectChanges();

        const paragraphs: DebugElement[] = debugElement.queryAll(By.css('p.message'));

        expect(paragraphs.length, `Should be only 1 'message' paragraph`).toEqual(1);
        expect((paragraphs[0].nativeElement as HTMLElement).textContent, `Should contain given 'message' text`).toEqual(message);
    });
});

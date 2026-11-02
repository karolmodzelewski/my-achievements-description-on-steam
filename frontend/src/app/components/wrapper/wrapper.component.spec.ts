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
        await TestBed.configureTestingModule({
            imports: [WrapperComponent, WrapperFixtureComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(WrapperComponent);
        component = fixture.componentInstance;
        debugElement = fixture.debugElement;

        fixture.detectChanges();
    });

    it('Should create a component', () => {
        expect(component, 'Component should be created').toBeTruthy();
    });

    it('Should have wrapper container', () => {
        const wrapper: DebugElement = debugElement.query(By.css('.wrapper'));

        expect(wrapper, 'There should be a wrapper container').toBeTruthy();
    });

    it('Should show ng-content content', () => {
        const componentFixture: ComponentFixture<WrapperFixtureComponent> = TestBed.createComponent(WrapperFixtureComponent);

        componentFixture.detectChanges();

        const wrapperFixtureComponent: DebugElement = componentFixture.debugElement.query(By.css('mados-wrapper'));

        expect((wrapperFixtureComponent.nativeElement as HTMLElement).textContent, `Should show a text from 'TestComponent' inside a mados-wrapper`).toEqual('Test');
    });
});

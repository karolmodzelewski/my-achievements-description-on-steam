import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { WrapperComponent } from './wrapper.component';
import { WrapperFixtureComponent } from './fixtures/wrapper-fixture.component';

describe('WrapperComponent', () => {
    let component: WrapperComponent;
    let fixture: ComponentFixture<WrapperComponent>;
    let debugElement: DebugElement;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [WrapperComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(WrapperComponent);
        component = fixture.componentInstance;
        debugElement = fixture.debugElement;

        fixture.detectChanges();
    }));

    it('Should create a component', () => {
        expect(component).withContext('Component should be created').toBeTruthy();
    });

    it('Should have wrapper container', () => {
        const wrapper: DebugElement = debugElement.query(By.css('.wrapper'));

        expect(wrapper).withContext('There should be a wrapper container').toBeTruthy();
    });

    it('Should show ng-content content', () => {
        const componentFixture: ComponentFixture<WrapperFixtureComponent> = TestBed.createComponent(WrapperFixtureComponent);
        const wrapperFixtureComponent: DebugElement = componentFixture.debugElement.query(By.css('mados-wrapper'));

        expect(wrapperFixtureComponent.nativeElement.textContent).withContext(`Should show a text from 'TestComponent' inside a mados-wrapper`).toEqual('Test');
    });
});

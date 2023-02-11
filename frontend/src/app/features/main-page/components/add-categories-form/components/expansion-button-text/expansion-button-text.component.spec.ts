import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ExpansionButtonTextComponent } from './expansion-button-text.component';

describe('ExpansionButtonTextComponent', () => {
    let component: ExpansionButtonTextComponent;
    let fixture: ComponentFixture<ExpansionButtonTextComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [ExpansionButtonTextComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(ExpansionButtonTextComponent);
        component = fixture.componentInstance;

        fixture.detectChanges();
    }));

    it('Should create a component', () => {
        expect(component).withContext('Component should be created').toBeTruthy();
    });
});

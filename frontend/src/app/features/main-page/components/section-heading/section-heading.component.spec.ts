import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SectionHeadingComponent } from './section-heading.component';

describe('SectionHeadingComponent', () => {
    let component: SectionHeadingComponent;
    let fixture: ComponentFixture<SectionHeadingComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [SectionHeadingComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(SectionHeadingComponent);
        component = fixture.componentInstance;

        fixture.detectChanges();
    }));

    it('Should create a component', () => {
        expect(component).withContext('Component should be created').toBeTruthy();
    });
});

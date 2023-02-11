import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AddCategoriesFormComponent } from './add-categories-form.component';

describe('AddCategoriesFormComponent', () => {
    let component: AddCategoriesFormComponent;
    let fixture: ComponentFixture<AddCategoriesFormComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [AddCategoriesFormComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(AddCategoriesFormComponent);
        component = fixture.componentInstance;

        fixture.detectChanges();
    }));

    it('Should create a component', () => {
        expect(component).withContext('Component should be created').toBeTruthy();
    });
});

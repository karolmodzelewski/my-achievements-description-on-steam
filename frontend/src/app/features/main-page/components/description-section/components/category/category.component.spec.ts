import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CategoryComponent } from './category.component';

describe('CategoryComponent', () => {
    let component: CategoryComponent;
    let fixture: ComponentFixture<CategoryComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [CategoryComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(CategoryComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('Should create a component', () => {
        expect(component).withContext('Component should be created').toBeTruthy();
    });
});

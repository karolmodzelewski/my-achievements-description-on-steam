import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CategoryTypeTranslationComponent } from './category-type-translation.component';

describe('CategoryTypeTranslationComponent', () => {
    let component: CategoryTypeTranslationComponent;
    let fixture: ComponentFixture<CategoryTypeTranslationComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [CategoryTypeTranslationComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(CategoryTypeTranslationComponent);
        component = fixture.componentInstance;

        fixture.detectChanges();
    }));

    it('Should create a component', () => {
        expect(component).withContext('Component should be created').toBeTruthy();
    });
});

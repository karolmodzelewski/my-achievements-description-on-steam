import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CategoryTypeTranslationHeadingComponent } from './category-type-translation-heading.component';

describe('CategoryTypeTranslationHeadingComponent', () => {
    let component: CategoryTypeTranslationHeadingComponent;
    let fixture: ComponentFixture<CategoryTypeTranslationHeadingComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [CategoryTypeTranslationHeadingComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(CategoryTypeTranslationHeadingComponent);
        component = fixture.componentInstance;

        fixture.detectChanges();
    }));

    it('Should create a component', () => {
        expect(component).withContext('Component should be created').toBeTruthy();
    });
});

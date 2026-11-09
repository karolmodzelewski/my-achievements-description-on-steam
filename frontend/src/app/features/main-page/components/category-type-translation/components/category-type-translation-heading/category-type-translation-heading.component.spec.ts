import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { beforeEach, describe, expect, it } from 'vitest';

import { CategoryTypeTranslationHeadingComponent } from './category-type-translation-heading.component';

describe('CategoryTypeTranslationHeadingComponent', () => {
    let component: CategoryTypeTranslationHeadingComponent;
    let fixture: ComponentFixture<CategoryTypeTranslationHeadingComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [CategoryTypeTranslationHeadingComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(CategoryTypeTranslationHeadingComponent);
        component = fixture.componentInstance;
        fixture.componentRef.setInput('headingText', 'Long game:');

        fixture.detectChanges();
    });

    it('Should create a component', () => {
        // Assert
        expect(component, 'Component should be created').toBeTruthy();
    });
});

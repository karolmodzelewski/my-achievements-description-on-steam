import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { beforeEach, describe, expect, it } from 'vitest';

import { CategoryTypeTranslationComponent } from './category-type-translation.component';
import { CategoryType } from '../../../../enums/category-type.enum';

describe('CategoryTypeTranslationComponent', () => {
    let component: CategoryTypeTranslationComponent;
    let fixture: ComponentFixture<CategoryTypeTranslationComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [CategoryTypeTranslationComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(CategoryTypeTranslationComponent);
        component = fixture.componentInstance;
        fixture.componentRef.setInput('key', CategoryType.LONG_GAME);

        fixture.detectChanges();
    });

    it('Should create a component', () => {
        // Assert
        expect(component, 'Component should be created').toBeTruthy();
    });
});

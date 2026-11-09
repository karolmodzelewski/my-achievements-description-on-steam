import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { beforeEach, describe, expect, it } from 'vitest';

import { CategoryComponent } from './category.component';
import { CategoryType } from '../../../../../../enums/category-type.enum';

describe('CategoryComponent', () => {
    let component: CategoryComponent;
    let fixture: ComponentFixture<CategoryComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [CategoryComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(CategoryComponent);
        component = fixture.componentInstance;
        fixture.componentRef.setInput('type', CategoryType.LONG_GAME);
        fixture.componentRef.setInput('iconName', 'icon');
        fixture.componentRef.setInput('description', 'Long game');

        fixture.detectChanges();
    });

    it('Should create a component', () => {
        // Assert
        expect(component, 'Component should be created').toBeTruthy();
    });
});

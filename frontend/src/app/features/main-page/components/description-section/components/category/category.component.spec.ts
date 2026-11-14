import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { beforeEach, describe, expect, it } from 'vitest';

import { CategoryComponent } from './category.component';

describe('CategoryComponent', () => {
    let component: CategoryComponent;
    let fixture: ComponentFixture<CategoryComponent>;

    beforeEach(async () => {
        TestBed.configureTestingModule({
            imports: [CategoryComponent],
        });

        fixture = TestBed.createComponent(CategoryComponent);
        component = fixture.componentInstance;
        fixture.componentRef.setInput('iconName', 'icon');
        fixture.componentRef.setInput('description', 'Long game');

        await fixture.whenStable();
    });

    it('Should create a component', () => {
        // Assert
        expect(component, 'Component should be created').toBeTruthy();
    });
});

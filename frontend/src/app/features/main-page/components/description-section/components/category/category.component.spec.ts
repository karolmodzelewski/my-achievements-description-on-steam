import type { DebugElement } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { beforeEach, describe, expect, it } from 'vitest';

import { CategoryComponent } from './category.component';
import { getTextByTestId, queryByTestId } from '../../../../../../../testing/helpers/dom.helpers';

describe('CategoryComponent', () => {
    let component: CategoryComponent;
    let fixture: ComponentFixture<CategoryComponent>;
    let debugElement: DebugElement;

    beforeEach(async () => {
        TestBed.configureTestingModule({
            imports: [CategoryComponent],
        });

        fixture = TestBed.createComponent(CategoryComponent);
        component = fixture.componentInstance;
        debugElement = fixture.debugElement;

        fixture.componentRef.setInput('iconName', 'icon');
        fixture.componentRef.setInput('description', 'Long game');
        fixture.componentRef.setInput('amount', 2);

        await fixture.whenStable();
    });

    it('should create a component', () => {
        // Assert
        expect(component).toBeTruthy();
    });

    it('should present the icon, the description and the amount of games', () => {
        // Assert
        expect(getTextByTestId(debugElement, 'categoryLine')).toBe('icon Long game (2)');
        expect(queryByTestId(debugElement, 'categoryNotCopied')).toBeNull();
    });

    it('should present a category without description', async () => {
        // Arrange
        fixture.componentRef.setInput('description', null);

        // Act
        await fixture.whenStable();

        // Assert
        expect(getTextByTestId(debugElement, 'categoryLine')).toBe('icon (2)');
    });

    it('should present 0 games when the amount is not given', async () => {
        // Arrange
        fixture.componentRef.setInput('amount', undefined);

        // Act
        await fixture.whenStable();

        // Assert
        expect(getTextByTestId(debugElement, 'categoryLine')).toBe('icon Long game (0)');
    });

    it('should mark a category without games as not copied', async () => {
        // Arrange
        fixture.componentRef.setInput('amount', 0);

        // Act
        await fixture.whenStable();

        // Assert
        expect(queryByTestId(debugElement, 'categoryNotCopied')).not.toBeNull();
    });
});

import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { beforeEach, describe, expect, it } from 'vitest';

import { ExpansionButtonTextComponent } from './expansion-button-text.component';

describe('ExpansionButtonTextComponent', () => {
    let component: ExpansionButtonTextComponent;
    let fixture: ComponentFixture<ExpansionButtonTextComponent>;

    beforeEach(async () => {
        TestBed.configureTestingModule({
            imports: [ExpansionButtonTextComponent],
        });

        fixture = TestBed.createComponent(ExpansionButtonTextComponent);
        component = fixture.componentInstance;
        fixture.componentRef.setInput('buttonText', 'Expand');
        fixture.componentRef.setInput('iconName', 'expand_more');

        await fixture.whenStable();
    });

    it('Should create a component', () => {
        // Assert
        expect(component, 'Component should be created').toBeTruthy();
    });
});

import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { beforeEach, describe, expect, it } from 'vitest';

import { ExpansionButtonTextComponent } from './expansion-button-text.component';

describe('ExpansionButtonTextComponent', () => {
    let component: ExpansionButtonTextComponent;
    let fixture: ComponentFixture<ExpansionButtonTextComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ExpansionButtonTextComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(ExpansionButtonTextComponent);
        component = fixture.componentInstance;
        fixture.componentRef.setInput('buttonText', 'Expand');
        fixture.componentRef.setInput('iconName', 'expand_more');

        fixture.detectChanges();
    });

    it('Should create a component', () => {
        expect(component, 'Component should be created').toBeTruthy();
    });
});

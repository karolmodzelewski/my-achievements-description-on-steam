import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { beforeEach, describe, expect, it } from 'vitest';

import { SectionHeadingComponent } from './section-heading.component';

describe('SectionHeadingComponent', () => {
    let component: SectionHeadingComponent;
    let fixture: ComponentFixture<SectionHeadingComponent>;

    beforeEach(async () => {
        TestBed.configureTestingModule({
            imports: [SectionHeadingComponent],
        });

        fixture = TestBed.createComponent(SectionHeadingComponent);
        component = fixture.componentInstance;
        fixture.componentRef.setInput('headingText', 'Heading');

        await fixture.whenStable();
    });

    it('Should create a component', () => {
        // Assert
        expect(component, 'Component should be created').toBeTruthy();
    });
});

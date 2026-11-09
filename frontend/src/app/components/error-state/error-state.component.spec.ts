import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { beforeEach, describe, expect, it } from 'vitest';

import { ErrorStateComponent } from './error-state.component';

describe('ErrorStateComponent', () => {
    let component: ErrorStateComponent;
    let fixture: ComponentFixture<ErrorStateComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ErrorStateComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(ErrorStateComponent);
        component = fixture.componentInstance;

        fixture.detectChanges();
    });

    it('should create', () => {
        // Assert
        expect(component, 'Component should be created').toBeTruthy();
    });
});

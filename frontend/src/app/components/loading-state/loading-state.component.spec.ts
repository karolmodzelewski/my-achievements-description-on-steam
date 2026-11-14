import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { beforeEach, describe, expect, it } from 'vitest';

import { LoadingStateComponent } from './loading-state.component';

describe('LoadingStateComponent', () => {
    let component: LoadingStateComponent;
    let fixture: ComponentFixture<LoadingStateComponent>;

    beforeEach(async () => {
        TestBed.configureTestingModule({
            imports: [LoadingStateComponent],
        });

        fixture = TestBed.createComponent(LoadingStateComponent);
        component = fixture.componentInstance;

        await fixture.whenStable();
    });

    it('should create', () => {
        // Assert
        expect(component, 'Component should be created').toBeTruthy();
    });
});

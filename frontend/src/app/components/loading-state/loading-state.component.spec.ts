import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LoadingStateComponent } from './loading-state.component';

describe('LoadingStateComponent', () => {
    let component: LoadingStateComponent;
    let fixture: ComponentFixture<LoadingStateComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [LoadingStateComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(LoadingStateComponent);
        component = fixture.componentInstance;

        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

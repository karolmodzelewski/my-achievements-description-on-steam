import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { beforeEach, describe, expect, it } from 'vitest';

import { AddCategoriesFormComponent } from './add-categories-form.component';
import { SnackbarService } from '../../../../components/snackbar/snackbar.service';

describe('AddCategoriesFormComponent', () => {
    let component: AddCategoriesFormComponent;
    let fixture: ComponentFixture<AddCategoriesFormComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AddCategoriesFormComponent],
            providers: [provideHttpClient(), provideHttpClientTesting(), SnackbarService],
        }).compileComponents();

        fixture = TestBed.createComponent(AddCategoriesFormComponent);
        component = fixture.componentInstance;
        fixture.componentRef.setInput('categories', []);

        fixture.detectChanges();
    });

    it('Should create a component', () => {
        expect(component, 'Component should be created').toBeTruthy();
    });
});

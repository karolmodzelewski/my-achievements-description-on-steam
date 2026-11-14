import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { beforeEach, describe, expect, it } from 'vitest';

import { AddCategoriesFormComponent } from './add-categories-form.component';
import { ConfirmationService } from '../../../../components/confirmation/confirmation.service';
import { SnackbarService } from '../../../../components/snackbar/snackbar.service';

describe('AddCategoriesFormComponent', () => {
    let component: AddCategoriesFormComponent;
    let fixture: ComponentFixture<AddCategoriesFormComponent>;

    beforeEach(async () => {
        TestBed.configureTestingModule({
            imports: [AddCategoriesFormComponent],
            providers: [provideHttpClient(), provideHttpClientTesting(), SnackbarService, ConfirmationService],
        });

        fixture = TestBed.createComponent(AddCategoriesFormComponent);
        component = fixture.componentInstance;
        fixture.componentRef.setInput('oneHundredPercentCategory', null);
        fixture.componentRef.setInput('mainCategories', []);
        fixture.componentRef.setInput('lengthCategories', []);
        fixture.componentRef.setInput('difficultyCategories', []);

        await fixture.whenStable();
    });

    it('Should create a component', () => {
        // Assert
        expect(component, 'Component should be created').toBeTruthy();
    });
});

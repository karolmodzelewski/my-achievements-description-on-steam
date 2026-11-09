import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { beforeEach, describe, expect, it } from 'vitest';

import { DescriptionSectionComponent } from './description-section.component';
import { SnackbarService } from '../../../../components/snackbar/snackbar.service';
import type { DescriptionResponseBody } from '../../../../interfaces/description-response-body.interface';

describe('DescriptionSectionComponent', () => {
    let component: DescriptionSectionComponent;
    let fixture: ComponentFixture<DescriptionSectionComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [DescriptionSectionComponent],
            providers: [SnackbarService],
        }).compileComponents();

        fixture = TestBed.createComponent(DescriptionSectionComponent);
        component = fixture.componentInstance;
        fixture.componentRef.setInput('descriptionData', { categories: [], completedGames: [], gamesWithNewAchievements: [] } satisfies DescriptionResponseBody);

        fixture.detectChanges();
    });

    it('Should create a component', () => {
        // Assert
        expect(component, 'Component should be created').toBeTruthy();
    });
});

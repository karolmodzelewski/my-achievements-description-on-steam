import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { beforeEach, describe, expect, it } from 'vitest';

import { DescriptionSectionComponent } from './description-section.component';

describe('DescriptionSectionComponent', () => {
    let component: DescriptionSectionComponent;
    let fixture: ComponentFixture<DescriptionSectionComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [DescriptionSectionComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(DescriptionSectionComponent);
        component = fixture.componentInstance;
        fixture.componentRef.setInput('descriptionData', { categories: [], completedGames: [], gamesWithNewAchievements: [] });

        fixture.detectChanges();
    });

    it('Should create a component', () => {
        expect(component, 'Component should be created').toBeTruthy();
    });
});

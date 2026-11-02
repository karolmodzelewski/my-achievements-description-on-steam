import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { beforeEach, describe, expect, it } from 'vitest';

import { AddGameFormComponent } from './add-game-form.component';
import { EditGameService } from '../../services/edit-game.service';
import { SnackbarService } from '../../../../components/snackbar/snackbar.service';

describe('AddGameFormComponent', () => {
    let component: AddGameFormComponent;
    let fixture: ComponentFixture<AddGameFormComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AddGameFormComponent],
            providers: [provideHttpClient(), provideHttpClientTesting(), EditGameService, SnackbarService],
        }).compileComponents();

        fixture = TestBed.createComponent(AddGameFormComponent);
        component = fixture.componentInstance;
        fixture.componentRef.setInput('description', { categories: [], completedGames: [], gamesWithNewAchievements: [] });

        fixture.detectChanges();
    });

    it('Should create a component', () => {
        expect(component, 'Component should be created').toBeTruthy();
    });
});

import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { beforeEach, describe, expect, it } from 'vitest';

import { GameComponent } from './game.component';
import { EditGameService } from '../../../../services/edit-game.service';
import { ConfirmationService } from '../../../../../../components/confirmation/confirmation.service';
import { SnackbarService } from '../../../../../../components/snackbar/snackbar.service';
import type { DescriptionEntry } from '../../../../../../interfaces/description-entry.interface';

describe('GameComponent', () => {
    let component: GameComponent;
    let fixture: ComponentFixture<GameComponent>;

    beforeEach(async () => {
        TestBed.configureTestingModule({
            imports: [GameComponent],
            providers: [provideHttpClient(), provideHttpClientTesting(), EditGameService, SnackbarService, ConfirmationService],
        });

        fixture = TestBed.createComponent(GameComponent);
        component = fixture.componentInstance;
        fixture.componentRef.setInput('entry', {
            game: { id: 1, name: 'Game', oneHundredPercentIconName: 'icon', hasNewAchievements: false, groups: [] },
            group: null,
            listedGroups: [],
        } satisfies DescriptionEntry);
        fixture.componentRef.setInput('shouldShowEdition', false);

        await fixture.whenStable();
    });

    it('Should create a component', () => {
        // Assert
        expect(component, 'Component should be created').toBeTruthy();
    });
});

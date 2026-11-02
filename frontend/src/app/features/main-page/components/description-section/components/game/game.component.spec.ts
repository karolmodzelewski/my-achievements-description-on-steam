import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { beforeEach, describe, expect, it } from 'vitest';

import { GameComponent } from './game.component';
import { EditGameService } from '../../../../services/edit-game.service';
import { SnackbarService } from '../../../../../../components/snackbar/snackbar.service';

describe('GameComponent', () => {
    let component: GameComponent;
    let fixture: ComponentFixture<GameComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [GameComponent],
            providers: [provideHttpClient(), provideHttpClientTesting(), EditGameService, SnackbarService],
        }).compileComponents();

        fixture = TestBed.createComponent(GameComponent);
        component = fixture.componentInstance;
        fixture.componentRef.setInput('oneHundredPercentIconName', 'icon');
        fixture.componentRef.setInput('name', 'Game');
        fixture.componentRef.setInput('shouldShowEdition', false);

        fixture.detectChanges();
    });

    it('Should create a component', () => {
        expect(component, 'Component should be created').toBeTruthy();
    });
});

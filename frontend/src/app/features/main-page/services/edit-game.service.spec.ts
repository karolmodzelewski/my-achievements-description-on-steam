import { TestBed } from '@angular/core/testing';

import { beforeEach, describe, expect, it } from 'vitest';

import { EditGameService } from './edit-game.service';

describe('EditGameService', () => {
    let service: EditGameService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [EditGameService],
        });

        service = TestBed.inject(EditGameService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});

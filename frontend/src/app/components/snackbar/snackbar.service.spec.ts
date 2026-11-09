import { TestBed } from '@angular/core/testing';

import { beforeEach, describe, expect, it } from 'vitest';

import { SnackbarService } from './snackbar.service';

describe('SnackbarService', () => {
    let service: SnackbarService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [SnackbarService],
        });

        service = TestBed.inject(SnackbarService);
    });

    it('should be created', () => {
        // Assert
        expect(service).toBeTruthy();
    });
});

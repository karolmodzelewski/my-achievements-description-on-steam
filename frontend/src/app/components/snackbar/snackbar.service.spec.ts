import { TestBed } from '@angular/core/testing';
import type { MatSnackBarRef } from '@angular/material/snack-bar';
import { MatSnackBar } from '@angular/material/snack-bar';

import type { MockInstance } from 'vitest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SnackbarType } from './enums/snackbar-type.enum';
import { SnackbarComponent } from './snackbar.component';
import { SnackbarService } from './snackbar.service';

describe('SnackbarService', () => {
    let service: SnackbarService;
    let openFromComponentSpy: MockInstance<MatSnackBar['openFromComponent']>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [SnackbarService],
        });

        service = TestBed.inject(SnackbarService);
        openFromComponentSpy = vi.spyOn(TestBed.inject(MatSnackBar), 'openFromComponent').mockReturnValue({} as MatSnackBarRef<unknown>);
    });

    it('should create a service', () => {
        // Assert
        expect(service).toBeTruthy();
    });

    it('should open a success snackbar closing itself after 6 seconds', () => {
        // Act
        service.openSnackbar('Saved', SnackbarType.SUCCESS);

        // Assert
        expect(openFromComponentSpy).toHaveBeenCalledWith(SnackbarComponent, { duration: 6000, panelClass: SnackbarType.SUCCESS, data: { snackbarMessage: 'Saved' } });
    });

    it('should open an error snackbar staying until it is closed', () => {
        // Act
        service.openSnackbar('Failed', SnackbarType.ERROR);

        // Assert
        expect(openFromComponentSpy).toHaveBeenCalledWith(SnackbarComponent, { duration: undefined, panelClass: SnackbarType.ERROR, data: { snackbarMessage: 'Failed' } });
    });
});

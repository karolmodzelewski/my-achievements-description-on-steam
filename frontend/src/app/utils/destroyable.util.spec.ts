import { TestBed } from '@angular/core/testing';

import { Subject } from 'rxjs';

import { Destroyable } from './destroyable.util';

describe('Destroyable', () => {
    let destroyable: Destroyable;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [Destroyable],
        });

        destroyable = TestBed.inject(Destroyable);
    });

    it('Should create a destroyable', () => {
        expect(destroyable).withContext('Destroyable should be created').toBeTruthy();
    });

    it('Should complete a Subject', () => {
        destroyable.destroyed$ = new Subject<void>();

        spyOn(destroyable.destroyed$, 'next');
        spyOn(destroyable.destroyed$, 'complete');

        destroyable.ngOnDestroy();

        expect(destroyable.destroyed$.next).toHaveBeenCalled();
        expect(destroyable.destroyed$.complete).toHaveBeenCalled();
    });
});

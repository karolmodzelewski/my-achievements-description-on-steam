import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { Subject } from 'rxjs';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Destroyable } from './destroyable.util';

@Injectable()
class TestDestroyable extends Destroyable {}

describe('Destroyable', () => {
    let destroyable: Destroyable;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [TestDestroyable],
        });

        destroyable = TestBed.inject(TestDestroyable);
    });

    it('Should create a destroyable', () => {
        expect(destroyable, 'Destroyable should be created').toBeTruthy();
    });

    it('Should complete a Subject', () => {
        destroyable.destroyed$ = new Subject<void>();

        const nextSpy = vi.spyOn(destroyable.destroyed$, 'next').mockReturnValue(undefined);
        const completeSpy = vi.spyOn(destroyable.destroyed$, 'complete').mockReturnValue(undefined);

        destroyable.ngOnDestroy();

        expect(nextSpy).toHaveBeenCalled();
        expect(completeSpy).toHaveBeenCalled();
    });
});

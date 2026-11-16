import type { ComponentHarness, ComponentHarnessConstructor } from '@angular/cdk/testing';
import { HarnessPredicate } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import type { ComponentFixture } from '@angular/core/testing';

import { getTestIdSelector } from './dom.helpers';

const getTestIdPredicate = <T extends ComponentHarness>(harnessType: ComponentHarnessConstructor<T>, testId: string): HarnessPredicate<T> =>
    new HarnessPredicate(harnessType, { selector: getTestIdSelector(testId) });

// Material controls are driven through their harnesses, still found by the data-testId of their host element.
// The document root loader also reaches overlays, e.g. options of an opened select
export const getHarnessByTestId = async <T extends ComponentHarness>(fixture: ComponentFixture<unknown>, harnessType: ComponentHarnessConstructor<T>, testId: string): Promise<T> =>
    TestbedHarnessEnvironment.documentRootLoader(fixture).getHarness(getTestIdPredicate(harnessType, testId));

export const getAllHarnessesByTestId = async <T extends ComponentHarness>(fixture: ComponentFixture<unknown>, harnessType: ComponentHarnessConstructor<T>, testId: string): Promise<T[]> =>
    TestbedHarnessEnvironment.documentRootLoader(fixture).getAllHarnesses(getTestIdPredicate(harnessType, testId));

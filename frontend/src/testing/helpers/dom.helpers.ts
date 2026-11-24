import type { DebugElement } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

const getByTestId = (debugElement: DebugElement, testId: string, index = 0): DebugElement => {
    const foundDebugElement = queryByTestId(debugElement, testId, index);

    if (!foundDebugElement) {
        throw new Error(`There is no element with data-testId="${testId}" at index ${index}`);
    }

    return foundDebugElement;
};

export const getTestIdSelector = (testId: string): string => `[data-testId="${testId}"]`;

export const queryAllByTestId = (debugElement: DebugElement, testId: string): DebugElement[] => debugElement.queryAll(By.css(getTestIdSelector(testId)));

export const queryByTestId = (debugElement: DebugElement, testId: string, index = 0): DebugElement | null => queryAllByTestId(debugElement, testId).at(index) ?? null;

export const getElementByTestId = <T extends HTMLElement = HTMLElement>(debugElement: DebugElement, testId: string, index = 0): T => getByTestId(debugElement, testId, index).nativeElement as T;

export const getTextByTestId = (debugElement: DebugElement, testId: string, index = 0): string => getElementByTestId(debugElement, testId, index).textContent.trim();

export const getTextsByTestId = (debugElement: DebugElement, testId: string): string[] =>
    queryAllByTestId(debugElement, testId).map((foundDebugElement) => (foundDebugElement.nativeElement as HTMLElement).textContent.trim());

export const getInputValuesByTestId = (debugElement: DebugElement, testId: string): string[] =>
    queryAllByTestId(debugElement, testId).map((foundDebugElement) => (foundDebugElement.nativeElement as HTMLInputElement).value);

// Buttons with disabledInteractive stay focusable, so they are only marked as disabled with aria-disabled
export const isDisabledByTestId = (debugElement: DebugElement, testId: string, index = 0): boolean => {
    const button = getElementByTestId<HTMLButtonElement>(debugElement, testId, index);

    return button.disabled || button.getAttribute('aria-disabled') === 'true';
};

export const clickByTestId = async (fixture: ComponentFixture<unknown>, testId: string, index = 0): Promise<void> => {
    getElementByTestId(fixture.debugElement, testId, index).click();
    await fixture.whenStable();
};

export const typeByTestId = async (fixture: ComponentFixture<unknown>, testId: string, value: string, index = 0): Promise<void> => {
    const input = getElementByTestId<HTMLInputElement>(fixture.debugElement, testId, index);

    input.value = value;
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
};

export const pressKeyByTestId = async (fixture: ComponentFixture<unknown>, testId: string, key: string, index = 0): Promise<void> => {
    getElementByTestId(fixture.debugElement, testId, index).dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
    await fixture.whenStable();
};

export const emitByTestId = async (fixture: ComponentFixture<unknown>, testId: string, eventName: string, eventValue?: unknown, index = 0): Promise<void> => {
    getByTestId(fixture.debugElement, testId, index).triggerEventHandler(eventName, eventValue);
    await fixture.whenStable();
};

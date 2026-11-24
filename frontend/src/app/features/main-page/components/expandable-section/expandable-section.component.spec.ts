import type { ViewportScroller } from '@angular/common';
import { Component } from '@angular/core';
import type { DebugElement } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { beforeEach, describe, expect, it } from 'vitest';

import { ExpandableSectionComponent } from './expandable-section.component';
import { clickByTestId, getElementByTestId, getTextByTestId, queryByTestId } from '../../../../../testing/helpers/dom.helpers';
import { spyOnViewportScroller } from '../../../../../testing/helpers/service-spy.helpers';

@Component({
    template: `
        <mados-expandable-section headingText="Manage wallpaper" headingId="manageWallpaperHeading" contentId="manageWallpaperForm">
            <ng-template>
                <p data-testId="projectedContent">Wallpaper form</p>
            </ng-template>
        </mados-expandable-section>
    `,
    imports: [ExpandableSectionComponent],
})
class ExpandableSectionHostComponent {}

describe('ExpandableSectionComponent', () => {
    let fixture: ComponentFixture<ExpandableSectionHostComponent>;
    let debugElement: DebugElement;
    let viewportScroller: ViewportScroller;

    beforeEach(async () => {
        TestBed.configureTestingModule({
            imports: [ExpandableSectionHostComponent],
        });

        viewportScroller = spyOnViewportScroller();

        fixture = TestBed.createComponent(ExpandableSectionHostComponent);
        debugElement = fixture.debugElement;

        await fixture.whenStable();
    });

    it('should create a component', () => {
        // Assert
        expect(queryByTestId(debugElement, 'expandableSection')).not.toBeNull();
    });

    it('should label the section with its heading', () => {
        // Assert
        const heading = getElementByTestId(debugElement, 'expandableSectionHeading');

        expect(heading.textContent.trim()).toBe('Manage wallpaper');
        expect(getElementByTestId(debugElement, 'expandableSection').getAttribute('aria-labelledby')).toBe(heading.id);
    });

    it('should hide the content initially', () => {
        // Assert
        const bottomExpansionButton = getElementByTestId(debugElement, 'bottomExpansionButton');

        expect(queryByTestId(debugElement, 'projectedContent')).toBeNull();
        expect(queryByTestId(debugElement, 'topCollapseButton')).toBeNull();
        expect(bottomExpansionButton.getAttribute('aria-expanded')).toBe('false');
        expect(bottomExpansionButton.hasAttribute('aria-controls')).toBe(false);
        expect(bottomExpansionButton.textContent).toContain('Expand');
    });

    it('should show the content after clicking the expansion button', async () => {
        // Act
        await clickByTestId(fixture, 'bottomExpansionButton');

        // Assert
        const content = getElementByTestId(debugElement, 'expandableSectionContent');

        expect(getTextByTestId(debugElement, 'projectedContent')).toBe('Wallpaper form');
        expect(content.id).toBe('manageWallpaperForm');
        expect(getElementByTestId(debugElement, 'topCollapseButton').getAttribute('aria-controls')).toBe(content.id);
        expect(getElementByTestId(debugElement, 'bottomExpansionButton').getAttribute('aria-controls')).toBe(content.id);
        expect(getElementByTestId(debugElement, 'bottomExpansionButton').getAttribute('aria-expanded')).toBe('true');
        expect(getElementByTestId(debugElement, 'bottomExpansionButton').textContent).toContain('Collapse');
    });

    it('should scroll to the heading and focus the top collapse button after expanding', async () => {
        // Act
        await clickByTestId(fixture, 'bottomExpansionButton');

        // Assert
        expect(viewportScroller.scrollToAnchor).toHaveBeenCalledWith('manageWallpaperHeading');
        expect(document.activeElement).toBe(getElementByTestId(debugElement, 'topCollapseButton'));
    });

    it('should hide the content, scroll to the heading and focus the bottom button after clicking the top collapse button', async () => {
        // Arrange
        await clickByTestId(fixture, 'bottomExpansionButton');

        // Act
        await clickByTestId(fixture, 'topCollapseButton');

        // Assert
        expect(queryByTestId(debugElement, 'projectedContent')).toBeNull();
        expect(queryByTestId(debugElement, 'topCollapseButton')).toBeNull();
        expect(viewportScroller.scrollToAnchor).toHaveBeenCalledTimes(2);
        expect(document.activeElement).toBe(getElementByTestId(debugElement, 'bottomExpansionButton'));
    });

    it('should hide the content after clicking the bottom button again', async () => {
        // Arrange
        await clickByTestId(fixture, 'bottomExpansionButton');

        // Act
        await clickByTestId(fixture, 'bottomExpansionButton');

        // Assert
        expect(queryByTestId(debugElement, 'projectedContent')).toBeNull();
        expect(getElementByTestId(debugElement, 'bottomExpansionButton').getAttribute('aria-expanded')).toBe('false');
    });
});

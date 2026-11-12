import { CdkCopyToClipboard } from '@angular/cdk/clipboard';
import { Component, computed, inject, input, output, signal } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

import { CategoryComponent } from './components/category/category.component';
import { CutOffTextComponent } from './components/cut-off-text/cut-off-text.component';
import { GameComponent } from './components/game/game.component';
import { BLANK_LINE, COMPLETED_SECTION_KEY, COMPLETED_SECTION_TITLE, NEW_ACHIEVEMENTS_SECTION_KEY, NEW_ACHIEVEMENTS_SECTION_TITLE } from './constants/description-section.constants';
import type { DescriptionLine } from './interfaces/description-line.interface';
import { SnackbarType } from '../../../../components/snackbar/enums/snackbar-type.enum';
import { SnackbarService } from '../../../../components/snackbar/snackbar.service';
import type { DescriptionCategory } from '../../../../interfaces/description-category.interface';
import type { DescriptionEntry } from '../../../../interfaces/description-entry.interface';
import type { DescriptionResponseBody } from '../../../../interfaces/description-response-body.interface';
import type { DescriptionSection } from '../../../../interfaces/description-section.interface';
import { checkIfGameIsHidden, getEntryLine, getSectionHeading, joinDescriptionParts } from '../../utils/description-text.util';
import { getSteamCutOffIndex, getSteamTextSize, STEAM_DESCRIPTION_MAX_SIZE, STEAM_LINE_BREAK_SIZE } from '../../utils/steam-size.util';
import { SectionHeadingComponent } from '../section-heading/section-heading.component';

@Component({
    selector: 'mados-description-section',
    templateUrl: './description-section.component.html',
    styleUrl: './description-section.component.scss',
    imports: [SectionHeadingComponent, MatIconButton, MatIcon, CdkCopyToClipboard, CategoryComponent, GameComponent, CutOffTextComponent],
})
export class DescriptionSectionComponent {
    private readonly snackbarService = inject(SnackbarService);

    public readonly descriptionData = input.required<DescriptionResponseBody>();

    public readonly reloadDescription = output();

    public readonly shouldShowEdition = signal<boolean>(false);
    public readonly maxDescriptionSize = STEAM_DESCRIPTION_MAX_SIZE;
    public readonly sectionSeparator = '_______________________________';
    public readonly headingText = 'Description';
    public readonly headingId = 'descriptionHeading';

    public readonly completedHeading = computed<string>(() => getSectionHeading(COMPLETED_SECTION_TITLE, this.descriptionData().completed));
    public readonly newAchievementsHeading = computed<string>(() => getSectionHeading(NEW_ACHIEVEMENTS_SECTION_TITLE, this.descriptionData().newAchievements));
    public readonly completedHiddenGamesText = computed<string>(() => this.getHiddenGamesText(this.descriptionData().completed.entries));
    public readonly newAchievementsHiddenGamesText = computed<string>(() => this.getHiddenGamesText(this.descriptionData().newAchievements.entries));
    public readonly descriptionLines = computed<DescriptionLine[]>(() => this.prepareDescriptionLines(this.descriptionData()));
    public readonly descriptionSize = computed<number>(() => getSteamTextSize(this.descriptionToCopy()));
    public readonly isLimitReached = computed<boolean>(() => this.descriptionSize() >= STEAM_DESCRIPTION_MAX_SIZE);
    public readonly cutOffIndexes = computed<Map<string, number>>(() => this.getCutOffIndexes(this.descriptionLines()));
    public readonly blockStartCategoriesIds = computed<Set<number>>(() => this.getBlockStartCategoriesIds(this.descriptionData().categories));
    public readonly descriptionToCopy = computed<string>(() =>
        this.descriptionLines()
            .map(({ text }) => text)
            .join('\n')
    );

    public handleEditionMode(): void {
        this.shouldShowEdition.update((shouldShowEdition) => !shouldShowEdition);
    }

    public handleDescriptionCopied(isCopied: boolean): void {
        if (isCopied) {
            this.snackbarService.openSnackbar('Description copied to clipboard', SnackbarType.SUCCESS);

            return;
        }

        this.snackbarService.openSnackbar('An error has occurred while copying description', SnackbarType.ERROR);
    }

    // The first length and the first difficulty category start a new block of categories, separated from the previous kind
    private getBlockStartCategoriesIds(categories: DescriptionCategory[]): Set<number> {
        return new Set(categories.filter((category, index) => index > 0 && categories[index - 1].kind !== category.kind).map(({ id }) => id));
    }

    private prepareDescriptionLines({ categories, completed, newAchievements }: DescriptionResponseBody): DescriptionLine[] {
        const descriptionLines = [
            ...this.getCategoriesLines(categories),
            ...this.getSectionLines(COMPLETED_SECTION_KEY, this.completedHeading(), completed, this.completedHiddenGamesText()),
            ...this.getSectionLines(NEW_ACHIEVEMENTS_SECTION_KEY, this.newAchievementsHeading(), newAchievements, this.newAchievementsHiddenGamesText()),
        ];

        // Only a section without any visible category before it can start with a blank line, as every part ends with a text line
        const firstTextLineIndex = descriptionLines.findIndex(({ text }) => text !== '');

        return firstTextLineIndex === -1 ? [] : descriptionLines.slice(firstTextLineIndex);
    }

    // Maps every line not fully fitting in the Steam limit to the index of its first cut off character
    private getCutOffIndexes(descriptionLines: DescriptionLine[]): Map<string, number> {
        const cutOffIndexes = new Map<string, number>();

        let lineStart = 0;

        descriptionLines.forEach(({ key, text }) => {
            const lineSize = getSteamTextSize(text);

            if (key !== null && lineStart + lineSize > STEAM_DESCRIPTION_MAX_SIZE) {
                cutOffIndexes.set(key, lineStart >= STEAM_DESCRIPTION_MAX_SIZE ? 0 : getSteamCutOffIndex(text, STEAM_DESCRIPTION_MAX_SIZE - lineStart));
            }

            lineStart += lineSize + STEAM_LINE_BREAK_SIZE;
        });

        return cutOffIndexes;
    }

    // Empty categories are hidden information, so they are never copied
    private getCategoriesLines(categories: DescriptionCategory[]): DescriptionLine[] {
        const categoriesLines: DescriptionLine[] = [];

        const visibleCategories = categories.filter((category) => category.amount !== 0);

        visibleCategories.forEach((category, index) => {
            // Separates blocks by the first visible category, as the first category of a block may be hidden
            if (index > 0 && visibleCategories[index - 1].kind !== category.kind) {
                categoriesLines.push(BLANK_LINE);
            }

            categoriesLines.push({ key: `category-${category.id}`, text: joinDescriptionParts(category.iconName, category.description ?? '', `(${category.amount})`) });
        });

        return categoriesLines;
    }

    // Starts with a blank line, separating the section from the previous part of the description
    private getSectionLines(sectionKey: string, heading: string, section: DescriptionSection, hiddenGamesText: string): DescriptionLine[] {
        if (!section.amount) {
            return [];
        }

        const sectionLines: DescriptionLine[] = [...this.getSeparatorLines(sectionKey, heading), ...this.getEntriesLines(sectionKey, section.entries)];

        if (hiddenGamesText) {
            sectionLines.push(BLANK_LINE, { key: `${sectionKey}-hidden-games`, text: hiddenGamesText });
        }

        return sectionLines;
    }

    private getSeparatorLines(sectionKey: string, heading: string): DescriptionLine[] {
        return [
            BLANK_LINE,
            { key: `${sectionKey}-separator-top`, text: this.sectionSeparator },
            BLANK_LINE,
            { key: `${sectionKey}-heading`, text: heading },
            { key: `${sectionKey}-separator-bottom`, text: this.sectionSeparator },
            BLANK_LINE,
        ];
    }

    // Hidden games and listed groups are hidden information, so they are never copied
    private getEntriesLines(sectionKey: string, entries: DescriptionEntry[]): DescriptionLine[] {
        return entries.filter(({ game }) => !checkIfGameIsHidden(game)).map((entry) => ({ key: `${sectionKey}-${entry.game.id}-${entry.group?.id ?? 'base'}`, text: getEntryLine(entry) }));
    }

    // Presented in the application and copied, so hidden games are summarised per category without revealing their names, e.g. ... and (2) :a:, and (1) :b: games
    private getHiddenGamesText(entries: DescriptionEntry[]): string {
        const hiddenGamesParts = this.descriptionData()
            .categories.filter((category) => category.shouldHideGames)
            .map((category) => ({ iconName: category.iconName, amount: this.countEntriesOfCategory(entries, category.id) }))
            .filter(({ amount }) => amount > 0)
            .map(({ iconName, amount }) => joinDescriptionParts('and', `(${amount})`, iconName));

        return hiddenGamesParts.length ? `... ${hiddenGamesParts.join(', ')} games` : '';
    }

    private countEntriesOfCategory(entries: DescriptionEntry[], categoryId: number): number {
        return entries.filter(({ game }) => game.categories?.some((category) => category.id === categoryId) === true).length;
    }
}

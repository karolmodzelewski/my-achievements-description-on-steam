import { CdkCopyToClipboard } from '@angular/cdk/clipboard';
import { Component, computed, inject, input, output, signal } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

import { CategoryComponent } from './components/category/category.component';
import { CutOffTextComponent } from './components/cut-off-text/cut-off-text.component';
import { GameComponent } from './components/game/game.component';
import { BLANK_LINE, COMPLETED_SECTION_KEY, COMPLETED_SECTION_TITLE, NEW_ACHIEVEMENTS_SECTION_KEY, NEW_ACHIEVEMENTS_SECTION_TITLE } from './constants/description-section.constants';
import { CategoryBlock } from './enums/category-block.enum';
import type { DescriptionLine } from './interfaces/description-line.interface';
import { SnackbarType } from '../../../../components/snackbar/enums/snackbar-type.enum';
import { SnackbarService } from '../../../../components/snackbar/snackbar.service';
import { CategoryType } from '../../../../enums/category-type.enum';
import type { Category } from '../../../../interfaces/category.interface';
import type { DescriptionEntry } from '../../../../interfaces/description-entry.interface';
import type { DescriptionResponseBody } from '../../../../interfaces/description-response-body.interface';
import type { DescriptionSection } from '../../../../interfaces/description-section.interface';
import type { Game } from '../../../../interfaces/game.interface';
import { getEntryLine, getSectionHeading, joinDescriptionParts } from '../../utils/description-text.util';
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
    public readonly completedAdultGamesText = computed<string>(() => this.getAdultGamesText(this.descriptionData().completed.entries));
    public readonly newAchievementsAdultGamesText = computed<string>(() => this.getAdultGamesText(this.descriptionData().newAchievements.entries));
    public readonly descriptionLines = computed<DescriptionLine[]>(() => this.prepareDescriptionLines(this.descriptionData()));
    public readonly descriptionSize = computed<number>(() => getSteamTextSize(this.descriptionToCopy()));
    public readonly isLimitReached = computed<boolean>(() => this.descriptionSize() >= STEAM_DESCRIPTION_MAX_SIZE);
    public readonly cutOffIndexes = computed<Map<string, number>>(() => this.getCutOffIndexes(this.descriptionLines()));
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

    private prepareDescriptionLines({ categories, completed, newAchievements }: DescriptionResponseBody): DescriptionLine[] {
        const descriptionLines = [
            ...this.getCategoriesLines(categories),
            ...this.getSectionLines(COMPLETED_SECTION_KEY, this.completedHeading(), completed, this.completedAdultGamesText()),
            ...this.getSectionLines(NEW_ACHIEVEMENTS_SECTION_KEY, this.newAchievementsHeading(), newAchievements, this.newAchievementsAdultGamesText()),
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
    private getCategoriesLines(categories: Category[]): DescriptionLine[] {
        const categoriesLines: DescriptionLine[] = [];

        const visibleCategories = categories.filter((category) => category.amount !== 0);

        visibleCategories.forEach((category, index) => {
            // Separates blocks by the first visible category, as the first category of a block may be hidden
            if (index > 0 && this.getCategoryBlock(visibleCategories[index - 1].type) !== this.getCategoryBlock(category.type)) {
                categoriesLines.push(BLANK_LINE);
            }

            categoriesLines.push({ key: `category-${category.type}`, text: joinDescriptionParts(category.iconName, category.description ?? '', `(${category.amount ?? 0})`) });
        });

        return categoriesLines;
    }

    private getCategoryBlock(type: CategoryType): CategoryBlock {
        if (type === CategoryType.LONG_GAME || type === CategoryType.VERY_LONG_GAME || type === CategoryType.ULTRA_LONG_GAME) {
            return CategoryBlock.LENGTH;
        }

        if (type === CategoryType.HARD_GAME || type === CategoryType.VERY_HARD_GAME || type === CategoryType.ULTRA_HARD_GAME) {
            return CategoryBlock.DIFFICULTY;
        }

        return CategoryBlock.GENERAL;
    }

    // Starts with a blank line, separating the section from the previous part of the description
    private getSectionLines(sectionKey: string, heading: string, section: DescriptionSection, adultGamesText: string): DescriptionLine[] {
        if (!section.amount) {
            return [];
        }

        const sectionLines: DescriptionLine[] = [...this.getSeparatorLines(sectionKey, heading), ...this.getEntriesLines(sectionKey, section.entries)];

        if (adultGamesText) {
            sectionLines.push(BLANK_LINE, { key: `${sectionKey}-adult-games`, text: adultGamesText });
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

    // Adult games and listed groups are hidden information, so they are never copied
    private getEntriesLines(sectionKey: string, entries: DescriptionEntry[]): DescriptionLine[] {
        return entries.filter(({ game }) => !this.checkIfGameIsAnAdultGame(game)).map((entry) => ({ key: `${sectionKey}-${entry.game.id}-${entry.group?.id ?? 'base'}`, text: getEntryLine(entry) }));
    }

    // Presented in the application and copied, so adult games are summarised without revealing their names
    private getAdultGamesText(entries: DescriptionEntry[]): string {
        const adultGamesAmount = this.countAdultGames(entries);

        return adultGamesAmount > 0 ? joinDescriptionParts('... and', `(${adultGamesAmount})`, this.getAdultGameIconName(this.descriptionData().categories), 'games') : '';
    }

    private checkIfGameIsAnAdultGame(game: Game): boolean {
        return game.categories?.some((category) => category.type === CategoryType.ADULT_GAME) === true;
    }

    private countAdultGames(entries: DescriptionEntry[]): number {
        return entries.filter(({ game }) => this.checkIfGameIsAnAdultGame(game)).length;
    }

    private getAdultGameIconName(categories: Category[]): string {
        return categories.find((category) => category.type === CategoryType.ADULT_GAME)?.iconName ?? '';
    }
}

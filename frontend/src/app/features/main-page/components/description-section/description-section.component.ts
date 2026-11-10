import { CdkCopyToClipboard } from '@angular/cdk/clipboard';
import { Component, computed, inject, input, output, signal } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

import { CategoryComponent } from './components/category/category.component';
import { GameComponent } from './components/game/game.component';
import { CategoryBlock } from './enums/category-block.enum';
import { SnackbarType } from '../../../../components/snackbar/enums/snackbar-type.enum';
import { SnackbarService } from '../../../../components/snackbar/snackbar.service';
import { CategoryType } from '../../../../enums/category-type.enum';
import type { Category } from '../../../../interfaces/category.interface';
import type { DescriptionEntry } from '../../../../interfaces/description-entry.interface';
import type { DescriptionResponseBody } from '../../../../interfaces/description-response-body.interface';
import type { DescriptionSection } from '../../../../interfaces/description-section.interface';
import type { Game } from '../../../../interfaces/game.interface';
import { getEntryLine, getSectionHeading, joinDescriptionParts } from '../../utils/description-text.util';
import { SectionHeadingComponent } from '../section-heading/section-heading.component';

const COMPLETED_SECTION_TITLE = 'Completed';
const NEW_ACHIEVEMENTS_SECTION_TITLE = 'New achievements';

@Component({
    selector: 'mados-description-section',
    templateUrl: './description-section.component.html',
    styleUrl: './description-section.component.scss',
    imports: [SectionHeadingComponent, MatIconButton, MatIcon, CdkCopyToClipboard, CategoryComponent, GameComponent],
})
export class DescriptionSectionComponent {
    private readonly snackbarService = inject(SnackbarService);

    public readonly descriptionData = input.required<DescriptionResponseBody>();

    public readonly reloadDescription = output();

    public readonly completedHeading = computed<string>(() => getSectionHeading(COMPLETED_SECTION_TITLE, this.descriptionData().completed));
    public readonly newAchievementsHeading = computed<string>(() => getSectionHeading(NEW_ACHIEVEMENTS_SECTION_TITLE, this.descriptionData().newAchievements));
    public readonly completedAdultGamesText = computed<string>(() => this.getAdultGamesText(this.descriptionData().completed.entries));
    public readonly newAchievementsAdultGamesText = computed<string>(() => this.getAdultGamesText(this.descriptionData().newAchievements.entries));
    public readonly descriptionToCopy = computed<string>(() => this.prepareDescriptionToCopy(this.descriptionData()));
    public readonly shouldShowEdition = signal<boolean>(false);
    public readonly sectionSeparator = '_______________________________';
    public readonly headingText = 'Description';
    public readonly headingId = 'descriptionHeading';

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

    private prepareDescriptionToCopy({ categories, completed, newAchievements }: DescriptionResponseBody): string {
        let descriptionToCopy = '';

        descriptionToCopy += this.getCategoriesPartOfDescription(categories);
        descriptionToCopy += this.getSectionPartOfDescription(this.completedHeading(), completed, this.completedAdultGamesText());

        // Separator when adult games and games with new achievements exists
        if (this.completedAdultGamesText() && newAchievements.amount > 0) {
            descriptionToCopy += '\n';
        }

        descriptionToCopy += this.getSectionPartOfDescription(this.newAchievementsHeading(), newAchievements, this.newAchievementsAdultGamesText());

        return descriptionToCopy.trim();
    }

    // Empty categories are hidden information, so they are never copied
    private getCategoriesPartOfDescription(categories: Category[]): string {
        let categoriesToCopy = '';

        const visibleCategories = categories.filter((category) => category.amount !== 0);

        visibleCategories.forEach((category, index) => {
            // Separates blocks by the first visible category, as the first category of a block may be hidden
            if (index > 0 && this.getCategoryBlock(visibleCategories[index - 1].type) !== this.getCategoryBlock(category.type)) {
                categoriesToCopy += '\n';
            }

            categoriesToCopy += `${joinDescriptionParts(category.iconName, category.description ?? '', `(${category.amount ?? 0})`)}\n`;
        });

        return categoriesToCopy;
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

    private getSectionPartOfDescription(heading: string, section: DescriptionSection, adultGamesText: string): string {
        if (!section.amount) {
            return '';
        }

        let sectionToCopy = '';

        sectionToCopy += this.getSeparatorPartOfDescription(heading);
        sectionToCopy += this.getEntriesPartOfDescription(section.entries);

        if (adultGamesText) {
            sectionToCopy += `\n${adultGamesText}`;
        }

        return sectionToCopy;
    }

    private getSeparatorPartOfDescription(heading: string): string {
        let separatorToCopy = '';

        separatorToCopy += `\n${this.sectionSeparator}\n\n`;
        separatorToCopy += `${heading}\n`;
        separatorToCopy += `${this.sectionSeparator}\n\n`;

        return separatorToCopy;
    }

    // Adult games and listed groups are hidden information, so they are never copied
    private getEntriesPartOfDescription(entries: DescriptionEntry[]): string {
        return entries
            .filter(({ game }) => !this.checkIfGameIsAnAdultGame(game))
            .map((entry) => `${getEntryLine(entry)}\n`)
            .join('');
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

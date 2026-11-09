import { CdkCopyToClipboard } from '@angular/cdk/clipboard';
import { Component, computed, inject, input, output, signal } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

import { CategoryComponent } from './components/category/category.component';
import { GameComponent } from './components/game/game.component';
import { SnackbarType } from '../../../../components/snackbar/enums/snackbar-type.enum';
import { SnackbarService } from '../../../../components/snackbar/snackbar.service';
import { CategoryType } from '../../../../enums/category-type.enum';
import type { Category } from '../../../../interfaces/category.interface';
import type { DescriptionResponseBody } from '../../../../interfaces/description-response-body.interface';
import type { Game } from '../../../../interfaces/game.interface';
import { SectionHeadingComponent } from '../section-heading/section-heading.component';

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

    private prepareDescriptionToCopy(description: DescriptionResponseBody): string {
        let descriptionToCopy = '';

        // Categories
        descriptionToCopy += this.getCategoriesPartOfDescription(description.categories);

        // Separator 1
        if (description.completedGames.length > 0) {
            descriptionToCopy += this.getSeparatorPartOfDescription('Completed', description.completedGames.length);
        }

        // Completed games
        descriptionToCopy += this.getGamePartOfDescription(description.completedGames);

        const completedAdultGamesAmount = this.countAdultGames(description.completedGames);

        if (completedAdultGamesAmount > 0) {
            descriptionToCopy += this.getAdultGamesAmountPartOfDescription(completedAdultGamesAmount, description.categories);
        }

        // Separator when adult games and games with new achievements exists
        if (completedAdultGamesAmount > 0 && description.gamesWithNewAchievements.length > 0) {
            descriptionToCopy += '\n';
        }

        // Separator 2
        if (description.gamesWithNewAchievements.length > 0) {
            descriptionToCopy += this.getSeparatorPartOfDescription('New achievements', description.gamesWithNewAchievements.length);
        }

        // Games with new achievements
        descriptionToCopy += this.getGamePartOfDescription(description.gamesWithNewAchievements);

        const adultGamesWithNewAchievementsAmount = this.countAdultGames(description.gamesWithNewAchievements);

        if (adultGamesWithNewAchievementsAmount > 0) {
            descriptionToCopy += this.getAdultGamesAmountPartOfDescription(adultGamesWithNewAchievementsAmount, description.categories);
        }

        return descriptionToCopy.trim();
    }

    private getCategoriesPartOfDescription(categories: Category[]): string {
        let categoriesToCopy = '';

        categories.forEach((category) => {
            if (category.type === CategoryType.LONG_GAME || category.type === CategoryType.HARD_GAME) {
                categoriesToCopy += '\n';
            }

            categoriesToCopy += `${category.iconName} ${category.description ?? ''} (${category.amount ?? 0})\n`;
        });

        return categoriesToCopy;
    }

    private getSeparatorPartOfDescription(separatorText: string, amount: number): string {
        let separatorToCopy = '';

        separatorToCopy += `\n${this.sectionSeparator}\n\n`;
        separatorToCopy += `${separatorText.toUpperCase()} (${amount}):\n`;
        separatorToCopy += `${this.sectionSeparator}\n\n`;

        return separatorToCopy;
    }

    private getGamePartOfDescription(games: Game[]): string {
        let gamesToCopy = '';

        games.forEach((game) => {
            if (this.checkIfGameIsAnAdultGame(game)) {
                return;
            }

            gamesToCopy += `${game.oneHundredPercentIconName} ${game.name} `;

            game.categories?.forEach((gameCategory) => {
                gamesToCopy += gameCategory.iconName;
            });

            gamesToCopy = gamesToCopy.trim();

            gamesToCopy += '\n';
        });

        return gamesToCopy;
    }

    private getAdultGamesAmountPartOfDescription(adultGamesAmount: number, categories: Category[]): string {
        let adultGamesAmountToCopy = '\n';

        adultGamesAmountToCopy += `... and (${adultGamesAmount}) ${this.getAdultGameIconName(categories)} games`;

        return adultGamesAmountToCopy;
    }

    private checkIfGameIsAnAdultGame(game: Game): boolean {
        return game.categories?.some((category) => category.type === CategoryType.ADULT_GAME) === true;
    }

    private countAdultGames(games: Game[]): number {
        return games.filter((game) => this.checkIfGameIsAnAdultGame(game)).length;
    }

    private getAdultGameIconName(categories: Category[]): string {
        return categories.find((category) => category.type === CategoryType.ADULT_GAME)?.iconName ?? '';
    }
}

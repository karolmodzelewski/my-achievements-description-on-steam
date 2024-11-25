import { Component, Input, ChangeDetectionStrategy, EventEmitter, Output } from '@angular/core';
import { MatTooltip } from '@angular/material/tooltip';

import { Game } from './../../../../interfaces/game.interface';
import { Category } from './../../../../interfaces/category.interface';
import { DescriptionResponseBody } from '../../../../interfaces/description-response-body.interface';
import { CategoryType } from '../../../../enums/category-type.enum';
import { GameCategory } from '../../../../interfaces/game-category.interface';

@Component({
    selector: 'mados-description-section',
    templateUrl: './description-section.component.html',
    styleUrls: ['./description-section.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DescriptionSectionComponent {
    @Input()
    public set descriptionData(description: DescriptionResponseBody) {
        this.description = description;
        this.prepareDescriptionToCopy();
    };

    @Output()
    public reloadDescription: EventEmitter<void> = new EventEmitter<void>();

    public description: DescriptionResponseBody;
    public descriptionToCopy: string;
    public sectionSeparator: string = '_______________________________';
    public tooltipText: string = 'Copied!';
    public headingText: string = 'Description';
    public shouldShowEdition: boolean;

    public handleEditionMode(): void {
        this.shouldShowEdition = !this.shouldShowEdition;
    }

    public handleTooltip(event: Event, tooltip: MatTooltip): void {
        event.stopImmediatePropagation();

        tooltip.show();

        setTimeout(() => {
            tooltip.hide();
        }, 2000);
    }

    public deleteGame(): void {
        this.reloadDescription.emit();
    }

    private prepareDescriptionToCopy(): void {
        let descriptionToCopy: string = '';

        // Categories
        descriptionToCopy += this.getCategoriesPartOfDescription(this.description?.categories);

        // Separator 1
        if (this.description.completedGames?.length) {
            descriptionToCopy += this.getSeparatorPartOfDescription('Completed', this.description.completedGames?.length);
        }

        // Completed games
        descriptionToCopy += this.getGamePartOfDescription(this.description?.completedGames);

        const completedAdultGamesAmount: number = this.countAdultGames(this.description?.completedGames);

        if (completedAdultGamesAmount) {
            descriptionToCopy += this.getAdultGamesAmountPartOfDescription(completedAdultGamesAmount);
        }

        // Separator when adult games and games with new achievements exists
        if (completedAdultGamesAmount && this.description.gamesWithNewAchievements?.length) {
            descriptionToCopy += '\n';
        }

        // Separator 2
        if (this.description.gamesWithNewAchievements?.length) {
            descriptionToCopy += this.getSeparatorPartOfDescription('New achievements', this.description.gamesWithNewAchievements?.length);
        }

        // Games with new achievements
        descriptionToCopy += this.getGamePartOfDescription(this.description?.gamesWithNewAchievements);

        const adultGamesWithNewAchievementsAmount: number = this.countAdultGames(this.description?.gamesWithNewAchievements);

        if (adultGamesWithNewAchievementsAmount) {
            descriptionToCopy += this.getAdultGamesAmountPartOfDescription(adultGamesWithNewAchievementsAmount);
        }

        this.descriptionToCopy = descriptionToCopy;
    }

    private getCategoriesPartOfDescription(categories: Category[]): string {
        let categoriesToCopy: string = '';

        categories?.forEach((category: Category) => {
            if (category?.type === CategoryType.LONG_GAME || category?.type === CategoryType.HARD_GAME) {
                categoriesToCopy += '\n';
            }

            categoriesToCopy += `${category?.iconName} ${category?.description} (${category?.amount})\n`;
        });

        return categoriesToCopy;
    }

    private getSeparatorPartOfDescription(separatorText: string, amount: number): string {
        let separatorToCopy: string = '';

        separatorToCopy += `\n${this.sectionSeparator}\n\n`;
        separatorToCopy += `${separatorText.toUpperCase()} (${amount}):\n`;
        separatorToCopy += `${this.sectionSeparator}\n\n`;

        return separatorToCopy;
    }

    private getGamePartOfDescription(games: Game[]): string {
        let gamesToCopy: string = '';

        games?.forEach((game: Game) => {
            const isAdultGame: boolean = this.checkIfGameIsAnAdultGame(game);

            if (isAdultGame) {
                return;
            }

            gamesToCopy += `${game?.oneHundredPercentIconName} ${game?.name} `;

            game?.categories?.forEach((gameCategory: GameCategory) => {
                gamesToCopy += `${gameCategory.iconName}`;
            });

            gamesToCopy = gamesToCopy.trim();

            gamesToCopy += '\n';
        });

        return gamesToCopy;
    }

    private getAdultGamesAmountPartOfDescription(adultGamesAmount: number): string {
        let adultGamesAmountToCopy: string = '\n';

        adultGamesAmountToCopy += `... and (${adultGamesAmount}) ${this.getAdultGameIconName()} games`

        return adultGamesAmountToCopy;
    }

    private checkIfGameIsAnAdultGame(game: Game): boolean {
        return !!game.categories?.some((category: GameCategory) => category.type === CategoryType.ADULT_GAME);
    }

    private countAdultGames(games: Game[]): number {
        return games.filter((game: Game) => this.checkIfGameIsAnAdultGame(game)).length;
    }

    private getAdultGameIconName(): string {
        return this.description.categories.find((category: Category) => category.type === CategoryType.ADULT_GAME)?.iconName ?? '';
    }
}

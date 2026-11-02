import { CdkCopyToClipboard } from '@angular/cdk/clipboard';
import type { InputSignal, OutputEmitterRef, Signal, WritableSignal } from '@angular/core';
import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';

import { CategoryComponent } from './components/category/category.component';
import { GameComponent } from './components/game/game.component';
import { CategoryType } from '../../../../enums/category-type.enum';
import type { Category } from '../../../../interfaces/category.interface';
import type { DescriptionResponseBody } from '../../../../interfaces/description-response-body.interface';
import type { GameCategory } from '../../../../interfaces/game-category.interface';
import type { Game } from '../../../../interfaces/game.interface';
import { SectionHeadingComponent } from '../section-heading/section-heading.component';

@Component({
    selector: 'mados-description-section',
    templateUrl: './description-section.component.html',
    styleUrl: './description-section.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [SectionHeadingComponent, MatIconModule, MatTooltip, CdkCopyToClipboard, CategoryComponent, GameComponent],
})
export class DescriptionSectionComponent {
    public readonly descriptionData: InputSignal<DescriptionResponseBody> = input.required<DescriptionResponseBody>();

    public readonly reloadDescription: OutputEmitterRef<void> = output();

    public readonly descriptionToCopy: Signal<string> = computed(() => this.prepareDescriptionToCopy(this.descriptionData()));
    public readonly shouldShowEdition: WritableSignal<boolean> = signal<boolean>(false);
    public readonly sectionSeparator: string = '_______________________________';
    public readonly tooltipText: string = 'Copied!';
    public readonly headingText: string = 'Description';

    public handleEditionMode(): void {
        this.shouldShowEdition.update((shouldShowEdition: boolean) => !shouldShowEdition);
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

    private prepareDescriptionToCopy(description: DescriptionResponseBody): string {
        let descriptionToCopy: string = '';

        // Categories
        descriptionToCopy += this.getCategoriesPartOfDescription(description.categories);

        // Separator 1
        if (description.completedGames.length > 0) {
            descriptionToCopy += this.getSeparatorPartOfDescription('Completed', description.completedGames.length);
        }

        // Completed games
        descriptionToCopy += this.getGamePartOfDescription(description.completedGames);

        const completedAdultGamesAmount: number = this.countAdultGames(description.completedGames);

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

        const adultGamesWithNewAchievementsAmount: number = this.countAdultGames(description.gamesWithNewAchievements);

        if (adultGamesWithNewAchievementsAmount > 0) {
            descriptionToCopy += this.getAdultGamesAmountPartOfDescription(adultGamesWithNewAchievementsAmount, description.categories);
        }

        return descriptionToCopy;
    }

    private getCategoriesPartOfDescription(categories: Category[]): string {
        let categoriesToCopy: string = '';

        categories.forEach((category: Category) => {
            if (category.type === CategoryType.LONG_GAME || category.type === CategoryType.HARD_GAME) {
                categoriesToCopy += '\n';
            }

            categoriesToCopy += `${category.iconName} ${String(category.description)} (${String(category.amount)})\n`;
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

        games.forEach((game: Game) => {
            const isAdultGame: boolean = this.checkIfGameIsAnAdultGame(game);

            if (isAdultGame) {
                return;
            }

            gamesToCopy += `${game.oneHundredPercentIconName} ${game.name} `;

            game.categories?.forEach((gameCategory: GameCategory) => {
                gamesToCopy += gameCategory.iconName;
            });

            gamesToCopy = gamesToCopy.trim();

            gamesToCopy += '\n';
        });

        return gamesToCopy;
    }

    private getAdultGamesAmountPartOfDescription(adultGamesAmount: number, categories: Category[]): string {
        let adultGamesAmountToCopy: string = '\n';

        adultGamesAmountToCopy += `... and (${adultGamesAmount}) ${this.getAdultGameIconName(categories)} games`;

        return adultGamesAmountToCopy;
    }

    private checkIfGameIsAnAdultGame(game: Game): boolean {
        return game.categories?.some((category: GameCategory) => category.type === CategoryType.ADULT_GAME) === true;
    }

    private countAdultGames(games: Game[]): number {
        return games.filter((game: Game) => this.checkIfGameIsAnAdultGame(game)).length;
    }

    private getAdultGameIconName(categories: Category[]): string {
        return categories.find((category: Category) => category.type === CategoryType.ADULT_GAME)?.iconName ?? '';
    }
}

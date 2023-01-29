import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
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
})
export class DescriptionSectionComponent implements OnInit {
    @Input()
    public description: DescriptionResponseBody;

    public descriptionToCopy: string;
    public sectionSeparator: string = '_______________________________';
    public tooltipText: string = 'Copied!';
    public headingText: string = 'Description';
    public shouldShowEdition: boolean;

    public ngOnInit(): void {
        this.prepareDescriptionToCopy();
    }

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

    private prepareDescriptionToCopy(): void {
        let descriptionToCopy: string = '';

        // Categories
        descriptionToCopy += this.getCategoriesPartOfDescription(this.description?.categories);

        // Separator 1
        descriptionToCopy += this.getSeparatorPartOfDescription('Completed', this.description?.completedGames?.length);

        // Completed games
        descriptionToCopy += this.getGamePartOfDescription(this.description?.completedGames);

        // Separator 2
        descriptionToCopy += this.getSeparatorPartOfDescription('New achievements', this.description?.gamesWithNewAchievements?.length);

        // Games with new achievements
        descriptionToCopy += this.getGamePartOfDescription(this.description?.gamesWithNewAchievements);

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
            gamesToCopy += `${game?.oneHundredPercentIconName} ${game?.name} `;

            game?.categories?.forEach((gameCategory: GameCategory) => {
                gamesToCopy += `${gameCategory.iconName}`;
            });

            gamesToCopy += '\n';
        });

        return gamesToCopy;
    }
}

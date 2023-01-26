import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatTooltip } from '@angular/material/tooltip';

import { takeUntil, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { Game } from './../../../../interfaces/game.interface';
import { Category } from './../../../../interfaces/category.interface';
import { Destroyable } from '../../../../utils/destroyable.util';
import { DescriptionResponseBody } from '../../../../interfaces/description-response-body.interface';
import { CategoryType } from '../../../../enums/category-type.enum';


@Component({
  selector: 'mados-description-section',
  templateUrl: './description-section.component.html',
  styleUrls: ['./description-section.component.scss']
})
export class DescriptionSectionComponent extends Destroyable implements OnInit {
    public description$: Observable<DescriptionResponseBody>;
    public descriptionToCopy: string;
    public sectionSeparator: string = '_______________________________';
    public tooltipText: string = 'Copied!';

    constructor(private httpClient: HttpClient) {
        super();
    }

    public ngOnInit(): void {
        this.getDescription();
    }

    public getDescription(): void {
        this.description$ = this.httpClient.get<DescriptionResponseBody>('description').pipe(
            takeUntil(this.destroyed$),
            tap((description: DescriptionResponseBody) => this.prepareDescriptionToCopy(description))
        );
    }

    public handleTooltip(event: Event, tooltip: MatTooltip): void {
        event.stopImmediatePropagation();

        tooltip.show();

        setTimeout(() => {
            tooltip.hide();
        }, 2000);
    }

    private prepareDescriptionToCopy(description: DescriptionResponseBody): void {
        let descriptionToCopy: string = '';

        // Categories
        descriptionToCopy += this.getCategoriesPartOfDescription(description?.categories);

        // Separator 1
        descriptionToCopy += this.getSeparatorPartOfDescription('Completed', description?.completedGames?.length);

        // Completed games
        descriptionToCopy += this.getGamePartOfDescription(description?.completedGames);

        // Separator 2
        descriptionToCopy += this.getSeparatorPartOfDescription('New achievements', description?.gamesWithNewAchievements?.length);

        // Games with new achievements
        descriptionToCopy += this.getGamePartOfDescription(description?.gamesWithNewAchievements);

        this.descriptionToCopy = descriptionToCopy;
    }

    private getCategoriesPartOfDescription(categories: Category[]): string {
        let categoriesToCopy: string = '';

        categories?.forEach((category: Category) => {
            if (category?.type === CategoryType.LONG_GAME || category?.type === CategoryType.HARD_GAME) {
                categoriesToCopy += '\n';
            }

            categoriesToCopy += `${category?.iconName} ${category?.description} (${category?.amount})\n`
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

            game?.iconNames?.forEach((iconName: string) => {
                gamesToCopy += `${iconName }`
            });

            gamesToCopy += '\n';
        });

        return gamesToCopy;
    }
}

import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ViewportScroller } from '@angular/common';

import { filter, takeUntil } from 'rxjs';

import { AddGameRequestBody } from '../../../../interfaces/add-game-request-body.interface';
import { CategoryType } from '../../../../enums/category-type.enum';
import { AddGameFormControl } from './enums/add-game-form-control.enum';
import { Destroyable } from '../../../../utils/destroyable.util';
import { GameCategory } from './../../../../interfaces/game-category.interface';
import { Game } from './../../../../interfaces/game.interface';
import { EditGameService } from './../../services/edit-game.service';
import { DescriptionResponseBody } from '../../../../interfaces/description-response-body.interface';

@Component({
    selector: 'mados-add-game-form',
    templateUrl: './add-game-form.component.html',
    styleUrls: ['./add-game-form.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddGameFormComponent extends Destroyable implements OnInit {
    @Input()
    public description: DescriptionResponseBody;

    public headingText: string = 'Add game';
    public form: FormGroup;
    public AddGameFormControl: typeof AddGameFormControl = AddGameFormControl;
    public CategoryType: typeof CategoryType = CategoryType;
    public headingId: string = 'heading';

    constructor(
        private httpClient: HttpClient,
        private editGameService: EditGameService,
        private viewportScroller: ViewportScroller,
    ) {
        super();
    }

    public ngOnInit(): void {
        this.initForm();
        this.handleGameEdition();
    }

    public addGame(): void {
        if (this.form.invalid) {
            return;
        }

        const requestBody: AddGameRequestBody = this.prepareAddGameDataForRequest();

        this.httpClient.post<AddGameRequestBody>('add-game', requestBody);
    }

    public resetInputField(control: FormControl | any): void {
        control.reset();
        control.updateValueAndValidity();
    }

    private prepareAddGameDataForRequest(): AddGameRequestBody {
        let requestBody: AddGameRequestBody = {
            name: this.form.get(AddGameFormControl.NAME)?.value,
        };

        if (this.form.get(AddGameFormControl.LENGTH)?.value) {
            requestBody = { ...requestBody, length: this.form.get(AddGameFormControl.LENGTH)?.value };
        }

        if (this.form.get(AddGameFormControl.DIFFICULTY)?.value) {
            requestBody = { ...requestBody, difficulty: this.form.get(AddGameFormControl.DIFFICULTY)?.value };
        }

        if (this.form.get(AddGameFormControl.LOVED_GAME)?.value) {
            requestBody = { ...requestBody, lovedGame: this.form.get(AddGameFormControl.LOVED_GAME)?.value };
        }

        if (this.form.get(AddGameFormControl.BAD_GAME)?.value) {
            requestBody = { ...requestBody, badGame: this.form.get(AddGameFormControl.BAD_GAME)?.value };
        }

        if (this.form.get(AddGameFormControl.DOESNT_COUNT)?.value) {
            requestBody = { ...requestBody, doesntCount: this.form.get(AddGameFormControl.DOESNT_COUNT)?.value };
        }

        if (this.form.get(AddGameFormControl.BUGGED_GAME)?.value) {
            requestBody = { ...requestBody, buggedGame: this.form.get(AddGameFormControl.BUGGED_GAME)?.value };
        }

        return requestBody;
    }

    private handleGameEdition(): void {
        this.editGameService.editingGameName$.pipe(
            filter(Boolean),
            takeUntil(this.destroyed$)
        ).subscribe((gameName: string) => this.updateFormWhenEditingGame(gameName));
    }

    private updateFormWhenEditingGame(gameName: string): void {
        this.form.reset();

        const { completedGames, gamesWithNewAchievements } = this.description;
        const game: Game = this.findGameByName(completedGames, gameName) || this.findGameByName(gamesWithNewAchievements, gameName);

        this.form.get(AddGameFormControl.NAME)?.setValue(gameName);
        this.updateFormCategoriesWhenEditingGame(game);
        this.form.updateValueAndValidity();
        this.viewportScroller.scrollToAnchor(this.headingId);
    }

    private updateFormCategoriesWhenEditingGame(game: Game): void {
        game.categories?.forEach((gameCategory: GameCategory) => {
            if (gameCategory.type === CategoryType.LONG_GAME || gameCategory.type === CategoryType.VERY_LONG_GAME || gameCategory.type === CategoryType.ULTRA_LONG_GAME) {
                this.form.get(AddGameFormControl.LENGTH)?.setValue(gameCategory.type);
            }

            if (gameCategory.type === CategoryType.HARD_GAME || gameCategory.type === CategoryType.VERY_HARD_GAME || gameCategory.type === CategoryType.ULTRA_HARD_GAME) {
                this.form.get(AddGameFormControl.DIFFICULTY)?.setValue(gameCategory.type);
            }

            if (gameCategory.type === CategoryType.LOVED_GAME) {
                this.form.get(AddGameFormControl.LOVED_GAME)?.setValue(true);
            }

            if (gameCategory.type === CategoryType.BAD_GAME) {
                this.form.get(AddGameFormControl.BAD_GAME)?.setValue(true);
            }

            if (gameCategory.type === CategoryType.DOESNT_COUNT) {
                this.form.get(AddGameFormControl.DOESNT_COUNT)?.setValue(true);
            }

            if (gameCategory.type === CategoryType.BUGGED_GAME) {
                this.form.get(AddGameFormControl.BUGGED_GAME)?.setValue(true);
            }
        });
    }

    private findGameByName(games: Game[], gameName: string): Game {
        return games.find((game: Game) => game.name === gameName) as Game;
    }

    private initForm(): void {
        this.form = new FormGroup({
            [AddGameFormControl.NAME]: new FormControl<string>('', Validators.required),
            [AddGameFormControl.LENGTH]: new FormControl<CategoryType | null>(null),
            [AddGameFormControl.DIFFICULTY]: new FormControl<CategoryType | null>(null),
            [AddGameFormControl.LOVED_GAME]: new FormControl<boolean>(false),
            [AddGameFormControl.BAD_GAME]: new FormControl<boolean>(false),
            [AddGameFormControl.DOESNT_COUNT]: new FormControl<boolean>(false),
            [AddGameFormControl.BUGGED_GAME]: new FormControl<boolean>(false),
        });
    }
}

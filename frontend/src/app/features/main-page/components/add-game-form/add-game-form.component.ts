import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit, ChangeDetectionStrategy, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ViewportScroller } from '@angular/common';

import { catchError, EMPTY, filter, take, takeUntil } from 'rxjs';

import { AddGameRequestBody } from '../../../../interfaces/add-game-request-body.interface';
import { CategoryType } from '../../../../enums/category-type.enum';
import { AddGameFormControl } from './enums/add-game-form-control.enum';
import { Destroyable } from '../../../../utils/destroyable.util';
import { GameCategory } from './../../../../interfaces/game-category.interface';
import { Game } from './../../../../interfaces/game.interface';
import { EditGameService } from './../../services/edit-game.service';
import { DescriptionResponseBody } from '../../../../interfaces/description-response-body.interface';
import { AddGameFormGroup } from './enums/add-game-form-group.enum';
import { ViewState } from './../../../../enums/view-state.enum';

@Component({
    selector: 'mados-add-game-form',
    templateUrl: './add-game-form.component.html',
    styleUrls: ['./add-game-form.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddGameFormComponent extends Destroyable implements OnInit {
    @Input()
    public description: DescriptionResponseBody;

    @Output()
    public reloadDescription: EventEmitter<void> = new EventEmitter<void>();

    public headingText: string = 'Add game';
    public form: FormGroup;
    public AddGameFormControl: typeof AddGameFormControl = AddGameFormControl;
    public AddGameFormGroup: typeof AddGameFormGroup = AddGameFormGroup;
    public CategoryType: typeof CategoryType = CategoryType;
    public ViewState: typeof ViewState = ViewState;
    public viewState: ViewState;
    public headingId: string = 'heading';

    private get gameCategoriesFormGroup(): FormGroup {
        return this.form.get(AddGameFormGroup.GAME_CATEGORIES) as FormGroup;
    }

    constructor(
        private httpClient: HttpClient,
        private editGameService: EditGameService,
        private viewportScroller: ViewportScroller,
        private formBuilder: FormBuilder
    ) {
        super();
    }

    public ngOnInit(): void {
        this.initForm();
        this.handleGameEdition();
    }

    // TODO: Add snackbars
    public addGame(): void {
        if (this.form.invalid) {
            return;
        }

        this.viewState = ViewState.LOADING;

        const requestBody: AddGameRequestBody = this.prepareAddGameDataForRequest();

        this.httpClient.post<AddGameRequestBody>('add-game', requestBody)
            .pipe(
                take(1),
                catchError(() => {
                    this.viewState = ViewState.ERROR;

                    return EMPTY;
                })
            ).subscribe(() => {
                this.viewState = ViewState.SUCCESS;
                this.initForm();
                this.reloadDescription.emit();
            });
    }

    public resetInputField(control: FormControl | any): void {
        control.reset();
        control.updateValueAndValidity();
    }

    private prepareAddGameDataForRequest(): AddGameRequestBody {
        const requestBody: AddGameRequestBody = {
            name: this.form.get(AddGameFormControl.NAME)?.value,
            hasNewAchievements: this.form.get(AddGameFormControl.HAS_NEW_ACHIEVEMENTS)?.value,
            categories: [],
        };

        for (const categoryType in this.gameCategoriesFormGroup?.value) {
            if (this.gameCategoriesFormGroup.value[categoryType]) {
                switch (categoryType) {
                    case AddGameFormControl.LENGTH:
                    case AddGameFormControl.DIFFICULTY:
                        requestBody.categories.push(this.gameCategoriesFormGroup.value[categoryType])
                        break;
                    default:
                        requestBody.categories.push(categoryType as CategoryType);
                }
            }
        }

        return requestBody;
    }

    private handleGameEdition(): void {
        this.editGameService.editingGameName$.pipe(filter(Boolean), takeUntil(this.destroyed$)).subscribe((gameName: string) => this.updateFormWhenEditingGame(gameName));
    }

    private updateFormWhenEditingGame(gameName: string): void {
        this.form.reset();

        const { completedGames, gamesWithNewAchievements } = this.description;
        const game: Game = this.findGameByName(completedGames, gameName) || this.findGameByName(gamesWithNewAchievements, gameName);

        this.form.get(AddGameFormControl.NAME)?.setValue(gameName);
        this.form.get(AddGameFormControl.HAS_NEW_ACHIEVEMENTS)?.setValue(game.hasNewAchievements);
        this.updateFormCategoriesWhenEditingGame(game);
        this.form.updateValueAndValidity();
        this.viewportScroller.scrollToAnchor(this.headingId);
    }

    private updateFormCategoriesWhenEditingGame(game: Game): void {
        game.categories?.forEach((gameCategory: GameCategory) => {
            if (gameCategory.type === CategoryType.LONG_GAME || gameCategory.type === CategoryType.VERY_LONG_GAME || gameCategory.type === CategoryType.ULTRA_LONG_GAME) {
                this.gameCategoriesFormGroup.get(AddGameFormControl.LENGTH)?.setValue(gameCategory.type);
            }

            if (gameCategory.type === CategoryType.HARD_GAME || gameCategory.type === CategoryType.VERY_HARD_GAME || gameCategory.type === CategoryType.ULTRA_HARD_GAME) {
                this.gameCategoriesFormGroup.get(AddGameFormControl.DIFFICULTY)?.setValue(gameCategory.type);
            }

            if (gameCategory.type === CategoryType.LOVED_GAME) {
                this.gameCategoriesFormGroup.get(AddGameFormControl.LOVED_GAME)?.setValue(true);
            }

            if (gameCategory.type === CategoryType.BAD_GAME) {
                this.gameCategoriesFormGroup.get(AddGameFormControl.BAD_GAME)?.setValue(true);
            }

            if (gameCategory.type === CategoryType.DOESNT_COUNT) {
                this.gameCategoriesFormGroup.get(AddGameFormControl.DOESNT_COUNT)?.setValue(true);
            }

            if (gameCategory.type === CategoryType.BUGGED_GAME) {
                this.gameCategoriesFormGroup.get(AddGameFormControl.BUGGED_GAME)?.setValue(true);
            }
        });
    }

    private findGameByName(games: Game[], gameName: string): Game {
        return games.find((game: Game) => game.name === gameName) as Game;
    }

    private initForm(): void {
        this.form = this.formBuilder.group({
            [AddGameFormControl.NAME]: ['', Validators.required],
            [AddGameFormControl.HAS_NEW_ACHIEVEMENTS]: [false],
            [AddGameFormGroup.GAME_CATEGORIES]: this.formBuilder.group({
                [AddGameFormControl.LENGTH]: [null],
                [AddGameFormControl.DIFFICULTY]: [null],
                [AddGameFormControl.LOVED_GAME]: [false],
                [AddGameFormControl.BAD_GAME]: [false],
                [AddGameFormControl.DOESNT_COUNT]: [false],
                [AddGameFormControl.BUGGED_GAME]: [false],
            }),
        });
    }
}

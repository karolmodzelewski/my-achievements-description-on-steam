import { ViewportScroller } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import type { InputSignal, OnInit, OutputEmitterRef, WritableSignal } from '@angular/core';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, input, output, signal } from '@angular/core';
import type { AbstractControl, FormGroup } from '@angular/forms';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { catchError, EMPTY, filter, take, takeUntil } from 'rxjs';

import { AddGameFormControl } from './enums/add-game-form-control.enum';
import { AddGameFormGroup } from './enums/add-game-form-group.enum';
import type { AddGameFormControls } from './interfaces/add-game-form-controls.interface';
import type { GameCategoriesFormControls } from './interfaces/game-categories-form-controls.interface';
import { SnackbarService } from '../../../../components/snackbar/snackbar.service';
import { CategoryType } from '../../../../enums/category-type.enum';
import { ViewState } from '../../../../enums/view-state.enum';
import type { AddGameRequestBody } from '../../../../interfaces/add-game-request-body.interface';
import type { DescriptionResponseBody } from '../../../../interfaces/description-response-body.interface';
import type { GameCategory } from '../../../../interfaces/game-category.interface';
import type { Game } from '../../../../interfaces/game.interface';
import { Destroyable } from '../../../../utils/destroyable.util';
import { EditGameService } from '../../services/edit-game.service';
import { SectionHeadingComponent } from '../section-heading/section-heading.component';

@Component({
    selector: 'mados-add-game-form',
    templateUrl: './add-game-form.component.html',
    styleUrl: './add-game-form.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [SectionHeadingComponent, ReactiveFormsModule, MatInputModule, MatIconModule, MatSelectModule, MatCheckboxModule, MatButtonModule],
})
export class AddGameFormComponent extends Destroyable implements OnInit {
    private readonly httpClient: HttpClient = inject(HttpClient);
    private readonly editGameService: EditGameService = inject(EditGameService);
    private readonly viewportScroller: ViewportScroller = inject(ViewportScroller);
    private readonly formBuilder: FormBuilder = inject(FormBuilder);
    private readonly snackbarService: SnackbarService = inject(SnackbarService);
    private readonly changeDetectorRef: ChangeDetectorRef = inject(ChangeDetectorRef);

    public readonly description: InputSignal<DescriptionResponseBody> = input.required<DescriptionResponseBody>();

    public readonly reloadDescription: OutputEmitterRef<void> = output();

    public readonly headingText: string = 'Add game';
    public readonly form: WritableSignal<FormGroup<AddGameFormControls>> = signal<FormGroup<AddGameFormControls>>(this.buildForm());
    public readonly AddGameFormControl: typeof AddGameFormControl = AddGameFormControl;
    public readonly AddGameFormGroup: typeof AddGameFormGroup = AddGameFormGroup;
    public readonly CategoryType: typeof CategoryType = CategoryType;
    public readonly ViewState: typeof ViewState = ViewState;
    public readonly viewState: WritableSignal<ViewState | null> = signal<ViewState | null>(null);
    public readonly headingId: string = 'addGameHeading';

    private get gameCategoriesFormGroup(): FormGroup<GameCategoriesFormControls> {
        return this.form().controls[AddGameFormGroup.GAME_CATEGORIES];
    }

    public ngOnInit(): void {
        this.handleGameEdition();
    }

    public addGame(): void {
        if (this.form().invalid) {
            return;
        }

        this.viewState.set(ViewState.LOADING);

        const requestBody: AddGameRequestBody = this.prepareAddGameDataForRequest();

        this.httpClient
            .post<AddGameRequestBody>('game', requestBody)
            .pipe(
                take(1),
                catchError(() => {
                    this.viewState.set(ViewState.ERROR);
                    this.snackbarService.openSnackbar('An error has occurred while saving game', 'error');

                    return EMPTY;
                })
            )
            .subscribe(() => {
                this.viewState.set(ViewState.SUCCESS);
                this.snackbarService.openSnackbar('Successfully saved game', 'success');
                this.form.set(this.buildForm());
                this.reloadDescription.emit();
            });
    }

    public resetInputField(control: AbstractControl): void {
        control.reset();
        control.updateValueAndValidity();
    }

    private prepareAddGameDataForRequest(): AddGameRequestBody {
        const formControls: AddGameFormControls = this.form().controls;
        const {
            [AddGameFormControl.LENGTH]: length,
            [AddGameFormControl.DIFFICULTY]: difficulty,
            ...checkboxes
        }: ReturnType<FormGroup<GameCategoriesFormControls>['getRawValue']> = this.gameCategoriesFormGroup.getRawValue();
        const requestBody: AddGameRequestBody = {
            name: formControls[AddGameFormControl.NAME].value ?? '',
            hasNewAchievements: formControls[AddGameFormControl.HAS_NEW_ACHIEVEMENTS].value ?? false,
            categories: [],
        };

        if (length !== null) {
            requestBody.categories.push(length);
        }

        if (difficulty !== null) {
            requestBody.categories.push(difficulty);
        }

        Object.entries(checkboxes).forEach(([categoryType, isChecked]: [string, boolean | null]) => {
            if (isChecked === true) {
                requestBody.categories.push(categoryType as CategoryType);
            }
        });

        return requestBody;
    }

    private handleGameEdition(): void {
        this.editGameService.editingGameName$.pipe(filter(Boolean), takeUntil(this.destroyed$)).subscribe((gameName: string) => this.updateFormWhenEditingGame(gameName));
    }

    private updateFormWhenEditingGame(gameName: string): void {
        const form: FormGroup<AddGameFormControls> = this.form();

        form.reset();

        const { completedGames, gamesWithNewAchievements }: DescriptionResponseBody = this.description();
        const game: Game | undefined = this.findGameByName(completedGames, gameName) ?? this.findGameByName(gamesWithNewAchievements, gameName);

        if (game === undefined) {
            return;
        }

        form.controls[AddGameFormControl.NAME].setValue(gameName);
        form.controls[AddGameFormControl.HAS_NEW_ACHIEVEMENTS].setValue(game.hasNewAchievements);
        this.updateFormCategoriesWhenEditingGame(game);
        form.updateValueAndValidity();
        this.changeDetectorRef.markForCheck();
        this.viewportScroller.scrollToAnchor(this.headingId);
    }

    private updateFormCategoriesWhenEditingGame(game: Game): void {
        const gameCategoriesControls: GameCategoriesFormControls = this.gameCategoriesFormGroup.controls;

        game.categories?.forEach((gameCategory: GameCategory) => {
            if (gameCategory.type === CategoryType.LONG_GAME || gameCategory.type === CategoryType.VERY_LONG_GAME || gameCategory.type === CategoryType.ULTRA_LONG_GAME) {
                gameCategoriesControls[AddGameFormControl.LENGTH].setValue(gameCategory.type);
            }

            if (gameCategory.type === CategoryType.HARD_GAME || gameCategory.type === CategoryType.VERY_HARD_GAME || gameCategory.type === CategoryType.ULTRA_HARD_GAME) {
                gameCategoriesControls[AddGameFormControl.DIFFICULTY].setValue(gameCategory.type);
            }

            if (gameCategory.type === CategoryType.LOVED_GAME) {
                gameCategoriesControls[AddGameFormControl.LOVED_GAME].setValue(true);
            }

            if (gameCategory.type === CategoryType.BAD_GAME) {
                gameCategoriesControls[AddGameFormControl.BAD_GAME].setValue(true);
            }

            if (gameCategory.type === CategoryType.DOESNT_COUNT) {
                gameCategoriesControls[AddGameFormControl.DOESNT_COUNT].setValue(true);
            }

            if (gameCategory.type === CategoryType.BUGGED_GAME) {
                gameCategoriesControls[AddGameFormControl.BUGGED_GAME].setValue(true);
            }

            if (gameCategory.type === CategoryType.ADULT_GAME) {
                gameCategoriesControls[AddGameFormControl.ADULT_GAME].setValue(true);
            }
        });
    }

    private findGameByName(games: Game[], gameName: string): Game | undefined {
        return games.find((game: Game) => game.name === gameName);
    }

    private buildForm(): FormGroup<AddGameFormControls> {
        return this.formBuilder.group<AddGameFormControls>({
            [AddGameFormControl.NAME]: this.formBuilder.control<string | null>('', Validators.required),
            [AddGameFormControl.HAS_NEW_ACHIEVEMENTS]: this.formBuilder.control<boolean | null>(false),
            [AddGameFormGroup.GAME_CATEGORIES]: this.formBuilder.group<GameCategoriesFormControls>({
                [AddGameFormControl.LENGTH]: this.formBuilder.control<CategoryType | null>(null),
                [AddGameFormControl.DIFFICULTY]: this.formBuilder.control<CategoryType | null>(null),
                [AddGameFormControl.LOVED_GAME]: this.formBuilder.control<boolean | null>(false),
                [AddGameFormControl.BAD_GAME]: this.formBuilder.control<boolean | null>(false),
                [AddGameFormControl.DOESNT_COUNT]: this.formBuilder.control<boolean | null>(false),
                [AddGameFormControl.BUGGED_GAME]: this.formBuilder.control<boolean | null>(false),
                [AddGameFormControl.ADULT_GAME]: this.formBuilder.control<boolean | null>(false),
            }),
        });
    }
}

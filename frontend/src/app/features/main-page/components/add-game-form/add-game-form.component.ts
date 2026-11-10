import { ViewportScroller } from '@angular/common';
import type { HttpErrorResponse } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { Component, computed, effect, inject, linkedSignal, output, untracked } from '@angular/core';
import type { FieldTree } from '@angular/forms/signals';
import { applyEach, form, FormField, FormRoot, pattern, required } from '@angular/forms/signals';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatOption } from '@angular/material/core';
import { MatError, MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';

import { catchError, firstValueFrom, of, tap } from 'rxjs';

import type { GameFormModel } from './interfaces/game-form-model.interface';
import type { GameGroupFormModel } from './interfaces/game-group-form-model.interface';
import { SnackbarType } from '../../../../components/snackbar/enums/snackbar-type.enum';
import { SnackbarService } from '../../../../components/snackbar/snackbar.service';
import { CategoryType } from '../../../../enums/category-type.enum';
import { ErrorCode } from '../../../../enums/error-code.enum';
import type { AddGameRequestBody } from '../../../../interfaces/add-game-request-body.interface';
import type { ErrorResponseBody } from '../../../../interfaces/error-response-body.interface';
import type { Game } from '../../../../interfaces/game.interface';
import { EditGameService } from '../../services/edit-game.service';
import { SectionHeadingComponent } from '../section-heading/section-heading.component';

const LENGTH_CATEGORY_TYPES = [CategoryType.LONG_GAME, CategoryType.VERY_LONG_GAME, CategoryType.ULTRA_LONG_GAME];
const DIFFICULTY_CATEGORY_TYPES = [CategoryType.HARD_GAME, CategoryType.VERY_HARD_GAME, CategoryType.ULTRA_HARD_GAME];
const NOT_BLANK_PATTERN = /\S/;

@Component({
    selector: 'mados-add-game-form',
    templateUrl: './add-game-form.component.html',
    styleUrl: './add-game-form.component.scss',
    imports: [SectionHeadingComponent, FormRoot, FormField, MatFormField, MatLabel, MatError, MatSuffix, MatInput, MatIcon, MatIconButton, MatSelect, MatOption, MatCheckbox, MatButton],
})
export class AddGameFormComponent {
    private readonly httpClient = inject(HttpClient);
    private readonly editGameService = inject(EditGameService);
    private readonly viewportScroller = inject(ViewportScroller);
    private readonly snackbarService = inject(SnackbarService);

    public readonly reloadDescription = output();

    public readonly headingText = 'Manage game';
    public readonly headingId = 'manageGameHeading';
    public readonly baseGameGroupName = 'Base game';
    public readonly CategoryType = CategoryType;
    public readonly isEditing = computed<boolean>(() => this.editGameService.editedGame() !== null);

    private readonly gameModel = linkedSignal<GameFormModel>(() => this.mapGameToFormModel(this.editGameService.editedGame()));

    public readonly gameForm = form(
        this.gameModel,
        (path) => {
            required(path.name);
            pattern(path.name, NOT_BLANK_PATTERN);
            applyEach(path.groups, (groupPath) => {
                required(groupPath.name);
                pattern(groupPath.name, NOT_BLANK_PATTERN);
            });
        },
        { submission: { action: () => this.saveGame() } }
    );

    constructor() {
        effect(() => {
            if (this.editGameService.editedGame()) {
                untracked(() => {
                    this.viewportScroller.scrollToAnchor(this.headingId);
                    this.gameForm.name().focusBoundControl({ preventScroll: true });
                });
            }
        });
    }

    public clearField(field: FieldTree<string>): void {
        field().reset('');
        field().focusBoundControl();
    }

    public addGroup(index: number): void {
        const newGroup: GameGroupFormModel = { name: '', hasNewAchievements: false };

        this.gameModel.update((gameModel) => ({ ...gameModel, groups: [...gameModel.groups.slice(0, index), newGroup, ...gameModel.groups.slice(index)] }));
    }

    public removeGroup(index: number): void {
        this.gameModel.update((gameModel) => ({ ...gameModel, groups: gameModel.groups.filter((_, groupIndex) => groupIndex !== index) }));
    }

    public resetForm(): void {
        this.gameForm().reset();
        this.editGameService.stopEditing();
    }

    private saveGame(): Promise<void> {
        const editedGame = this.editGameService.editedGame();
        const requestBody = this.prepareRequestBody();
        const saveGameRequest = editedGame ? this.httpClient.put<void>(`game/${editedGame.id}`, requestBody) : this.httpClient.post<void>('game', requestBody);

        return firstValueFrom(
            saveGameRequest.pipe(
                tap(() => {
                    this.snackbarService.openSnackbar('Successfully saved game', SnackbarType.SUCCESS);
                    this.resetForm();
                    this.reloadDescription.emit();
                }),
                catchError(({ error }: HttpErrorResponse) => {
                    const errorResponseBody = error as ErrorResponseBody | null;
                    const message = errorResponseBody?.errorCode === ErrorCode.EMPTY_NAME ? 'Game or group name has to be provided' : 'An error has occurred while saving game';

                    this.snackbarService.openSnackbar(message, SnackbarType.ERROR);

                    return of(undefined);
                })
            )
        );
    }

    private prepareRequestBody(): AddGameRequestBody {
        const { name, length, difficulty, lovedGame, badGame, doesntCount, buggedGame, adultGame, hasNewAchievements, groups } = this.gameModel();
        const checkboxCategories: [boolean, CategoryType][] = [
            [lovedGame, CategoryType.LOVED_GAME],
            [badGame, CategoryType.BAD_GAME],
            [doesntCount, CategoryType.DOESNT_COUNT],
            [buggedGame, CategoryType.BUGGED_GAME],
            [adultGame, CategoryType.ADULT_GAME],
        ];
        const checkedCategories = checkboxCategories.filter(([isChecked]) => isChecked).map(([, categoryType]) => categoryType);

        return {
            name: name.trim(),
            hasNewAchievements,
            groups: groups.map((group) => ({ name: group.name.trim(), hasNewAchievements: group.hasNewAchievements })),
            categories: [length, difficulty, ...checkedCategories].filter((categoryType) => categoryType !== null),
        };
    }

    private mapGameToFormModel(game: Game | null): GameFormModel {
        const categoryTypes = game?.categories?.map(({ type }) => type) ?? [];

        return {
            name: game?.name ?? '',
            length: categoryTypes.find((categoryType) => LENGTH_CATEGORY_TYPES.includes(categoryType)) ?? null,
            difficulty: categoryTypes.find((categoryType) => DIFFICULTY_CATEGORY_TYPES.includes(categoryType)) ?? null,
            lovedGame: categoryTypes.includes(CategoryType.LOVED_GAME),
            badGame: categoryTypes.includes(CategoryType.BAD_GAME),
            doesntCount: categoryTypes.includes(CategoryType.DOESNT_COUNT),
            buggedGame: categoryTypes.includes(CategoryType.BUGGED_GAME),
            adultGame: categoryTypes.includes(CategoryType.ADULT_GAME),
            hasNewAchievements: game?.hasNewAchievements ?? false,
            groups: game?.groups.map(({ name, hasNewAchievements }) => ({ name, hasNewAchievements })) ?? [],
        };
    }
}

import { ViewportScroller } from '@angular/common';
import type { HttpErrorResponse } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { afterNextRender, afterRenderEffect, Component, computed, inject, Injector, input, linkedSignal, output, untracked, viewChild, viewChildren } from '@angular/core';
import type { FieldState } from '@angular/forms/signals';
import { applyEach, disabled, form, FormField, FormRoot, pattern, required } from '@angular/forms/signals';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatOption } from '@angular/material/core';
import { MatError, MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';

import { catchError, filter, firstValueFrom, of, take, tap } from 'rxjs';

import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import type { GameFormModel } from './interfaces/game-form-model.interface';
import type { GameFormSource } from './interfaces/game-form-source.interface';
import type { GameGroupFormModel } from './interfaces/game-group-form-model.interface';
import type { GameMainCategoryFormModel } from './interfaces/game-main-category-form-model.interface';
import { ConfirmationService } from '../../../../components/confirmation/confirmation.service';
import { SnackbarType } from '../../../../components/snackbar/enums/snackbar-type.enum';
import { SnackbarService } from '../../../../components/snackbar/snackbar.service';
import { ErrorCode } from '../../../../enums/error-code.enum';
import type { AddGameRequestBody } from '../../../../interfaces/add-game-request-body.interface';
import type { Category } from '../../../../interfaces/category.interface';
import type { ErrorResponseBody } from '../../../../interfaces/error-response-body.interface';
import { NOT_BLANK_PATTERN } from '../../constants/form.constants';
import { EditGameService } from '../../services/edit-game.service';
import { SectionHeadingComponent } from '../section-heading/section-heading.component';

@Component({
    selector: 'mados-add-game-form',
    templateUrl: './add-game-form.component.html',
    styleUrl: './add-game-form.component.scss',
    imports: [SectionHeadingComponent, FormRoot, FormField, MatFormField, MatLabel, MatError, MatSuffix, MatInput, MatIcon, MatIconButton, MatSelect, MatOption, MatCheckbox, MatButton, TranslocoPipe],
})
export class AddGameFormComponent {
    private readonly httpClient = inject(HttpClient);
    private readonly editGameService = inject(EditGameService);
    private readonly confirmationService = inject(ConfirmationService);
    private readonly viewportScroller = inject(ViewportScroller);
    private readonly snackbarService = inject(SnackbarService);
    private readonly translocoService = inject(TranslocoService);
    private readonly injector = inject(Injector);

    private readonly addBaseGameGroupButton = viewChild.required('addBaseGameGroupButton', { read: MatIconButton });
    private readonly addGroupButtons = viewChildren('addGroupButton', { read: MatIconButton });

    public readonly mainCategories = input.required<Category[]>();
    public readonly lengthCategories = input.required<Category[]>();
    public readonly difficultyCategories = input.required<Category[]>();

    public readonly reloadDescription = output();

    public readonly headingId = 'manageGameHeading';
    public readonly isEditing = computed<boolean>(() => this.editGameService.editedGame() !== null);

    private readonly gameModel = linkedSignal<GameFormSource, GameFormModel>({
        source: () => ({
            game: this.editGameService.editedGame(),
            mainCategories: this.mainCategories(),
            lengthCategories: this.lengthCategories(),
            difficultyCategories: this.difficultyCategories(),
        }),
        computation: (source, previous) => this.computeGameModel(source, previous),
    });

    public readonly gameForm = form(
        this.gameModel,
        (path) => {
            required(path.name);
            pattern(path.name, NOT_BLANK_PATTERN);
            disabled(path.length, { when: () => !this.lengthCategories().length });
            disabled(path.difficulty, { when: () => !this.difficultyCategories().length });
            applyEach(path.groups, (groupPath) => {
                required(groupPath.name);
                pattern(groupPath.name, NOT_BLANK_PATTERN);
            });
        },
        { submission: { action: () => this.saveGame() } }
    );

    constructor() {
        afterRenderEffect(() => {
            if (!this.editGameService.editedGame()) {
                return;
            }

            untracked(() => {
                this.viewportScroller.scrollToAnchor(this.headingId);
                this.gameForm.name().focusBoundControl({ preventScroll: true });
            });
        });
    }

    public clearField<T>(event: MouseEvent, field: () => FieldState<T>, emptyValue: T): void {
        event.stopPropagation();
        field().reset(emptyValue);
        field().focusBoundControl();
    }

    public addGroup(index: number): void {
        const newGroup: GameGroupFormModel = { id: null, name: '', hasNewAchievements: false };

        this.gameModel.update((gameModel) => ({ ...gameModel, groups: [...gameModel.groups.slice(0, index), newGroup, ...gameModel.groups.slice(index)] }));
    }

    // A saved group is deleted only after saving the form, so its removal is confirmed first
    public removeGroup(index: number): void {
        const group = this.gameModel().groups[index];
        const savedGroup = this.editGameService.editedGame()?.groups.find(({ id }) => id === group.id);

        if (!savedGroup) {
            this.removeGroupFromModel(group);

            return;
        }

        this.confirmationService
            .openConfirmation({
                title: this.translocoService.translate('confirmation.delete.group.title'),
                questionStart: this.translocoService.translate('confirmation.delete.group.questionStart'),
                identifier: savedGroup.name,
                questionEnd: this.translocoService.translate('confirmation.delete.group.questionEnd'),
            })
            .pipe(take(1), filter(Boolean))
            .subscribe(() => this.removeGroupFromModel(group));
    }

    public resetForm(): void {
        this.gameForm().reset();
        this.editGameService.stopEditing();
        // The cancel button disappears and the submit button gets disabled, so the focus is moved to where the next game starts
        this.gameForm.name().focusBoundControl();
    }

    private removeGroupFromModel(removedGroup: GameGroupFormModel): void {
        const removedIndex = this.gameModel().groups.indexOf(removedGroup);

        this.gameModel.update((gameModel) => ({ ...gameModel, groups: gameModel.groups.filter((group) => group !== removedGroup) }));
        // The removed group takes its focused button with it. The add button of the group above restores the same position,
        // while focusing another remove button would let repeated key presses remove several groups by accident
        afterNextRender(() => (removedIndex === 0 ? this.addBaseGameGroupButton() : this.addGroupButtons().at(removedIndex - 1))?.focus(), { injector: this.injector });
    }

    private saveGame(): Promise<void> {
        const editedGame = this.editGameService.editedGame();
        const requestBody = this.prepareRequestBody();
        const saveGameRequest = editedGame ? this.httpClient.put<void>(`game/${editedGame.id}`, requestBody) : this.httpClient.post<void>('game', requestBody);

        return firstValueFrom(
            saveGameRequest.pipe(
                tap(() => {
                    this.snackbarService.openSnackbar(this.translocoService.translate('addGameForm.saveSuccess'), SnackbarType.SUCCESS);
                    this.resetForm();
                    this.reloadDescription.emit();
                }),
                catchError(({ error }: HttpErrorResponse) => {
                    const errorResponseBody = error as ErrorResponseBody | null;
                    const messageKey = errorResponseBody?.errorCode === ErrorCode.EMPTY_NAME ? 'addGameForm.emptyName' : 'addGameForm.saveError';

                    this.snackbarService.openSnackbar(this.translocoService.translate(messageKey), SnackbarType.ERROR);

                    return of(undefined);
                })
            )
        );
    }

    private prepareRequestBody(): AddGameRequestBody {
        const { name, length, difficulty, mainCategories, hasNewAchievements, groups } = this.gameModel();
        const checkedMainCategoriesIds = mainCategories.filter(({ isChecked }) => isChecked).map(({ id }) => id);

        return {
            name: name.trim(),
            hasNewAchievements,
            groups: groups.map((group) => ({ name: group.name.trim(), hasNewAchievements: group.hasNewAchievements })),
            categories: [...checkedMainCategoriesIds, length, difficulty].filter((categoryId) => categoryId !== null),
        };
    }

    // Categories saved while filling the form keep the filled values, only deleted categories are dropped from them
    private computeGameModel(source: GameFormSource, previous?: { source: GameFormSource; value: GameFormModel }): GameFormModel {
        const haveOnlyCategoriesChanged =
            previous?.source.game === source.game &&
            (previous.source.mainCategories !== source.mainCategories ||
                previous.source.lengthCategories !== source.lengthCategories ||
                previous.source.difficultyCategories !== source.difficultyCategories);

        if (!haveOnlyCategoriesChanged) {
            return this.mapGameToFormModel(source);
        }

        const { length, difficulty, mainCategories } = previous.value;
        const checkedMainCategoriesIds = mainCategories.filter(({ isChecked }) => isChecked).map(({ id }) => id);

        return {
            ...previous.value,
            length: this.findCategoryId(source.lengthCategories, length === null ? [] : [length]),
            difficulty: this.findCategoryId(source.difficultyCategories, difficulty === null ? [] : [difficulty]),
            mainCategories: this.mapMainCategories(source.mainCategories, checkedMainCategoriesIds),
        };
    }

    private mapGameToFormModel({ game, mainCategories, lengthCategories, difficultyCategories }: GameFormSource): GameFormModel {
        const categoriesIds = game?.categories?.map(({ id }) => id) ?? [];

        return {
            name: game?.name ?? '',
            length: this.findCategoryId(lengthCategories, categoriesIds),
            difficulty: this.findCategoryId(difficultyCategories, categoriesIds),
            mainCategories: this.mapMainCategories(mainCategories, categoriesIds),
            hasNewAchievements: game?.hasNewAchievements ?? false,
            groups: game?.groups.map(({ id, name, hasNewAchievements }) => ({ id, name, hasNewAchievements })) ?? [],
        };
    }

    private mapMainCategories(mainCategories: Category[], checkedCategoriesIds: number[]): GameMainCategoryFormModel[] {
        return mainCategories.map(({ id, name }) => ({ id, name, isChecked: checkedCategoriesIds.includes(id) }));
    }

    private findCategoryId(categories: Category[], categoriesIds: number[]): number | null {
        return categories.find(({ id }) => categoriesIds.includes(id))?.id ?? null;
    }
}

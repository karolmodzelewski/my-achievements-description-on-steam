import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, input, linkedSignal, output } from '@angular/core';
import type { FieldState } from '@angular/forms/signals';
import { form, FormField, FormRoot, pattern, required } from '@angular/forms/signals';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatError, MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';

import { catchError, firstValueFrom, of, tap } from 'rxjs';

import type { OneHundredPercentFormModel } from './interfaces/one-hundred-percent-form-model.interface';
import { SnackbarType } from '../../../../../../components/snackbar/enums/snackbar-type.enum';
import { SnackbarService } from '../../../../../../components/snackbar/snackbar.service';
import { CategoryKind } from '../../../../../../enums/category-kind.enum';
import type { CategoryRequestBody } from '../../../../../../interfaces/category-request-body.interface';
import type { Category } from '../../../../../../interfaces/category.interface';
import { NOT_BLANK_PATTERN } from '../../../../constants/form.constants';

@Component({
    selector: 'mados-one-hundred-percent-form',
    templateUrl: './one-hundred-percent-form.component.html',
    styleUrl: './one-hundred-percent-form.component.scss',
    imports: [FormRoot, FormField, MatFormField, MatLabel, MatError, MatSuffix, MatInput, MatIcon, MatIconButton, MatButton],
})
export class OneHundredPercentFormComponent {
    private readonly httpClient = inject(HttpClient);
    private readonly snackbarService = inject(SnackbarService);

    // The 100% category always exists and has a fixed name, so only its icon can be changed
    public readonly category = input.required<Category>();

    public readonly categorySaved = output();

    public readonly legend = '100% category';

    private readonly categoryModel = linkedSignal<OneHundredPercentFormModel>(() => ({ iconName: this.category().iconName }));

    public readonly categoryForm = form(
        this.categoryModel,
        (path) => {
            required(path.iconName);
            pattern(path.iconName, NOT_BLANK_PATTERN);
        },
        { submission: { action: () => this.saveCategory() } }
    );

    public readonly hasChanges = computed<boolean>(() => this.categoryModel().iconName.trim() !== this.category().iconName);

    public clearField(event: MouseEvent, field: () => FieldState<string>): void {
        event.stopPropagation();
        field().reset('');
        field().focusBoundControl();
    }

    private saveCategory(): Promise<void> {
        const { id, name } = this.category();
        const requestBody: CategoryRequestBody[] = [{ id, name, iconName: this.categoryModel().iconName.trim(), shouldHideGames: false }];

        return firstValueFrom(
            this.httpClient.put<void>(`categories/${CategoryKind.ONE_HUNDRED_PERCENT}`, requestBody).pipe(
                tap(() => {
                    this.snackbarService.openSnackbar('Successfully saved 100% category', SnackbarType.SUCCESS);
                    this.categorySaved.emit();
                }),
                catchError(() => {
                    this.snackbarService.openSnackbar('An error has occurred while saving 100% category', SnackbarType.ERROR);

                    return of(undefined);
                })
            )
        );
    }
}

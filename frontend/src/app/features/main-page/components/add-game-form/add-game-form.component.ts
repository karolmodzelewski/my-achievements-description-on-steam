import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { AddGameRequestBody } from '../../../../interfaces/add-game-request-body.interface';
import { CategoryType } from '../../../../enums/category-type.enum';
import { AddGameFormControl } from './enums/add-game-form-control.enum';

@Component({
    selector: 'mados-add-game-form',
    templateUrl: './add-game-form.component.html',
    styleUrls: ['./add-game-form.component.scss'],
})
export class AddGameFormComponent implements OnInit {
    public headingText: string = 'Add game';
    public form: FormGroup;
    public AddGameFormControl: typeof AddGameFormControl = AddGameFormControl;
    public CategoryType: typeof CategoryType = CategoryType;

    constructor(private httpClient: HttpClient) {}

    public ngOnInit(): void {
        this.initForm();
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

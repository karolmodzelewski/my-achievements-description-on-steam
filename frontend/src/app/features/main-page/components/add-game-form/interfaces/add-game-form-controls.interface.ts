import type { FormControl, FormGroup } from '@angular/forms';

import type { GameCategoriesFormControls } from './game-categories-form-controls.interface';
import type { AddGameFormControl } from '../enums/add-game-form-control.enum';
import type { AddGameFormGroup } from '../enums/add-game-form-group.enum';

export interface AddGameFormControls {
    [AddGameFormControl.NAME]: FormControl<string | null>;
    [AddGameFormControl.HAS_NEW_ACHIEVEMENTS]: FormControl<boolean | null>;
    [AddGameFormGroup.GAME_CATEGORIES]: FormGroup<GameCategoriesFormControls>;
}

import type { FormControl } from '@angular/forms';

import type { CategoryType } from '../../../../../enums/category-type.enum';
import type { AddGameFormControl } from '../enums/add-game-form-control.enum';

export interface GameCategoriesFormControls {
    [AddGameFormControl.LENGTH]: FormControl<CategoryType | null>;
    [AddGameFormControl.DIFFICULTY]: FormControl<CategoryType | null>;
    [AddGameFormControl.LOVED_GAME]: FormControl<boolean | null>;
    [AddGameFormControl.BAD_GAME]: FormControl<boolean | null>;
    [AddGameFormControl.DOESNT_COUNT]: FormControl<boolean | null>;
    [AddGameFormControl.BUGGED_GAME]: FormControl<boolean | null>;
    [AddGameFormControl.ADULT_GAME]: FormControl<boolean | null>;
}

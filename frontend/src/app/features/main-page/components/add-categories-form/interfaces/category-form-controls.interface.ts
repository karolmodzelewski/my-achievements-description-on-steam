import type { FormControl } from '@angular/forms';

export interface CategoryFormControls {
    iconName: FormControl<string | null>;
    description?: FormControl<string | null>;
}

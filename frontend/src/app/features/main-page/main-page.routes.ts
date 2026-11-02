import type { Routes } from '@angular/router';

import { MainPageComponent } from './main-page.component';
import { EditGameService } from './services/edit-game.service';
import { SnackbarService } from '../../components/snackbar/snackbar.service';

export const mainPageRoutes: Routes = [
    {
        path: '',
        component: MainPageComponent,
        providers: [EditGameService, SnackbarService],
    },
];

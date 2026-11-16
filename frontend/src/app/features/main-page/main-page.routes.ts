import type { Routes } from '@angular/router';

import { MainPageComponent } from './main-page.component';
import { CategoriesApiService } from './services/categories-api.service';
import { DescriptionApiService } from './services/description-api.service';
import { EditGameService } from './services/edit-game.service';
import { GameApiService } from './services/game-api.service';
import { ConfirmationService } from '../../components/confirmation/confirmation.service';
import { SnackbarService } from '../../components/snackbar/snackbar.service';

export const mainPageRoutes: Routes = [
    {
        path: '',
        component: MainPageComponent,
        providers: [CategoriesApiService, DescriptionApiService, GameApiService, EditGameService, SnackbarService, ConfirmationService],
    },
];

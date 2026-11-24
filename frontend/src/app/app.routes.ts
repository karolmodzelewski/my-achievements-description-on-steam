import type { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadChildren: async () => import('./features/main-page/main-page.routes').then((m) => m.mainPageRoutes),
    },
];

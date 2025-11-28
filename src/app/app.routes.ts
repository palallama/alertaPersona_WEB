import { Routes } from '@angular/router';
import { LandingComponent } from './views/landing/landing';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        component: LandingComponent
    },
    {
        path: 'admin',
        loadChildren: () =>
            import('./views/admin/admin.routes').then((mod) => mod.ADMIN_ROUTES),
    },
    //   {
    //     path: '',
    //     component: VerticalLayout,
    //     loadChildren: () =>
    //       import('./views/views.route').then((mod) => mod.VIEWS_ROUTES),
    //     canActivate: [authGuard],
    //   },
];

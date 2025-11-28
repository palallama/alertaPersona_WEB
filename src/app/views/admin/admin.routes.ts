import { Routes } from '@angular/router'
import { Login } from './login/login'
import { Usuarios } from './usuario/usuarios/usuarios'
import { authGuard } from '@core/guards/auth.guard'
import { UsuarioFormComponent } from './usuario/usuario/usuario'
import { Dashboard } from './dashboard/dashboard'

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: Dashboard,
    canActivate: [authGuard],
  },
  {
    path: 'login',
    component: Login,
  },
  {
    path: 'usuarios',
    component: Usuarios,
    canActivate: [authGuard],
  },
]

import { Routes } from '@angular/router';
import { authGuard } from './features/auth/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'portfolio', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'portfolio',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/investments/portfolio-overview/portfolio-overview.component').then(
        (m) => m.PortfolioOverviewComponent,
      ),
  },
  {
    path: 'investments',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/investments/investment-list/investment-list.component').then(
        (m) => m.InvestmentListComponent,
      ),
  },
];

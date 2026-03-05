import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'portfolio', pathMatch: 'full' },
  {
    path: 'portfolio',
    loadComponent: () =>
      import('./features/investments/portfolio-overview/portfolio-overview.component').then(
        (m) => m.PortfolioOverviewComponent,
      ),
  },
  {
    path: 'investments',
    loadComponent: () =>
      import('./features/investments/investment-list/investment-list.component').then(
        (m) => m.InvestmentListComponent,
      ),
  },
];

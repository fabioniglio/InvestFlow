import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { CurrencySelectorComponent } from './core/components/currency-selector/currency-selector.component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    CurrencySelectorComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}

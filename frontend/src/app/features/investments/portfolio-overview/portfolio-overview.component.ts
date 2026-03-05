import { CurrencyPipe, DecimalPipe, NgClass } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PortfolioValue } from '../../../core/models/investment.model';
import { InvestmentsService } from '../../../core/services/investments.service';
import { PortfolioChartsComponent } from '../portfolio-charts/portfolio-charts.component';

@Component({
  selector: 'app-portfolio-overview',
  imports: [MatCardModule, MatProgressSpinnerModule, MatIconModule, CurrencyPipe, DecimalPipe, NgClass, PortfolioChartsComponent],
  templateUrl: './portfolio-overview.component.html',
  styleUrl: './portfolio-overview.component.scss',
})
export class PortfolioOverviewComponent implements OnInit {
  private service = inject(InvestmentsService);

  portfolio = signal<PortfolioValue[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.service.getPortfolioValue().subscribe({
      next: (data) => {
        this.portfolio.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load portfolio data.');
        this.loading.set(false);
      },
    });
  }

  totalInvested(): number {
    return this.portfolio().reduce((sum, s) => sum + Number(s.total_invested), 0);
  }

  hasPrices(): boolean {
    return this.portfolio().some((s) => s.current_value !== null);
  }

  totalCurrentValue(): number | null {
    if (!this.hasPrices()) return null;
    return this.portfolio().reduce((sum, s) => sum + (s.current_value ?? 0), 0);
  }

  totalPnl(): number | null {
    const cv = this.totalCurrentValue();
    return cv !== null ? cv - this.totalInvested() : null;
  }

  totalPnlPercent(): number | null {
    const pnl = this.totalPnl();
    if (pnl === null) return null;
    const invested = this.totalInvested();
    return invested > 0 ? (pnl / invested) * 100 : 0;
  }

  totalDividends(): number {
    return this.portfolio().reduce((sum, s) => sum + Number(s.total_dividends), 0);
  }
}

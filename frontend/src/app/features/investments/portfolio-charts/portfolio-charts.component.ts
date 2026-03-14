import {
  AfterViewInit,
  Component,
  effect,
  ElementRef,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { Investment, PortfolioValue } from '../../../core/models/investment.model';
import { CurrencyService } from '../../../core/services/currency.service';
import { InvestmentsService } from '../../../core/services/investments.service';

Chart.register(...registerables);

const COLORS = [
  '#4285F4', '#EA4335', '#FBBC05', '#34A853', '#FF6D00',
  '#46BDC6', '#7B68EE', '#FF6B9D', '#00ACC1', '#AB47BC',
];

@Component({
  selector: 'app-portfolio-charts',
  imports: [],
  templateUrl: './portfolio-charts.component.html',
  styleUrl: './portfolio-charts.component.scss',
})
export class PortfolioChartsComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() portfolio: PortfolioValue[] = [];

  @ViewChild('allocationCanvas') allocationCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('pnlCanvas') pnlCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('historyCanvas') historyCanvas!: ElementRef<HTMLCanvasElement>;

  private service = inject(InvestmentsService);
  private currencyService = inject(CurrencyService);
  private allocationChart?: Chart;
  private pnlChart?: Chart;
  private historyChart?: Chart;
  private viewReady = false;

  constructor() {
    effect(() => {
      this.currencyService.selectedCurrency();
      if (this.viewReady) this.renderCharts();
    });
  }

  private formatCurrency(amount: number): string {
    const rate = this.currencyService.getRate();
    const code = this.currencyService.getCurrencyCode();
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount * rate);
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.renderCharts();
    this.loadHistory();
  }

  ngOnChanges(): void {
    if (this.viewReady) {
      this.renderCharts();
    }
  }

  ngOnDestroy(): void {
    this.allocationChart?.destroy();
    this.pnlChart?.destroy();
    this.historyChart?.destroy();
  }

  private renderCharts(): void {
    this.renderAllocation();
    this.renderPnl();
  }

  private renderAllocation(): void {
    this.allocationChart?.destroy();
    const assets = this.portfolio.filter((a) => (a.current_value ?? 0) > 0);
    if (!assets.length) return;

    this.allocationChart = new Chart(this.allocationCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: assets.map((a) => a.asset_symbol),
        datasets: [
          {
            data: assets.map((a) => +(a.current_value ?? 0).toFixed(2)),
            backgroundColor: COLORS,
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'right' },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${this.formatCurrency(ctx.raw as number)}`,
            },
          },
        },
      },
    });
  }

  private renderPnl(): void {
    this.pnlChart?.destroy();
    const assets = this.portfolio.filter((a) => a.pnl !== null);
    if (!assets.length) return;

    this.pnlChart = new Chart(this.pnlCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: assets.map((a) => a.asset_symbol),
        datasets: [
          {
            label: `P&L (${this.currencyService.getCurrencyCode()})`,
            data: assets.map((a) => +(a.pnl ?? 0).toFixed(2)),
            backgroundColor: assets.map((a) =>
              (a.pnl ?? 0) >= 0 ? 'rgba(46, 125, 50, 0.8)' : 'rgba(198, 40, 40, 0.8)',
            ),
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: {
            ticks: {
              callback: (v) => this.formatCurrency(+(v ?? 0)),
            },
          },
        },
      },
    });
  }

  private loadHistory(): void {
    this.service.getAll().subscribe((investments) => {
      this.renderHistory(investments);
    });
  }

  private renderHistory(investments: Investment[]): void {
    this.historyChart?.destroy();
    if (!investments.length) return;

    const sorted = [...investments]
      .filter((i) => i.type === 'buy' || i.type === 'sell')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let cumulative = 0;
    const points: { x: string; y: number }[] = [];

    for (const inv of sorted) {
      cumulative += inv.type === 'buy' ? Number(inv.amount) : -Number(inv.amount);
      points.push({
        x: new Date(inv.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }),
        y: +cumulative.toFixed(2),
      });
    }

    this.historyChart = new Chart(this.historyCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: points.map((p) => p.x),
        datasets: [
          {
            label: `Total Invested (${this.currencyService.getCurrencyCode()})`,
            data: points.map((p) => p.y),
            borderColor: '#4285F4',
            backgroundColor: 'rgba(66, 133, 244, 0.1)',
            fill: true,
            tension: 0.3,
            pointRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: {
            ticks: { callback: (v) => this.formatCurrency(+(v ?? 0)) },
          },
        },
      },
    });
  }
}

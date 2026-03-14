import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from './api.service';

export interface ExchangeRates {
  base: string;
  rates: Record<string, number>;
}

export const BASE_CURRENCY = 'USD';

export const CURRENCY_OPTIONS: { code: string; label: string }[] = [
  { code: 'USD', label: 'US Dollar' },
  { code: 'EUR', label: 'Euro' },
  { code: 'GBP', label: 'British Pound' },
  { code: 'CHF', label: 'Swiss Franc' },
  { code: 'JPY', label: 'Japanese Yen' },
  { code: 'CAD', label: 'Canadian Dollar' },
  { code: 'AUD', label: 'Australian Dollar' },
];

const STORAGE_KEY = 'investflow.displayCurrency';

@Injectable({ providedIn: 'root' })
export class CurrencyService {
  private api = inject(ApiService);

  readonly selectedCurrency = signal<string>(this.loadStored());
  readonly rates = signal<ExchangeRates | null>(null);

  private loadStored(): string {
    if (typeof localStorage === 'undefined') return BASE_CURRENCY;
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored && CURRENCY_OPTIONS.some((c) => c.code === stored)
      ? stored
      : BASE_CURRENCY;
  }

  setCurrency(code: string): void {
    if (!CURRENCY_OPTIONS.some((c) => c.code === code)) return;
    this.selectedCurrency.set(code);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, code);
    }
  }

  loadRates(): void {
    this.api.get<ExchangeRates>('/market/rates').subscribe({
      next: (data) => this.rates.set(data),
      error: () => this.rates.set(null),
    });
  }

  /** Multiplier to convert from base (USD) to selected currency. 1 for USD. */
  getRate(): number {
    const code = this.selectedCurrency();
    if (code === BASE_CURRENCY) return 1;
    const r = this.rates();
    return r?.rates?.[code] ?? 1;
  }

  getCurrencyCode(): string {
    return this.selectedCurrency();
  }
}

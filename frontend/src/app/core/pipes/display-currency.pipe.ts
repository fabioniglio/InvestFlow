import { inject, Pipe, PipeTransform } from '@angular/core';
import { CurrencyService } from '../services/currency.service';

/**
 * Converts an amount in USD (base currency) to the user's selected display currency
 * and formats it (e.g. 1500 -> "€1,380.00" when EUR is selected).
 * Impure so that changing the selected currency updates all displayed amounts.
 */
@Pipe({ name: 'displayCurrency', standalone: true, pure: false })
export class DisplayCurrencyPipe implements PipeTransform {
  private currencyService = inject(CurrencyService);

  transform(value: number | string | null | undefined): string {
    if (value == null || value === '') return '—';
    const num = typeof value === 'string' ? Number(value) : value;
    if (Number.isNaN(num)) return '—';
    const rate = this.currencyService.getRate();
    const converted = num * rate;
    const code = this.currencyService.getCurrencyCode();
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(converted);
  }
}

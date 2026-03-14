import { Component, inject, OnInit } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { CurrencyService, CURRENCY_OPTIONS } from '../../services/currency.service';

@Component({
  selector: 'app-currency-selector',
  standalone: true,
  imports: [MatFormFieldModule, MatSelectModule],
  template: `
    <mat-form-field subscriptSizing="dynamic" class="currency-field">
      <mat-label>Currency</mat-label>
      <mat-select
        [value]="currencyService.selectedCurrency()"
        (valueChange)="currencyService.setCurrency($event)"
      >
        @for (opt of options; track opt.code) {
          <mat-option [value]="opt.code">{{ opt.code }} – {{ opt.label }}</mat-option>
        }
      </mat-select>
    </mat-form-field>
  `,
  styles: [
    `
      .currency-field {
        width: 160px;
        margin-right: 8px;
      }
      :host ::ng-deep .currency-field .mat-mdc-form-field-subscript-wrapper {
        display: none;
      }
      :host ::ng-deep .currency-field .mat-mdc-text-field-wrapper {
        padding: 0 8px;
        background: rgba(255, 255, 255, 0.15);
        border-radius: 4px;
      }
    `,
  ],
})
export class CurrencySelectorComponent implements OnInit {
  readonly currencyService = inject(CurrencyService);
  readonly options = CURRENCY_OPTIONS;

  ngOnInit(): void {
    this.currencyService.loadRates();
  }
}
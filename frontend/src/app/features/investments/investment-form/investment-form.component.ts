import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InvestmentsService } from '../../../core/services/investments.service';

@Component({
  selector: 'app-investment-form',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './investment-form.component.html',
  styleUrl: './investment-form.component.scss',
})
export class InvestmentFormComponent {
  private fb = inject(FormBuilder);
  private service = inject(InvestmentsService);
  private dialogRef = inject(MatDialogRef<InvestmentFormComponent>);
  private snackBar = inject(MatSnackBar);

  saving = false;

  form = this.fb.group({
    asset_class: ['stock' as 'stock' | 'etf' | 'crypto' | 'mutual_fund' | 'other'],
    asset_symbol: ['', [Validators.required, Validators.maxLength(24)]],
    type: ['buy' as 'buy' | 'sell' | 'dividend', Validators.required],
    quantity: [null as number | null],
    price: [null as number | null],
    amount: [null as number | null, [Validators.required, Validators.min(0.01)]],
    date: [new Date(), Validators.required],
    notes: [''],
  });

  constructor() {
    this.form.get('quantity')!.valueChanges.subscribe(() => this.autoCalcAmount());
    this.form.get('price')!.valueChanges.subscribe(() => this.autoCalcAmount());
  }

  private autoCalcAmount(): void {
    const qty = this.form.get('quantity')!.value;
    const price = this.form.get('price')!.value;
    if (qty && price) {
      this.form.get('amount')!.setValue(+(qty * price).toFixed(2), { emitEvent: false });
    }
  }

  submit(): void {
    if (this.form.invalid) return;
    this.saving = true;
    const val = this.form.getRawValue();

    const isCrypto = val.asset_class === 'crypto';
    this.service
      .create({
        asset_symbol: isCrypto ? val.asset_symbol! : val.asset_symbol!.toUpperCase(),
        asset_class: val.asset_class ?? undefined,
        type: val.type!,
        quantity: val.quantity ?? undefined,
        price: val.price ?? undefined,
        amount: val.amount!,
        date: (val.date as Date).toISOString(),
        notes: val.notes || undefined,
      })
      .subscribe({
        next: (result) => {
          this.snackBar.open('Investment added!', 'Close', { duration: 2000 });
          this.dialogRef.close(result);
        },
        error: () => {
          this.snackBar.open('Failed to save investment.', 'Close', { duration: 3000 });
          this.saving = false;
        },
      });
  }

  cancel(): void {
    this.dialogRef.close();
  }

  symbolPlaceholder(): string {
    const ac = this.form.get('asset_class')?.value;
    switch (ac) {
      case 'crypto':
        return 'e.g. BINANCE:BTCUSDT';
      case 'etf':
        return 'e.g. SPY, VOO';
      case 'mutual_fund':
        return 'e.g. VFIAX';
      default:
        return 'e.g. AAPL, MSFT';
    }
  }

  symbolHint(): string {
    const ac = this.form.get('asset_class')?.value;
    if (ac === 'crypto') {
      return 'Use EXCHANGE:PAIR (e.g. BINANCE:BTCUSDT) for current price from Finnhub';
    }
    return '';
  }
}

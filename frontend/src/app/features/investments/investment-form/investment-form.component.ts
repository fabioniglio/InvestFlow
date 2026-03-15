import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Asset, Investment } from '../../../core/models/investment.model';
import { AssetsService } from '../../../core/services/assets.service';
import { InvestmentsService } from '../../../core/services/investments.service';

export interface InvestmentFormData {
  investment?: Investment;
}

@Component({
  selector: 'app-investment-form',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './investment-form.component.html',
  styleUrl: './investment-form.component.scss',
})
export class InvestmentFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(InvestmentsService);
  private assetsService = inject(AssetsService);
  private dialogRef = inject(MatDialogRef<InvestmentFormComponent>);
  private snackBar = inject(MatSnackBar);
  private dialogData = inject<InvestmentFormData | null>(MAT_DIALOG_DATA, { optional: true });

  saving = false;
  symbolSuggestions = signal<Asset[]>([]);
  private symbolSearch$ = new Subject<string>();
  isEdit = false;
  editId: string | null = null;

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

    const assetClass = () => this.form.get('asset_class')?.value as string | undefined;
    this.symbolSearch$
      .pipe(
        debounceTime(250),
        distinctUntilChanged(),
        switchMap((q) =>
          this.assetsService.search({
            q: q || undefined,
            asset_class: assetClass() as Asset['asset_class'],
            limit: 15,
          }),
        ),
      )
      .subscribe({
        next: (list) => this.symbolSuggestions.set(list),
        error: () => this.symbolSuggestions.set([]),
      });
  }

  displaySymbol(asset: Asset | string | null): string {
    if (!asset) return '';
    return typeof asset === 'string' ? asset : asset.symbol;
  }

  onSymbolInput(): void {
    const q = this.form.get('asset_symbol')?.value?.trim();
    this.symbolSearch$.next(q ?? '');
  }

  onSymbolSelected(e: MatAutocompleteSelectedEvent): void {
    const asset = e.option.value as Asset;
    this.form.patchValue({
      asset_symbol: asset.symbol,
      asset_class: asset.asset_class,
    });
  }

  ngOnInit(): void {
    const inv = this.dialogData?.investment;
    if (inv) {
      this.isEdit = true;
      this.editId = inv.id;
      const date = inv.date ? new Date(inv.date) : new Date();
      this.form.patchValue({
        asset_class: (inv.asset_class ?? 'stock') as 'stock' | 'etf' | 'crypto' | 'mutual_fund' | 'other',
        asset_symbol: inv.asset_symbol ?? '',
        type: inv.type ?? 'buy',
        quantity: inv.quantity ?? null,
        price: inv.price ?? null,
        amount: inv.amount ?? null,
        date,
        notes: inv.notes ?? '',
      });
    }
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

    const qty = val.quantity != null ? Number(val.quantity) : undefined;
    const price = val.price != null ? Number(val.price) : undefined;
    const amount = val.amount != null ? Number(val.amount) : undefined;

    const payload = {
      asset_symbol: isCrypto ? val.asset_symbol! : val.asset_symbol!.toUpperCase(),
      asset_class: val.asset_class ?? undefined,
      type: val.type!,
      quantity: qty,
      price,
      amount: amount ?? 0,
      date: (val.date as Date).toISOString(),
      notes: val.notes || undefined,
    };

    const req = this.isEdit && this.editId
      ? this.service.update(this.editId, payload)
      : this.service.create(payload);

    req.subscribe({
      next: (result) => {
        this.snackBar.open(this.isEdit ? 'Investment updated!' : 'Investment added!', 'Close', { duration: 2000 });
        this.dialogRef.close(result);
      },
      error: () => {
        this.snackBar.open('Failed to save investment.', 'Close', { duration: 3000 });
        setTimeout(() => {
          this.saving = false;
        }, 0);
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

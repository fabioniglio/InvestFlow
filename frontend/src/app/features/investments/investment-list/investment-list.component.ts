import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { Investment } from '../../../core/models/investment.model';
import { DisplayCurrencyPipe } from '../../../core/pipes/display-currency.pipe';
import { InvestmentsService } from '../../../core/services/investments.service';
import { InvestmentFormComponent } from '../investment-form/investment-form.component';

@Component({
  selector: 'app-investment-list',
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    DatePipe,
    DisplayCurrencyPipe,
    DecimalPipe,
    FormsModule,
  ],
  templateUrl: './investment-list.component.html',
  styleUrl: './investment-list.component.scss',
})
export class InvestmentListComponent implements OnInit {
  private service = inject(InvestmentsService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  investments = signal<Investment[]>([]);
  loading = signal(true);

  filterType = '';
  filterAsset = '';

  readonly columns = ['date', 'asset', 'type', 'quantity', 'price', 'amount', 'actions'];

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.service
      .getAll({
        type: this.filterType || undefined,
        asset: this.filterAsset || undefined,
      })
      .subscribe({
        next: (data) => {
          this.investments.set(data);
          this.loading.set(false);
        },
        error: () => {
          this.snackBar.open('Failed to load investments.', 'Close', { duration: 3000 });
          this.loading.set(false);
        },
      });
  }

  openForm(): void {
    const ref = this.dialog.open(InvestmentFormComponent, { width: '500px' });
    ref.afterClosed().subscribe((result) => {
      if (result) this.load();
    });
  }

  edit(investment: Investment): void {
    const ref = this.dialog.open(InvestmentFormComponent, {
      width: '500px',
      data: { investment },
    });
    ref.afterClosed().subscribe((result) => {
      if (result) this.load();
    });
  }

  delete(id: string): void {
    this.service.delete(id).subscribe({
      next: () => {
        this.snackBar.open('Investment deleted.', 'Close', { duration: 2000 });
        this.load();
      },
      error: () => {
        this.snackBar.open('Failed to delete.', 'Close', { duration: 3000 });
      },
    });
  }

  applyFilters(): void {
    this.load();
  }

  clearFilters(): void {
    this.filterType = '';
    this.filterAsset = '';
    this.load();
  }
}

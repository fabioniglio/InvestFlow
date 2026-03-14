import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="auth-page">
      <mat-card class="auth-card">
        <mat-card-header>
          <mat-card-title>Sign in to InvestFlow</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="submit()">
            <mat-form-field class="full-width">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" placeholder="you@example.com">
              @if (form.get('email')?.hasError('required')) {
                <mat-error>Email is required</mat-error>
              }
            </mat-form-field>
            <mat-form-field class="full-width">
              <mat-label>Password</mat-label>
              <input matInput type="password" formControlName="password" placeholder="••••••••">
              @if (form.get('password')?.hasError('required')) {
                <mat-error>Password is required</mat-error>
              }
            </mat-form-field>
            @if (error()) {
              <p class="error">{{ error() }}</p>
            }
            <button mat-flat-button color="primary" type="submit" class="submit-btn" [disabled]="form.invalid || loading()">
              @if (loading()) {
                <mat-spinner diameter="20" />
              } @else {
                Sign in
              }
            </button>
          </form>
        </mat-card-content>
        <mat-card-footer>
          <a mat-button routerLink="/register">Create an account</a>
        </mat-card-footer>
      </mat-card>
    </div>
  `,
  styles: [`
    .auth-page { display: flex; justify-content: center; align-items: center; min-height: 60vh; padding: 24px; }
    .auth-card { width: 100%; max-width: 360px; }
    .full-width { width: 100%; }
    .submit-btn { width: 100%; margin-top: 8px; }
    .error { color: #c62828; font-size: 0.9rem; margin: 8px 0; }
    mat-card-footer { padding: 16px; text-align: center; }
  `],
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  loading = signal(false);
  error = signal('');

  submit(): void {
    this.error.set('');
    this.loading.set(true);
    const { email, password } = this.form.getRawValue();
    this.auth.login(email!, password!).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/portfolio']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message ?? 'Invalid email or password');
      },
    });
  }
}

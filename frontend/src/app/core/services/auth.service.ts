import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';

const TOKEN_KEY = 'investflow.token';

export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthResponse {
  user: AuthUser;
  access_token: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  readonly currentUser = signal<AuthUser | null>(this.loadStoredUser());

  private loadStoredUser(): AuthUser | null {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
    if (!raw) return null;
    try {
      const payload = JSON.parse(atob(raw.split('.')[1]));
      return payload.sub && payload.email ? { id: payload.sub, email: payload.email } : null;
    } catch {
      return null;
    }
  }

  getToken(): string | null {
    return typeof localStorage !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  login(email: string, password: string) {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap((res) => {
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem(TOKEN_KEY, res.access_token);
          }
          this.currentUser.set(res.user);
        }),
      );
  }

  register(email: string, password: string) {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/register`, { email, password })
      .pipe(
        tap((res) => {
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem(TOKEN_KEY, res.access_token);
          }
          this.currentUser.set(res.user);
        }),
      );
  }

  logout(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
    }
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }
}

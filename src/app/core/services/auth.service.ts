import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { StorageService } from './storage.service';
import {
  AuthResponse,
  LoginOtpResponse,
  LoginRequest,
  User,
  VerifyOtpRequest,
} from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly storage = inject(StorageService);

  // Signals expose auth state for templates without RxJS plumbing in every component.
  readonly currentUser = signal<User | null>(this.storage.getUser<User>());
  readonly isAuthenticated = computed(() => !!this.currentUser());

  // Step 1 of the OTP flow: validates password and issues a 6-digit code.
  // In dev the backend echoes the OTP in the response body so we can test
  // without an SMS provider.
  login(body: LoginRequest): Observable<LoginOtpResponse> {
    return this.api.post<LoginOtpResponse>('/users/login', body);
  }

  // Step 2: exchange OTP for a session token, persist and update state.
  verifyOtp(body: VerifyOtpRequest): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('/users/verify-otp', body).pipe(
      tap((res) => {
        if (res.success && res.token && res.user) {
          this.storage.setToken(res.token);
          this.storage.setUser(res.user);
          this.currentUser.set(res.user);
        }
      })
    );
  }

  logout(): Observable<{ success: boolean }> {
    return this.api.post<{ success: boolean }>('/users/logout').pipe(
      tap({
        next: () => this.clear(),
        error: () => this.clear(),
      })
    );
  }

  // Local-only sign-out — for when we want to drop state without calling the
  // server (e.g. interceptor caught a 401).
  clear(): void {
    this.storage.clear();
    this.currentUser.set(null);
  }

  getToken(): string | null {
    return this.storage.getToken();
  }

  isAdmin(): boolean {
    const role = this.currentUser()?.role;
    return role === 'admin' || role === 'super_admin';
  }

  isSuperAdmin(): boolean {
    return this.currentUser()?.role === 'super_admin';
  }
}

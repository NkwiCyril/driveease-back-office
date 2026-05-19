import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { IconComponent } from '../../shared/components/icon/icon.component';

type LoginStep = 'credentials' | 'otp' | 'forgot';

@Component({
  selector: 'pe-login-page',
  standalone: true,
  imports: [FormsModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-primary-container flex items-center justify-center p-gutter">
      <main class="w-full max-w-[420px]">
        <div class="bg-surface-container-lowest rounded-xl border border-outline-variant p-container_padding shadow-overlay">
          <!-- Header -->
          <div class="text-center mb-stack_lg">
            <div class="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-surface-container-high border border-outline-variant mb-stack_md">
              <pe-icon name="directions_car" [size]="32" [filled]="true" class="text-primary" />
            </div>
            <h1 class="font-h1 text-h1 text-primary mb-base">ParkEase</h1>
            <p class="font-body-md text-body-md text-on-surface-variant">Admin Portal</p>
          </div>

          @if (banner()) {
            <div class="mb-stack_md px-4 py-3 rounded border-[1.5px] border-error/30 bg-error/10 text-error font-body-sm text-body-sm flex items-start gap-2">
              <pe-icon name="error" [size]="18" />
              <span>{{ banner() }}</span>
            </div>
          }

          @if (step() === 'credentials') {
            <form class="space-y-stack_md" (ngSubmit)="onSubmitCredentials()">
              <div>
                <label class="block font-label-md text-label-md text-on-surface mb-base" for="phone">Phone Number</label>
                <div class="flex">
                  <span class="inline-flex items-center px-4 rounded-l border border-r-0 border-outline-variant bg-surface-container-low font-body-md text-body-md text-on-surface-variant">
                    +237
                  </span>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    [(ngModel)]="phone"
                    placeholder="000 000 000"
                    autocomplete="tel-national"
                    required
                    class="flex-1 block w-full px-4 py-3 rounded-none rounded-r border border-outline-variant bg-surface-container-lowest font-body-md text-body-md text-on-surface placeholder:text-outline focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label class="block font-label-md text-label-md text-on-surface mb-base" for="password">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  [(ngModel)]="password"
                  placeholder="Enter your password"
                  autocomplete="current-password"
                  required
                  class="block w-full px-4 py-3 rounded border border-outline-variant bg-surface-container-lowest font-body-md text-body-md text-on-surface placeholder:text-outline focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors"
                />
              </div>

              <div class="pt-stack_sm">
                <button
                  type="submit"
                  [disabled]="loading()"
                  class="w-full flex justify-center py-3 px-4 rounded-full font-label-md text-label-md text-on-secondary bg-secondary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary transition-opacity disabled:opacity-60"
                >
                  {{ loading() ? 'Sending OTP…' : 'Continue' }}
                </button>
              </div>
            </form>
          } @else if (step() === 'otp') {
            <form class="space-y-stack_md" (ngSubmit)="onSubmitOtp()">
              <div class="text-center mb-stack_md">
                <p class="font-body-md text-body-md text-on-surface-variant">
                  A 6-digit code was sent to <span class="font-label-md text-on-surface">+237 {{ phone }}</span>
                </p>
                @if (devOtp()) {
                  <p class="font-label-sm text-label-sm text-status-warning mt-2">DEV: code is <code class="font-mono">{{ devOtp() }}</code></p>
                }
              </div>

              <div>
                <label class="block font-label-md text-label-md text-on-surface mb-base" for="otp">6-digit OTP</label>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  inputmode="numeric"
                  pattern="\\d{6}"
                  maxlength="6"
                  [(ngModel)]="otp"
                  placeholder="000000"
                  autocomplete="one-time-code"
                  required
                  class="block w-full px-4 py-3 rounded border border-outline-variant bg-surface-container-lowest font-display text-h1 text-on-surface text-center tracking-[0.4em] focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors"
                />
              </div>

              <div class="pt-stack_sm space-y-2">
                <button
                  type="submit"
                  [disabled]="loading() || otp.length !== 6"
                  class="w-full flex justify-center py-3 px-4 rounded-full font-label-md text-label-md text-on-secondary bg-secondary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary transition-opacity disabled:opacity-60"
                >
                  {{ loading() ? 'Verifying…' : 'Verify & Sign In' }}
                </button>
                <button
                  type="button"
                  (click)="backToCredentials()"
                  class="w-full text-center font-label-md text-label-md text-secondary hover:underline py-2"
                >
                  Back
                </button>
              </div>
            </form>
          } @else {
            <!-- Forgot password — OTP-less reset: API expects a phone and the new password.
                 In production this would be gated behind an OTP verification, but the
                 endpoint /api/users/reset-password (per the docs) is intentionally
                 dumb: any caller that knows the phone can reset. We surface this
                 limitation in the UI. -->
            <form class="space-y-stack_md" (ngSubmit)="onSubmitReset()">
              <p class="font-body-sm text-on-surface-variant">
                Enter the account's phone number and a new password. The API does not currently require an OTP for resets.
              </p>
              <div>
                <label class="block font-label-md text-label-md text-on-surface mb-base" for="reset-phone">Phone Number</label>
                <div class="flex">
                  <span class="inline-flex items-center px-4 rounded-l border border-r-0 border-outline-variant bg-surface-container-low font-body-md text-body-md text-on-surface-variant">+237</span>
                  <input
                    id="reset-phone"
                    name="resetPhone"
                    type="tel"
                    [(ngModel)]="phone"
                    placeholder="000 000 000"
                    required
                    class="flex-1 block w-full px-4 py-3 rounded-none rounded-r border border-outline-variant bg-surface-container-lowest font-body-md text-body-md text-on-surface placeholder:text-outline focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors"
                  />
                </div>
              </div>
              <div>
                <label class="block font-label-md text-label-md text-on-surface mb-base" for="new-password">New Password</label>
                <input
                  id="new-password"
                  name="newPassword"
                  type="password"
                  [(ngModel)]="newPassword"
                  minlength="6"
                  required
                  class="block w-full px-4 py-3 rounded border border-outline-variant bg-surface-container-lowest font-body-md text-body-md text-on-surface placeholder:text-outline focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors"
                />
              </div>
              <div>
                <label class="block font-label-md text-label-md text-on-surface mb-base" for="repeat-password">Repeat New Password</label>
                <input
                  id="repeat-password"
                  name="repeatPassword"
                  type="password"
                  [(ngModel)]="repeatPassword"
                  required
                  class="block w-full px-4 py-3 rounded border border-outline-variant bg-surface-container-lowest font-body-md text-body-md text-on-surface placeholder:text-outline focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors"
                />
              </div>
              <div class="pt-stack_sm space-y-2">
                <button
                  type="submit"
                  [disabled]="loading()"
                  class="w-full flex justify-center py-3 px-4 rounded-full font-label-md text-label-md text-on-secondary bg-secondary hover:opacity-90 disabled:opacity-60 transition-opacity"
                >{{ loading() ? 'Resetting…' : 'Reset Password' }}</button>
                <button
                  type="button"
                  (click)="backToCredentials()"
                  class="w-full text-center font-label-md text-label-md text-secondary hover:underline py-2"
                >Back</button>
              </div>
            </form>
          }

          @if (step() === 'credentials') {
            <div class="mt-stack_lg text-center">
              <button type="button" (click)="step.set('forgot'); banner.set(null)" class="font-label-md text-label-md text-secondary hover:underline">Forgot Password?</button>
            </div>
          }
        </div>
      </main>
    </div>
  `,
})
export class LoginPage {
  private readonly auth = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  phone = '';
  password = '';
  otp = '';
  newPassword = '';
  repeatPassword = '';

  readonly step = signal<LoginStep>('credentials');
  readonly loading = signal(false);
  readonly banner = signal<string | null>(null);
  readonly devOtp = signal<string | null>(null);

  constructor() {
    const reason = this.route.snapshot.queryParamMap.get('reason');
    if (reason === 'session-expired') this.banner.set('Your session expired. Please sign in again.');
    if (reason === 'forbidden') this.banner.set('This portal is admin-only. Sign in with an admin account.');
  }

  onSubmitCredentials(): void {
    this.banner.set(null);
    this.loading.set(true);
    console.log('Attempting login with phone:', this.phone);
    this.auth.login({ phone: this.phone.trim(), password: this.password }).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.devOtp.set(res.otp ?? null);
        this.step.set('otp');
      },
      error: (err) => {
        this.loading.set(false);
        this.banner.set(err?.error?.message ?? 'Could not sign in. Check your credentials.');
      },
    });
  }

  onSubmitOtp(): void {
    this.banner.set(null);
    this.loading.set(true);
    this.auth.verifyOtp({ phone: this.phone.trim(), otp: this.otp.trim() }).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.success && this.auth.isAdmin()) {
          this.router.navigate(['/dashboard']);
        } else {
          this.auth.clear();
          this.banner.set('This account does not have admin access.');
          this.step.set('credentials');
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.banner.set(err?.error?.message ?? 'Invalid or expired code.');
      },
    });
  }

  backToCredentials(): void {
    this.step.set('credentials');
    this.otp = '';
    this.newPassword = '';
    this.repeatPassword = '';
    this.banner.set(null);
  }

  onSubmitReset(): void {
    if (this.newPassword !== this.repeatPassword) {
      this.banner.set('Passwords do not match.');
      return;
    }
    this.banner.set(null);
    this.loading.set(true);
    this.userService.resetPassword({
      phone: this.phone.trim(),
      password: this.newPassword,
      repeatPassword: this.repeatPassword,
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.banner.set('Password reset. Sign in with your new password.');
        this.password = '';
        this.newPassword = '';
        this.repeatPassword = '';
        this.step.set('credentials');
      },
      error: (err) => {
        this.loading.set(false);
        this.banner.set(err?.error?.message ?? 'Reset failed.');
      },
    });
  }
}

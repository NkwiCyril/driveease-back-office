import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models/user.model';
import { IconComponent } from '../components/icon/icon.component';

export type UserFormMode = 'create' | 'edit';

interface FormState {
  name: string;
  phone: string;
  email: string;
  dateOfBirth: string;
  password: string;
  repeatPassword: string;
}

@Component({
  selector: 'pe-user-form',
  standalone: true,
  imports: [FormsModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form #f="ngForm" (ngSubmit)="onSubmit(f)" novalidate>
      @if (banner()) {
        <div class="mb-stack_md px-3 py-2 rounded border-[1.5px] border-error/30 bg-error/10 text-error font-body-sm flex items-start gap-2">
          <pe-icon name="error" [size]="18" />
          <span>{{ banner() }}</span>
        </div>
      }
      @if (success()) {
        <div class="mb-stack_md px-3 py-2 rounded border-[1.5px] font-body-sm" style="color:#16a34a;border-color:rgba(22,163,74,0.3);background:rgba(22,163,74,0.1);">
          {{ success() }}
        </div>
      }

      <div class="grid grid-cols-1 md:grid-cols-2 gap-stack_md">
        <label class="block">
          <span class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Full Name</span>
          <input
            type="text"
            name="name"
            [(ngModel)]="state.name"
            required
            class="mt-1 w-full h-10 px-3 bg-surface border-[1.5px] border-outline-variant rounded font-body-md focus:border-secondary outline-none"
          />
        </label>

        <label class="block">
          <span class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Phone (9-15 digits, no +237)</span>
          <input
            type="tel"
            name="phone"
            [(ngModel)]="state.phone"
            required
            pattern="\\d{9,15}"
            class="mt-1 w-full h-10 px-3 bg-surface border-[1.5px] border-outline-variant rounded font-body-md focus:border-secondary outline-none"
          />
        </label>

        <label class="block">
          <span class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Email</span>
          <input
            type="email"
            name="email"
            [(ngModel)]="state.email"
            class="mt-1 w-full h-10 px-3 bg-surface border-[1.5px] border-outline-variant rounded font-body-md focus:border-secondary outline-none"
          />
        </label>

        <label class="block">
          <span class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Date of Birth</span>
          <input
            type="date"
            name="dob"
            [(ngModel)]="state.dateOfBirth"
            class="mt-1 w-full h-10 px-3 bg-surface border-[1.5px] border-outline-variant rounded font-body-md focus:border-secondary outline-none"
          />
        </label>

        <label class="block">
          <span class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
            {{ mode === 'create' ? 'Password' : 'New Password (optional)' }}
          </span>
          <input
            type="password"
            name="password"
            [(ngModel)]="state.password"
            [required]="mode === 'create'"
            minlength="6"
            autocomplete="new-password"
            class="mt-1 w-full h-10 px-3 bg-surface border-[1.5px] border-outline-variant rounded font-body-md focus:border-secondary outline-none"
          />
        </label>

        <label class="block">
          <span class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Repeat Password</span>
          <input
            type="password"
            name="repeatPassword"
            [(ngModel)]="state.repeatPassword"
            [required]="!!state.password"
            class="mt-1 w-full h-10 px-3 bg-surface border-[1.5px] border-outline-variant rounded font-body-md focus:border-secondary outline-none"
          />
        </label>
      </div>

      <div class="flex justify-end gap-2 mt-stack_lg">
        <button type="button" (click)="cancel.emit()" class="h-10 px-4 bg-surface border-[1.5px] border-outline-variant rounded font-label-md text-label-md text-on-surface hover:bg-surface-container-low transition-colors">
          Cancel
        </button>
        <button
          type="submit"
          [disabled]="saving() || !f.form.valid"
          class="h-10 px-4 bg-secondary text-on-secondary rounded font-label-md text-label-md hover:opacity-90 disabled:opacity-60 transition-opacity flex items-center gap-2"
        >
          @if (saving()) {
            <pe-icon name="progress_activity" [size]="18" />
          }
          {{ mode === 'create' ? 'Create User' : 'Save Changes' }}
        </button>
      </div>
    </form>
  `,
})
export class UserFormComponent implements OnInit {
  private readonly userService = inject(UserService);

  @Input({ required: true }) mode!: UserFormMode;
  @Input() user?: User | null;

  @Output() saved = new EventEmitter<{ user?: User; otp?: string }>();
  @Output() cancel = new EventEmitter<void>();

  readonly saving = signal(false);
  readonly banner = signal<string | null>(null);
  readonly success = signal<string | null>(null);

  state: FormState = {
    name: '',
    phone: '',
    email: '',
    dateOfBirth: '',
    password: '',
    repeatPassword: '',
  };

  ngOnInit(): void {
    if (this.mode === 'edit' && this.user) {
      this.state = {
        name: this.user.name ?? '',
        phone: this.user.phone ?? '',
        email: this.user.email ?? '',
        // <input type="date"> wants YYYY-MM-DD; strip the time portion.
        dateOfBirth: this.user.dateOfBirth ? this.user.dateOfBirth.slice(0, 10) : '',
        password: '',
        repeatPassword: '',
      };
    }
  }

  onSubmit(f: NgForm): void {
    if (!f.form.valid) return;
    this.banner.set(null);
    this.success.set(null);

    if (this.state.password && this.state.password !== this.state.repeatPassword) {
      this.banner.set('Passwords do not match.');
      return;
    }

    this.saving.set(true);

    if (this.mode === 'create') {
      this.userService.create({
        name: this.state.name.trim(),
        phone: this.state.phone.trim(),
        password: this.state.password,
        repeatPassword: this.state.repeatPassword,
      }).subscribe({
        next: (res) => {
          this.saving.set(false);
          if (res.otp) {
            // Dev mode echoes the OTP — display it so the admin can pass it on.
            this.success.set(`User created. Share the OTP ${res.otp} with the user — they must verify before signing in.`);
            setTimeout(() => this.saved.emit({ otp: res.otp }), 2500);
          } else {
            this.saved.emit({});
          }
        },
        error: (err) => {
          this.saving.set(false);
          this.banner.set(this.errorOf(err));
        },
      });
    } else {
      const id = this.user?.id ?? this.user?._id;
      if (!id) {
        this.saving.set(false);
        this.banner.set('Missing user id.');
        return;
      }
      const body: Record<string, string> = {
        name: this.state.name.trim(),
        phone: this.state.phone.trim(),
        email: this.state.email.trim(),
      };
      if (this.state.dateOfBirth) body['dateOfBirth'] = this.state.dateOfBirth;
      if (this.state.password) {
        body['password'] = this.state.password;
        body['repeatPassword'] = this.state.repeatPassword;
      }
      this.userService.update(id, body).subscribe({
        next: (res) => {
          this.saving.set(false);
          this.saved.emit({ user: res.data });
        },
        error: (err) => {
          this.saving.set(false);
          this.banner.set(this.errorOf(err));
        },
      });
    }
  }

  private errorOf(err: unknown): string {
    const e = err as { error?: { message?: string; errors?: Array<{ msg: string }> } };
    if (e?.error?.errors?.length) return e.error.errors.map((x) => x.msg).join(', ');
    return e?.error?.message ?? 'Something went wrong.';
  }
}

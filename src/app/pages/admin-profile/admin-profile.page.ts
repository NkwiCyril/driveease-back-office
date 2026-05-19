import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { StatusBadgeComponent, BadgeTone } from '../../shared/components/status-badge/status-badge.component';
import { ImgComponent } from '../../shared/components/img/img.component';

@Component({
  selector: 'pe-admin-profile-page',
  standalone: true,
  imports: [DatePipe, FormsModule, PageHeaderComponent, IconComponent, StatusBadgeComponent, ImgComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <pe-page-header title="Admin Profile" subtitle="Your account and active session." />

    @if (banner(); as b) {
      @if (b.kind === 'error') {
        <div class="mb-stack_md px-4 py-3 rounded border-[1.5px] border-error/30 bg-error/10 text-error font-body-sm flex items-start gap-2">
          <pe-icon name="error" [size]="18" />
          <span>{{ b.message }}</span>
        </div>
      } @else {
        <div class="mb-stack_md px-4 py-3 rounded border-[1.5px] font-body-sm flex items-start gap-2" style="border-color:rgba(22,163,74,0.3);background:rgba(22,163,74,0.1);color:#16a34a">
          <pe-icon name="check_circle" [size]="18" />
          <span>{{ b.message }}</span>
        </div>
      }
    }

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
      <!-- Identity card -->
      <section class="bg-surface border-[1.5px] border-outline-variant rounded-xl p-stack_lg shadow-card lg:col-span-1 text-center">
        <div class="w-28 h-28 mx-auto rounded-full overflow-hidden border border-outline-variant mb-stack_md">
          @if (user()?.image) {
            <pe-img [src]="user()?.image" [alt]="user()?.name ?? ''" fallback="avatar" />
          } @else {
            <div class="w-full h-full bg-secondary text-on-secondary flex items-center justify-center font-display text-display">
              {{ initials() }}
            </div>
          }
        </div>
        <h3 class="font-h2 text-h2 text-primary">{{ user()?.name }}</h3>
        <p class="font-body-md text-body-md text-on-surface-variant mt-1">+237 {{ user()?.phone }}</p>
        <div class="mt-stack_md inline-flex"><pe-status-badge [tone]="roleTone()">{{ user()?.role }}</pe-status-badge></div>

        <hr class="border-outline-variant my-stack_md" />

        <button (click)="logout()" class="w-full h-10 bg-surface border border-error text-error rounded font-label-md text-label-md hover:bg-error-container transition-colors flex items-center justify-center gap-2">
          <pe-icon name="logout" [size]="18" /> Sign Out
        </button>
      </section>

      <!-- Settings forms -->
      <section class="lg:col-span-2 space-y-stack_lg">
        <!-- Profile (name/email) -->
        <div class="bg-surface border-[1.5px] border-outline-variant rounded-xl p-stack_lg shadow-card">
          <h3 class="font-h3 text-h3 text-on-surface mb-stack_md">Profile</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-stack_md">
            <label class="block">
              <span class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Full Name</span>
              <input
                [(ngModel)]="profileName"
                name="profileName"
                type="text"
                class="mt-1 w-full h-10 px-3 bg-surface border-[1.5px] border-outline-variant rounded font-body-md focus:border-secondary outline-none"
              />
            </label>
            <label class="block">
              <span class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Email</span>
              <input
                [(ngModel)]="profileEmail"
                name="profileEmail"
                type="email"
                class="mt-1 w-full h-10 px-3 bg-surface border-[1.5px] border-outline-variant rounded font-body-md focus:border-secondary outline-none"
              />
            </label>
            <label class="block">
              <span class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Phone</span>
              <input [value]="user()?.phone" disabled type="tel" class="mt-1 w-full h-10 px-3 bg-surface-container-low border-[1.5px] border-outline-variant rounded font-body-md text-on-surface-variant" />
            </label>
            <label class="block">
              <span class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Joined</span>
              <input [value]="(user()?.createdAt | date:'mediumDate') ?? ''" disabled type="text" class="mt-1 w-full h-10 px-3 bg-surface-container-low border-[1.5px] border-outline-variant rounded font-body-md text-on-surface-variant" />
            </label>
          </div>
          <div class="flex justify-end mt-stack_md">
            <button
              (click)="saveProfile()"
              [disabled]="saving()"
              class="h-10 px-4 bg-secondary text-on-secondary rounded font-label-md text-label-md hover:opacity-90 disabled:opacity-60"
            >{{ saving() ? 'Saving…' : 'Save' }}</button>
          </div>
        </div>

        <!-- Identity uploads -->
        <div class="bg-surface border-[1.5px] border-outline-variant rounded-xl p-stack_lg shadow-card">
          <h3 class="font-h3 text-h3 text-on-surface mb-stack_md">Identity & Profile Picture</h3>
          <p class="font-body-sm text-on-surface-variant mb-stack_md">
            Upload a profile photo and ID card images. Each file is sent only if you pick one — leaving a field empty keeps the existing image.
          </p>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-stack_md">
            <label class="block">
              <span class="font-body-sm text-on-surface-variant">Profile photo</span>
              <input type="file" accept="image/*" (change)="onFile('image', $event)" class="mt-1 block w-full text-body-sm text-on-surface file:mr-3 file:px-2 file:py-1 file:rounded file:border-0 file:bg-surface-variant file:text-on-surface file:font-label-sm hover:file:bg-surface-container-low" />
            </label>
            <label class="block">
              <span class="font-body-sm text-on-surface-variant">ID card front</span>
              <input type="file" accept="image/*" (change)="onFile('idCardFront', $event)" class="mt-1 block w-full text-body-sm text-on-surface file:mr-3 file:px-2 file:py-1 file:rounded file:border-0 file:bg-surface-variant file:text-on-surface file:font-label-sm hover:file:bg-surface-container-low" />
            </label>
            <label class="block">
              <span class="font-body-sm text-on-surface-variant">ID card back</span>
              <input type="file" accept="image/*" (change)="onFile('idCardBack', $event)" class="mt-1 block w-full text-body-sm text-on-surface file:mr-3 file:px-2 file:py-1 file:rounded file:border-0 file:bg-surface-variant file:text-on-surface file:font-label-sm hover:file:bg-surface-container-low" />
            </label>
          </div>
          <div class="flex justify-end mt-stack_md">
            <button
              (click)="uploadDetails()"
              [disabled]="!hasFiles() || uploading()"
              class="h-10 px-4 bg-secondary text-on-secondary rounded font-label-md text-label-md hover:opacity-90 disabled:opacity-60"
            >{{ uploading() ? 'Uploading…' : 'Upload' }}</button>
          </div>
        </div>

        <!-- Security -->
        <div class="bg-surface border-[1.5px] border-outline-variant rounded-xl p-stack_lg shadow-card">
          <h3 class="font-h3 text-h3 text-on-surface mb-stack_md">Security</h3>
          <div class="space-y-2 mb-stack_md">
            <div class="flex justify-between items-center p-3 rounded border-[1.5px] border-outline-variant bg-surface-container-lowest">
              <div class="flex items-center gap-3">
                <pe-icon name="key" [size]="20" class="text-on-surface-variant" />
                <div>
                  <p class="font-label-md text-label-md text-on-surface">Active session</p>
                  <p class="font-body-sm text-body-sm text-on-surface-variant">Single session per account enforced by the API.</p>
                </div>
              </div>
              <pe-status-badge tone="success" icon="check">Active</pe-status-badge>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
})
export class AdminProfilePage {
  private readonly auth = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);

  readonly user = this.auth.currentUser;
  readonly saving = signal(false);
  readonly uploading = signal(false);
  readonly banner = signal<{ kind: 'success' | 'error'; message: string } | null>(null);

  profileName = this.user()?.name ?? '';
  profileEmail = this.user()?.email ?? '';

  private files: Partial<Record<'image' | 'idCardFront' | 'idCardBack', File>> = {};

  hasFiles(): boolean {
    return Object.values(this.files).some(Boolean);
  }

  onFile(key: 'image' | 'idCardFront' | 'idCardBack', event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.files[key] = file;
  }

  saveProfile(): void {
    const id = this.user()?.id ?? this.user()?._id;
    if (!id) return;
    this.banner.set(null);
    this.saving.set(true);
    this.userService.update(id, {
      name: this.profileName.trim(),
      email: this.profileEmail.trim() || undefined,
    }).subscribe({
      next: (res) => {
        this.saving.set(false);
        if (res.data) this.auth.currentUser.set(res.data);
        this.banner.set({ kind: 'success', message: 'Profile updated.' });
      },
      error: (err) => {
        this.saving.set(false);
        this.banner.set({ kind: 'error', message: err?.error?.message ?? 'Could not save profile.' });
      },
    });
  }

  uploadDetails(): void {
    if (!this.hasFiles()) return;
    this.banner.set(null);
    this.uploading.set(true);
    const form = new FormData();
    for (const [key, file] of Object.entries(this.files)) {
      if (file) form.append(key, file);
    }
    this.userService.updateMyDetails(form).subscribe({
      next: (res) => {
        this.uploading.set(false);
        if (res.data) this.auth.currentUser.set(res.data);
        this.files = {};
        this.banner.set({ kind: 'success', message: 'Images uploaded.' });
      },
      error: (err) => {
        this.uploading.set(false);
        this.banner.set({ kind: 'error', message: err?.error?.message ?? 'Upload failed.' });
      },
    });
  }

  initials(): string {
    const name = this.user()?.name ?? 'A';
    return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  }

  roleTone(): BadgeTone {
    const r = this.user()?.role;
    if (r === 'super_admin') return 'purple';
    if (r === 'admin') return 'info';
    if (r === 'merchant') return 'success';
    return 'neutral';
  }

  logout(): void {
    this.auth.logout().subscribe({
      next: () => this.router.navigate(['/auth/login']),
      error: () => this.router.navigate(['/auth/login']),
    });
  }
}

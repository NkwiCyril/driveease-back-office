import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { User, UserRole } from '../../core/models/user.model';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent, BadgeTone } from '../../shared/components/status-badge/status-badge.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { DialogComponent } from '../../shared/components/dialog/dialog.component';
import { UserFormComponent } from '../../shared/forms/user-form.component';

@Component({
  selector: 'pe-users-page',
  standalone: true,
  imports: [DatePipe, FormsModule, RouterLink, PageHeaderComponent, StatusBadgeComponent, IconComponent, EmptyStateComponent, DialogComponent, UserFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <pe-page-header title="Users Management" subtitle="Search, audit and manage every account on the platform.">
      <button class="h-10 px-4 bg-surface border-[1.5px] border-outline-variant text-on-surface font-label-md text-label-md rounded flex items-center gap-2 hover:bg-surface-container-low transition-colors">
        <pe-icon name="download" [size]="18" />
        Export
      </button>
      <button (click)="openCreate()" class="h-10 px-4 bg-secondary text-on-secondary font-label-md text-label-md rounded flex items-center gap-2 hover:opacity-90 transition-opacity shadow-card">
        <pe-icon name="person_add" [size]="18" />
        New User
      </button>
    </pe-page-header>

    @if (showCreate()) {
      <pe-dialog title="Create User" subtitle="The new account starts unverified; share the OTP shown after creation with the user." [widthPx]="720" (close)="showCreate.set(false)">
        <pe-user-form mode="create" (saved)="onUserCreated()" (cancel)="showCreate.set(false)" />
      </pe-dialog>
    }

    <!-- Filters -->
    <div class="bg-surface border-[1.5px] border-outline-variant rounded p-4 mb-stack_lg flex flex-wrap items-center gap-4 shadow-card">
      <div class="relative flex-1 min-w-[240px]">
        <pe-icon name="search" [size]="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none" />
        <input
          type="text"
          [(ngModel)]="query"
          (keyup.enter)="load()"
          placeholder="Search by name or phone…"
          class="w-full h-10 pl-10 pr-4 bg-surface border-[1.5px] border-outline-variant rounded font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:border-secondary outline-none"
        />
      </div>
      <select
        [(ngModel)]="roleFilter"
        (change)="load()"
        class="h-10 px-4 bg-surface border-[1.5px] border-outline-variant rounded font-body-sm text-body-sm text-on-surface focus:border-secondary outline-none cursor-pointer"
      >
        <option value="">All Roles</option>
        <option value="regular">Regular</option>
        <option value="merchant">Merchant</option>
        <option value="admin">Admin</option>
        <option value="super_admin">Super Admin</option>
      </select>
      <select
        [(ngModel)]="verifiedFilter"
        (change)="load()"
        class="h-10 px-4 bg-surface border-[1.5px] border-outline-variant rounded font-body-sm text-body-sm text-on-surface focus:border-secondary outline-none cursor-pointer"
      >
        <option value="">Any Verification</option>
        <option value="verified">Verified</option>
        <option value="pending">Pending</option>
        <option value="unverified">Unverified</option>
      </select>
    </div>

    <!-- Table -->
    <div class="bg-surface border-[1.5px] border-outline-variant rounded-lg overflow-hidden shadow-card">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b-[1.5px] border-outline-variant bg-surface-container-lowest">
              <th class="p-3 w-12 text-center">
                <input type="checkbox" class="w-4 h-4 rounded border-outline-variant text-secondary cursor-pointer" />
              </th>
              <th class="p-3 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">User</th>
              <th class="p-3 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Phone</th>
              <th class="p-3 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Role</th>
              <th class="p-3 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Verification</th>
              <th class="p-3 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Joined</th>
              <th class="p-3 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="font-body-sm text-body-sm text-on-surface divide-y divide-outline-variant/50">
            @for (user of filtered(); track user.id || user._id) {
              <tr class="hover:bg-background transition-colors group">
                <td class="p-3 text-center">
                  <input type="checkbox" class="w-4 h-4 rounded border-outline-variant text-secondary cursor-pointer" />
                </td>
                <td class="p-3">
                  <a [routerLink]="['/users', user.id || user._id]" class="flex items-center gap-3 group">
                    <span class="w-9 h-9 rounded-full bg-secondary/10 text-secondary flex items-center justify-center font-label-md text-label-md">
                      {{ initials(user.name) }}
                    </span>
                    <div>
                      <div class="font-label-md text-label-md text-primary group-hover:text-secondary transition-colors">{{ user.name }}</div>
                      @if (user.email) {
                        <div class="text-outline">{{ user.email }}</div>
                      }
                    </div>
                  </a>
                </td>
                <td class="p-3 text-on-surface-variant">+237 {{ user.phone }}</td>
                <td class="p-3">
                  <pe-status-badge [tone]="roleTone(user.role)">{{ roleLabel(user.role) }}</pe-status-badge>
                </td>
                <td class="p-3">
                  <pe-status-badge [tone]="verifiedTone(user.verified)" [icon]="verifiedIcon(user.verified)">
                    {{ verifiedLabel(user.verified) }}
                  </pe-status-badge>
                </td>
                <td class="p-3 text-on-surface-variant">{{ user.createdAt | date:'MMM d, y' }}</td>
                <td class="p-3 text-right">
                  <a
                    [routerLink]="['/users', user.id || user._id]"
                    class="p-1 text-outline hover:text-primary transition-colors inline-flex items-center"
                  >
                    <pe-icon name="chevron_right" [size]="20" />
                  </a>
                </td>
              </tr>
            }
            @if (!loading() && filtered().length === 0) {
              <tr><td colspan="7">
                <pe-empty-state icon="person_search" title="No users found" description="Try a different search term or clear the filters." />
              </td></tr>
            }
          </tbody>
        </table>
      </div>

      <div class="border-t-[1.5px] border-outline-variant p-4 flex items-center justify-between bg-surface-container-lowest">
        <span class="font-body-sm text-body-sm text-on-surface-variant">
          Showing {{ filtered().length }} of {{ users().length }} users
        </span>
      </div>
    </div>
  `,
})
export class UsersPage implements OnInit {
  private readonly userService = inject(UserService);

  query = '';
  roleFilter: UserRole | '' = '';
  verifiedFilter: '' | 'verified' | 'pending' | 'unverified' = '';

  readonly users = signal<User[]>([]);
  readonly loading = signal(false);
  readonly showCreate = signal(false);

  openCreate(): void { this.showCreate.set(true); }

  onUserCreated(): void {
    this.showCreate.set(false);
    this.load();
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    // When there's a search term, use the dedicated server-side search endpoint
    // (returns matching users with cars populated). Empty queries fall through
    // to GET /users which lists all — still no server-side role filter, so
    // role / verification filtering is applied in `filtered()` regardless.
    this.loading.set(true);
    const q = this.query.trim();
    const request$ = q
      ? this.userService.search({ name: q, limit: 50 })
      : this.userService.list();
    request$.subscribe({
      next: (res) => {
        this.users.set(res.data ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.users.set([]);
        this.loading.set(false);
      },
    });
  }

  filtered(): User[] {
    // Server already narrowed by name when there's a query; here we only need
    // the role / verification refinements on top.
    return this.users().filter((u) => {
      const matchesRole = !this.roleFilter || u.role === this.roleFilter;
      const matchesVerified = !this.verifiedFilter || u.verified === this.verifiedFilter;
      return matchesRole && matchesVerified;
    });
  }

  initials(name: string): string {
    return name?.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase() ?? '?';
  }

  roleLabel(role?: UserRole): string {
    return ({ regular: 'Regular', merchant: 'Merchant', admin: 'Admin', super_admin: 'Super Admin' } as const)[role ?? 'regular'];
  }

  roleTone(role?: UserRole): BadgeTone {
    if (role === 'super_admin') return 'purple';
    if (role === 'admin') return 'info';
    if (role === 'merchant') return 'success';
    return 'neutral';
  }

  verifiedLabel(state?: string): string {
    return ({ verified: 'Verified', pending: 'Pending', unverified: 'Unverified' } as Record<string, string>)[state ?? 'unverified'] ?? 'Unverified';
  }

  verifiedTone(state?: string): BadgeTone {
    if (state === 'verified') return 'success';
    if (state === 'pending') return 'warning';
    return 'neutral';
  }

  verifiedIcon(state?: string): string | undefined {
    return state === 'verified' ? 'verified' : state === 'pending' ? 'pending' : undefined;
  }
}

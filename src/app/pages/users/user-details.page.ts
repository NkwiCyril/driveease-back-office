import { ChangeDetectionStrategy, Component, Input, OnInit, computed, effect, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { CarService } from '../../core/services/car.service';
import { AdvertService } from '../../core/services/advert.service';
import { RatingService } from '../../core/services/rating.service';
import { AuthService } from '../../core/services/auth.service';
import { User, UserRole } from '../../core/models/user.model';
import { Car } from '../../core/models/car.model';
import { Advert } from '../../core/models/advert.model';
import { RatingSummary } from '../../core/models/rating.model';
import { environment } from '../../../environments/environment';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { StatusBadgeComponent, BadgeTone } from '../../shared/components/status-badge/status-badge.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { DialogComponent } from '../../shared/components/dialog/dialog.component';
import { UserFormComponent } from '../../shared/forms/user-form.component';
import { ImgComponent } from '../../shared/components/img/img.component';

type Tab = 'profile' | 'cars' | 'adverts' | 'bookings';

@Component({
  selector: 'pe-user-details-page',
  standalone: true,
  imports: [
    DatePipe,
    DecimalPipe,
    FormsModule,
    RouterLink,
    IconComponent,
    StatusBadgeComponent,
    EmptyStateComponent,
    DialogComponent,
    UserFormComponent,
    ImgComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Breadcrumbs -->
    <div class="mb-stack_md">
      <div class="flex items-center gap-2 text-on-surface-variant font-body-sm text-body-sm mb-2">
        <a routerLink="/users" class="hover:text-secondary">Users</a>
        <pe-icon name="chevron_right" [size]="16" />
        <span class="text-on-surface font-semibold">{{ user()?.name || '…' }}</span>
      </div>
      <div class="flex justify-between items-end gap-stack_md flex-wrap">
        <h1 class="font-h1 text-h1 text-primary">User Details</h1>
        <div class="flex items-center gap-2">
          @if (user()?.verified) {
            <pe-status-badge [tone]="verifiedTone()" icon="verified">{{ verifiedLabel() }}</pe-status-badge>
          }
          @if (user()) {
            <button (click)="showEdit.set(true)" class="h-10 px-4 bg-surface border-[1.5px] border-outline-variant text-on-surface font-label-md text-label-md rounded flex items-center gap-2 hover:bg-surface-container-low transition-colors">
              <pe-icon name="edit" [size]="18" /> Edit
            </button>
          }
        </div>
      </div>
    </div>

    @if (showEdit() && user()) {
      <pe-dialog title="Edit User" [widthPx]="720" (close)="showEdit.set(false)">
        <pe-user-form mode="edit" [user]="user()" (saved)="onSaved($event)" (cancel)="showEdit.set(false)" />
      </pe-dialog>
    }

    <div class="grid grid-cols-12 gap-gutter">
      <!-- Left column -->
      <div class="col-span-12 lg:col-span-8 space-y-stack_lg">
        <!-- Tabs -->
        <div class="flex gap-1 border-b border-outline-variant overflow-x-auto">
          @for (t of tabs; track t.id) {
            <button
              (click)="tab.set(t.id)"
              class="px-4 py-3 font-label-md text-label-md transition-colors whitespace-nowrap"
              [class.text-secondary]="tab() === t.id"
              [class.border-b-2]="tab() === t.id"
              [class.border-secondary]="tab() === t.id"
              [class.font-bold]="tab() === t.id"
              [class.text-on-surface-variant]="tab() !== t.id"
              [class.hover:text-on-surface]="tab() !== t.id"
            >
              {{ t.label }}
              @if (counts()[t.id] != null) {
                <span class="ml-2 font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-surface-container-low text-on-surface-variant">
                  {{ counts()[t.id] }}
                </span>
              }
            </button>
          }
        </div>

        <!-- PROFILE TAB -->
        @if (tab() === 'profile' && user(); as u) {
          <div class="bg-surface border border-outline-variant rounded-xl p-stack_lg shadow-card">
            <div class="flex items-start gap-stack_lg flex-wrap">
              <div class="w-32 h-32 rounded-xl border border-outline-variant overflow-hidden bg-surface-container shrink-0">
                @if (u.image) {
                  <pe-img [src]="u.image" [alt]="u.name" fallback="avatar" />
                } @else {
                  <div class="w-full h-full flex items-center justify-center">
                    <span class="font-display text-display text-on-surface-variant">{{ initials(u.name) }}</span>
                  </div>
                }
              </div>
              <div class="flex-1 min-w-[280px]">
                <h2 class="font-h2 text-h2 text-primary mb-1">{{ u.name }}</h2>
                <p class="font-body-md text-body-md text-on-surface-variant mb-4">Joined {{ u.createdAt | date:'MMMM d, y' }}</p>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block mb-1">Phone</label>
                    <div class="font-body-md text-body-md text-on-surface font-medium flex items-center gap-2">
                      <pe-icon name="phone" [size]="18" class="text-outline" />
                      +237 {{ u.phone }}
                    </div>
                  </div>
                  <div>
                    <label class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block mb-1">Email</label>
                    <div class="font-body-md text-body-md text-on-surface font-medium flex items-center gap-2">
                      <pe-icon name="mail" [size]="18" class="text-outline" />
                      {{ u.email || '—' }}
                    </div>
                  </div>
                  <div>
                    <label class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block mb-1">Role</label>
                    <pe-status-badge [tone]="roleTone(u.role)">{{ u.role || 'regular' }}</pe-status-badge>
                  </div>
                  <div>
                    <label class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block mb-1">Cars Owned</label>
                    <div class="font-body-md text-body-md text-on-surface font-medium">{{ u.cars?.length || 0 }}</div>
                  </div>
                </div>
              </div>
            </div>

            @if (u.idCardFront || u.idCardBack) {
              <div class="mt-stack_lg pt-stack_lg border-t border-outline-variant">
                <h3 class="font-h3 text-h3 text-primary mb-stack_md">Identity Documents</h3>
                <div class="flex flex-wrap gap-stack_md">
                  @if (u.idCardFront) {
                    <div class="relative">
                      <div class="w-48 h-32 bg-surface-container rounded border border-outline-variant overflow-hidden">
                        <pe-img [src]="u.idCardFront" alt="ID Front" fallback="image" />
                      </div>
                      <div class="absolute bottom-0 left-0 right-0 bg-primary/80 text-on-primary font-label-sm text-label-sm p-1 text-center">ID Front</div>
                    </div>
                  }
                  @if (u.idCardBack) {
                    <div class="relative">
                      <div class="w-48 h-32 bg-surface-container rounded border border-outline-variant overflow-hidden">
                        <pe-img [src]="u.idCardBack" alt="ID Back" fallback="image" />
                      </div>
                      <div class="absolute bottom-0 left-0 right-0 bg-primary/80 text-on-primary font-label-sm text-label-sm p-1 text-center">ID Back</div>
                    </div>
                  }
                </div>
              </div>
            }
          </div>

          <!-- Ratings summary -->
          @if (ratings(); as r) {
            <div class="bg-surface border border-outline-variant rounded-xl p-stack_lg shadow-card">
              <h3 class="font-h3 text-h3 text-primary mb-stack_md">Seller Rating</h3>
              @if (r.count > 0) {
                <div class="flex items-start gap-stack_lg flex-wrap">
                  <div class="text-center">
                    <div class="font-display text-display text-on-surface leading-none">{{ r.average.toFixed(1) }}</div>
                    <div class="flex justify-center gap-0.5 my-2">
                      @for (i of [1,2,3,4,5]; track i) {
                        <pe-icon name="star" [size]="20" [filled]="i <= roundedAvg()" [class]="i <= roundedAvg() ? 'text-status-warning' : 'text-outline-variant'" />
                      }
                    </div>
                    <div class="font-body-sm text-body-sm text-on-surface-variant">{{ r.count }} review{{ r.count === 1 ? '' : 's' }}</div>
                  </div>
                  <div class="flex-1 min-w-[200px] space-y-1">
                    @for (s of [5,4,3,2,1]; track s) {
                      <div class="flex items-center gap-2 font-body-sm">
                        <span class="text-on-surface-variant w-4">{{ s }}</span>
                        <pe-icon name="star" [size]="14" [filled]="true" class="text-status-warning" />
                        <div class="flex-1 h-2 rounded-full bg-surface-variant overflow-hidden">
                          <div class="h-full rounded-full" [style.width.%]="ratingPct(s)" style="background:#eab308"></div>
                        </div>
                        <span class="text-on-surface-variant w-8 text-right">{{ ratingCount(s) }}</span>
                      </div>
                    }
                  </div>
                </div>
              } @else {
                <p class="font-body-md text-on-surface-variant">No buyer ratings yet.</p>
              }
            </div>
          }
        }

        <!-- CARS TAB -->
        @if (tab() === 'cars') {
          <section class="space-y-stack_md">
            <h3 class="font-h3 text-h3 text-primary">For Sale ({{ saleCars().length }})</h3>
            @if (saleCars().length === 0) {
              <pe-empty-state icon="sell" title="No cars listed for sale" />
            } @else {
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-stack_md">
                @for (c of saleCars(); track c._id) {
                  <a [routerLink]="['/cars', c._id]" class="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-card flex hover:border-secondary transition-colors">
                    <div class="w-28 h-28 bg-surface-container-lowest shrink-0">
                      <pe-img [src]="c.images?.[0]" alt="" fallback="car" />
                    </div>
                    <div class="flex-1 p-stack_md min-w-0">
                      <p class="font-label-md text-label-md text-primary truncate">{{ c.year }} {{ c.make }} {{ c.model }}</p>
                      <p class="font-body-sm text-body-sm text-on-surface mt-1">{{ (c.price || 0) | number }} XAF</p>
                      <div class="flex gap-1 mt-2 flex-wrap">
                        <pe-status-badge [tone]="statusTone(c.status)">{{ c.status }}</pe-status-badge>
                        @if (c.flagged) {
                          <pe-status-badge tone="danger" icon="flag">Flagged</pe-status-badge>
                        }
                      </div>
                    </div>
                  </a>
                }
              </div>
            }
          </section>

          <section class="space-y-stack_md mt-stack_lg">
            <h3 class="font-h3 text-h3 text-primary">For Rent ({{ rentCars().length }})</h3>
            @if (rentCars().length === 0) {
              <pe-empty-state icon="key" title="No cars listed for rent" />
            } @else {
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-stack_md">
                @for (c of rentCars(); track c._id) {
                  <a [routerLink]="['/cars', c._id]" class="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-card flex hover:border-secondary transition-colors">
                    <div class="w-28 h-28 bg-surface-container-lowest shrink-0">
                      <pe-img [src]="c.images?.[0]" alt="" fallback="car" />
                    </div>
                    <div class="flex-1 p-stack_md min-w-0">
                      <p class="font-label-md text-label-md text-primary truncate">{{ c.year }} {{ c.make }} {{ c.model }}</p>
                      <p class="font-body-sm text-body-sm text-on-surface mt-1">{{ (c.rentalPrice || 0) | number }} XAF / day</p>
                      <div class="flex gap-1 mt-2 flex-wrap">
                        <pe-status-badge [tone]="statusTone(c.status)">{{ c.status }}</pe-status-badge>
                      </div>
                    </div>
                  </a>
                }
              </div>
            }
          </section>
        }

        <!-- ADVERTS TAB -->
        @if (tab() === 'adverts') {
          @if (adverts().length === 0) {
            <div class="bg-surface border border-outline-variant rounded-xl p-stack_lg shadow-card">
              <pe-empty-state icon="campaign" title="No adverts" description="This user hasn't published any adverts yet." />
            </div>
          } @else {
            <div class="grid grid-cols-1 md:grid-cols-2 gap-stack_md">
              @for (a of adverts(); track a._id) {
                <article class="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-card">
                  <div class="aspect-video bg-surface-container-lowest overflow-hidden">
                    <pe-img [src]="a.images?.[0]" alt="" fallback="car" />
                  </div>
                  <div class="p-stack_md">
                    <h4 class="font-label-md text-label-md text-primary truncate">{{ a.title }}</h4>
                    <p class="font-body-sm text-body-sm text-on-surface-variant mt-1">{{ a.make }} {{ a.model }} · {{ a.year }}</p>
                    <div class="flex justify-between items-center mt-stack_sm">
                      <pe-status-badge [tone]="advertStatusTone(a.status)">{{ a.status }}</pe-status-badge>
                      <div class="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-2">
                        <span class="inline-flex items-center gap-1"><pe-icon name="visibility" [size]="14" /> {{ a.views || 0 }}</span>
                        <span class="inline-flex items-center gap-1"><pe-icon name="ads_click" [size]="14" /> {{ a.clicks || 0 }}</span>
                      </div>
                    </div>
                  </div>
                </article>
              }
            </div>
          }
        }

        <!-- BOOKINGS TAB -->
        @if (tab() === 'bookings') {
          <div class="bg-surface border border-outline-variant rounded-xl p-stack_lg shadow-card">
            <pe-empty-state
              icon="event"
              title="Bookings unavailable here"
              description="The API only exposes the caller's own bookings (/api/bookings is auth-scoped). A platform-wide listing endpoint is needed to show a specific user's history."
            />
          </div>
        }
      </div>

      <!-- Right column: actions -->
      <div class="col-span-12 lg:col-span-4 space-y-stack_lg">
        <div class="bg-surface border border-outline-variant rounded-xl p-stack_lg shadow-card sticky top-20">
          <h3 class="font-h3 text-h3 text-primary mb-stack_md">Account Actions</h3>
          <div class="space-y-stack_lg">
            <div class="space-y-3">
              <label class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block">Current Role</label>
              <div class="font-body-md text-on-surface font-medium">{{ user()?.role || 'regular' }}</div>
              <button
                (click)="promoteToAdmin()"
                [disabled]="!canPromote() || saving()"
                class="w-full h-10 bg-surface border-[1.5px] border-outline-variant rounded text-primary font-label-md text-label-md hover:bg-surface-container-low transition-colors disabled:opacity-60"
              >
                @if (user()?.role === 'admin' || user()?.role === 'super_admin') {
                  Already an admin
                } @else {
                  Promote to Admin
                }
              </button>
              <p class="font-label-sm text-label-sm text-on-surface-variant">
                The API only supports promoting to admin. To demote, edit the user in MongoDB directly.
              </p>
            </div>

            <hr class="border-outline-variant" />

            <!-- API gap: backend's PUT /users/:id only accepts name, phone, password, email, dateOfBirth. There is no
                 endpoint to set the user's verified status or to invalidate another user's session, so these actions
                 are disabled with a tooltip until the backend exposes them. -->
            <div class="space-y-3">
              <button
                type="button"
                disabled
                title="No backend endpoint for changing another user's verified status yet"
                class="w-full h-10 rounded font-label-md text-label-md transition-colors flex items-center justify-center gap-2 cursor-not-allowed border-[1.5px] border-outline-variant bg-surface-container-low text-on-surface-variant"
              >
                <pe-icon name="verified" [size]="18" />
                Mark Verified <span class="font-label-sm">(API pending)</span>
              </button>
              <button
                type="button"
                disabled
                title="No backend endpoint to invalidate another user's session yet"
                class="w-full h-10 rounded font-label-md text-label-md transition-colors flex items-center justify-center gap-2 cursor-not-allowed border-[1.5px] border-outline-variant bg-surface-container-low text-on-surface-variant"
              >
                <pe-icon name="logout" [size]="18" />
                Force Logout <span class="font-label-sm">(API pending)</span>
              </button>
            </div>

            <hr class="border-outline-variant" />

            <div class="space-y-3 pt-2">
              <div class="flex items-start gap-2 text-error">
                <pe-icon name="warning" [size]="18" />
                <p class="font-body-sm text-body-sm">Super Admin access required for deletion.</p>
              </div>
              <button
                (click)="deleteUser()"
                [disabled]="!auth.isSuperAdmin() || saving()"
                class="w-full h-10 bg-surface border border-error text-error rounded font-label-md text-label-md hover:bg-error-container transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                <pe-icon name="delete" [size]="18" />
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class UserDetailsPage implements OnInit {
  private readonly userService = inject(UserService);
  private readonly carService = inject(CarService);
  private readonly advertService = inject(AdvertService);
  private readonly ratingService = inject(RatingService);
  private readonly router = inject(Router);
  readonly auth = inject(AuthService);

  @Input() id!: string;

  readonly user = signal<User | null>(null);
  readonly tab = signal<Tab>('profile');
  readonly saving = signal(false);
  readonly showEdit = signal(false);

  onSaved(event: { user?: User }): void {
    this.showEdit.set(false);
    if (event.user) this.user.set(event.user);
  }

  readonly saleCars = signal<Car[]>([]);
  readonly rentCars = signal<Car[]>([]);
  readonly adverts = signal<Advert[]>([]);
  readonly ratings = signal<RatingSummary | null>(null);

  // Lazily mark which tabs we've already pulled so we don't re-fetch on every switch.
  private loaded = new Set<Tab>(['profile']);

  readonly counts = computed<Record<Tab, number | undefined>>(() => ({
    profile: undefined,
    cars: this.loaded.has('cars') ? this.saleCars().length + this.rentCars().length : undefined,
    adverts: this.loaded.has('adverts') ? this.adverts().length : undefined,
    bookings: undefined,
  }));

  readonly roundedAvg = computed(() => Math.round(this.ratings()?.average ?? 0));

  readonly tabs: Array<{ id: Tab; label: string }> = [
    { id: 'profile', label: 'Profile' },
    { id: 'cars', label: 'Cars' },
    { id: 'adverts', label: 'Adverts' },
    { id: 'bookings', label: 'Bookings' },
  ];

  constructor() {
    // Re-fetch when the user switches tabs, but only the first time per tab.
    effect(() => {
      const t = this.tab();
      if (this.loaded.has(t) || !this.user()) return;
      this.loaded.add(t);
      if (t === 'cars') this.loadCars();
      if (t === 'adverts') this.loadAdverts();
    });
  }

  ngOnInit(): void {
    this.userService.get(this.id).subscribe({
      next: (res) => {
        this.user.set(res.data ?? null);
        // Rating summary lives on the profile card — fetch it eagerly.
        this.ratingService.summary(this.id).subscribe({
          next: (r) => this.ratings.set(r.data ?? null),
          error: () => this.ratings.set(null),
        });
      },
      error: () => this.user.set(null),
    });
  }

  private loadCars(): void {
    this.carService.userSaleCars(this.id, { limit: 20 }).subscribe({
      next: (res) => this.saleCars.set(res.data ?? []),
      error: () => this.saleCars.set([]),
    });
    this.carService.userRentCars(this.id, { limit: 20 }).subscribe({
      next: (res) => this.rentCars.set(res.data ?? []),
      error: () => this.rentCars.set([]),
    });
  }

  private loadAdverts(): void {
    this.advertService.userAdverts(this.id, { limit: 20 }).subscribe({
      next: (res) => this.adverts.set(res.data ?? []),
      error: () => this.adverts.set([]),
    });
  }

  canPromote(): boolean {
    const role = this.user()?.role;
    return role !== 'admin' && role !== 'super_admin';
  }

  promoteToAdmin(): void {
    const phone = this.user()?.phone;
    if (!phone || !this.canPromote()) return;
    if (!confirm(`Promote ${this.user()?.name} (+237 ${phone}) to admin?`)) return;
    this.saving.set(true);
    this.userService.promoteToAdmin(phone).subscribe({
      next: (res) => {
        if (res.data) this.user.set(res.data);
        this.saving.set(false);
      },
      error: () => this.saving.set(false),
    });
  }

  deleteUser(): void {
    if (!this.auth.isSuperAdmin()) return;
    if (!confirm(`Permanently delete ${this.user()?.name}? This cannot be undone.`)) return;
    this.saving.set(true);
    this.userService.delete(this.id).subscribe({
      next: () => this.router.navigate(['/users']),
      error: () => this.saving.set(false),
    });
  }

  ratingPct(stars: number): number {
    const r = this.ratings();
    if (!r || !r.count) return 0;
    const count = (r.breakdown as Record<number, number>)[stars] ?? 0;
    return Math.round((count / r.count) * 100);
  }

  ratingCount(stars: number): number {
    return (this.ratings()?.breakdown as Record<number, number> | undefined)?.[stars] ?? 0;
  }

  initials(name?: string): string {
    return name?.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase() ?? '?';
  }

  mediaUrl(path?: string | null): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${environment.mediaUrl}${path}`;
  }

  verifiedLabel(): string {
    const v = this.user()?.verified;
    return ({ verified: 'Verified Merchant', pending: 'Pending Verification', unverified: 'Unverified' } as Record<string, string>)[v ?? 'unverified'];
  }

  verifiedTone(): BadgeTone {
    const v = this.user()?.verified;
    if (v === 'verified') return 'success';
    if (v === 'pending') return 'warning';
    return 'neutral';
  }

  roleTone(role?: UserRole): BadgeTone {
    if (role === 'super_admin') return 'purple';
    if (role === 'admin') return 'info';
    if (role === 'merchant') return 'success';
    return 'neutral';
  }

  statusTone(s: Car['status']): BadgeTone {
    if (s === 'available') return 'success';
    if (s === 'rented') return 'info';
    if (s === 'sold') return 'neutral';
    return 'warning';
  }

  advertStatusTone(s: Advert['status']): BadgeTone {
    if (s === 'active') return 'success';
    if (s === 'paused') return 'warning';
    if (s === 'expired') return 'neutral';
    return 'info';
  }
}

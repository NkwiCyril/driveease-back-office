import { ChangeDetectionStrategy, Component, Input, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { CarService } from '../../core/services/car.service';
import { RatingService } from '../../core/services/rating.service';
import { UserService } from '../../core/services/user.service';
import { Car } from '../../core/models/car.model';
import { User } from '../../core/models/user.model';
import { RatingSummary } from '../../core/models/rating.model';
import { ApiResponse } from '../../core/models/api.model';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { StatusBadgeComponent, BadgeTone } from '../../shared/components/status-badge/status-badge.component';
import { DialogComponent } from '../../shared/components/dialog/dialog.component';
import { CarFormComponent } from '../../shared/forms/car-form.component';
import { PriceListFormComponent } from '../../shared/forms/price-list-form.component';
import { ImgComponent } from '../../shared/components/img/img.component';

@Component({
  selector: 'pe-car-details-page',
  standalone: true,
  imports: [DatePipe, DecimalPipe, RouterLink, IconComponent, StatusBadgeComponent, DialogComponent, CarFormComponent, PriceListFormComponent, ImgComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mb-stack_md">
      <div class="flex items-center gap-2 text-on-surface-variant font-body-sm text-body-sm mb-2">
        <a routerLink="/cars" class="hover:text-secondary">Cars</a>
        <pe-icon name="chevron_right" [size]="16" />
        <span class="text-on-surface font-semibold">{{ car()?.make }} {{ car()?.model }}</span>
      </div>
      <div class="flex justify-between items-end gap-stack_md flex-wrap">
        <h1 class="font-h1 text-h1 text-primary">Car Details</h1>
        <div class="flex flex-wrap gap-2">
          <pe-status-badge [tone]="car()?.flagged ? 'danger' : car()?.verified === 'verified' ? 'success' : 'neutral'" [icon]="car()?.flagged ? 'flag' : car()?.verified === 'verified' ? 'verified' : undefined">
            {{ car()?.flagged ? 'Flagged' : car()?.verified === 'verified' ? 'Verified' : 'Unverified' }}
          </pe-status-badge>
          @if (car()?.premiumVerified) {
            <pe-status-badge tone="purple" icon="workspace_premium">Premium</pe-status-badge>
          }
          @if (car()) {
            <button (click)="showEdit.set(true)" class="h-10 px-4 bg-surface border-[1.5px] border-outline-variant text-on-surface font-label-md text-label-md rounded flex items-center gap-2 hover:bg-surface-container-low transition-colors">
              <pe-icon name="edit" [size]="18" /> Edit
            </button>
          }
        </div>
      </div>
    </div>

    @if (showEdit() && car()) {
      <pe-dialog title="Edit Car" subtitle="Existing images stay; new uploads are appended." [widthPx]="860" (close)="showEdit.set(false)">
        <pe-car-form mode="edit" [car]="car()" (saved)="onSaved($event)" (cancel)="showEdit.set(false)" />
      </pe-dialog>
    }

    @if (showSell() && car()) {
      <pe-dialog title="List Car for Sale" [widthPx]="520" (close)="showSell.set(false)">
        <pe-price-list-form mode="sale" [car]="car()!" (saved)="onSaved($event)" (cancel)="showSell.set(false)" />
      </pe-dialog>
    }

    @if (showRent() && car()) {
      <pe-dialog title="List Car for Rent" [widthPx]="520" (close)="showRent.set(false)">
        <pe-price-list-form mode="rent" [car]="car()!" (saved)="onSaved($event)" (cancel)="showRent.set(false)" />
      </pe-dialog>
    }

    @if (car(); as c) {
      <div class="grid grid-cols-12 gap-gutter">
        <!-- Left -->
        <div class="col-span-12 lg:col-span-8 space-y-stack_lg">
          <!-- Gallery -->
          <div class="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-card">
            <div class="aspect-video bg-surface-container-lowest flex items-center justify-center">
              @if (c.images?.length) {
                <pe-img [src]="c.images?.[activeImage()]" [alt]="c.make + ' ' + c.model" fallback="car" />
              } @else {
                <pe-icon name="directions_car" [size]="64" class="text-outline" />
              }
            </div>
            @if ((c.images?.length || 0) > 1) {
              <div class="flex gap-2 p-3 overflow-x-auto border-t border-outline-variant">
                @for (img of c.images!; track img; let i = $index) {
                  <button (click)="activeImage.set(i)" class="w-16 h-16 rounded border overflow-hidden shrink-0" [class.border-secondary]="i === activeImage()" [class.border-outline-variant]="i !== activeImage()">
                    <pe-img [src]="img" alt="" fallback="car" />
                  </button>
                }
              </div>
            }
          </div>

          <!-- Specs grid -->
          <div class="bg-surface border border-outline-variant rounded-xl p-stack_lg shadow-card">
            <h3 class="font-h3 text-h3 text-primary mb-stack_md">Specifications</h3>
            <dl class="grid grid-cols-2 md:grid-cols-3 gap-stack_md">
              <div><dt class="font-label-sm text-label-sm text-on-surface-variant uppercase">Year</dt><dd class="font-label-md text-on-surface">{{ c.year }}</dd></div>
              <div><dt class="font-label-sm text-label-sm text-on-surface-variant uppercase">Make</dt><dd class="font-label-md text-on-surface">{{ c.make }}</dd></div>
              <div><dt class="font-label-sm text-label-sm text-on-surface-variant uppercase">Model</dt><dd class="font-label-md text-on-surface">{{ c.model }}</dd></div>
              <div><dt class="font-label-sm text-label-sm text-on-surface-variant uppercase">Transmission</dt><dd class="font-label-md text-on-surface">{{ c.transmission || '—' }}</dd></div>
              <div><dt class="font-label-sm text-label-sm text-on-surface-variant uppercase">Fuel</dt><dd class="font-label-md text-on-surface">{{ c.fuelType || '—' }}</dd></div>
              <div><dt class="font-label-sm text-label-sm text-on-surface-variant uppercase">Mileage</dt><dd class="font-label-md text-on-surface">{{ (c.mileage || 0) | number }} km</dd></div>
              <div><dt class="font-label-sm text-label-sm text-on-surface-variant uppercase">Color</dt><dd class="font-label-md text-on-surface">{{ c.color || '—' }}</dd></div>
              <div><dt class="font-label-sm text-label-sm text-on-surface-variant uppercase">Body</dt><dd class="font-label-md text-on-surface">{{ c.bodyType || '—' }}</dd></div>
              <div><dt class="font-label-sm text-label-sm text-on-surface-variant uppercase">Added</dt><dd class="font-label-md text-on-surface">{{ c.createdAt | date:'MMM d, y' }}</dd></div>
            </dl>
            @if (c.description) {
              <hr class="border-outline-variant my-stack_md" />
              <p class="font-body-md text-body-md text-on-surface">{{ c.description }}</p>
            }
            @if (c.verificationReason) {
              <div class="mt-stack_md p-3 rounded bg-status-danger/10 border-[1.5px] border-status-danger/30 text-status-danger font-body-sm">
                <strong>AI Note:</strong> {{ c.verificationReason }}
              </div>
            }
          </div>
        </div>

        <!-- Right: owner + actions -->
        <div class="col-span-12 lg:col-span-4 space-y-stack_lg">
          @if (owner(); as o) {
            <div class="bg-surface border border-outline-variant rounded-xl p-stack_lg shadow-card">
              <h3 class="font-h3 text-h3 text-primary mb-stack_md">Owner</h3>
              <a [routerLink]="['/users', o.id || o._id]" class="flex items-center gap-3 mb-stack_md group">
                <span class="w-12 h-12 rounded-full bg-secondary/10 text-secondary flex items-center justify-center font-label-md text-label-md">
                  {{ ownerInitials() }}
                </span>
                <div class="min-w-0">
                  <p class="font-label-md text-label-md text-primary group-hover:text-secondary truncate">{{ o.name }}</p>
                  <p class="font-body-sm text-body-sm text-on-surface-variant truncate">+237 {{ o.phone }}</p>
                </div>
                <pe-icon name="chevron_right" [size]="18" class="text-outline ml-auto" />
              </a>
              @if (ratings(); as r) {
                @if (r.count > 0) {
                  <div class="flex items-center gap-2 font-body-sm text-on-surface-variant border-t border-outline-variant pt-stack_md">
                    <div class="flex gap-0.5">
                      @for (i of [1,2,3,4,5]; track i) {
                        <pe-icon name="star" [size]="14" [filled]="i <= roundedAvg()" [class]="i <= roundedAvg() ? 'text-status-warning' : 'text-outline-variant'" />
                      }
                    </div>
                    <span class="text-on-surface font-label-md">{{ r.average.toFixed(1) }}</span>
                    <span>({{ r.count }} review{{ r.count === 1 ? '' : 's' }})</span>
                  </div>
                } @else {
                  <div class="border-t border-outline-variant pt-stack_md font-body-sm text-body-sm text-on-surface-variant">
                    No ratings yet.
                  </div>
                }
              }
            </div>
          }

          <div class="bg-surface border border-outline-variant rounded-xl p-stack_lg shadow-card sticky top-20">
            <h3 class="font-h3 text-h3 text-primary mb-stack_md">Verification</h3>

            <button
              (click)="setVerified()"
              [disabled]="saving()"
              class="w-full h-10 rounded font-label-md text-label-md text-white transition-colors flex items-center justify-center gap-2 mb-2 disabled:opacity-60"
              style="background:#16a34a"
            >
              <pe-icon name="verified" [size]="18" /> Mark Verified
            </button>
            <button
              (click)="setFlagged()"
              [disabled]="saving()"
              class="w-full h-10 rounded font-label-md text-label-md transition-colors flex items-center justify-center gap-2 mb-2 disabled:opacity-60"
              style="background:#ef4444;color:white"
            >
              <pe-icon name="flag" [size]="18" /> Flag for Review
            </button>
            <button
              (click)="togglePremium()"
              [disabled]="saving()"
              class="w-full h-10 rounded border-[1.5px] border-status-purple text-status-purple bg-status-purple/10 font-label-md text-label-md hover:bg-status-purple/20 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <pe-icon name="workspace_premium" [size]="18" />
              {{ c.premiumVerified ? 'Remove Premium' : 'Mark Premium' }}
            </button>

            <hr class="border-outline-variant my-stack_md" />

            <h4 class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-2">Pricing</h4>
            <div class="space-y-2 mb-stack_md font-body-md">
              <div class="flex justify-between"><span class="text-on-surface-variant">Sale price</span><span class="text-on-surface font-label-md">{{ (c.price || 0) | number }} XAF</span></div>
              <div class="flex justify-between"><span class="text-on-surface-variant">Rental price</span><span class="text-on-surface font-label-md">{{ (c.rentalPrice || 0) | number }} XAF / day</span></div>
            </div>
            <div class="grid grid-cols-2 gap-2 mb-stack_md">
              <button (click)="showSell.set(true)" class="h-9 px-3 bg-surface border-[1.5px] border-outline-variant text-on-surface font-label-md rounded hover:bg-surface-container-low flex items-center justify-center gap-1">
                <pe-icon name="sell" [size]="16" /> Set sale price
              </button>
              <button (click)="showRent.set(true)" class="h-9 px-3 bg-surface border-[1.5px] border-outline-variant text-on-surface font-label-md rounded hover:bg-surface-container-low flex items-center justify-center gap-1">
                <pe-icon name="key" [size]="16" /> Set rental price
              </button>
            </div>

            @if (c.inGarage || c.status === 'parked') {
              <button
                (click)="collectFromGarage()"
                [disabled]="saving()"
                class="w-full h-10 bg-surface border-[1.5px] border-outline-variant text-on-surface rounded font-label-md text-label-md hover:bg-surface-container-low transition-colors flex items-center justify-center gap-2 mb-stack_md disabled:opacity-60"
              >
                <pe-icon name="local_shipping" [size]="18" /> Collect from Garage
              </button>
            }

            <hr class="border-outline-variant my-stack_md" />

            <button
              (click)="deleteCar()"
              [disabled]="saving()"
              class="w-full h-10 bg-surface border border-error text-error rounded font-label-md text-label-md hover:bg-error-container transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <pe-icon name="delete" [size]="18" /> Delete Listing
            </button>
          </div>
        </div>
      </div>
    } @else {
      <div class="bg-surface border border-outline-variant rounded-xl p-stack_lg text-center">
        <pe-icon name="hourglass_empty" [size]="32" class="text-on-surface-variant" />
        <p class="font-body-md text-on-surface-variant mt-2">Loading car details…</p>
      </div>
    }
  `,
})
export class CarDetailsPage implements OnInit {
  private readonly api = inject(ApiService);
  private readonly carService = inject(CarService);
  private readonly ratingService = inject(RatingService);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);

  @Input() id!: string;

  readonly car = signal<Car | null>(null);
  readonly owner = signal<User | null>(null);
  readonly ratings = signal<RatingSummary | null>(null);
  readonly activeImage = signal(0);
  readonly saving = signal(false);

  readonly showEdit = signal(false);
  readonly showSell = signal(false);
  readonly showRent = signal(false);

  onSaved(updated: Car): void {
    this.car.set(updated);
    this.showEdit.set(false);
    this.showSell.set(false);
    this.showRent.set(false);
  }

  readonly roundedAvg = computed(() => Math.round(this.ratings()?.average ?? 0));

  ngOnInit(): void {
    this.api.get<ApiResponse<Car>>(`/cars/${this.id}`).subscribe({
      next: (res) => {
        const c = res.data ?? null;
        this.car.set(c);
        if (c) this.loadOwner(c);
      },
      error: () => this.car.set(null),
    });
  }

  private loadOwner(car: Car): void {
    // owner can come back as an id string or as a populated object depending
    // on whether the backend route called `.populate('owner')`.
    if (typeof car.owner === 'string') {
      this.userService.get(car.owner).subscribe({
        next: (res) => res.data && this.owner.set(res.data),
        error: () => this.owner.set(null),
      });
      this.fetchRatings(car.owner);
    } else if (car.owner && typeof car.owner === 'object') {
      this.owner.set(car.owner as User);
      const ownerId = (car.owner as User)._id ?? (car.owner as User).id;
      if (ownerId) this.fetchRatings(ownerId);
    }
  }

  private fetchRatings(sellerId: string): void {
    this.ratingService.summary(sellerId).subscribe({
      next: (res) => this.ratings.set(res.data ?? null),
      error: () => this.ratings.set(null),
    });
  }

  ownerInitials(): string {
    const o = this.owner();
    return o?.name?.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase() ?? '?';
  }

  setVerified(): void {
    this.update({ verified: 'verified' });
  }

  setFlagged(): void {
    this.update({ verified: 'flagged' });
  }

  togglePremium(): void {
    // The deployed backend exposes a dedicated /:id/premium toggle that flips
    // the flag in either direction — cleaner than reusing /verify.
    this.saving.set(true);
    this.carService.setPremium(this.id, !this.car()?.premiumVerified).subscribe({
      next: (res) => {
        if (res.data) this.car.set(res.data);
        this.saving.set(false);
      },
      error: () => this.saving.set(false),
    });
  }

  private update(body: { verified?: 'verified' | 'unverified' | 'flagged'; premiumVerified?: boolean }): void {
    this.saving.set(true);
    this.carService.setVerification(this.id, body).subscribe({
      next: (res) => {
        if (res.data) this.car.set(res.data);
        this.saving.set(false);
      },
      error: () => this.saving.set(false),
    });
  }

  deleteCar(): void {
    if (!confirm('Delete this car listing? This cannot be undone.')) return;
    this.saving.set(true);
    this.carService.delete(this.id).subscribe({
      next: () => this.router.navigate(['/cars']),
      error: () => this.saving.set(false),
    });
  }

  collectFromGarage(): void {
    if (!confirm('Mark this car as collected from the garage?')) return;
    this.saving.set(true);
    this.carService.collect(this.id).subscribe({
      next: (res) => {
        if (res.data) this.car.set(res.data);
        this.saving.set(false);
      },
      error: () => this.saving.set(false),
    });
  }
}

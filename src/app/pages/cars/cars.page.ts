import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CarService } from '../../core/services/car.service';
import { Car } from '../../core/models/car.model';
import { environment } from '../../../environments/environment';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { StatusBadgeComponent, BadgeTone } from '../../shared/components/status-badge/status-badge.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { DialogComponent } from '../../shared/components/dialog/dialog.component';
import { CarFormComponent } from '../../shared/forms/car-form.component';
import { ImgComponent } from '../../shared/components/img/img.component';

@Component({
  selector: 'pe-cars-page',
  standalone: true,
  imports: [DatePipe, DecimalPipe, FormsModule, RouterLink, PageHeaderComponent, IconComponent, StatusBadgeComponent, EmptyStateComponent, DialogComponent, CarFormComponent, ImgComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <pe-page-header title="Vehicle Listings" subtitle="Manage and verify vehicle listings across the platform.">
      <button class="h-10 px-4 bg-surface border-[1.5px] border-outline-variant text-on-surface font-label-md text-label-md rounded flex items-center gap-2 hover:bg-surface-container-low">
        <pe-icon name="download" [size]="18" /> Export
      </button>
      <button (click)="showCreate.set(true)" class="h-10 px-4 bg-secondary text-on-secondary font-label-md text-label-md rounded flex items-center gap-2 hover:opacity-90 shadow-card">
        <pe-icon name="add" [size]="18" /> Add Listing
      </button>
    </pe-page-header>

    @if (showCreate()) {
      <pe-dialog title="Add Car Listing" subtitle="Upload images and documents — they're sent as multipart form data." [widthPx]="860" (close)="showCreate.set(false)">
        <pe-car-form mode="create" (saved)="onCreated()" (cancel)="showCreate.set(false)" />
      </pe-dialog>
    }

    <!-- Filters -->
    <div class="bg-surface border-[1.5px] border-outline-variant rounded p-4 mb-stack_lg flex flex-wrap items-center gap-4 shadow-card">
      <div class="relative flex-1 min-w-[200px]">
        <pe-icon name="search" [size]="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none" />
        <input
          [(ngModel)]="search"
          (keyup.enter)="load()"
          type="text"
          placeholder="Search by make, model, or ID…"
          class="w-full h-10 pl-10 pr-4 bg-surface border-[1.5px] border-outline-variant rounded font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:border-secondary outline-none"
        />
      </div>
      <select
        [(ngModel)]="make"
        (change)="load()"
        class="h-10 px-4 bg-surface border-[1.5px] border-outline-variant rounded font-body-sm text-body-sm text-on-surface focus:border-secondary outline-none cursor-pointer min-w-[140px]"
      >
        <option value="">All Makes</option>
        @for (m of makes(); track m) { <option [value]="m">{{ m }}</option> }
      </select>
      <div class="flex items-center gap-2">
        <input [(ngModel)]="yearMin" type="number" placeholder="Min Year" class="w-24 h-10 px-3 bg-surface border-[1.5px] border-outline-variant rounded font-body-sm focus:border-secondary outline-none" />
        <span class="text-outline-variant">—</span>
        <input [(ngModel)]="yearMax" type="number" placeholder="Max Year" class="w-24 h-10 px-3 bg-surface border-[1.5px] border-outline-variant rounded font-body-sm focus:border-secondary outline-none" />
      </div>
      <div class="flex items-center gap-2">
        <input [(ngModel)]="priceMin" type="number" placeholder="Min Price (XAF)" class="w-32 h-10 px-3 bg-surface border-[1.5px] border-outline-variant rounded font-body-sm focus:border-secondary outline-none" />
        <span class="text-outline-variant">—</span>
        <input [(ngModel)]="priceMax" type="number" placeholder="Max Price (XAF)" class="w-32 h-10 px-3 bg-surface border-[1.5px] border-outline-variant rounded font-body-sm focus:border-secondary outline-none" />
      </div>
      <div class="flex border-[1.5px] border-outline-variant rounded overflow-hidden">
        @for (f of verificationTabs; track f.id) {
          <button
            (click)="setVerification(f.id)"
            class="h-10 px-4 font-label-md text-label-md border-r-[1.5px] border-outline-variant last:border-r-0 transition-colors"
            [class.bg-surface-container-low]="verification() === f.id"
            [class.text-primary]="verification() === f.id"
            [class.bg-surface]="verification() !== f.id"
            [class.text-on-surface-variant]="verification() !== f.id"
            [class.hover:bg-surface-container-low]="verification() !== f.id"
          >{{ f.label }}</button>
        }
      </div>
      <button (click)="load()" class="h-10 px-4 bg-secondary text-on-secondary rounded font-label-md text-label-md hover:opacity-90">
        Apply
      </button>
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
              <th class="p-3 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider w-16">Image</th>
              <th class="p-3 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Vehicle</th>
              <th class="p-3 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Price (XAF)</th>
              <th class="p-3 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Status</th>
              <th class="p-3 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Verification</th>
              <th class="p-3 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Added</th>
              <th class="p-3 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="font-body-sm text-body-sm text-on-surface divide-y divide-outline-variant/50">
            @for (car of cars(); track car._id) {
              <tr class="hover:bg-background transition-colors group">
                <td class="p-3 text-center">
                  <input type="checkbox" class="w-4 h-4 rounded border-outline-variant text-secondary cursor-pointer" />
                </td>
                <td class="p-3">
                  <div class="w-10 h-10 rounded border border-outline-variant overflow-hidden bg-surface-variant">
                    <pe-img [src]="car.images?.[0]" alt="" fallback="car" />
                  </div>
                </td>
                <td class="p-3">
                  <a [routerLink]="['/cars', car._id]" class="block">
                    <div class="font-h3 text-h3 text-primary hover:text-secondary transition-colors">{{ car.year }} {{ car.make }} {{ car.model }}</div>
                    <div class="text-outline mt-0.5">{{ car.transmission || '—' }} · {{ car.fuelType || 'fuel n/a' }}</div>
                  </a>
                </td>
                <td class="p-3 font-label-md text-label-md">
                  {{ (car.price || 0) | number }}
                </td>
                <td class="p-3">
                  <pe-status-badge [tone]="statusTone(car.status)">{{ statusLabel(car.status) }}</pe-status-badge>
                </td>
                <td class="p-3">
                  <pe-status-badge [tone]="verificationTone(car)" [icon]="verificationIcon(car)">
                    {{ verificationLabel(car) }}
                  </pe-status-badge>
                </td>
                <td class="p-3 text-on-surface-variant">{{ car.createdAt | date:'MMM d, y' }}</td>
                <td class="p-3 text-right">
                  <a [routerLink]="['/cars', car._id]" class="p-1 text-outline hover:text-primary transition-colors inline-flex">
                    <pe-icon name="chevron_right" [size]="20" />
                  </a>
                </td>
              </tr>
            }
            @if (!loading() && cars().length === 0) {
              <tr><td colspan="8">
                <pe-empty-state icon="directions_car" title="No cars match these filters" description="Try widening the year or price range, or clear the search." />
              </td></tr>
            }
          </tbody>
        </table>
      </div>

      <div class="border-t-[1.5px] border-outline-variant p-4 flex items-center justify-between bg-surface-container-lowest">
        <span class="font-body-sm text-body-sm text-on-surface-variant">
          Showing {{ cars().length }} of {{ total() | number }} entries
        </span>
        <div class="flex gap-1">
          <button (click)="prev()" [disabled]="page() <= 1" class="w-8 h-8 flex items-center justify-center rounded border-[1.5px] border-outline-variant text-outline hover:bg-surface-container-low transition-colors disabled:opacity-50">
            <pe-icon name="chevron_left" [size]="18" />
          </button>
          <span class="w-auto px-3 h-8 flex items-center justify-center rounded border-[1.5px] border-secondary bg-secondary/10 text-secondary font-label-md text-label-md">
            {{ page() }}
          </span>
          <button (click)="next()" [disabled]="page() * limit >= total()" class="w-8 h-8 flex items-center justify-center rounded border-[1.5px] border-outline-variant text-on-surface hover:bg-surface-container-low transition-colors disabled:opacity-50">
            <pe-icon name="chevron_right" [size]="18" />
          </button>
        </div>
      </div>
    </div>
  `,
})
export class CarsPage implements OnInit {
  private readonly carService = inject(CarService);

  readonly cars = signal<Car[]>([]);
  readonly total = signal(0);
  readonly makes = signal<string[]>([]);
  readonly verification = signal<'all' | 'verified' | 'flagged'>('all');
  readonly loading = signal(false);
  readonly page = signal(1);
  readonly limit = 20;
  readonly showCreate = signal(false);

  onCreated(): void {
    this.showCreate.set(false);
    this.load();
  }

  search = '';
  make = '';
  yearMin?: number;
  yearMax?: number;
  priceMin?: number;
  priceMax?: number;

  readonly verificationTabs = [
    { id: 'all' as const, label: 'All' },
    { id: 'verified' as const, label: 'Verified' },
    { id: 'flagged' as const, label: 'Flagged' },
  ];

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.carService.search({
      q: this.search.trim() || undefined,
      make: this.make || undefined,
      yearMin: this.yearMin,
      yearMax: this.yearMax,
      priceMin: this.priceMin,
      priceMax: this.priceMax,
      page: this.page(),
      limit: this.limit,
    }).subscribe({
      next: (res) => {
        let list = res.data ?? [];
        // Verification tabs are client-side over the search payload.
        if (this.verification() === 'verified') list = list.filter((c) => c.verified === 'verified');
        if (this.verification() === 'flagged') list = list.filter((c) => c.flagged);
        this.cars.set(list);
        this.total.set(res.pagination?.total ?? list.length);
        this.makes.set((res.facets?.makes || []).map((m) => m.make));
        this.loading.set(false);
      },
      error: () => {
        this.cars.set([]);
        this.total.set(0);
        this.loading.set(false);
      },
    });
  }

  setVerification(v: 'all' | 'verified' | 'flagged'): void {
    this.verification.set(v);
    this.load();
  }

  prev(): void {
    if (this.page() > 1) {
      this.page.set(this.page() - 1);
      this.load();
    }
  }

  next(): void {
    this.page.set(this.page() + 1);
    this.load();
  }

  mediaUrl(path: string): string {
    if (path.startsWith('http')) return path;
    return `${environment.mediaUrl}${path}`;
  }

  statusLabel(s: Car['status']): string {
    return ({ available: 'Active', parked: 'Parked', rented: 'Rented', sold: 'Sold' } as Record<string, string>)[s] ?? s;
  }
  statusTone(s: Car['status']): BadgeTone {
    if (s === 'available') return 'success';
    if (s === 'rented') return 'info';
    if (s === 'sold') return 'neutral';
    return 'warning';
  }

  verificationLabel(c: Car): string {
    if (c.flagged) return 'Flagged';
    if (c.verified === 'verified') return c.premiumVerified ? 'Premium' : 'Verified';
    return 'Unverified';
  }
  verificationTone(c: Car): BadgeTone {
    if (c.flagged) return 'danger';
    if (c.verified === 'verified') return c.premiumVerified ? 'purple' : 'info';
    return 'neutral';
  }
  verificationIcon(c: Car): string | undefined {
    if (c.flagged) return 'flag';
    if (c.verified === 'verified') return c.premiumVerified ? 'workspace_premium' : 'verified';
    return undefined;
  }
}

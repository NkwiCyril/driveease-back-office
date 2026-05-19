import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdvertService } from '../../core/services/advert.service';
import { Advert, AdvertStatus } from '../../core/models/advert.model';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { StatusBadgeComponent, BadgeTone } from '../../shared/components/status-badge/status-badge.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { DialogComponent } from '../../shared/components/dialog/dialog.component';
import { AdvertFormComponent } from '../../shared/forms/advert-form.component';
import { ImgComponent } from '../../shared/components/img/img.component';

@Component({
  selector: 'pe-adverts-page',
  standalone: true,
  imports: [DatePipe, DecimalPipe, FormsModule, PageHeaderComponent, IconComponent, StatusBadgeComponent, EmptyStateComponent, DialogComponent, AdvertFormComponent, ImgComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <pe-page-header title="Adverts Management" subtitle="Moderate listings, manage featured rotation and pricing boosts.">
      <button class="h-10 px-4 bg-surface border-[1.5px] border-outline-variant text-on-surface font-label-md text-label-md rounded flex items-center gap-2 hover:bg-surface-container-low">
        <pe-icon name="download" [size]="18" /> Export
      </button>
      <button (click)="openCreate()" class="h-10 px-4 bg-secondary text-on-secondary font-label-md text-label-md rounded flex items-center gap-2 hover:opacity-90 shadow-card">
        <pe-icon name="add" [size]="18" /> New Advert
      </button>
    </pe-page-header>

    @if (formMode()) {
      <pe-dialog [title]="formMode() === 'create' ? 'New Advert' : 'Edit Advert'" [widthPx]="820" (close)="closeForm()">
        <pe-advert-form [mode]="formMode()!" [advert]="editTarget()" (saved)="onSaved()" (cancel)="closeForm()" />
      </pe-dialog>
    }

    <!-- Stats row -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-gutter mb-stack_lg">
      @for (stat of stats(); track stat.label) {
        <div class="bg-surface-container-lowest border-[1.5px] border-outline-variant rounded-xl p-stack_md shadow-card">
          <p class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">{{ stat.label }}</p>
          <p class="font-h2 text-h2 text-on-surface mt-1">{{ stat.value }}</p>
        </div>
      }
    </div>

    <!-- Filters -->
    <div class="bg-surface border-[1.5px] border-outline-variant rounded p-4 mb-stack_lg flex flex-wrap items-center gap-4 shadow-card">
      <select
        [(ngModel)]="status"
        (change)="load()"
        class="h-10 px-4 bg-surface border-[1.5px] border-outline-variant rounded font-body-sm text-body-sm focus:border-secondary outline-none cursor-pointer"
      >
        <option value="">All Statuses</option>
        <option value="active">Active</option>
        <option value="paused">Paused</option>
        <option value="draft">Draft</option>
        <option value="expired">Expired</option>
      </select>
    </div>

    <!-- Adverts Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-gutter">
      @for (advert of adverts(); track advert._id) {
        <article class="bg-surface border-[1.5px] border-outline-variant rounded-xl overflow-hidden shadow-card flex flex-col">
          <div class="aspect-video bg-surface-container-lowest flex items-center justify-center relative overflow-hidden">
            <pe-img [src]="advert.images?.[0]" [alt]="advert.title" fallback="car" />
            <div class="absolute top-3 left-3 flex gap-2">
              <pe-status-badge [tone]="statusTone(advert.status)">{{ advert.status }}</pe-status-badge>
              @if (isFeatured(advert)) {
                <pe-status-badge tone="warning" icon="star">Featured</pe-status-badge>
              }
            </div>
          </div>
          <div class="p-stack_md flex-1 flex flex-col">
            <h3 class="font-h3 text-h3 text-primary mb-1 truncate">{{ advert.title }}</h3>
            <p class="font-body-sm text-body-sm text-on-surface-variant mb-stack_md line-clamp-2">{{ advert.description || advert.make + ' ' + advert.model }}</p>
            <div class="flex justify-between items-end mt-auto">
              <div>
                <p class="font-label-sm text-label-sm text-on-surface-variant uppercase">Price</p>
                <p class="font-label-md text-label-md text-on-surface">{{ (advert.price || 0) | number }} XAF</p>
              </div>
              <div class="text-right">
                <p class="font-label-sm text-label-sm text-on-surface-variant uppercase">Engagement</p>
                <p class="font-label-md text-label-md text-on-surface flex items-center gap-2">
                  <span class="inline-flex items-center gap-1"><pe-icon name="visibility" [size]="14" /> {{ advert.views || 0 }}</span>
                  <span class="inline-flex items-center gap-1"><pe-icon name="ads_click" [size]="14" /> {{ advert.clicks || 0 }}</span>
                </p>
              </div>
            </div>
            <div class="mt-stack_md pt-stack_md border-t border-outline-variant flex justify-between items-center gap-2">
              <span class="font-label-sm text-label-sm text-on-surface-variant">{{ advert.createdAt | date:'MMM d, y' }}</span>
              <div class="flex gap-2">
                <button (click)="boost(advert)" class="h-8 px-3 bg-surface border-[1.5px] border-outline-variant text-on-surface font-label-sm rounded hover:bg-surface-container-low">
                  Boost
                </button>
                <button (click)="remove(advert)" class="h-8 px-3 bg-surface border-[1.5px] border-error/30 text-error font-label-sm rounded hover:bg-error-container">
                  Remove
                </button>
              </div>
            </div>
          </div>
        </article>
      }
      @if (!loading() && adverts().length === 0) {
        <div class="col-span-full">
          <pe-empty-state icon="campaign" title="No adverts found" description="When merchants publish adverts they'll appear here." />
        </div>
      }
    </div>
  `,
})
export class AdvertsPage implements OnInit {
  private readonly advertService = inject(AdvertService);

  readonly adverts = signal<Advert[]>([]);
  readonly loading = signal(false);
  readonly stats = signal<Array<{ label: string; value: string | number }>>([]);
  readonly formMode = signal<'create' | 'edit' | null>(null);
  readonly editTarget = signal<Advert | null>(null);

  status: AdvertStatus | '' = '';

  openCreate(): void {
    this.editTarget.set(null);
    this.formMode.set('create');
  }

  openEdit(advert: Advert): void {
    this.editTarget.set(advert);
    this.formMode.set('edit');
  }

  closeForm(): void {
    this.formMode.set(null);
    this.editTarget.set(null);
  }

  onSaved(): void {
    this.closeForm();
    this.load();
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.advertService.list({ status: this.status || undefined, limit: 50 }).subscribe({
      next: (res) => {
        const list = res.data ?? [];
        this.adverts.set(list);
        this.stats.set([
          { label: 'Total', value: res.pagination?.total ?? list.length },
          { label: 'Featured', value: list.filter((a) => this.isFeatured(a)).length },
          { label: 'Active', value: list.filter((a) => a.status === 'active').length },
          { label: 'Total Views', value: list.reduce((sum, a) => sum + (a.views || 0), 0).toLocaleString() },
        ]);
        this.loading.set(false);
      },
      error: () => {
        this.adverts.set([]);
        this.loading.set(false);
      },
    });
  }

  isFeatured(a: Advert): boolean {
    return (a.priority ?? 0) > 0 && !!a.priorityUntil && new Date(a.priorityUntil) > new Date();
  }

  statusTone(s: AdvertStatus): BadgeTone {
    if (s === 'active') return 'success';
    if (s === 'paused') return 'warning';
    if (s === 'expired') return 'neutral';
    return 'info';
  }

  boost(a: Advert): void {
    const days = prompt('Boost for how many days?', '7');
    if (!days) return;
    const n = parseInt(days, 10);
    if (Number.isNaN(n) || n < 1) return;
    this.advertService.setPriority(a._id, { priority: 10, durationDays: n }).subscribe({
      next: () => this.load(),
    });
  }

  remove(a: Advert): void {
    if (!confirm(`Remove advert "${a.title}"?`)) return;
    this.advertService.delete(a._id).subscribe({ next: () => this.load() });
  }
}

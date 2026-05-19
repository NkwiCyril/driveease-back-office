import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CarService } from '../../core/services/car.service';
import { Car } from '../../core/models/car.model';
import { environment } from '../../../environments/environment';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ImgComponent } from '../../shared/components/img/img.component';

@Component({
  selector: 'pe-ai-queue-page',
  standalone: true,
  imports: [DatePipe, RouterLink, PageHeaderComponent, IconComponent, StatusBadgeComponent, EmptyStateComponent, ImgComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <pe-page-header title="AI Verification Queue" subtitle="Cars the auto-verifier flagged for human review.">
      <button (click)="load()" class="h-10 px-4 bg-surface border-[1.5px] border-outline-variant text-on-surface font-label-md text-label-md rounded flex items-center gap-2 hover:bg-surface-container-low">
        <pe-icon name="refresh" [size]="18" /> Refresh
      </button>
    </pe-page-header>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
      @for (car of flagged(); track car._id) {
        <article class="bg-surface border-[1.5px] border-outline-variant rounded-xl overflow-hidden shadow-card">
          <div class="flex gap-stack_md p-stack_md">
            <div class="w-32 h-32 rounded border border-outline-variant overflow-hidden bg-surface-container-lowest shrink-0">
              <pe-img [src]="car.images?.[0]" alt="" fallback="car" />
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="font-h3 text-h3 text-primary mb-1 truncate">{{ car.year }} {{ car.make }} {{ car.model }}</h3>
              <p class="font-body-sm text-body-sm text-on-surface-variant mb-2 line-clamp-2">{{ car.description || '—' }}</p>
              <div class="flex flex-wrap gap-2 mb-2">
                <pe-status-badge tone="danger" icon="flag">Flagged</pe-status-badge>
                <pe-status-badge tone="neutral">{{ car.status }}</pe-status-badge>
              </div>
              @if (car.verificationReason) {
                <p class="font-body-sm text-body-sm text-status-danger">
                  <strong>AI:</strong> {{ car.verificationReason }}
                </p>
              }
              <p class="font-label-sm text-label-sm text-on-surface-variant mt-2">Submitted {{ car.createdAt | date:'MMM d, y' }}</p>
            </div>
          </div>
          <div class="p-stack_md border-t border-outline-variant bg-surface-container-lowest flex flex-wrap gap-2 justify-end">
            <a [routerLink]="['/cars', car._id]" class="h-9 px-4 rounded border-[1.5px] border-outline-variant text-primary font-label-md text-label-md hover:bg-surface-container-low transition-colors inline-flex items-center gap-1">
              <pe-icon name="open_in_new" [size]="16" /> Inspect
            </a>
            <button (click)="approve(car)" class="h-9 px-4 rounded text-white font-label-md text-label-md hover:opacity-90 transition-opacity inline-flex items-center gap-1" style="background:#16a34a">
              <pe-icon name="verified" [size]="16" /> Approve
            </button>
            <button (click)="reject(car)" class="h-9 px-4 rounded text-white font-label-md text-label-md hover:opacity-90 transition-opacity inline-flex items-center gap-1" style="background:#ef4444">
              <pe-icon name="block" [size]="16" /> Reject
            </button>
          </div>
        </article>
      }
      @if (!loading() && flagged().length === 0) {
        <div class="col-span-full">
          <pe-empty-state icon="check_circle" title="Inbox zero" description="No cars are currently flagged for review. Nice work." />
        </div>
      }
    </div>
  `,
})
export class AiQueuePage implements OnInit {
  private readonly carService = inject(CarService);

  readonly flagged = signal<Car[]>([]);
  readonly loading = signal(false);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    // Pull a wide window of search results and filter to flagged client-side
    // — the backend has no dedicated /cars/flagged endpoint yet.
    this.carService.search({ limit: 50 }).subscribe({
      next: (res) => {
        const list = (res.data ?? []).filter((c) => c.flagged);
        this.flagged.set(list);
        this.loading.set(false);
      },
      error: () => {
        this.flagged.set([]);
        this.loading.set(false);
      },
    });
  }

  approve(car: Car): void {
    this.carService.setVerification(car._id, { verified: 'verified' }).subscribe({ next: () => this.load() });
  }

  reject(car: Car): void {
    if (!confirm(`Reject and delete ${car.year} ${car.make} ${car.model}?`)) return;
    this.carService.delete(car._id).subscribe({ next: () => this.load() });
  }

  mediaUrl(path: string): string {
    if (path.startsWith('http')) return path;
    return `${environment.mediaUrl}${path}`;
  }
}

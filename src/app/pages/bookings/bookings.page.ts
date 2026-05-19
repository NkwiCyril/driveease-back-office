import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingService } from '../../core/services/booking.service';
import { Booking, BookingStatus } from '../../core/models/booking.model';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { StatusBadgeComponent, BadgeTone } from '../../shared/components/status-badge/status-badge.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { DialogComponent } from '../../shared/components/dialog/dialog.component';
import { BookingFormComponent } from '../../shared/forms/booking-form.component';

@Component({
  selector: 'pe-bookings-page',
  standalone: true,
  imports: [DatePipe, DecimalPipe, FormsModule, PageHeaderComponent, IconComponent, StatusBadgeComponent, EmptyStateComponent, DialogComponent, BookingFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <pe-page-header title="Bookings" subtitle="Track every rental booking across the platform.">
      <button class="h-10 px-4 bg-surface border-[1.5px] border-outline-variant text-on-surface font-label-md text-label-md rounded flex items-center gap-2 hover:bg-surface-container-low">
        <pe-icon name="download" [size]="18" /> Export
      </button>
      <button (click)="openCreate()" class="h-10 px-4 bg-secondary text-on-secondary font-label-md text-label-md rounded flex items-center gap-2 hover:opacity-90 shadow-card">
        <pe-icon name="add" [size]="18" /> New Booking
      </button>
    </pe-page-header>

    @if (formMode()) {
      <pe-dialog [title]="formMode() === 'create' ? 'New Booking' : 'Edit Booking'" [widthPx]="640" (close)="closeForm()">
        <pe-booking-form [mode]="formMode()!" [booking]="editTarget()" (saved)="onSaved()" (cancel)="closeForm()" />
      </pe-dialog>
    }

    <!-- Filter pills -->
    <div class="flex flex-wrap gap-2 mb-stack_lg">
      @for (f of filters; track f.id) {
        <button
          (click)="setStatus(f.id)"
          class="h-9 px-4 rounded-full font-label-md text-label-md border-[1.5px] transition-colors"
          [class.bg-primary]="status() === f.id"
          [class.text-on-primary]="status() === f.id"
          [class.border-primary]="status() === f.id"
          [class.bg-surface]="status() !== f.id"
          [class.text-on-surface-variant]="status() !== f.id"
          [class.border-outline-variant]="status() !== f.id"
          [class.hover:bg-surface-container-low]="status() !== f.id"
        >{{ f.label }}</button>
      }
    </div>

    <div class="bg-surface border-[1.5px] border-outline-variant rounded-lg overflow-hidden shadow-card">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b-[1.5px] border-outline-variant bg-surface-container-lowest">
              <th class="p-3 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Booking</th>
              <th class="p-3 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Customer</th>
              <th class="p-3 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Period</th>
              <th class="p-3 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Days</th>
              <th class="p-3 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Total</th>
              <th class="p-3 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Status</th>
              <th class="p-3 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="font-body-sm text-body-sm divide-y divide-outline-variant/50">
            @for (b of bookings(); track b._id) {
              <tr class="hover:bg-background transition-colors">
                <td class="p-3">
                  <div class="font-label-md text-label-md text-primary">{{ carLabel(b) }}</div>
                  <div class="text-outline">#{{ b._id.slice(-6) }}</div>
                </td>
                <td class="p-3 text-on-surface">{{ userLabel(b) }}</td>
                <td class="p-3 text-on-surface-variant">{{ b.startDate | date:'MMM d' }} — {{ b.endDate | date:'MMM d, y' }}</td>
                <td class="p-3">{{ b.days }}</td>
                <td class="p-3 font-label-md">{{ (b.totalCost || 0) | number }} XAF</td>
                <td class="p-3"><pe-status-badge [tone]="statusTone(b.status)">{{ b.status }}</pe-status-badge></td>
                <td class="p-3 text-right">
                  <div class="flex justify-end gap-2">
                    <button
                      (click)="openEdit(b)"
                      [disabled]="b.status === 'cancelled' || b.status === 'completed'"
                      class="h-8 px-3 bg-surface border-[1.5px] border-outline-variant text-on-surface font-label-sm rounded hover:bg-surface-container-low transition-colors disabled:opacity-40"
                    >Edit</button>
                    <button
                      (click)="cancel(b)"
                      [disabled]="b.status === 'cancelled' || b.status === 'completed'"
                      class="h-8 px-3 bg-surface border-[1.5px] border-outline-variant text-on-surface font-label-sm rounded hover:bg-surface-container-low transition-colors disabled:opacity-40"
                    >Cancel</button>
                  </div>
                </td>
              </tr>
            }
            @if (!loading() && bookings().length === 0) {
              <tr><td colspan="7">
                <pe-empty-state icon="event_busy" title="No bookings" description="Bookings created in the platform will surface here." />
              </td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class BookingsPage implements OnInit {
  private readonly bookingService = inject(BookingService);

  readonly bookings = signal<Booking[]>([]);
  readonly loading = signal(false);
  readonly status = signal<BookingStatus | ''>('');
  readonly formMode = signal<'create' | 'edit' | null>(null);
  readonly editTarget = signal<Booking | null>(null);

  openCreate(): void { this.editTarget.set(null); this.formMode.set('create'); }
  openEdit(b: Booking): void { this.editTarget.set(b); this.formMode.set('edit'); }
  closeForm(): void { this.formMode.set(null); this.editTarget.set(null); }
  onSaved(): void { this.closeForm(); this.load(); }

  readonly filters: Array<{ id: BookingStatus | ''; label: string }> = [
    { id: '', label: 'All' },
    { id: 'pending', label: 'Pending' },
    { id: 'active', label: 'Active' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  ngOnInit(): void {
    this.load();
  }

  setStatus(s: BookingStatus | ''): void {
    this.status.set(s);
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.bookingService.list({ status: this.status() || undefined, limit: 50 }).subscribe({
      next: (res) => {
        this.bookings.set(res.data ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.bookings.set([]);
        this.loading.set(false);
      },
    });
  }

  carLabel(b: Booking): string {
    const car = b.car;
    if (typeof car === 'string') return `Car ${car.slice(-6)}`;
    return `${car.year ?? ''} ${car.make ?? ''} ${car.model ?? ''}`.trim() || 'Car';
  }

  userLabel(b: Booking): string {
    const u = b.user;
    if (typeof u === 'string') return `User ${u.slice(-6)}`;
    return u.name ?? '—';
  }

  statusTone(s: BookingStatus): BadgeTone {
    if (s === 'active') return 'info';
    if (s === 'completed') return 'success';
    if (s === 'cancelled') return 'danger';
    return 'warning';
  }

  cancel(b: Booking): void {
    if (b.status === 'cancelled' || b.status === 'completed') return;
    const reason = prompt('Cancel reason?');
    if (reason == null) return;
    this.bookingService.cancel(b._id, reason).subscribe({ next: () => this.load() });
  }
}

import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { BookingService } from '../../core/services/booking.service';
import { Booking } from '../../core/models/booking.model';

export type BookingFormMode = 'create' | 'edit';

interface FormState {
  carId: string;
  startDate: string;
  endDate: string;
  notes: string;
}

@Component({
  selector: 'pe-booking-form',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form #f="ngForm" (ngSubmit)="onSubmit(f)" novalidate>
      @if (banner()) {
        <div class="mb-stack_md px-3 py-2 rounded border-[1.5px] border-error/30 bg-error/10 text-error font-body-sm">
          {{ banner() }}
        </div>
      }

      <div class="space-y-stack_md">
        @if (mode === 'create') {
          <label class="block">
            <span class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Car ID</span>
            <input
              type="text"
              name="carId"
              [(ngModel)]="state.carId"
              required
              class="mt-1 w-full h-10 px-3 bg-surface border-[1.5px] border-outline-variant rounded font-body-md focus:border-secondary outline-none"
            />
            <span class="font-label-sm text-label-sm text-on-surface-variant">Paste the car's MongoDB id (visible on the Car Details page URL).</span>
          </label>
        } @else {
          <div class="px-3 py-2 rounded bg-surface-container-lowest border border-outline-variant">
            <p class="font-label-sm text-label-sm text-on-surface-variant uppercase">Car</p>
            <p class="font-body-md text-on-surface">{{ carLabel() }}</p>
          </div>
        }

        <div class="grid grid-cols-1 md:grid-cols-2 gap-stack_md">
          <label class="block">
            <span class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Start Date</span>
            <input
              type="datetime-local"
              name="startDate"
              [(ngModel)]="state.startDate"
              required
              class="mt-1 w-full h-10 px-3 bg-surface border-[1.5px] border-outline-variant rounded font-body-md focus:border-secondary outline-none"
            />
          </label>
          <label class="block">
            <span class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">End Date</span>
            <input
              type="datetime-local"
              name="endDate"
              [(ngModel)]="state.endDate"
              required
              class="mt-1 w-full h-10 px-3 bg-surface border-[1.5px] border-outline-variant rounded font-body-md focus:border-secondary outline-none"
            />
          </label>
        </div>

        <label class="block">
          <span class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Notes</span>
          <textarea
            name="notes"
            [(ngModel)]="state.notes"
            rows="3"
            maxlength="500"
            class="mt-1 w-full px-3 py-2 bg-surface border-[1.5px] border-outline-variant rounded font-body-md focus:border-secondary outline-none"
          ></textarea>
        </label>
      </div>

      <div class="flex justify-end gap-2 mt-stack_lg">
        <button type="button" (click)="cancel.emit()" class="h-10 px-4 bg-surface border-[1.5px] border-outline-variant rounded font-label-md text-label-md hover:bg-surface-container-low">Cancel</button>
        <button type="submit" [disabled]="saving() || !f.form.valid" class="h-10 px-4 bg-secondary text-on-secondary rounded font-label-md text-label-md hover:opacity-90 disabled:opacity-60">
          {{ saving() ? 'Saving…' : (mode === 'create' ? 'Create Booking' : 'Save Changes') }}
        </button>
      </div>
    </form>
  `,
})
export class BookingFormComponent implements OnInit {
  private readonly bookingService = inject(BookingService);

  @Input({ required: true }) mode!: BookingFormMode;
  @Input() booking?: Booking | null;

  @Output() saved = new EventEmitter<Booking>();
  @Output() cancel = new EventEmitter<void>();

  readonly saving = signal(false);
  readonly banner = signal<string | null>(null);

  state: FormState = { carId: '', startDate: '', endDate: '', notes: '' };

  ngOnInit(): void {
    if (this.mode === 'edit' && this.booking) {
      this.state = {
        carId: typeof this.booking.car === 'string' ? this.booking.car : (this.booking.car?._id ?? ''),
        startDate: this.toLocal(this.booking.startDate),
        endDate: this.toLocal(this.booking.endDate),
        notes: this.booking.notes ?? '',
      };
    }
  }

  carLabel(): string {
    const c = this.booking?.car;
    if (!c || typeof c === 'string') return c ?? '—';
    return `${c.year ?? ''} ${c.make ?? ''} ${c.model ?? ''}`.trim();
  }

  onSubmit(_f: NgForm): void {
    this.banner.set(null);
    this.saving.set(true);

    if (this.mode === 'create') {
      this.bookingService.create({
        carId: this.state.carId.trim(),
        startDate: new Date(this.state.startDate).toISOString(),
        endDate: new Date(this.state.endDate).toISOString(),
        notes: this.state.notes || undefined,
      }).subscribe({
        next: (res) => {
          this.saving.set(false);
          if (res.data) this.saved.emit(res.data);
        },
        error: (err) => this.handleError(err),
      });
    } else {
      this.bookingService.update(this.booking!._id, {
        startDate: new Date(this.state.startDate).toISOString(),
        endDate: new Date(this.state.endDate).toISOString(),
        notes: this.state.notes || undefined,
      }).subscribe({
        next: (res) => {
          this.saving.set(false);
          if (res.data) this.saved.emit(res.data);
        },
        error: (err) => this.handleError(err),
      });
    }
  }

  private handleError(err: unknown): void {
    this.saving.set(false);
    const e = err as { error?: { message?: string } };
    this.banner.set(e?.error?.message ?? 'Save failed.');
  }

  private toLocal(iso?: string): string {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
}

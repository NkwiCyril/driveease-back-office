import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CarService } from '../../core/services/car.service';
import { Car } from '../../core/models/car.model';

/**
 * Single-field price form used by Car Details → "List for Sale" / "List for Rent".
 * Mode toggles which endpoint to hit.
 */
@Component({
  selector: 'pe-price-list-form',
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
      <p class="font-body-md text-on-surface-variant mb-stack_md">
        {{ helperText() }}
      </p>
      <label class="block">
        <span class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
          {{ mode === 'sale' ? 'Sale Price (XAF)' : 'Rental Price (XAF / day)' }}
        </span>
        <input
          type="number"
          name="price"
          min="0"
          [(ngModel)]="value"
          required
          class="mt-1 w-full h-10 px-3 bg-surface border-[1.5px] border-outline-variant rounded font-body-md focus:border-secondary outline-none"
        />
      </label>
      <div class="flex justify-end gap-2 mt-stack_lg">
        <button type="button" (click)="cancel.emit()" class="h-10 px-4 bg-surface border-[1.5px] border-outline-variant rounded font-label-md text-label-md hover:bg-surface-container-low">Cancel</button>
        <button type="submit" [disabled]="saving() || !f.form.valid" class="h-10 px-4 bg-secondary text-on-secondary rounded font-label-md text-label-md hover:opacity-90 disabled:opacity-60">
          {{ saving() ? 'Saving…' : (mode === 'sale' ? 'List for Sale' : 'List for Rent') }}
        </button>
      </div>
    </form>
  `,
})
export class PriceListFormComponent {
  private readonly carService = inject(CarService);

  @Input({ required: true }) mode!: 'sale' | 'rent';
  @Input({ required: true }) car!: Car;

  @Output() saved = new EventEmitter<Car>();
  @Output() cancel = new EventEmitter<void>();

  value: number | null = null;
  readonly saving = signal(false);
  readonly banner = signal<string | null>(null);

  helperText(): string {
    if (this.mode === 'sale') {
      return `Setting a sale price will set forSale=true on this car so buyers can find and purchase it.`;
    }
    return `Setting a rental price will set forRent=true so renters can book this car.`;
  }

  onSubmit(_f: NgForm): void {
    if (this.value == null || this.value < 0) return;
    this.banner.set(null);
    this.saving.set(true);

    const request$ = this.mode === 'sale'
      ? this.carService.listForSale(this.car._id, this.value)
      : this.carService.listForRent(this.car._id, this.value);

    request$.subscribe({
      next: (res) => {
        this.saving.set(false);
        if (res.data) this.saved.emit(res.data);
      },
      error: (err) => {
        this.saving.set(false);
        const e = err as { error?: { message?: string } };
        this.banner.set(e?.error?.message ?? 'Could not update price.');
      },
    });
  }
}

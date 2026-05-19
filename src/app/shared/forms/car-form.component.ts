import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CarService } from '../../core/services/car.service';
import { Car, FuelType, Transmission } from '../../core/models/car.model';
import { IconComponent } from '../components/icon/icon.component';
import { ImgComponent } from '../components/img/img.component';

export type CarFormMode = 'create' | 'edit';

const FUEL_TYPES: FuelType[] = ['petrol', 'diesel', 'electric', 'hybrid', 'lpg', 'cng', 'other'];
const TRANSMISSIONS: Transmission[] = ['manual', 'automatic'];

interface FormState {
  make: string;
  model: string;
  year: number | null;
  vin: string;
  description: string;
  price: number | null;
  rentalPrice: number | null;
  fuelType: FuelType | '';
  transmission: Transmission | '';
  color: string;
  bodyType: string;
  mileage: number | null;
  forSale: boolean;
  forRent: boolean;
  inGarage: boolean;
}

@Component({
  selector: 'pe-car-form',
  standalone: true,
  imports: [FormsModule, IconComponent, ImgComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form #f="ngForm" (ngSubmit)="onSubmit(f)" novalidate>
      @if (banner()) {
        <div class="mb-stack_md px-3 py-2 rounded border-[1.5px] border-error/30 bg-error/10 text-error font-body-sm flex items-start gap-2">
          <pe-icon name="error" [size]="18" />
          <span>{{ banner() }}</span>
        </div>
      }

      <!-- Specs -->
      <section class="mb-stack_lg">
        <h4 class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-stack_sm">Specs</h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-stack_md">
          <label class="block md:col-span-1">
            <span class="font-label-sm text-label-sm text-on-surface-variant uppercase">Make</span>
            <input type="text" name="make" [(ngModel)]="state.make" required class="mt-1 w-full h-10 px-3 bg-surface border-[1.5px] border-outline-variant rounded font-body-md focus:border-secondary outline-none" />
          </label>
          <label class="block">
            <span class="font-label-sm text-label-sm text-on-surface-variant uppercase">Model</span>
            <input type="text" name="model" [(ngModel)]="state.model" required class="mt-1 w-full h-10 px-3 bg-surface border-[1.5px] border-outline-variant rounded font-body-md focus:border-secondary outline-none" />
          </label>
          <label class="block">
            <span class="font-label-sm text-label-sm text-on-surface-variant uppercase">Year</span>
            <input type="number" min="1886" name="year" [(ngModel)]="state.year" required class="mt-1 w-full h-10 px-3 bg-surface border-[1.5px] border-outline-variant rounded font-body-md focus:border-secondary outline-none" />
          </label>

          <label class="block">
            <span class="font-label-sm text-label-sm text-on-surface-variant uppercase">VIN</span>
            <input type="text" name="vin" [(ngModel)]="state.vin" class="mt-1 w-full h-10 px-3 bg-surface border-[1.5px] border-outline-variant rounded font-body-md focus:border-secondary outline-none" />
          </label>
          <label class="block">
            <span class="font-label-sm text-label-sm text-on-surface-variant uppercase">Color</span>
            <input type="text" name="color" [(ngModel)]="state.color" class="mt-1 w-full h-10 px-3 bg-surface border-[1.5px] border-outline-variant rounded font-body-md focus:border-secondary outline-none" />
          </label>
          <label class="block">
            <span class="font-label-sm text-label-sm text-on-surface-variant uppercase">Body Type</span>
            <input type="text" name="bodyType" [(ngModel)]="state.bodyType" placeholder="Sedan, SUV…" class="mt-1 w-full h-10 px-3 bg-surface border-[1.5px] border-outline-variant rounded font-body-md focus:border-secondary outline-none" />
          </label>

          <label class="block">
            <span class="font-label-sm text-label-sm text-on-surface-variant uppercase">Fuel Type</span>
            <select name="fuelType" [(ngModel)]="state.fuelType" class="mt-1 w-full h-10 px-3 bg-surface border-[1.5px] border-outline-variant rounded font-body-md focus:border-secondary outline-none">
              <option value="">—</option>
              @for (f of fuelTypes; track f) { <option [value]="f">{{ f }}</option> }
            </select>
          </label>
          <label class="block">
            <span class="font-label-sm text-label-sm text-on-surface-variant uppercase">Transmission</span>
            <select name="transmission" [(ngModel)]="state.transmission" class="mt-1 w-full h-10 px-3 bg-surface border-[1.5px] border-outline-variant rounded font-body-md focus:border-secondary outline-none">
              <option value="">—</option>
              @for (t of transmissions; track t) { <option [value]="t">{{ t }}</option> }
            </select>
          </label>
          <label class="block">
            <span class="font-label-sm text-label-sm text-on-surface-variant uppercase">Mileage (km)</span>
            <input type="number" min="0" name="mileage" [(ngModel)]="state.mileage" class="mt-1 w-full h-10 px-3 bg-surface border-[1.5px] border-outline-variant rounded font-body-md focus:border-secondary outline-none" />
          </label>
        </div>
      </section>

      <!-- Listing -->
      <section class="mb-stack_lg">
        <h4 class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-stack_sm">Listing</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-stack_md">
          <label class="block">
            <span class="font-label-sm text-label-sm text-on-surface-variant uppercase">Sale Price (XAF)</span>
            <input type="number" min="0" name="price" [(ngModel)]="state.price" class="mt-1 w-full h-10 px-3 bg-surface border-[1.5px] border-outline-variant rounded font-body-md focus:border-secondary outline-none" />
          </label>
          <label class="block">
            <span class="font-label-sm text-label-sm text-on-surface-variant uppercase">Rental Price (XAF / day)</span>
            <input type="number" min="0" name="rentalPrice" [(ngModel)]="state.rentalPrice" class="mt-1 w-full h-10 px-3 bg-surface border-[1.5px] border-outline-variant rounded font-body-md focus:border-secondary outline-none" />
          </label>
        </div>
        <div class="flex flex-wrap gap-stack_md mt-stack_sm">
          <label class="inline-flex items-center gap-2 font-body-md text-on-surface">
            <input type="checkbox" name="forSale" [(ngModel)]="state.forSale" class="w-4 h-4" />
            For sale
          </label>
          <label class="inline-flex items-center gap-2 font-body-md text-on-surface">
            <input type="checkbox" name="forRent" [(ngModel)]="state.forRent" class="w-4 h-4" />
            For rent
          </label>
          <label class="inline-flex items-center gap-2 font-body-md text-on-surface">
            <input type="checkbox" name="inGarage" [(ngModel)]="state.inGarage" class="w-4 h-4" />
            Parked in garage
          </label>
        </div>
      </section>

      <!-- Description -->
      <section class="mb-stack_lg">
        <label class="block">
          <span class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Description</span>
          <textarea
            name="description"
            [(ngModel)]="state.description"
            rows="4"
            maxlength="1000"
            class="mt-1 w-full px-3 py-2 bg-surface border-[1.5px] border-outline-variant rounded font-body-md focus:border-secondary outline-none"
          ></textarea>
        </label>
      </section>

      <!-- Images -->
      <section class="mb-stack_lg">
        <h4 class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-stack_sm">Images (up to 5)</h4>
        @if (existingImages.length) {
          <p class="font-body-sm text-on-surface-variant mb-stack_sm">Existing — new uploads will be appended.</p>
          <div class="flex flex-wrap gap-2 mb-stack_sm">
            @for (img of existingImages; track img) {
              <div class="w-20 h-20 rounded border border-outline-variant overflow-hidden">
                <pe-img [src]="img" alt="" fallback="car" />
              </div>
            }
          </div>
        }
        <input
          type="file"
          accept="image/*"
          multiple
          (change)="onImages($event)"
          class="block w-full text-body-sm text-on-surface file:mr-3 file:px-3 file:py-2 file:rounded file:border-0 file:bg-secondary file:text-on-secondary file:font-label-md hover:file:opacity-90"
        />
        @if (imageFiles().length) {
          <p class="font-body-sm text-on-surface-variant mt-stack_sm">{{ imageFiles().length }} new file(s) ready to upload.</p>
        }
      </section>

      <!-- Documents -->
      <section class="mb-stack_lg">
        <h4 class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-stack_sm">Documents (optional)</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-stack_md">
          @for (doc of docFields; track doc.key) {
            <label class="block">
              <span class="font-body-sm text-on-surface-variant">{{ doc.label }}</span>
              <input
                type="file"
                accept="image/*,application/pdf"
                (change)="onDoc(doc.key, $event)"
                class="mt-1 block w-full text-body-sm text-on-surface file:mr-3 file:px-2 file:py-1 file:rounded file:border-0 file:bg-surface-variant file:text-on-surface file:font-label-sm hover:file:bg-surface-container-low"
              />
            </label>
          }
        </div>
      </section>

      <div class="flex justify-end gap-2">
        <button type="button" (click)="cancel.emit()" class="h-10 px-4 bg-surface border-[1.5px] border-outline-variant rounded font-label-md text-label-md text-on-surface hover:bg-surface-container-low transition-colors">
          Cancel
        </button>
        <button
          type="submit"
          [disabled]="saving() || !f.form.valid"
          class="h-10 px-4 bg-secondary text-on-secondary rounded font-label-md text-label-md hover:opacity-90 disabled:opacity-60 transition-opacity"
        >
          {{ saving() ? 'Saving…' : (mode === 'create' ? 'Create Car' : 'Save Changes') }}
        </button>
      </div>
    </form>
  `,
})
export class CarFormComponent implements OnInit {
  private readonly carService = inject(CarService);

  @Input({ required: true }) mode!: CarFormMode;
  @Input() car?: Car | null;

  @Output() saved = new EventEmitter<Car>();
  @Output() cancel = new EventEmitter<void>();

  readonly saving = signal(false);
  readonly banner = signal<string | null>(null);
  readonly imageFiles = signal<File[]>([]);

  state: FormState = this.empty();
  existingImages: string[] = [];
  private docs: Partial<Record<string, File>> = {};

  readonly fuelTypes = FUEL_TYPES;
  readonly transmissions = TRANSMISSIONS;
  readonly docFields = [
    { key: 'carteGrise', label: 'Carte Grise (registration)' },
    { key: 'customerDocument', label: 'Customer document' },
    { key: 'salesCertificate', label: 'Sales certificate' },
    { key: 'idCardFront', label: 'Owner ID front' },
    { key: 'idCardBack', label: 'Owner ID back' },
  ];

  ngOnInit(): void {
    if (this.mode === 'edit' && this.car) {
      const c = this.car;
      this.state = {
        make: c.make ?? '',
        model: c.model ?? '',
        year: c.year ?? null,
        vin: c.vin ?? '',
        description: c.description ?? '',
        price: c.price ?? null,
        rentalPrice: c.rentalPrice ?? null,
        fuelType: c.fuelType ?? '',
        transmission: c.transmission ?? '',
        color: c.color ?? '',
        bodyType: c.bodyType ?? '',
        mileage: c.mileage ?? null,
        forSale: !!c.forSale,
        forRent: !!c.forRent,
        inGarage: !!c.inGarage,
      };
      this.existingImages = c.images ?? [];
    }
  }

  onImages(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []).slice(0, 5);
    this.imageFiles.set(files);
  }

  onDoc(key: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.docs[key] = file;
  }

  onSubmit(f: NgForm): void {
    if (!f.form.valid) return;
    this.banner.set(null);
    this.saving.set(true);

    const form = new FormData();
    for (const [k, v] of Object.entries(this.state)) {
      if (v === '' || v == null) continue;
      form.append(k, String(v));
    }
    for (const file of this.imageFiles()) form.append('images', file);
    for (const [key, file] of Object.entries(this.docs)) {
      if (file) form.append(key, file);
    }

    const request$ = this.mode === 'create'
      ? this.carService.create(form)
      : this.carService.update(this.car!._id, form);

    request$.subscribe({
      next: (res) => {
        this.saving.set(false);
        if (res.data) this.saved.emit(res.data);
      },
      error: (err) => {
        this.saving.set(false);
        const e = err as { error?: { message?: string } };
        this.banner.set(e?.error?.message ?? 'Save failed.');
      },
    });
  }

  private empty(): FormState {
    return {
      make: '', model: '', year: null, vin: '', description: '',
      price: null, rentalPrice: null, fuelType: '', transmission: '',
      color: '', bodyType: '', mileage: null,
      forSale: false, forRent: false, inGarage: false,
    };
  }
}

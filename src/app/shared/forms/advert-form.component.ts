import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { AdvertService } from '../../core/services/advert.service';
import { Advert, AdvertStatus } from '../../core/models/advert.model';
import { ImgComponent } from '../components/img/img.component';

export type AdvertFormMode = 'create' | 'edit';

const STATUSES: AdvertStatus[] = ['draft', 'active', 'paused', 'expired'];

interface FormState {
  title: string;
  description: string;
  car: string;
  make: string;
  model: string;
  year: number | null;
  price: number | null;
  contactPhone: string;
  priority: number | null;
  priorityUntil: string;
  startsAt: string;
  expiresAt: string;
  status: AdvertStatus;
}

@Component({
  selector: 'pe-advert-form',
  standalone: true,
  imports: [FormsModule, ImgComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form #f="ngForm" (ngSubmit)="onSubmit(f)" novalidate>
      @if (banner()) {
        <div class="mb-stack_md px-3 py-2 rounded border-[1.5px] border-error/30 bg-error/10 text-error font-body-sm">
          {{ banner() }}
        </div>
      }

      <div class="space-y-stack_md">
        <label class="block">
          <span class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Title</span>
          <input
            type="text"
            name="title"
            [(ngModel)]="state.title"
            required
            maxlength="200"
            class="mt-1 w-full h-10 px-3 bg-surface border-[1.5px] border-outline-variant rounded font-body-md focus:border-secondary outline-none"
          />
        </label>

        <label class="block">
          <span class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Description</span>
          <textarea
            name="description"
            [(ngModel)]="state.description"
            rows="3"
            maxlength="2000"
            class="mt-1 w-full px-3 py-2 bg-surface border-[1.5px] border-outline-variant rounded font-body-md focus:border-secondary outline-none"
          ></textarea>
        </label>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-stack_md">
          <label class="block md:col-span-3">
            <span class="font-label-sm text-label-sm text-on-surface-variant uppercase">Linked Car ID (optional)</span>
            <input type="text" name="car" [(ngModel)]="state.car" class="mt-1 w-full h-10 px-3 bg-surface border-[1.5px] border-outline-variant rounded font-body-md focus:border-secondary outline-none" />
            <span class="font-label-sm text-label-sm text-on-surface-variant">Leave blank for a standalone advert (then fill make/model/year below).</span>
          </label>

          <label class="block">
            <span class="font-label-sm text-label-sm text-on-surface-variant uppercase">Make</span>
            <input type="text" name="make" [(ngModel)]="state.make" class="mt-1 w-full h-10 px-3 bg-surface border-[1.5px] border-outline-variant rounded font-body-md focus:border-secondary outline-none" />
          </label>
          <label class="block">
            <span class="font-label-sm text-label-sm text-on-surface-variant uppercase">Model</span>
            <input type="text" name="model" [(ngModel)]="state.model" class="mt-1 w-full h-10 px-3 bg-surface border-[1.5px] border-outline-variant rounded font-body-md focus:border-secondary outline-none" />
          </label>
          <label class="block">
            <span class="font-label-sm text-label-sm text-on-surface-variant uppercase">Year</span>
            <input type="number" min="1886" name="year" [(ngModel)]="state.year" class="mt-1 w-full h-10 px-3 bg-surface border-[1.5px] border-outline-variant rounded font-body-md focus:border-secondary outline-none" />
          </label>

          <label class="block">
            <span class="font-label-sm text-label-sm text-on-surface-variant uppercase">Price (XAF)</span>
            <input type="number" min="0" name="price" [(ngModel)]="state.price" class="mt-1 w-full h-10 px-3 bg-surface border-[1.5px] border-outline-variant rounded font-body-md focus:border-secondary outline-none" />
          </label>
          <label class="block">
            <span class="font-label-sm text-label-sm text-on-surface-variant uppercase">Contact Phone</span>
            <input type="tel" name="contactPhone" [(ngModel)]="state.contactPhone" class="mt-1 w-full h-10 px-3 bg-surface border-[1.5px] border-outline-variant rounded font-body-md focus:border-secondary outline-none" />
          </label>
          <label class="block">
            <span class="font-label-sm text-label-sm text-on-surface-variant uppercase">Status</span>
            <select name="status" [(ngModel)]="state.status" class="mt-1 w-full h-10 px-3 bg-surface border-[1.5px] border-outline-variant rounded font-body-md focus:border-secondary outline-none">
              @for (s of statuses; track s) { <option [value]="s">{{ s }}</option> }
            </select>
          </label>

          <label class="block">
            <span class="font-label-sm text-label-sm text-on-surface-variant uppercase">Starts</span>
            <input type="datetime-local" name="startsAt" [(ngModel)]="state.startsAt" class="mt-1 w-full h-10 px-3 bg-surface border-[1.5px] border-outline-variant rounded font-body-md focus:border-secondary outline-none" />
          </label>
          <label class="block">
            <span class="font-label-sm text-label-sm text-on-surface-variant uppercase">Expires</span>
            <input type="datetime-local" name="expiresAt" [(ngModel)]="state.expiresAt" class="mt-1 w-full h-10 px-3 bg-surface border-[1.5px] border-outline-variant rounded font-body-md focus:border-secondary outline-none" />
          </label>
          <label class="block">
            <span class="font-label-sm text-label-sm text-on-surface-variant uppercase">Priority</span>
            <input type="number" min="0" name="priority" [(ngModel)]="state.priority" class="mt-1 w-full h-10 px-3 bg-surface border-[1.5px] border-outline-variant rounded font-body-md focus:border-secondary outline-none" />
          </label>
          <label class="block md:col-span-2">
            <span class="font-label-sm text-label-sm text-on-surface-variant uppercase">Priority Until (boost ends)</span>
            <input type="datetime-local" name="priorityUntil" [(ngModel)]="state.priorityUntil" class="mt-1 w-full h-10 px-3 bg-surface border-[1.5px] border-outline-variant rounded font-body-md focus:border-secondary outline-none" />
          </label>
        </div>

        <section>
          <h4 class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-stack_sm">Images (up to 5)</h4>
          @if (existingImages.length) {
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
      </div>

      <div class="flex justify-end gap-2 mt-stack_lg">
        <button type="button" (click)="cancel.emit()" class="h-10 px-4 bg-surface border-[1.5px] border-outline-variant rounded font-label-md text-label-md hover:bg-surface-container-low">Cancel</button>
        <button type="submit" [disabled]="saving() || !f.form.valid" class="h-10 px-4 bg-secondary text-on-secondary rounded font-label-md text-label-md hover:opacity-90 disabled:opacity-60">
          {{ saving() ? 'Saving…' : (mode === 'create' ? 'Create Advert' : 'Save Changes') }}
        </button>
      </div>
    </form>
  `,
})
export class AdvertFormComponent implements OnInit {
  private readonly advertService = inject(AdvertService);

  @Input({ required: true }) mode!: AdvertFormMode;
  @Input() advert?: Advert | null;

  @Output() saved = new EventEmitter<Advert>();
  @Output() cancel = new EventEmitter<void>();

  readonly saving = signal(false);
  readonly banner = signal<string | null>(null);
  readonly imageFiles = signal<File[]>([]);

  state: FormState = this.empty();
  existingImages: string[] = [];

  readonly statuses = STATUSES;

  ngOnInit(): void {
    if (this.mode === 'edit' && this.advert) {
      const a = this.advert;
      this.state = {
        title: a.title ?? '',
        description: a.description ?? '',
        car: typeof a.car === 'string' ? a.car : '',
        make: a.make ?? '',
        model: a.model ?? '',
        year: a.year ?? null,
        price: a.price ?? null,
        contactPhone: a.contactPhone ?? '',
        priority: a.priority ?? null,
        priorityUntil: this.toLocal(a.priorityUntil),
        startsAt: this.toLocal(a.startsAt),
        expiresAt: this.toLocal(a.expiresAt),
        status: a.status ?? 'active',
      };
      this.existingImages = a.images ?? [];
    }
  }

  onImages(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.imageFiles.set(Array.from(input.files ?? []).slice(0, 5));
  }

  onSubmit(f: NgForm): void {
    if (!f.form.valid) return;
    this.banner.set(null);
    this.saving.set(true);

    const form = new FormData();
    for (const [k, v] of Object.entries(this.state)) {
      if (v === '' || v == null) continue;
      // datetime-local values need to be ISO before send.
      if (['startsAt', 'expiresAt', 'priorityUntil'].includes(k) && typeof v === 'string') {
        form.append(k, new Date(v).toISOString());
      } else {
        form.append(k, String(v));
      }
    }
    for (const file of this.imageFiles()) form.append('images', file);

    const request$ = this.mode === 'create'
      ? this.advertService.create(form)
      : this.advertService.update(this.advert!._id, form);

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

  // Convert an ISO timestamp to the format <input type="datetime-local"> expects.
  private toLocal(iso?: string | null): string {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  private empty(): FormState {
    return {
      title: '', description: '', car: '',
      make: '', model: '', year: null,
      price: null, contactPhone: '',
      priority: null, priorityUntil: '',
      startsAt: '', expiresAt: '',
      status: 'active',
    };
  }
}

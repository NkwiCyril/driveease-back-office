import { ChangeDetectionStrategy, Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

/**
 * Lightweight modal wrapper. Pages host this with @if and react to @Output
 * close events. Backdrop click + Esc both close. Body content goes in the
 * default slot; an optional footer slot is exposed for action rows.
 */
@Component({
  selector: 'pe-dialog',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-stack_lg bg-black/40 backdrop-blur-sm"
      (click)="onBackdropClick($event)"
    >
      <div
        class="relative bg-surface rounded-xl border border-outline-variant shadow-overlay w-full"
        [style.maxWidth.px]="widthPx"
        (click)="$event.stopPropagation()"
      >
        <header class="flex items-start justify-between p-stack_lg border-b border-outline-variant">
          <div>
            <h2 class="font-h2 text-h2 text-primary">{{ title }}</h2>
            @if (subtitle) {
              <p class="font-body-md text-body-md text-on-surface-variant mt-1">{{ subtitle }}</p>
            }
          </div>
          <button
            type="button"
            (click)="close.emit()"
            aria-label="Close"
            class="p-2 -mr-2 -mt-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors"
          >
            <pe-icon name="close" [size]="22" />
          </button>
        </header>

        <div class="p-stack_lg max-h-[70vh] overflow-y-auto">
          <ng-content />
        </div>

        <footer class="flex justify-end gap-2 p-stack_lg border-t border-outline-variant bg-surface-container-lowest rounded-b-xl">
          <ng-content select="[dialog-actions]" />
        </footer>
      </div>
    </div>
  `,
})
export class DialogComponent {
  @Input({ required: true }) title!: string;
  @Input() subtitle?: string;
  @Input() widthPx = 640;

  @Output() close = new EventEmitter<void>();

  @HostListener('document:keydown.escape')
  onEsc(): void {
    this.close.emit();
  }

  onBackdropClick(_event: MouseEvent): void {
    // Click on the outer wrapper (not bubbled from inner content) closes.
    this.close.emit();
  }
}

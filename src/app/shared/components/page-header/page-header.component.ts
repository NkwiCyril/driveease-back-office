import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'pe-page-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-stack_md mb-stack_lg">
      <div>
        @if (eyebrow) {
          <p class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1">{{ eyebrow }}</p>
        }
        <h1 class="font-h1 text-h1 text-on-surface mb-1">{{ title }}</h1>
        @if (subtitle) {
          <p class="font-body-md text-body-md text-on-surface-variant">{{ subtitle }}</p>
        }
      </div>
      <div class="flex flex-wrap gap-3">
        <ng-content />
      </div>
    </div>
  `,
})
export class PageHeaderComponent {
  @Input({ required: true }) title!: string;
  @Input() subtitle?: string;
  @Input() eyebrow?: string;
}

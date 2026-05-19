import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'pe-empty-state',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col items-center justify-center text-center py-stack_lg px-stack_md">
      <div class="w-16 h-16 rounded-full bg-surface-container-low flex items-center justify-center mb-stack_md">
        <pe-icon [name]="icon" [size]="32" class="text-on-surface-variant" />
      </div>
      <h3 class="font-h3 text-h3 text-on-surface mb-1">{{ title }}</h3>
      @if (description) {
        <p class="font-body-md text-body-md text-on-surface-variant max-w-md">{{ description }}</p>
      }
      <div class="mt-stack_md"><ng-content /></div>
    </div>
  `,
})
export class EmptyStateComponent {
  @Input({ required: true }) title!: string;
  @Input() description?: string;
  @Input() icon = 'inbox';
}

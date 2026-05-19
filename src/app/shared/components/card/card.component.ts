import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'pe-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="bg-surface-container-lowest border-[1.5px] border-outline-variant rounded-xl shadow-card"
      [class.p-stack_lg]="padding === 'lg'"
      [class.p-stack_md]="padding === 'md'"
      [class.p-stack_sm]="padding === 'sm'"
      [class.p-0]="padding === 'none'"
    >
      @if (title) {
        <div class="flex justify-between items-center mb-stack_md">
          <h3 class="font-h3 text-h3 text-on-surface">{{ title }}</h3>
          <ng-content select="[card-action]" />
        </div>
      }
      <ng-content />
    </div>
  `,
})
export class CardComponent {
  @Input() title?: string;
  @Input() padding: 'none' | 'sm' | 'md' | 'lg' = 'lg';
}

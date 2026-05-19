import { ChangeDetectionStrategy, Component, Input, computed, signal } from '@angular/core';
import { NgStyle } from '@angular/common';
import { IconComponent } from '../icon/icon.component';

export type StatTrend = 'up' | 'down' | 'neutral';

const TREND_STYLE: Record<StatTrend, Record<string, string>> = {
  up:      { color: '#16a34a', backgroundColor: 'rgba(22,163,74,0.10)', borderColor: 'rgba(22,163,74,0.20)' },
  down:    { color: '#ef4444', backgroundColor: 'rgba(239,68,68,0.10)', borderColor: 'rgba(239,68,68,0.20)' },
  neutral: { color: '#44474c', backgroundColor: '#dce2f3',              borderColor: '#e2e4e9' },
};

@Component({
  selector: 'pe-stat-card',
  standalone: true,
  imports: [NgStyle, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-surface-container-lowest border-[1.5px] border-outline-variant rounded-xl p-stack_lg shadow-card flex flex-col justify-between min-h-[160px]">
      <div class="flex justify-between items-start mb-4">
        <div>
          <p class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1">{{ label }}</p>
          <h3 class="font-display text-display text-on-surface leading-none">
            {{ value }}
            @if (unit) {
              <span class="text-h3 font-h3 text-on-surface-variant ml-2">{{ unit }}</span>
            }
          </h3>
        </div>
        <div class="bg-surface-container-low p-2 rounded-lg">
          <pe-icon [name]="icon" [size]="22" class="text-secondary" />
        </div>
      </div>

      @if (trendValue) {
        <div class="flex items-center gap-2">
          <span
            class="font-label-md text-label-md flex items-center px-2 py-1 rounded-md border-[1.5px]"
            [ngStyle]="trendStyle()"
          >
            <pe-icon [name]="trendIcon()" [size]="14" />
            <span class="ml-1">{{ trendValue }}</span>
          </span>
          @if (trendCaption) {
            <span class="font-body-sm text-body-sm text-on-surface-variant">{{ trendCaption }}</span>
          }
        </div>
      }

      <ng-content />
    </div>
  `,
})
export class StatCardComponent {
  private readonly trendSig = signal<StatTrend>('neutral');

  @Input({ required: true }) label!: string;
  @Input({ required: true }) value!: string | number;
  @Input() unit?: string;
  @Input({ required: true }) icon!: string;
  @Input() set trend(value: StatTrend) {
    this.trendSig.set(value);
  }
  @Input() trendValue?: string;
  @Input() trendCaption?: string;

  readonly trendStyle = computed(() => TREND_STYLE[this.trendSig()]);
  readonly trendIcon = computed(() => {
    const t = this.trendSig();
    return t === 'up' ? 'trending_up' : t === 'down' ? 'trending_down' : 'trending_flat';
  });
}

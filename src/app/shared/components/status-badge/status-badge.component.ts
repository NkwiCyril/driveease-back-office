import { ChangeDetectionStrategy, Component, Input, computed, signal } from '@angular/core';
import { NgStyle } from '@angular/common';
import { IconComponent } from '../icon/icon.component';

export type BadgeTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'orange' | 'purple';

const PALETTE: Record<BadgeTone, { fg: string; bg: string; border: string }> = {
  success: { fg: '#16a34a', bg: 'rgba(22,163,74,0.10)', border: 'rgba(22,163,74,0.30)' },
  warning: { fg: '#eab308', bg: 'rgba(234,179,8,0.10)', border: 'rgba(234,179,8,0.30)' },
  danger:  { fg: '#ef4444', bg: 'rgba(239,68,68,0.10)', border: 'rgba(239,68,68,0.30)' },
  info:    { fg: '#0043eb', bg: 'rgba(0,67,235,0.10)', border: 'rgba(0,67,235,0.30)' },
  neutral: { fg: '#44474c', bg: '#dce2f3',             border: '#e2e4e9' },
  orange:  { fg: '#ea580c', bg: 'rgba(234,88,12,0.10)', border: 'rgba(234,88,12,0.30)' },
  purple:  { fg: '#7c3aed', bg: 'rgba(124,58,237,0.10)', border: 'rgba(124,58,237,0.30)' },
};

@Component({
  selector: 'pe-status-badge',
  standalone: true,
  imports: [NgStyle, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span
      class="inline-flex items-center gap-1 px-2 py-1 rounded border-[1.5px] font-label-sm text-label-sm whitespace-nowrap"
      [ngStyle]="{ color: palette().fg, backgroundColor: palette().bg, borderColor: palette().border }"
    >
      @if (icon) {
        <pe-icon [name]="icon" [size]="14" />
      }
      <ng-content />
    </span>
  `,
})
export class StatusBadgeComponent {
  private readonly toneSig = signal<BadgeTone>('neutral');

  @Input() set tone(value: BadgeTone) {
    this.toneSig.set(value);
  }

  @Input() icon?: string;

  readonly palette = computed(() => PALETTE[this.toneSig()]);
}

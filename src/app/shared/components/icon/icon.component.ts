import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';

/**
 * Material Symbols Outlined wrapper. Pass the icon name as content via `name`.
 * `filled` toggles the FILL axis (heavier glyph for active/important states).
 */
@Component({
  selector: 'pe-icon',
  standalone: true,
  imports: [NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span
    class="material-symbols-outlined"
    [ngClass]="{ filled: filled }"
    [style.fontSize.px]="size"
  >{{ name }}</span>`,
})
export class IconComponent {
  @Input({ required: true }) name!: string;
  @Input() size = 20;
  @Input() filled = false;
}

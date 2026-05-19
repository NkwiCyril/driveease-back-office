import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

/**
 * Inline banner placed at the top of pages whose content is preview-only —
 * the backend endpoint backing the screen does not yet exist. Designs stay
 * visible so they read as roadmap, not as broken UI.
 */
@Component({
  selector: 'pe-api-pending-notice',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mb-stack_lg flex items-start gap-3 px-stack_md py-3 rounded-xl border-[1.5px]" style="border-color:rgba(234,179,8,0.35);background:rgba(234,179,8,0.08)">
      <pe-icon name="construction" [size]="20" [filled]="true" class="text-status-warning shrink-0" />
      <div class="flex-1">
        <p class="font-label-md text-label-md text-on-surface mb-1">{{ title }}</p>
        <p class="font-body-sm text-body-sm text-on-surface-variant">
          {{ message }}
        </p>
      </div>
    </div>
  `,
})
export class ApiPendingNoticeComponent {
  @Input() title = 'Preview only — backing API not yet implemented';
  @Input() message = 'This screen shows placeholder data so the design can be reviewed. The endpoints required to power it have not been added to the backend yet.';
}

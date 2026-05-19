import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { StatusBadgeComponent, BadgeTone } from '../../shared/components/status-badge/status-badge.component';
import { ApiPendingNoticeComponent } from '../../shared/components/api-pending-notice/api-pending-notice.component';

interface AuditEntry {
  id: string;
  time: string;
  actor: string;
  action: string;
  target: string;
  status: 'success' | 'failure' | 'warning';
  ip?: string;
}

@Component({
  selector: 'pe-audit-page',
  standalone: true,
  imports: [DatePipe, FormsModule, PageHeaderComponent, IconComponent, StatusBadgeComponent, ApiPendingNoticeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <pe-page-header title="Audit Log" subtitle="Every privileged action across the back office — read-only.">
      <button class="h-10 px-4 bg-surface border-[1.5px] border-outline-variant text-on-surface font-label-md text-label-md rounded flex items-center gap-2 hover:bg-surface-container-low">
        <pe-icon name="download" [size]="18" /> Export CSV
      </button>
    </pe-page-header>

    <pe-api-pending-notice
      title="Audit Log — preview only"
      message="The backend does not currently emit an audit trail of privileged actions. Rows below are static examples illustrating the intended schema."
    />

    <div class="bg-surface border-[1.5px] border-outline-variant rounded p-4 mb-stack_lg flex flex-wrap items-center gap-4 shadow-card">
      <div class="relative flex-1 min-w-[240px]">
        <pe-icon name="search" [size]="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none" />
        <input type="text" placeholder="Filter by actor, action, or target…" class="w-full h-10 pl-10 pr-4 bg-surface border-[1.5px] border-outline-variant rounded font-body-sm text-body-sm focus:border-secondary outline-none" />
      </div>
      <select class="h-10 px-4 bg-surface border-[1.5px] border-outline-variant rounded font-body-sm text-body-sm focus:border-secondary outline-none cursor-pointer">
        <option>Any action</option>
        <option>Verification</option>
        <option>Role change</option>
        <option>Deletion</option>
        <option>Auth</option>
      </select>
      <select class="h-10 px-4 bg-surface border-[1.5px] border-outline-variant rounded font-body-sm text-body-sm focus:border-secondary outline-none cursor-pointer">
        <option>Last 24h</option>
        <option>Last 7 days</option>
        <option>Last 30 days</option>
      </select>
    </div>

    <div class="bg-surface border-[1.5px] border-outline-variant rounded-lg overflow-hidden shadow-card">
      <table class="w-full text-left">
        <thead>
          <tr class="border-b-[1.5px] border-outline-variant bg-surface-container-lowest">
            <th class="p-3 font-label-sm text-label-sm text-on-surface-variant uppercase">Time</th>
            <th class="p-3 font-label-sm text-label-sm text-on-surface-variant uppercase">Actor</th>
            <th class="p-3 font-label-sm text-label-sm text-on-surface-variant uppercase">Action</th>
            <th class="p-3 font-label-sm text-label-sm text-on-surface-variant uppercase">Target</th>
            <th class="p-3 font-label-sm text-label-sm text-on-surface-variant uppercase">Status</th>
            <th class="p-3 font-label-sm text-label-sm text-on-surface-variant uppercase">IP</th>
          </tr>
        </thead>
        <tbody class="font-body-sm divide-y divide-outline-variant/50">
          @for (e of entries; track e.id) {
            <tr class="hover:bg-background transition-colors">
              <td class="p-3 text-on-surface-variant whitespace-nowrap">{{ e.time | date:'MMM d, HH:mm' }}</td>
              <td class="p-3 font-label-md text-primary">{{ e.actor }}</td>
              <td class="p-3 text-on-surface">{{ e.action }}</td>
              <td class="p-3 text-on-surface-variant">{{ e.target }}</td>
              <td class="p-3"><pe-status-badge [tone]="tone(e.status)">{{ e.status }}</pe-status-badge></td>
              <td class="p-3 font-mono text-on-surface-variant">{{ e.ip || '—' }}</td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class AuditPage {
  readonly entries: AuditEntry[] = [
    { id: '1', time: '2026-05-14T09:42:00Z', actor: 'Samuel Eto\'o', action: 'Verified car', target: 'Car #4829A — Toyota Camry', status: 'success', ip: '102.244.10.5' },
    { id: '2', time: '2026-05-14T09:28:00Z', actor: 'System', action: 'AI flagged listing', target: 'Car #4831B', status: 'warning', ip: '—' },
    { id: '3', time: '2026-05-14T08:15:00Z', actor: 'Marie Tcheng', action: 'Role changed', target: 'User #u1023 → admin', status: 'success', ip: '102.244.10.9' },
    { id: '4', time: '2026-05-13T22:09:00Z', actor: 'Samuel Eto\'o', action: 'Deleted advert', target: 'Advert #ad-991', status: 'success', ip: '102.244.10.5' },
    { id: '5', time: '2026-05-13T21:52:00Z', actor: 'Unknown', action: 'Failed login', target: '+237 671 098 432', status: 'failure', ip: '41.205.22.18' },
  ];

  tone(s: AuditEntry['status']): BadgeTone {
    if (s === 'success') return 'success';
    if (s === 'failure') return 'danger';
    return 'warning';
  }
}

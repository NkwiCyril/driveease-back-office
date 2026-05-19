import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { ApiPendingNoticeComponent } from '../../shared/components/api-pending-notice/api-pending-notice.component';

@Component({
  selector: 'pe-reports-page',
  standalone: true,
  imports: [PageHeaderComponent, IconComponent, StatCardComponent, ApiPendingNoticeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <pe-page-header title="Reports & Analytics" subtitle="Cross-platform insights for revenue, growth and verification health.">
      <select class="h-10 px-4 bg-surface border-[1.5px] border-outline-variant rounded font-body-sm text-body-sm focus:border-secondary outline-none cursor-pointer">
        <option>Last 30 days</option>
        <option>Last 90 days</option>
        <option>This year</option>
      </select>
      <button class="h-10 px-4 bg-secondary text-on-secondary font-label-md text-label-md rounded flex items-center gap-2 hover:opacity-90">
        <pe-icon name="download" [size]="18" /> Export PDF
      </button>
    </pe-page-header>

    <pe-api-pending-notice
      title="Reports & Analytics — preview only"
      message="All charts and figures below are static placeholders. A reporting/aggregation endpoint is needed to power these views from real platform data."
    />

    <!-- KPI row -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter mb-stack_lg">
      <pe-stat-card label="Gross Revenue" [value]="'48.2M'" unit="XAF" icon="payments" trend="up" trendValue="+18%" trendCaption="vs prior" />
      <pe-stat-card label="New Users" [value]="1248" icon="group_add" trend="up" trendValue="+9%" trendCaption="vs prior" />
      <pe-stat-card label="Listings Added" [value]="412" icon="post_add" trend="down" trendValue="-3%" trendCaption="vs prior" />
      <pe-stat-card label="Avg Booking" [value]="'68k'" unit="XAF" icon="receipt_long" trend="neutral" trendValue="±0%" trendCaption="vs prior" />
    </div>

    <!-- Charts placeholders -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-gutter mb-stack_lg">
      <section class="lg:col-span-2 bg-surface-container-lowest border-[1.5px] border-outline-variant rounded-xl p-stack_lg shadow-card">
        <div class="flex justify-between items-center mb-stack_md">
          <h3 class="font-h3 text-h3 text-on-surface">Revenue trend</h3>
          <div class="flex gap-2">
            <button class="h-8 px-3 rounded border-[1.5px] border-secondary bg-secondary/10 text-secondary font-label-sm">7d</button>
            <button class="h-8 px-3 rounded border-[1.5px] border-outline-variant text-on-surface-variant font-label-sm">30d</button>
            <button class="h-8 px-3 rounded border-[1.5px] border-outline-variant text-on-surface-variant font-label-sm">90d</button>
          </div>
        </div>
        <div class="h-72 rounded bg-gradient-to-b from-secondary/10 to-transparent relative">
          <svg viewBox="0 0 600 200" preserveAspectRatio="none" class="w-full h-full">
            <polyline fill="none" stroke="#0043eb" stroke-width="2"
              points="0,150 60,140 120,120 180,135 240,100 300,90 360,70 420,80 480,55 540,45 600,40" />
            <polyline fill="rgba(0,67,235,0.08)" stroke="none"
              points="0,150 60,140 120,120 180,135 240,100 300,90 360,70 420,80 480,55 540,45 600,40 600,200 0,200" />
          </svg>
        </div>
      </section>
      <section class="bg-surface-container-lowest border-[1.5px] border-outline-variant rounded-xl p-stack_lg shadow-card">
        <h3 class="font-h3 text-h3 text-on-surface mb-stack_md">Verification mix</h3>
        <div class="space-y-stack_md">
          @for (row of mix; track row.label) {
            <div>
              <div class="flex justify-between font-body-sm text-body-sm">
                <span class="text-on-surface-variant flex items-center gap-2"><span class="w-2 h-2 rounded-full" [style.background]="row.color"></span> {{ row.label }}</span>
                <span class="text-on-surface font-label-md">{{ row.pct }}%</span>
              </div>
              <div class="w-full h-2 rounded-full bg-surface-variant mt-1 overflow-hidden">
                <div class="h-full rounded-full" [style.width.%]="row.pct" [style.background]="row.color"></div>
              </div>
            </div>
          }
        </div>
      </section>
    </div>

    <!-- Top markets -->
    <section class="bg-surface-container-lowest border-[1.5px] border-outline-variant rounded-xl p-stack_lg shadow-card">
      <h3 class="font-h3 text-h3 text-on-surface mb-stack_md">Top regions</h3>
      <table class="w-full text-left">
        <thead>
          <tr class="border-b-[1.5px] border-outline-variant">
            <th class="py-2 font-label-sm text-label-sm text-on-surface-variant uppercase">City</th>
            <th class="py-2 font-label-sm text-label-sm text-on-surface-variant uppercase">Users</th>
            <th class="py-2 font-label-sm text-label-sm text-on-surface-variant uppercase">Cars</th>
            <th class="py-2 font-label-sm text-label-sm text-on-surface-variant uppercase">Revenue</th>
          </tr>
        </thead>
        <tbody class="font-body-sm text-body-sm divide-y divide-outline-variant/50">
          @for (r of regions; track r.city) {
            <tr>
              <td class="py-2 font-label-md text-primary">{{ r.city }}</td>
              <td class="py-2">{{ r.users }}</td>
              <td class="py-2">{{ r.cars }}</td>
              <td class="py-2">{{ r.revenue }} XAF</td>
            </tr>
          }
        </tbody>
      </table>
    </section>
  `,
})
export class ReportsPage {
  readonly mix = [
    { label: 'Verified', pct: 78, color: '#16a34a' },
    { label: 'Pending', pct: 16, color: '#eab308' },
    { label: 'Flagged', pct: 6,  color: '#ef4444' },
  ];

  readonly regions = [
    { city: 'Yaoundé', users: '4,820', cars: '1,560', revenue: '24.1M' },
    { city: 'Douala', users: '3,910', cars: '1,210', revenue: '18.7M' },
    { city: 'Bafoussam', users: '1,205', cars: '420', revenue: '3.2M' },
    { city: 'Limbé', users: '742', cars: '210', revenue: '1.6M' },
  ];
}

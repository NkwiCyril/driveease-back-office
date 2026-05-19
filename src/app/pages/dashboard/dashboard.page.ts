import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CarService } from '../../core/services/car.service';
import { AdvertService } from '../../core/services/advert.service';
import { UserService } from '../../core/services/user.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { IconComponent } from '../../shared/components/icon/icon.component';

interface CarBreakdown {
  total: number;
  verified: number;
  pending: number;
  flagged: number;
}

@Component({
  selector: 'pe-dashboard-page',
  standalone: true,
  imports: [PageHeaderComponent, StatCardComponent, IconComponent, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <pe-page-header
      title="Overview Dashboard"
      subtitle="Real-time metrics for ParkEase operations across Cameroon."
    >
      <button class="bg-primary text-on-primary px-4 py-2 rounded font-label-md text-label-md hover:bg-primary/90 transition-colors flex items-center gap-2 h-10">
        <pe-icon name="download" [size]="18" />
        Export Report
      </button>
    </pe-page-header>

    <!-- KPI Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter mb-stack_lg">
      <pe-stat-card
        label="Total Users"
        [value]="totalUsers() ?? '—'"
        icon="group"
        trend="up"
        trendValue="+5%"
        trendCaption="vs last month"
      />

      <div class="bg-surface-container-lowest border-[1.5px] border-outline-variant rounded-xl p-stack_lg shadow-card flex flex-col justify-between min-h-[160px]">
        <div class="flex justify-between items-start mb-4">
          <div>
            <p class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1">Total Cars</p>
            <h3 class="font-display text-display text-on-surface leading-none">{{ cars().total }}</h3>
          </div>
          <div class="bg-surface-container-low p-2 rounded-lg">
            <pe-icon name="directions_car" [size]="22" class="text-secondary" />
          </div>
        </div>
        <div class="space-y-2 mt-auto font-body-sm text-body-sm">
          <div class="flex justify-between items-center border-b border-outline-variant/50 pb-1">
            <span class="text-on-surface-variant flex items-center gap-1"><span class="w-2 h-2 rounded-full" style="background:#16a34a"></span> Verified</span>
            <span class="font-label-md text-label-md text-on-surface">{{ cars().verified }}</span>
          </div>
          <div class="flex justify-between items-center border-b border-outline-variant/50 pb-1">
            <span class="text-on-surface-variant flex items-center gap-1"><span class="w-2 h-2 rounded-full" style="background:#eab308"></span> Pending</span>
            <span class="font-label-md text-label-md text-on-surface">{{ cars().pending }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-on-surface-variant flex items-center gap-1"><span class="w-2 h-2 rounded-full" style="background:#ef4444"></span> Flagged</span>
            <span class="font-label-md text-label-md text-on-surface">{{ cars().flagged }}</span>
          </div>
        </div>
      </div>

      <div class="bg-surface-container-lowest border-[1.5px] border-outline-variant rounded-xl p-stack_lg shadow-card flex flex-col justify-between min-h-[160px]">
        <div class="flex justify-between items-start mb-4">
          <div>
            <p class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1">Active Adverts</p>
            <h3 class="font-display text-display text-on-surface leading-none">{{ activeAdverts() }}</h3>
          </div>
          <div class="bg-surface-container-low p-2 rounded-lg">
            <pe-icon name="ads_click" [size]="22" class="text-secondary" />
          </div>
        </div>
        <div class="mt-auto bg-surface-container p-3 rounded border-[1.5px] border-outline-variant/50 flex justify-between items-center">
          <span class="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-2">
            <pe-icon name="star" [size]="16" [filled]="true" class="text-status-warning" />
            Featured Slots
          </span>
          <span class="font-label-md text-label-md text-on-surface">{{ featuredAdverts() }} / {{ featuredCap }}</span>
        </div>
      </div>

      <pe-stat-card
        label="Bookings Today"
        [value]="'—'"
        icon="calendar_today"
        trend="neutral"
        trendValue="N/A"
        trendCaption="no aggregate endpoint"
      />

      <pe-stat-card
        label="Total Revenue"
        [value]="'—'"
        unit="XAF"
        icon="payments"
        trend="neutral"
        trendValue="N/A"
        trendCaption="no aggregate endpoint"
      />

      <div class="bg-surface-container-lowest border-[1.5px] border-outline-variant rounded-xl p-stack_lg shadow-card flex items-center gap-6 min-h-[160px]">
        <div class="relative w-24 h-24 flex-shrink-0">
          <svg class="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path class="text-surface-variant" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none" stroke="currentColor" stroke-width="3"></path>
          </svg>
          <div class="absolute inset-0 flex flex-col items-center justify-center">
            <pe-icon name="hourglass_empty" [size]="28" class="text-on-surface-variant" />
          </div>
        </div>
        <div>
          <p class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1">AI Verification</p>
          <h3 class="font-h3 text-h3 text-on-surface mb-2">Automated Processing</h3>
          <p class="font-body-sm text-body-sm text-on-surface-variant">Aggregate confidence metric pending — needs a backend endpoint.</p>
        </div>
      </div>
    </div>

    <!-- Recent Activity + Action Required -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
      <section class="lg:col-span-7 bg-surface-container-lowest border-[1.5px] border-outline-variant rounded-xl p-stack_lg shadow-card">
        <div class="flex justify-between items-center mb-stack_md flex-wrap gap-2">
          <h3 class="font-h3 text-h3 text-on-surface">Recent Activity</h3>
          <span class="font-label-sm text-label-sm px-2 py-1 rounded border-[1.5px]" style="border-color:rgba(234,179,8,0.35);background:rgba(234,179,8,0.1);color:#a16207">Preview — no activity endpoint</span>
        </div>
        <ul class="space-y-stack_md opacity-60">
          @for (item of activity; track item.id) {
            <li class="flex items-start gap-4 p-4 rounded-xl border-[1.5px] border-outline-variant bg-surface-container-lowest">
              <div
                class="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-[1.5px] border-surface-container-lowest"
                [style.color]="item.color"
                [style.background-color]="item.bg"
              >
                <pe-icon [name]="item.icon" [size]="18" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-body-sm text-body-sm text-on-surface" [innerHTML]="item.text"></p>
                <span class="font-label-sm text-label-sm text-on-surface-variant">{{ item.when }}</span>
              </div>
            </li>
          }
        </ul>
      </section>

      <section class="lg:col-span-5 bg-surface-container-lowest border-[1.5px] border-outline-variant rounded-xl p-stack_lg shadow-card">
        <h3 class="font-h3 text-h3 text-on-surface mb-6">Action Required</h3>
        <div class="space-y-4">
          <a
            routerLink="/ai-queue"
            class="block p-4 rounded-xl border-[1.5px] border-status-danger/30 bg-status-danger/5 hover:bg-status-danger/10 transition-colors flex items-center justify-between"
          >
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 rounded-full bg-status-danger/10 flex items-center justify-center text-status-danger">
                <pe-icon name="flag" [size]="20" />
              </div>
              <div>
                <h4 class="font-label-md text-label-md text-on-surface">Review Flagged Cars</h4>
                <p class="font-body-sm text-body-sm text-on-surface-variant">Pending manual inspection</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span class="bg-status-danger text-white font-label-sm text-label-sm px-2 py-1 rounded-full">{{ cars().flagged || 0 }}</span>
              <pe-icon name="chevron_right" [size]="20" class="text-outline-variant" />
            </div>
          </a>

          <a
            routerLink="/users"
            class="block p-4 rounded-xl border-[1.5px] border-outline-variant bg-surface-container-lowest hover:bg-surface-container-low transition-colors flex items-center justify-between"
          >
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant">
                <pe-icon name="group" [size]="20" />
              </div>
              <div>
                <h4 class="font-label-md text-label-md text-on-surface">All Users</h4>
                <p class="font-body-sm text-body-sm text-on-surface-variant">Browse and manage accounts</p>
              </div>
            </div>
            <pe-icon name="chevron_right" [size]="20" class="text-outline-variant" />
          </a>

          <a
            routerLink="/adverts"
            class="block p-4 rounded-xl border-[1.5px] border-outline-variant bg-surface-container-lowest hover:bg-surface-container-low transition-colors flex items-center justify-between"
          >
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant">
                <pe-icon name="ads_click" [size]="20" />
              </div>
              <div>
                <h4 class="font-label-md text-label-md text-on-surface">Adverts Moderation</h4>
                <p class="font-body-sm text-body-sm text-on-surface-variant">Boost, edit or remove listings</p>
              </div>
            </div>
            <pe-icon name="chevron_right" [size]="20" class="text-outline-variant" />
          </a>
        </div>
      </section>
    </div>
  `,
})
export class DashboardPage implements OnInit {
  private readonly carService = inject(CarService);
  private readonly advertService = inject(AdvertService);
  private readonly userService = inject(UserService);

  readonly totalUsers = signal<number | null>(null);
  readonly cars = signal<CarBreakdown>({ total: 0, verified: 0, pending: 0, flagged: 0 });
  readonly activeAdverts = signal(0);
  readonly featuredAdverts = signal(0);
  readonly featuredCap = 200;

  // Placeholder activity feed — backend doesn't yet expose an activity stream.
  readonly activity = [
    { id: 1, icon: 'verified', color: '#0043eb', bg: '#f0f3ff', text: `<span class="font-label-md text-label-md">Samuel Eto'o</span> verified a <span class="font-label-md text-label-md">Toyota Camry</span>`, when: '2 mins ago' },
    { id: 2, icon: 'flag',     color: '#ef4444', bg: 'rgba(239,68,68,0.1)', text: `AI System flagged listing <span class="font-label-md text-label-md">#4829A</span>`, when: '15 mins ago' },
    { id: 3, icon: 'payments', color: '#0043eb', bg: '#f0f3ff', text: `<span class="font-label-md text-label-md">Jean-Pierre</span> completed payment of <span class="font-label-md text-label-md">45,000 XAF</span>`, when: '1 hour ago' },
  ];

  ngOnInit(): void {
    forkJoin({
      users: this.userService.list().pipe(catchError(() => of({ success: false, data: [] }))),
      verifiedCars: this.carService.search({ limit: 1 }).pipe(catchError(() => of({ success: false, data: [], pagination: undefined } as any))),
      adverts: this.advertService.list({ status: 'active', limit: 1 }).pipe(catchError(() => of({ success: false, data: [], pagination: undefined } as any))),
      featured: this.advertService.featured(1).pipe(catchError(() => of({ success: false, data: [] }))),
    }).subscribe(({ users, verifiedCars, adverts, featured }) => {
      this.totalUsers.set(users?.data?.length ?? 0);
      this.activeAdverts.set(adverts?.pagination?.total ?? adverts?.data?.length ?? 0);
      this.featuredAdverts.set(featured?.data?.length ?? 0);

      const total = verifiedCars?.pagination?.total ?? verifiedCars?.data?.length ?? 0;
      this.cars.set({
        total,
        // Backend doesn't bucket by status in one call yet — show total under "Verified"
        // as a sensible proxy until a dedicated dashboard endpoint exists.
        verified: total,
        pending: 0,
        flagged: 0,
      });
    });
  }
}

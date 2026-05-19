import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { ApiPendingNoticeComponent } from '../../shared/components/api-pending-notice/api-pending-notice.component';

@Component({
  selector: 'pe-settings-page',
  standalone: true,
  imports: [FormsModule, PageHeaderComponent, IconComponent, ApiPendingNoticeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <pe-page-header title="System Settings" subtitle="Platform-wide configuration — fees, integrations, notifications." />

    <pe-api-pending-notice
      title="System Settings — preview only"
      message="None of the toggles below are persisted. A settings/config endpoint is required before this screen can be activated."
    />

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
      <aside class="lg:col-span-3">
        <nav class="bg-surface border-[1.5px] border-outline-variant rounded-xl p-2 shadow-card sticky top-20">
          @for (s of sections; track s.id) {
            <a [href]="'#' + s.id" class="flex items-center gap-3 px-3 py-2 rounded text-on-surface-variant hover:bg-surface-container-low hover:text-primary font-label-md text-label-md transition-colors">
              <pe-icon [name]="s.icon" [size]="18" />
              {{ s.label }}
            </a>
          }
        </nav>
      </aside>

      <div class="lg:col-span-9 space-y-stack_lg">
        <section id="general" class="bg-surface border-[1.5px] border-outline-variant rounded-xl p-stack_lg shadow-card">
          <h3 class="font-h3 text-h3 text-on-surface mb-stack_md">General</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-stack_md">
            <label class="block">
              <span class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Platform Name</span>
              <input type="text" value="ParkEase" class="mt-1 w-full h-10 px-3 bg-surface border-[1.5px] border-outline-variant rounded font-body-md focus:border-secondary outline-none" />
            </label>
            <label class="block">
              <span class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Default Currency</span>
              <select class="mt-1 w-full h-10 px-3 bg-surface border-[1.5px] border-outline-variant rounded font-body-md focus:border-secondary outline-none">
                <option>XAF (Central African CFA franc)</option>
                <option>USD</option>
                <option>EUR</option>
              </select>
            </label>
            <label class="block">
              <span class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Country</span>
              <select class="mt-1 w-full h-10 px-3 bg-surface border-[1.5px] border-outline-variant rounded font-body-md focus:border-secondary outline-none">
                <option>Cameroon</option>
              </select>
            </label>
            <label class="block">
              <span class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Timezone</span>
              <select class="mt-1 w-full h-10 px-3 bg-surface border-[1.5px] border-outline-variant rounded font-body-md focus:border-secondary outline-none">
                <option>Africa/Douala (WAT)</option>
              </select>
            </label>
          </div>
        </section>

        <section id="fees" class="bg-surface border-[1.5px] border-outline-variant rounded-xl p-stack_lg shadow-card">
          <h3 class="font-h3 text-h3 text-on-surface mb-stack_md">Marketplace Fees</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-stack_md">
            <label class="block">
              <span class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Sale Commission</span>
              <div class="relative mt-1">
                <input type="number" value="5" class="w-full h-10 pl-3 pr-8 bg-surface border-[1.5px] border-outline-variant rounded font-body-md focus:border-secondary outline-none" />
                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-outline">%</span>
              </div>
            </label>
            <label class="block">
              <span class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Rental Commission</span>
              <div class="relative mt-1">
                <input type="number" value="10" class="w-full h-10 pl-3 pr-8 bg-surface border-[1.5px] border-outline-variant rounded font-body-md focus:border-secondary outline-none" />
                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-outline">%</span>
              </div>
            </label>
            <label class="block">
              <span class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Featured Slot Price</span>
              <div class="relative mt-1">
                <input type="number" value="15000" class="w-full h-10 pl-3 pr-14 bg-surface border-[1.5px] border-outline-variant rounded font-body-md focus:border-secondary outline-none" />
                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-outline font-label-sm">XAF</span>
              </div>
            </label>
          </div>
        </section>

        <section id="verification" class="bg-surface border-[1.5px] border-outline-variant rounded-xl p-stack_lg shadow-card">
          <h3 class="font-h3 text-h3 text-on-surface mb-stack_md">AI Verification</h3>
          <div class="space-y-3">
            <label class="flex items-center justify-between p-3 rounded border-[1.5px] border-outline-variant bg-surface-container-lowest">
              <div>
                <p class="font-label-md text-label-md text-on-surface">Auto-flag low-confidence listings</p>
                <p class="font-body-sm text-body-sm text-on-surface-variant">Listings below the threshold are moved to the AI Queue automatically.</p>
              </div>
              <input type="checkbox" checked class="w-12 h-6 rounded-full" />
            </label>
            <label class="block max-w-sm">
              <span class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Confidence Threshold</span>
              <input type="range" min="50" max="99" value="80" class="w-full mt-1" />
              <div class="font-body-sm text-body-sm text-on-surface-variant flex justify-between"><span>50%</span><span>99%</span></div>
            </label>
          </div>
        </section>

        <section id="notifications" class="bg-surface border-[1.5px] border-outline-variant rounded-xl p-stack_lg shadow-card">
          <h3 class="font-h3 text-h3 text-on-surface mb-stack_md">Admin Notifications</h3>
          <div class="space-y-2">
            @for (n of notifications; track n) {
              <label class="flex items-center justify-between p-3 rounded border-[1.5px] border-outline-variant bg-surface-container-lowest">
                <span class="font-body-md text-body-md text-on-surface">{{ n }}</span>
                <input type="checkbox" checked class="w-5 h-5" />
              </label>
            }
          </div>
        </section>

        <div class="flex justify-end gap-2">
          <button class="h-10 px-4 bg-surface border-[1.5px] border-outline-variant rounded font-label-md text-label-md">Cancel</button>
          <button class="h-10 px-4 bg-secondary text-on-secondary rounded font-label-md text-label-md hover:opacity-90">Save Changes</button>
        </div>
      </div>
    </div>
  `,
})
export class SettingsPage {
  readonly sections = [
    { id: 'general', icon: 'tune', label: 'General' },
    { id: 'fees', icon: 'savings', label: 'Marketplace Fees' },
    { id: 'verification', icon: 'verified', label: 'AI Verification' },
    { id: 'notifications', icon: 'notifications', label: 'Notifications' },
  ];

  readonly notifications = [
    'New flagged car requires review',
    'New merchant KYC submission',
    'Booking dispute filed',
    'Daily revenue summary',
  ];
}

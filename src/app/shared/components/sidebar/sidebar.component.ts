import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IconComponent } from '../icon/icon.component';

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

@Component({
  selector: 'pe-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <aside class="w-[sidebar_width] h-screen border-r border-outline-variant bg-surface-container-lowest flex flex-col py-base z-20 shrink-0 fixed left-0 top-0">
      <div class="px-container_padding py-stack_md mb-stack_lg">
        <h2 class="text-h2 font-h2 text-primary">ParkEase</h2>
        <p class="font-body-sm text-body-sm text-on-surface-variant">Car Marketplace Admin</p>
      </div>

      <nav class="flex-1 overflow-y-auto px-2">
        <ul class="flex flex-col gap-1">
          @for (item of nav; track item.path) {
            <li>
              <a
                [routerLink]="item.path"
                routerLinkActive="!bg-secondary-container !text-on-secondary-container !border-l-4 !border-secondary !font-bold"
                [routerLinkActiveOptions]="{ exact: false }"
                class="flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-all duration-200 active:scale-95 rounded-r"
              >
                <pe-icon [name]="item.icon" [size]="20" />
                <span class="text-body-md">{{ item.label }}</span>
              </a>
            </li>
          }
        </ul>
      </nav>

      <div class="mt-auto pt-stack_md border-t border-outline-variant/30 px-2">
        <a
          routerLink="/admin/profile"
          routerLinkActive="!bg-secondary-container !text-on-secondary-container"
          class="flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-all duration-200 rounded-r"
        >
          <pe-icon name="account_circle" [size]="20" />
          <span class="text-body-md">Admin Profile</span>
        </a>
      </div>
    </aside>
  `,
})
export class SidebarComponent {
  readonly nav: NavItem[] = [
    { label: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
    { label: 'Users', path: '/users', icon: 'person' },
    { label: 'Cars', path: '/cars', icon: 'directions_car' },
    { label: 'AI Queue', path: '/ai-queue', icon: 'smart_toy' },
    { label: 'Adverts', path: '/adverts', icon: 'ads_click' },
    { label: 'Bookings', path: '/bookings', icon: 'calendar_today' },
    { label: 'Reports', path: '/reports', icon: 'assessment' },
    { label: 'Roles & Permissions', path: '/roles', icon: 'security' },
    { label: 'Audit Log', path: '/audit', icon: 'history_edu' },
    { label: 'Settings', path: '/settings', icon: 'settings' },
    { label: 'Seed Tools', path: '/seed-tools', icon: 'database' },
  ];
}

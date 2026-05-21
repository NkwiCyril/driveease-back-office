import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';

@Component({
  selector: 'pe-admin-shell',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!--
      Topbar is fixed across the full viewport width (above the sidebar).
      Sidebar starts at top-16 so it doesn't slide under the topbar.
      Main content needs both pt-16 (for the topbar) and ml-[240px] (for the sidebar).
    -->
    <div class="min-h-screen bg-background">
      <pe-topbar />
      <pe-sidebar />
      <main class="ml-[240px] pt-16 min-h-screen">
        <div class="max-w-[1440px] mx-auto p-container_padding">
          <router-outlet />
        </div>
      </main>
    </div>
  `,
})
export class AdminShellComponent {}

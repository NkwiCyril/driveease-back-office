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
    <div class="flex min-h-screen bg-background">
      <pe-sidebar />
      <div class="flex-1 flex flex-col ml-[240px] min-h-screen">
        <pe-topbar />
        <main class="flex-1 p-container_padding overflow-y-auto">
          <div class="max-w-[1440px] mx-auto">
            <router-outlet />
          </div>
        </main>
      </div>
    </div>
  `,
})
export class AdminShellComponent {}

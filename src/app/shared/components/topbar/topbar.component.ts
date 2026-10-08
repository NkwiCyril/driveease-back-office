import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'pe-topbar',
  standalone: true,
  imports: [IconComponent, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Pinned across the full viewport width and flush to the top. inset-x-0 +
         w-full guarantee it spans edge to edge above the sidebar; z-30 keeps it
         over the sidebar (z-20). The brand block is a fixed 240px column with a
         right border so it lines up pixel-for-pixel with the sidebar beneath. -->
    <header class="fixed top-0 inset-x-0 w-full bg-surface border-b border-outline-variant flex items-center h-16 z-30">
      <!-- Brand column — exactly the sidebar width (240px), bordered to match. -->
      <div class="w-[240px] shrink-0 h-full flex items-center gap-2 px-stack_lg border-r border-outline-variant">
        <h1 class="text-h2 font-h2 font-bold text-primary leading-none">ParkEase</h1>
        <span class="font-body-sm text-body-sm text-on-surface-variant hidden sm:inline">Admin</span>
      </div>

      <!-- Right region fills the remaining width. -->
      <div class="flex-1 flex justify-between items-center px-container_padding gap-gutter">
        <div class="relative hidden md:block">
          <pe-icon name="search" [size]="20" class="absolute left-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none" />
          <input
            class="pl-10 pr-4 py-2 rounded border-[1.5px] border-outline-variant bg-surface-container-lowest text-on-surface focus:border-secondary focus:ring-0 focus:outline-none w-64 transition-colors font-body-sm text-body-sm"
            placeholder="Search…"
            type="text"
          />
        </div>

      <div class="flex items-center gap-stack_md ml-auto">
        <a
          routerLink="/admin/profile"
          class="flex items-center gap-3 cursor-pointer p-1 pr-3 rounded-full hover:bg-surface-container-low transition-colors border-[1.5px] border-outline-variant bg-surface-container-lowest"
        >
          <span class="w-8 h-8 rounded-full bg-secondary text-on-secondary flex items-center justify-center font-label-md text-label-md">
            {{ initials() }}
          </span>
          <span class="font-label-md text-label-md text-on-surface hidden sm:inline">{{ displayName() }}</span>
        </a>
        <button
          (click)="logout()"
          class="p-2 text-on-surface-variant hover:bg-surface-container-low hover:text-error transition-colors rounded-full"
          aria-label="Logout"
        >
          <pe-icon name="logout" [size]="22" />
        </button>
      </div>
      </div>
    </header>
  `,
})
export class TopbarComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  displayName(): string {
    return this.auth.currentUser()?.name ?? 'Admin';
  }

  initials(): string {
    const name = this.displayName();
    return name
      .split(' ')
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  logout(): void {
    this.auth.logout().subscribe({
      next: () => this.router.navigate(['/auth/login']),
      error: () => this.router.navigate(['/auth/login']),
    });
  }
}

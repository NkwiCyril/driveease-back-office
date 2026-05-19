import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { AdvertService } from '../../core/services/advert.service';
import { CarService } from '../../core/services/car.service';
import { UserService } from '../../core/services/user.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { IconComponent } from '../../shared/components/icon/icon.component';

interface ToolResult {
  status: 'idle' | 'running' | 'success' | 'error';
  message?: string;
}

@Component({
  selector: 'pe-seed-tools-page',
  standalone: true,
  imports: [PageHeaderComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <pe-page-header
      title="Seed Tools"
      subtitle="Destructive and high-impact maintenance actions. Super Admin only."
    />

    <div class="bg-status-warning/10 border-[1.5px] border-status-warning/30 rounded p-4 mb-stack_lg flex items-start gap-3">
      <pe-icon name="warning" [size]="20" class="text-status-warning" />
      <p class="font-body-md text-body-md text-on-surface">
        These tools mutate production data. Always confirm before running. Actions are logged in the Audit Log.
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
      @for (tool of tools; track tool.id) {
        <article class="bg-surface border-[1.5px] border-outline-variant rounded-xl p-stack_lg shadow-card flex flex-col">
          <div class="flex items-center gap-3 mb-stack_sm">
            <div class="w-10 h-10 rounded bg-secondary/10 flex items-center justify-center text-secondary">
              <pe-icon [name]="tool.icon" [size]="22" />
            </div>
            <h3 class="font-h3 text-h3 text-on-surface">{{ tool.title }}</h3>
          </div>
          <p class="font-body-md text-body-md text-on-surface-variant mb-stack_md">{{ tool.description }}</p>

          @if (results()[tool.id]; as result) {
            @if (result.status !== 'idle') {
              <div
                class="mb-stack_md px-3 py-2 rounded font-body-sm text-body-sm border-[1.5px]"
                [class.text-status-success]="result.status === 'success'"
                [class.border-status-success]="result.status === 'success'"
                [class.bg-status-success]="result.status === 'success'"
                [class.text-status-danger]="result.status === 'error'"
                [class.border-status-danger]="result.status === 'error'"
                [class.bg-status-danger]="result.status === 'error'"
                [class.text-status-warning]="result.status === 'running'"
                [class.border-status-warning]="result.status === 'running'"
                [class.bg-status-warning]="result.status === 'running'"
                style="background-color: rgba(0,0,0,0.05);"
              >
                {{ result.message }}
              </div>
            }
          }

          <div class="mt-auto flex justify-end">
            <button
              (click)="tool.action()"
              [disabled]="!canRun(tool) || results()[tool.id]?.status === 'running'"
              class="h-10 px-4 rounded font-label-md text-label-md transition-colors disabled:opacity-50"
              [style.background]="tool.destructive ? '#ef4444' : '#0043eb'"
              [style.color]="'#fff'"
            >
              {{ results()[tool.id]?.status === 'running' ? 'Running…' : tool.cta }}
            </button>
          </div>
        </article>
      }
    </div>
  `,
})
export class SeedToolsPage {
  private readonly api = inject(ApiService);
  private readonly advertService = inject(AdvertService);
  private readonly carService = inject(CarService);
  private readonly userService = inject(UserService);
  readonly auth = inject(AuthService);

  readonly results = signal<Record<string, ToolResult>>({});

  readonly tools = [
    {
      id: 'verifyAll',
      title: 'Verify all cars',
      icon: 'verified',
      description: 'Marks every car in the database as verified and clears any flagged state. Intended for test environments only.',
      cta: 'Run',
      destructive: false,
      action: () => this.run('verifyAll', () => this.api.post('/cars/verify-all')),
    },
    {
      id: 'promoteAdmin',
      title: 'Promote user to admin',
      icon: 'admin_panel_settings',
      description: 'Sets the role of the user with a given phone number to "admin". Idempotent. Backend exposes no demote path — use this carefully.',
      cta: 'Promote by Phone',
      destructive: false,
      action: () => this.runPhonePrompt('promoteAdmin', 'Phone number (no +237 prefix):', (phone) => this.userService.promoteToAdmin(phone)),
    },
    {
      id: 'promotePhoneCars',
      title: 'Mark a user\'s cars as Premium',
      icon: 'workspace_premium',
      description: 'Bulk-flags every car owned by the user with this phone as premiumVerified=true. Idempotent.',
      cta: 'Promote Cars by Phone',
      destructive: false,
      action: () => this.runPhonePrompt('promotePhoneCars', 'Phone number (no +237 prefix):', (phone) => this.carService.bulkPromotePhone(phone)),
    },
    {
      id: 'wipeAdverts',
      title: 'Delete all adverts',
      icon: 'campaign',
      description: 'Removes every advert from the system. Cars and users are not affected. Super Admin only.',
      cta: 'Wipe Adverts',
      destructive: true,
      action: () => this.run('wipeAdverts', () => this.advertService.deleteAll(), true),
    },
  ];

  private runPhonePrompt(id: string, label: string, fn: (phone: string) => unknown): void {
    const phone = prompt(label);
    if (!phone) return;
    const cleaned = phone.replace(/\D+/g, '');
    if (!/^\d{9,15}$/.test(cleaned)) {
      this.setResult(id, { status: 'error', message: 'Phone must be 9-15 digits.' });
      return;
    }
    this.run(id, () => fn(cleaned));
  }

  canRun(tool: { destructive: boolean }): boolean {
    return tool.destructive ? this.auth.isSuperAdmin() : this.auth.isAdmin();
  }

  run(id: string, fn: () => unknown, requireConfirm = false): void {
    if (requireConfirm && !confirm('This action is destructive. Continue?')) return;
    this.setResult(id, { status: 'running', message: 'Working…' });
    const result = fn() as { subscribe?: (handlers: { next: () => void; error: (e: unknown) => void }) => void };
    if (result?.subscribe) {
      result.subscribe({
        next: () => this.setResult(id, { status: 'success', message: 'Completed successfully.' }),
        error: (e) => this.setResult(id, { status: 'error', message: this.errorMessage(e) }),
      });
    } else {
      this.setResult(id, { status: 'success', message: 'Completed.' });
    }
  }

  private setResult(id: string, result: ToolResult): void {
    this.results.update((m) => ({ ...m, [id]: result }));
  }

  private errorMessage(err: unknown): string {
    const e = err as { error?: { message?: string }; message?: string };
    return e?.error?.message ?? e?.message ?? 'Something went wrong.';
  }
}

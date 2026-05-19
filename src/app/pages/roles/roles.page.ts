import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { StatusBadgeComponent, BadgeTone } from '../../shared/components/status-badge/status-badge.component';
import { ApiPendingNoticeComponent } from '../../shared/components/api-pending-notice/api-pending-notice.component';

interface RoleRow {
  role: string;
  tone: BadgeTone;
  description: string;
  permissions: Record<string, boolean>;
  userCount: number;
}

@Component({
  selector: 'pe-roles-page',
  standalone: true,
  imports: [RouterLink, PageHeaderComponent, IconComponent, StatusBadgeComponent, ApiPendingNoticeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <pe-page-header title="Roles & Permissions" subtitle="Define what each role can do across the platform." />

    <pe-api-pending-notice
      title="Roles & Permissions — partial support"
      message="The API only exposes one-way admin promotion (POST /users/promote-admin/:phone). Custom role creation and permission editing are not yet backed by endpoints. Use Seed Tools to promote a user to admin by phone number."
    >
    </pe-api-pending-notice>

    <div class="mb-stack_lg">
      <a routerLink="/seed-tools" class="inline-flex items-center gap-2 h-10 px-4 bg-secondary text-on-secondary font-label-md text-label-md rounded hover:opacity-90 shadow-card">
        <pe-icon name="admin_panel_settings" [size]="18" /> Promote user to admin
      </a>
    </div>

    <div class="bg-surface border-[1.5px] border-outline-variant rounded-xl overflow-hidden shadow-card">
      <table class="w-full text-left">
        <thead>
          <tr class="border-b-[1.5px] border-outline-variant bg-surface-container-lowest">
            <th class="p-3 font-label-sm text-label-sm text-on-surface-variant uppercase">Role</th>
            <th class="p-3 font-label-sm text-label-sm text-on-surface-variant uppercase">Users</th>
            @for (col of permissionColumns; track col) {
              <th class="p-3 font-label-sm text-label-sm text-on-surface-variant uppercase">{{ col }}</th>
            }
          </tr>
        </thead>
        <tbody class="font-body-sm divide-y divide-outline-variant/50">
          @for (r of rows; track r.role) {
            <tr class="hover:bg-background transition-colors">
              <td class="p-3">
                <pe-status-badge [tone]="r.tone">{{ r.role }}</pe-status-badge>
                <p class="font-body-sm text-body-sm text-on-surface-variant mt-1">{{ r.description }}</p>
              </td>
              <td class="p-3 font-label-md text-on-surface">{{ r.userCount }}</td>
              @for (col of permissionColumns; track col) {
                <td class="p-3">
                  @if (r.permissions[col]) {
                    <pe-icon name="check" [size]="20" class="text-status-success" />
                  } @else {
                    <pe-icon name="close" [size]="20" class="text-outline-variant" />
                  }
                </td>
              }
            </tr>
          }
        </tbody>
      </table>
    </div>

    <div class="mt-stack_lg bg-surface border-[1.5px] border-outline-variant rounded-xl p-stack_lg shadow-card">
      <div class="flex items-start gap-2 text-on-surface-variant font-body-sm">
        <pe-icon name="info" [size]="20" class="text-secondary" />
        <p>
          Backend roles are enum-bound (<code>regular</code>, <code>merchant</code>, <code>admin</code>, <code>super_admin</code>).
          Only <strong>super_admin</strong> can promote others, and <code>super_admin</code> itself can only be set directly in the database.
        </p>
      </div>
    </div>
  `,
})
export class RolesPage {
  readonly permissionColumns = ['View users', 'Edit cars', 'Verify cars', 'Boost adverts', 'Delete data', 'Change roles'];

  readonly rows: RoleRow[] = [
    {
      role: 'Regular',
      tone: 'neutral',
      description: 'Consumer accounts — browse, book, rate.',
      userCount: 10240,
      permissions: { 'View users': false, 'Edit cars': false, 'Verify cars': false, 'Boost adverts': false, 'Delete data': false, 'Change roles': false },
    },
    {
      role: 'Merchant',
      tone: 'success',
      description: 'Sellers — upload cars, manage own listings.',
      userCount: 2120,
      permissions: { 'View users': false, 'Edit cars': true,  'Verify cars': false, 'Boost adverts': true,  'Delete data': false, 'Change roles': false },
    },
    {
      role: 'Admin',
      tone: 'info',
      description: 'Platform staff — moderate content and bookings.',
      userCount: 12,
      permissions: { 'View users': true,  'Edit cars': true,  'Verify cars': true,  'Boost adverts': true,  'Delete data': false, 'Change roles': false },
    },
    {
      role: 'Super Admin',
      tone: 'purple',
      description: 'Top-level — destructive actions and role management.',
      userCount: 2,
      permissions: { 'View users': true,  'Edit cars': true,  'Verify cars': true,  'Boost adverts': true,  'Delete data': true,  'Change roles': true },
    },
  ];
}

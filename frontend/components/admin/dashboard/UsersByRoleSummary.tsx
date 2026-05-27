import React from 'react';
import type { UsersByRoleItem } from '../../../lib/types/admin-stats.types';

interface UsersByRoleSummaryProps {
  usersByRole: UsersByRoleItem[];
}

export default function UsersByRoleSummary({ usersByRole }: UsersByRoleSummaryProps) {
  const adminCount = usersByRole.find((u) => u.role === 'ADMIN')?.count ?? 0;
  const userCount = usersByRole.find((u) => u.role === 'USER')?.count ?? 0;

  return (
    <div className="bg-paper-cream border border-graphite-border rounded-none p-6 flex flex-col h-full">
      <h3 className="text-headline-md text-ink-black mb-6">Users by Role</h3>
      <div className="grid grid-cols-2 gap-4 flex-grow items-center">
        <div className="bg-white border border-graphite-border rounded-none p-4 text-center">
          <span className="material-symbols-outlined text-[32px] text-on-tertiary-container mb-2">
            admin_panel_settings
          </span>
          <div className="text-headline-lg font-bold text-ink-black">{adminCount}</div>
          <div className="font-label-sm text-[#76777b] uppercase tracking-wider mt-1">Admins</div>
        </div>
        <div className="bg-white border border-graphite-border rounded-none p-4 text-center">
          <span className="material-symbols-outlined text-[32px] text-secondary mb-2">
            person
          </span>
          <div className="text-headline-lg font-bold text-ink-black">{userCount}</div>
          <div className="font-label-sm text-[#76777b] uppercase tracking-wider mt-1">Users</div>
        </div>
      </div>
    </div>
  );
}

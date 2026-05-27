import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { RecentUserItem } from '../../../lib/types/admin-stats.types';
import { resolveUploadUrl } from '../../../lib/uploads/url';
import RoleBadge from '../users/RoleBadge';
import DashboardEmptyState from './DashboardEmptyState';

interface RecentUsersProps {
  users: RecentUserItem[];
}

export default function RecentUsersTable({ users }: RecentUsersProps) {
  if (users.length === 0) {
    return (
      <div className="bg-paper-cream border border-graphite-border rounded-none overflow-hidden flex flex-col h-full">
        <div className="p-6 border-b border-graphite-border bg-[#f4f4f0] flex justify-between items-center">
          <h3 className="text-headline-md text-ink-black">Recent Users</h3>
          <Link
            href="/admin/users"
            className="font-label-sm text-label-sm text-secondary uppercase tracking-widest hover:underline"
          >
            View All
          </Link>
        </div>
        <div className="flex-grow flex items-center justify-center p-6 bg-white">
          <DashboardEmptyState
            title="No recent users"
            description="Newly created users will appear here."
            icon="group"
          />
        </div>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-paper-cream border border-graphite-border rounded-none overflow-hidden flex flex-col h-full">
      <div className="p-6 border-b border-graphite-border bg-[#f4f4f0] flex justify-between items-center">
        <h3 className="text-headline-md text-ink-black">Recent Users</h3>
        <Link
          href="/admin/users"
          className="font-label-sm text-label-sm text-[#76777b] uppercase tracking-widest hover:underline"
        >
          View All
        </Link>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto bg-white flex-grow">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-graphite-border bg-surface-bright">
              <th className="py-3 px-6 font-label-md text-label-md text-[#76777b] font-medium">User</th>
              <th className="py-3 px-6 font-label-md text-label-md text-[#76777b] font-medium">Role</th>
              <th className="py-3 px-6 font-label-md text-label-md text-[#76777b] font-medium">Joined At</th>
              <th className="py-3 px-6 font-label-md text-label-md text-[#76777b] font-medium text-right">Docs</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-graphite-border">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-surface-bright transition-colors">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#e9e8e4] border border-graphite-border flex items-center justify-center overflow-hidden shrink-0">
                      {u.avatarUrl ? (
                        <Image
                          src={resolveUploadUrl(u.avatarUrl)}
                          alt=""
                          width={32}
                          height={32}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      ) : (
                        <span className="material-symbols-outlined text-[16px] text-[#76777b]">person</span>
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <Link href={`/admin/users/${u.id}`} className="font-medium text-ink-black hover:text-on-tertiary-container transition-colors truncate max-w-[160px]">
                        {u.fullName}
                      </Link>
                      <span className="text-xs text-[#76777b] truncate max-w-[160px]">{u.email}</span>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <RoleBadge role={u.role} />
                </td>
                <td className="py-4 px-6 text-[#76777b]">{formatDate(u.createdAt)}</td>
                <td className="py-4 px-6 text-right font-medium">{u.documentsCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List View */}
      <div className="md:hidden divide-y divide-graphite-border bg-white flex-grow">
        {users.map((u) => (
          <div key={u.id} className="p-4 flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[#e9e8e4] border border-graphite-border flex items-center justify-center overflow-hidden shrink-0">
                  {u.avatarUrl ? (
                    <Image
                      src={resolveUploadUrl(u.avatarUrl)}
                      alt=""
                      width={28}
                      height={28}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <span className="material-symbols-outlined text-[14px] text-[#76777b]">person</span>
                  )}
                </div>
                <div className="flex flex-col">
                  <Link href={`/admin/users/${u.id}`} className="font-semibold text-ink-black hover:text-on-tertiary-container transition-colors text-sm">
                    {u.fullName}
                  </Link>
                  <span className="text-xs text-[#76777b]">{u.email}</span>
                </div>
              </div>
              <RoleBadge role={u.role} />
            </div>
            <div className="flex items-center justify-between text-xs text-[#76777b] mt-1">
              <span>Joined {formatDate(u.createdAt)}</span>
              <span className="font-medium">{u.documentsCount} Documents</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

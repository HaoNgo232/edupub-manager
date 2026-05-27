'use client';

import React from 'react';
import { Role } from '../../../lib/api';

interface RoleBadgeProps {
  role: Role;
}

export default function RoleBadge({ role }: RoleBadgeProps) {
  const isAdmin = role === 'ADMIN';

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 font-label-sm text-label-sm rounded uppercase border ${
        isAdmin ? 'bg-[#d1e7dd] text-[#0f5132] border-[#a3cfbb]' : 'bg-[#e9e8e4] text-[#46464b] border-graphite-border'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isAdmin ? 'bg-[#0f5132]' : 'bg-[#76777b]'}`} />
      {isAdmin ? 'Admin' : 'User'}
    </span>
  );
}

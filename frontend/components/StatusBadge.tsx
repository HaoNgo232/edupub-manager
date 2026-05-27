'use client';

import React from 'react';
import { DocumentStatus } from '../lib/api';

const STATUS_CONFIG: Record<DocumentStatus, { label: string; bg: string; text: string; dot: string }> = {
  DRAFT: {
    label: 'DRAFT',
    bg: 'bg-[#e9e8e4]',
    text: 'text-[#46464b]',
    dot: 'bg-[#76777b]',
  },
  PUBLISHED: {
    label: 'PUBLISHED',
    bg: 'bg-[#d1e7dd]',
    text: 'text-[#0f5132]',
    dot: 'bg-[#0f5132]',
  },
  ARCHIVED: {
    label: 'ARCHIVED',
    bg: 'bg-[#fff3cd]',
    text: 'text-[#664d03]',
    dot: 'bg-[#664d03]',
  },
};

interface StatusBadgeProps {
  status: DocumentStatus;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.DRAFT;
  const padding = size === 'md' ? 'px-3 py-1' : 'px-2 py-0.5';
  return (
    <span
      className={`inline-flex items-center gap-1.5 ${padding} ${cfg.bg} ${cfg.text} font-label-sm text-label-sm rounded uppercase`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

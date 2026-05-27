import React from 'react';
import StatCard from './StatCard';
import type { AdminStatsSummary } from '../../../lib/types/admin-stats.types';

interface AdminSummaryCardsProps {
  summary: AdminStatsSummary;
}

export default function AdminSummaryCards({ summary }: AdminSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter mb-margin-edge">
      <StatCard
        title="Total Users"
        value={summary.totalUsers}
        icon="group"
        subtext="Includes admins and users"
      />
      <StatCard
        title="Total Documents"
        value={summary.totalDocuments}
        icon="description"
        subtext="All educational documents"
      />
      <StatCard
        title="Published"
        value={summary.totalPublishedDocuments}
        icon="check_circle"
        subtext="Published documents"
        iconColorClass="text-on-tertiary-container"
      />
      <StatCard
        title="Drafts"
        value={summary.totalDraftDocuments}
        icon="edit_document"
        subtext="Documents in draft"
        iconColorClass="text-[#76777b]"
      />
    </div>
  );
}

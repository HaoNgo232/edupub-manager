import React from 'react';

interface DashboardEmptyStateProps {
  title?: string;
  description?: string;
  icon?: string;
}

export default function DashboardEmptyState({
  title = 'No chart data',
  description = 'There is not enough data to display this chart yet.',
  icon = 'analytics',
}: DashboardEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center h-full">
      <span className="material-symbols-outlined text-[40px] text-[#c7c6cb] mb-3">{icon}</span>
      <h4 className="font-label-md font-bold text-ink-black">{title}</h4>
      <p className="font-label-sm text-[#76777b] mt-1 px-4">{description}</p>
    </div>
  );
}

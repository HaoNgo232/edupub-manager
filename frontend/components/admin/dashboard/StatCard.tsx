import React from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: string;
  subtext: string;
  iconColorClass?: string;
}

export default function StatCard({
  title,
  value,
  icon,
  subtext,
  iconColorClass = 'text-[#76777b]',
}: StatCardProps) {
  return (
    <div className="bg-paper-cream border border-graphite-border rounded-none p-6 flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <span className="font-label-md text-label-md text-[#76777b] uppercase tracking-wider">
          {title}
        </span>
        <span className={`material-symbols-outlined ${iconColorClass}`}>
          {icon}
        </span>
      </div>
      <div className="text-headline-xl text-ink-black mb-1">
        {value}
      </div>
      <div className="font-label-sm text-label-sm text-[#76777b] mt-auto">
        {subtext}
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { DocumentsByStatusItem } from '../../../lib/types/admin-stats.types';
import DashboardEmptyState from './DashboardEmptyState';

interface DocumentsByStatusChartProps {
  data: DocumentsByStatusItem[];
}

const COLOR_MAP = {
  PUBLISHED: '#e5564b', // Primary red
  DRAFT: '#1c1e24',     // Dark gray
  ARCHIVED: '#D1D5DB',  // Light gray
};

const LABEL_MAP = {
  PUBLISHED: 'Published',
  DRAFT: 'Draft',
  ARCHIVED: 'Archived',
};

export default function DocumentsByStatusChart({ data }: DocumentsByStatusChartProps) {
  const chartData = data
    .filter((item) => item.count > 0)
    .map((item) => ({
      name: LABEL_MAP[item.status] || item.status,
      value: item.count,
      status: item.status,
    }));

  const total = chartData.reduce((acc, curr) => acc + curr.value, 0);

  if (total === 0) {
    return (
      <div className="bg-paper-cream border border-graphite-border rounded-none p-6 h-[380px] flex flex-col justify-between">
        <h3 className="text-headline-md text-ink-black">Document Status</h3>
        <div className="flex-grow">
          <DashboardEmptyState />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-paper-cream border border-graphite-border rounded-none p-6 h-[380px] flex flex-col justify-between">
      <h3 className="text-headline-md text-ink-black">Document Status</h3>
      <div className="h-64 flex items-center justify-center relative mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLOR_MAP[entry.status as keyof typeof COLOR_MAP] || '#76777b'} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#1c1e24',
                color: '#fff',
                borderRadius: '0px',
                border: 'none',
                fontFamily: 'Inter',
              }}
              itemStyle={{ color: '#fff' }}
            />
            <Legend verticalAlign="bottom" height={36} iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

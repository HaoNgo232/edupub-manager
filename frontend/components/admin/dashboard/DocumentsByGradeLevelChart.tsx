'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { DocumentsByGradeLevelItem } from '../../../lib/types/admin-stats.types';
import DashboardEmptyState from './DashboardEmptyState';

interface DocumentsByGradeLevelChartProps {
  data: DocumentsByGradeLevelItem[];
}

export default function DocumentsByGradeLevelChart({ data }: DocumentsByGradeLevelChartProps) {
  // Sort by grade level ascending
  const sortedData = [...data].sort((a, b) => a.gradeLevel - b.gradeLevel);

  const chartData = sortedData.map((item) => ({
    name: `Grade ${item.gradeLevel}`,
    count: item.count,
  }));

  const total = chartData.reduce((acc, curr) => acc + curr.count, 0);

  if (total === 0) {
    return (
      <div className="bg-paper-cream border border-graphite-border rounded-lg p-6 h-[380px] flex flex-col justify-between">
        <h3 className="text-headline-md text-ink-black">Documents by Grade</h3>
        <div className="flex-grow">
          <DashboardEmptyState />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-paper-cream border border-graphite-border rounded-lg p-6 h-[380px] flex flex-col justify-between">
      <h3 className="text-headline-md text-ink-black">Documents by Grade</h3>
      <div className="h-64 relative w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e3e2df" />
            <XAxis type="number" tickLine={false} axisLine={false} stroke="#585e6b" fontSize={12} allowDecimals={false} />
            <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} stroke="#585e6b" fontSize={12} width={70} />
            <Tooltip
              cursor={{ fill: 'rgba(0,0,0,0.05)' }}
              contentStyle={{
                backgroundColor: '#1c1e24',
                color: '#fff',
                borderRadius: '4px',
                border: 'none',
                fontFamily: 'Inter',
              }}
              labelStyle={{ fontWeight: 'bold', color: '#fff' }}
              itemStyle={{ color: '#fff' }}
            />
            <Bar dataKey="count" fill="#e5564b" radius={[0, 2, 2, 0]} barSize={24} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { DocumentsBySubjectItem } from '../../../lib/types/admin-stats.types';
import DashboardEmptyState from './DashboardEmptyState';

interface DocumentsBySubjectChartProps {
  data: DocumentsBySubjectItem[];
}

const SUBJECT_LABEL_MAP: Record<string, string> = {
  MATH: 'Math',
  LITERATURE: 'Literature',
  ENGLISH: 'English',
  PHYSICS: 'Physics',
  CHEMISTRY: 'Chemistry',
  BIOLOGY: 'Biology',
  HISTORY: 'History',
  GEOGRAPHY: 'Geography',
  OTHER: 'Other',
};

export default function DocumentsBySubjectChart({ data }: DocumentsBySubjectChartProps) {
  const chartData = data.map((item) => ({
    name: SUBJECT_LABEL_MAP[item.subject] || item.subject,
    count: item.count,
  }));

  const total = chartData.reduce((acc, curr) => acc + curr.count, 0);

  if (total === 0) {
    return (
      <div className="bg-paper-cream border border-graphite-border rounded-lg p-6 h-[380px] flex flex-col justify-between">
        <h3 className="text-headline-md text-ink-black">Documents by Subject</h3>
        <div className="flex-grow">
          <DashboardEmptyState />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-paper-cream border border-graphite-border rounded-lg p-6 h-[380px] flex flex-col justify-between">
      <h3 className="text-headline-md text-ink-black">Documents by Subject</h3>
      <div className="h-64 relative w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e3e2df" />
            <XAxis dataKey="name" tickLine={false} axisLine={false} stroke="#585e6b" fontSize={12} />
            <YAxis tickLine={false} axisLine={false} stroke="#585e6b" fontSize={12} allowDecimals={false} />
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
            <Bar dataKey="count" fill="#1c1e24" radius={[2, 2, 0, 0]} barSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

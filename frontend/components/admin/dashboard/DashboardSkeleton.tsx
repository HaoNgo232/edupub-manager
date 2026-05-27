import React from 'react';

export default function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* 4 Summary Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter mb-margin-edge">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-paper-cream border border-graphite-border rounded-lg p-6 flex flex-col h-32 justify-between">
            <div className="flex justify-between items-start">
              <div className="h-4 w-24 bg-gray-300 rounded" />
              <div className="h-6 w-6 bg-gray-300 rounded-full" />
            </div>
            <div className="h-8 w-16 bg-gray-300 rounded" />
            <div className="h-3 w-32 bg-gray-300 rounded" />
          </div>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter mb-margin-edge">
        {[1, 2].map((i) => (
          <div key={i} className="bg-paper-cream border border-graphite-border rounded-lg p-6 h-[380px] flex flex-col justify-between">
            <div className="h-6 w-40 bg-gray-300 rounded mb-6" />
            <div className="flex-grow flex items-center justify-center bg-gray-200 rounded h-64" />
          </div>
        ))}
      </div>

      {/* Grade and Role summary Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter mb-margin-edge">
        <div className="lg:col-span-2 bg-paper-cream border border-graphite-border rounded-lg p-6 h-[380px] flex flex-col justify-between">
          <div className="h-6 w-40 bg-gray-300 rounded mb-6" />
          <div className="flex-grow flex items-center justify-center bg-gray-200 rounded h-64" />
        </div>
        <div className="bg-paper-cream border border-graphite-border rounded-lg p-6 h-[380px] flex flex-col justify-between">
          <div className="h-6 w-40 bg-gray-300 rounded mb-6" />
          <div className="grid grid-cols-2 gap-4 flex-grow items-center">
            <div className="bg-white border border-graphite-border rounded p-4 h-32 flex flex-col justify-center items-center gap-2">
              <div className="h-8 w-8 bg-gray-300 rounded-full" />
              <div className="h-6 w-8 bg-gray-300 rounded" />
              <div className="h-3 w-12 bg-gray-300 rounded" />
            </div>
            <div className="bg-white border border-graphite-border rounded p-4 h-32 flex flex-col justify-center items-center gap-2">
              <div className="h-8 w-8 bg-gray-300 rounded-full" />
              <div className="h-6 w-8 bg-gray-300 rounded" />
              <div className="h-3 w-12 bg-gray-300 rounded" />
            </div>
          </div>
        </div>
      </div>

      {/* Tables Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
        {[1, 2].map((i) => (
          <div key={i} className="bg-paper-cream border border-graphite-border rounded-lg overflow-hidden flex flex-col h-[320px]">
            <div className="p-6 border-b border-graphite-border bg-[#f4f4f0] flex justify-between items-center">
              <div className="h-6 w-36 bg-gray-300 rounded" />
              <div className="h-4 w-12 bg-gray-300 rounded" />
            </div>
            <div className="p-6 space-y-4 bg-white flex-grow">
              {[1, 2, 3].map((j) => (
                <div key={j} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-gray-300 rounded" />
                    <div className="h-3 w-20 bg-gray-300 rounded" />
                  </div>
                  <div className="h-6 w-16 bg-gray-300 rounded" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

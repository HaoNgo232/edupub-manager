import React from 'react';

interface DashboardErrorStateProps {
  onRetry: () => void;
  errorMessage?: string | null;
}

export default function DashboardErrorState({ onRetry, errorMessage }: DashboardErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center bg-paper-cream border border-graphite-border rounded-lg p-8 my-6 max-w-md mx-auto">
      <span className="material-symbols-outlined text-[48px] text-[#ba1a1a] mb-4">
        error
      </span>
      <h3 className="text-headline-md font-bold text-ink-black mb-2">
        Unable to load dashboard
      </h3>
      <p className="font-body-md text-[#76777b] mb-6">
        {errorMessage || 'Something went wrong while loading dashboard statistics.'}
      </p>
      <button
        onClick={onRetry}
        className="px-6 py-2.5 bg-[#030509] text-white font-label-md text-label-md rounded flex items-center hover:opacity-90 transition-opacity active:scale-[0.98]"
      >
        <span className="material-symbols-outlined mr-2 text-sm">refresh</span>
        Retry
      </button>
    </div>
  );
}

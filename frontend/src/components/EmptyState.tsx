import React from 'react';
import { SearchX, RotateCcw } from 'lucide-react';

interface EmptyStateProps {
  onReset: () => void;
  hasFilters: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onReset, hasFilters }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center shadow-xl space-y-4 max-w-lg mx-auto my-8">
      <div className="w-16 h-16 rounded-full bg-slate-800/80 text-slate-400 flex items-center justify-center mx-auto border border-slate-700">
        <SearchX className="w-8 h-8" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-white">No projects found</h3>
        <p className="text-sm text-slate-400 mt-1">
          {hasFilters
            ? 'No projects match your current search query or FDV threshold.'
            : 'No cryptocurrency projects meet all strict criteria at this moment.'}
        </p>
      </div>
      {hasFilters && (
        <button
          onClick={onReset}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium inline-flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset all filters</span>
        </button>
      )}
    </div>
  );
};

export const LoadingSkeleton: React.FC = () => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 shadow-xl">
      <div className="h-6 w-48 bg-slate-800 rounded animate-pulse" />
      <div className="space-y-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-14 bg-slate-800/60 rounded-lg animate-pulse flex items-center px-4 justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-700 animate-pulse" />
              <div className="space-y-1.5">
                <div className="h-3 w-28 bg-slate-700 rounded" />
                <div className="h-2 w-16 bg-slate-700/80 rounded" />
              </div>
            </div>
            <div className="h-4 w-20 bg-slate-700 rounded" />
            <div className="h-4 w-24 bg-slate-700 rounded" />
            <div className="h-4 w-20 bg-slate-700 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
};

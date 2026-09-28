import React from 'react';
import { RefreshCw, TrendingUp } from 'lucide-react';

interface HeaderProps {
  onRefresh: () => void;
  isLoading: boolean;
  totalProjects: number;
}

export const Header: React.FC<HeaderProps> = ({
  onRefresh,
  isLoading,
  totalProjects,
}) => {
  return (
    <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-lg font-bold tracking-tight text-white">Crypto Screener</span>
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">•</span>
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">
              {totalProjects} Assets Tracked
            </span>
          </div>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-3">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-200 text-xs font-medium flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            title="Refresh market data"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>
    </header>
  );
};

import React from 'react';
import { Search, Filter, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import type { SortField, SortDirection } from '../types/project';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  maxFdv: number;
  onMaxFdvChange: (val: number) => void;
  sortField: SortField;
  sortDirection: SortDirection;
  onSortChange: (field: SortField) => void;
  applyStrictFilters: boolean;
  onToggleStrictFilters: () => void;
  onReset: () => void;
  filteredCount: number;
  totalCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  maxFdv,
  onMaxFdvChange,
  sortField,
  sortDirection,
  onSortChange,
  applyStrictFilters,
  onToggleStrictFilters,
  onReset,
  filteredCount,
  totalCount,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-lg space-y-4">
      {/* Top row: Search input + View mode toggle + Reset */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search projects by name or symbol (e.g. 'eth', 'blast')..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-12 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Toggle & Reset */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleStrictFilters}
            className={`px-3 py-2 rounded-lg text-xs font-medium border flex items-center gap-2 transition-all cursor-pointer ${
              applyStrictFilters
                ? 'bg-blue-600/15 text-blue-400 border-blue-500/30'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Screener Criteria:</span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
              applyStrictFilters ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400'
            }`}>
              {applyStrictFilters ? 'ON' : 'OFF'}
            </span>
          </button>

          <button
            onClick={onReset}
            className="px-3 py-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Reset filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Bottom row: FDV Filter slider + Quick Sort Buttons + Counter */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center pt-3 border-t border-slate-800/80">
        {/* FDV Filter Slider */}
        <div className="md:col-span-6 flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-slate-300 font-medium">
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
              Maximum FDV Filter:
            </span>
            <span className="font-mono font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
              ≤ {formatCurrency(maxFdv)}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="1000000"
              max="100000000"
              step="1000000"
              value={maxFdv}
              onChange={(e) => onMaxFdvChange(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>$1M</span>
            <span>$50M</span>
            <span>$100M</span>
          </div>
        </div>

        {/* Sorting options */}
        <div className="md:col-span-4 flex items-center gap-2">
          <span className="text-xs text-slate-400 whitespace-nowrap">Sort by:</span>

          <button
            onClick={() => onSortChange('market_cap')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 border transition-all cursor-pointer ${
              sortField === 'market_cap'
                ? 'bg-blue-600/20 text-blue-300 border-blue-500/40'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <span>Market Cap</span>
            {sortField === 'market_cap' && (
              <span className="text-[10px] font-bold text-blue-400">
                {sortDirection === 'desc' ? '↓' : '↑'}
              </span>
            )}
          </button>

          <button
            onClick={() => onSortChange('total_volume')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 border transition-all cursor-pointer ${
              sortField === 'total_volume'
                ? 'bg-blue-600/20 text-blue-300 border-blue-500/40'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <span>24h Volume</span>
            {sortField === 'total_volume' && (
              <span className="text-[10px] font-bold text-blue-400">
                {sortDirection === 'desc' ? '↓' : '↑'}
              </span>
            )}
          </button>
        </div>

        {/* Counter */}
        <div className="md:col-span-2 flex justify-start md:justify-end">
          <span className="text-xs text-slate-400 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800">
            Showing <strong className="text-white">{filteredCount}</strong> of {totalCount}
          </span>
        </div>
      </div>
    </div>
  );
};

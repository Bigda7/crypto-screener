import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { ProjectTable } from './components/ProjectTable';
import { EmptyState, LoadingSkeleton } from './components/EmptyState';
import { fetchProjects } from './services/api';
import type { Project, SortField, SortDirection } from './types/project';
import { AlertCircle, RefreshCw } from 'lucide-react';

const DEFAULT_MAX_FDV = 100_000_000;

export const App: React.FC = () => {
  // State
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [applyStrictFilters, setApplyStrictFilters] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [maxFdv, setMaxFdv] = useState<number>(DEFAULT_MAX_FDV);
  const [sortField, setSortField] = useState<SortField>('market_cap');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Load data from FastAPI backend
  const loadData = useCallback(async (forceRefresh = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const resp = await fetchProjects({
        applyFilters: applyStrictFilters,
        forceRefresh,
      });
      setProjects(resp.data);
    } catch (err: unknown) {
      console.error('Failed to load crypto projects:', err);
      const msg = err instanceof Error ? err.message : 'Network error';
      setError(`Unable to connect to API service: ${msg}`);
    } finally {
      setIsLoading(false);
    }
  }, [applyStrictFilters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSortChange = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setMaxFdv(DEFAULT_MAX_FDV);
    setSortField('market_cap');
    setSortDirection('desc');
    setApplyStrictFilters(true);
  };

  // Filter & Sort Pipeline
  const processedProjects = useMemo(() => {
    let result = [...projects];

    // 1. Partial match search (name or symbol)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || p.symbol.toLowerCase().includes(q)
      );
    }

    // 2. User-defined FDV filter
    result = result.filter((p) => {
      if (p.fully_diluted_valuation === null || p.fully_diluted_valuation === undefined) {
        return false;
      }
      return p.fully_diluted_valuation <= maxFdv;
    });

    // 3. Sorting by Market Cap or 24h Volume
    result.sort((a, b) => {
      const valA = a[sortField] ?? 0;
      const valB = b[sortField] ?? 0;
      if (sortDirection === 'asc') {
        return valA - valB;
      }
      return valB - valA;
    });

    return result;
  }, [projects, searchQuery, maxFdv, sortField, sortDirection]);

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    maxFdv < DEFAULT_MAX_FDV ||
    !applyStrictFilters;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      {/* Navigation Header */}
      <Header
        onRefresh={() => loadData(true)}
        isLoading={isLoading}
        totalProjects={projects.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
        {/* Error notification */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 flex items-center justify-between gap-4 text-rose-300">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
              <div className="text-sm font-medium">{error}</div>
            </div>
            <button
              onClick={() => loadData(true)}
              className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Filter Controls */}
        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          maxFdv={maxFdv}
          onMaxFdvChange={setMaxFdv}
          sortField={sortField}
          sortDirection={sortDirection}
          onSortChange={handleSortChange}
          applyStrictFilters={applyStrictFilters}
          onToggleStrictFilters={() => setApplyStrictFilters((prev) => !prev)}
          onReset={handleResetFilters}
          filteredCount={processedProjects.length}
          totalCount={projects.length}
        />

        {/* Content Table / Loading / Empty */}
        {isLoading && projects.length === 0 ? (
          <LoadingSkeleton />
        ) : processedProjects.length === 0 ? (
          <EmptyState onReset={handleResetFilters} hasFilters={hasActiveFilters} />
        ) : (
          <ProjectTable
            projects={processedProjects}
            sortField={sortField}
            sortDirection={sortDirection}
            onSortChange={handleSortChange}
          />
        )}
      </main>

      {/* Clean Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Crypto Screener</span>
          <span>Market data sourced from CoinGecko API</span>
        </div>
      </footer>
    </div>
  );
};

export default App;

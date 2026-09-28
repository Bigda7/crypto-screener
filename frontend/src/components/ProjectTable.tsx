import React from 'react';
import { ArrowUp, ArrowDown, ArrowUpDown, Check, AlertCircle, Coins } from 'lucide-react';
import { formatCurrency, formatSupply } from '../utils/formatters';
import type { Project, SortField, SortDirection } from '../types/project';

interface ProjectTableProps {
  projects: Project[];
  sortField: SortField;
  sortDirection: SortDirection;
  onSortChange: (field: SortField) => void;
}

export const ProjectTable: React.FC<ProjectTableProps> = ({
  projects,
  sortField,
  sortDirection,
  onSortChange,
}) => {
  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-500 opacity-60 group-hover:opacity-100 transition-opacity" />;
    }
    return sortDirection === 'desc' ? (
      <ArrowDown className="w-3.5 h-3.5 text-blue-400" />
    ) : (
      <ArrowUp className="w-3.5 h-3.5 text-blue-400" />
    );
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/60 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <th className="py-3.5 px-4 w-12 text-center">#</th>
              <th className="py-3.5 px-4">Project</th>
              <th className="py-3.5 px-4 text-right">Price</th>
              
              {/* Sortable: Market Cap */}
              <th
                onClick={() => onSortChange('market_cap')}
                className="py-3.5 px-4 text-right cursor-pointer select-none group hover:text-white transition-colors"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Market Cap</span>
                  {renderSortIcon('market_cap')}
                </div>
              </th>

              {/* Sortable: 24h Volume */}
              <th
                onClick={() => onSortChange('total_volume')}
                className="py-3.5 px-4 text-right cursor-pointer select-none group hover:text-white transition-colors"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>24h Volume</span>
                  {renderSortIcon('total_volume')}
                </div>
              </th>

              <th className="py-3.5 px-4 text-right">FDV</th>
              <th className="py-3.5 px-4 text-right">TVL</th>
              <th className="py-3.5 px-4 text-center">Supply (Max == Total)</th>
              <th className="py-3.5 px-4 text-center">Preview Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-sm">
            {projects.map((project, idx) => {
              const supplyEqual =
                project.max_supply !== null &&
                project.max_supply !== undefined &&
                project.total_supply !== null &&
                project.total_supply !== undefined &&
                project.max_supply === project.total_supply;

              return (
                <tr
                  key={project.id}
                  className="hover:bg-slate-800/40 transition-colors group"
                >
                  {/* Rank */}
                  <td className="py-4 px-4 text-center text-xs text-slate-500 font-mono">
                    {project.market_cap_rank || idx + 1}
                  </td>

                  {/* Project Name & Symbol */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      {project.image ? (
                        <img
                          src={project.image}
                          alt={project.name}
                          className="w-8 h-8 rounded-full bg-slate-800 p-0.5 object-cover flex-shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                          <Coins className="w-4 h-4" />
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                          {project.name}
                        </div>
                        <div className="text-xs text-slate-400 font-mono uppercase">
                          {project.symbol}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Price */}
                  <td className="py-4 px-4 text-right font-mono text-slate-200">
                    {project.current_price !== undefined && project.current_price !== null
                      ? formatCurrency(project.current_price)
                      : '—'}
                  </td>

                  {/* Market Cap */}
                  <td className="py-4 px-4 text-right font-mono font-medium text-slate-100">
                    {formatCurrency(project.market_cap)}
                  </td>

                  {/* 24h Volume */}
                  <td className="py-4 px-4 text-right font-mono text-slate-200">
                    {formatCurrency(project.total_volume)}
                  </td>

                  {/* FDV */}
                  <td className="py-4 px-4 text-right font-mono text-slate-300">
                    {formatCurrency(project.fully_diluted_valuation)}
                  </td>

                  {/* TVL */}
                  <td className="py-4 px-4 text-right font-mono text-emerald-400">
                    {formatCurrency(project.tvl)}
                  </td>

                  {/* Supply Status */}
                  <td className="py-4 px-4 text-center">
                    {supplyEqual ? (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <Check className="w-3 h-3" />
                        <span className="font-mono text-[11px]">{formatSupply(project.total_supply)}</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20" title={`Max: ${formatSupply(project.max_supply)}, Total: ${formatSupply(project.total_supply)}`}>
                        <AlertCircle className="w-3 h-3" />
                        <span className="text-[11px]">Mismatch</span>
                      </div>
                    )}
                  </td>

                  {/* Preview Listing Badge */}
                  <td className="py-4 px-4 text-center">
                    {project.preview_listing ? (
                      <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                        Preview
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-400">
                        Listed
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

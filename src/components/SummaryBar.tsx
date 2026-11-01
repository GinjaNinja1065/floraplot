import React from 'react';
import { HEIGHT_TIERS, HeightTierId, PlotData } from '../types/survey';
import { BarChart3, Layers, ChevronDown, ChevronUp } from 'lucide-react';

interface SummaryBarProps {
  plot: PlotData;
  activeTierFilter: HeightTierId | null;
  onSelectTierFilter: (tierId: HeightTierId | null) => void;
  isCompact?: boolean;
}

export const SummaryBar: React.FC<SummaryBarProps> = ({
  plot,
  activeTierFilter,
  onSelectTierFilter,
}) => {
  // Compute totals for each of the 9 height tiers across all species in this plot
  const tierTotals: Record<HeightTierId, number> = {
    under_0_1: 0,
    '0_1_to_0_5': 0,
    '0_5_to_1_0': 0,
    '1_0_to_1_5': 0,
    '1_5_to_2_0': 0,
    '2_0_to_2_5': 0,
    '2_5_to_5_0': 0,
    '5_0_to_10_0': 0,
    over_10: 0,
  };

  let grandTotal = 0;
  plot.speciesList.forEach((sp) => {
    HEIGHT_TIERS.forEach((tier) => {
      const val = sp.counts[tier.id] || 0;
      tierTotals[tier.id] += val;
      grandTotal += val;
    });
  });

  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <div className="w-full bg-slate-900/90 border-b border-slate-800 shadow-md backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5">
        {/* Header row with Grand Total and plot indicator */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>CATEGORY TOTALS</span>
            </div>
            <span className="text-xs text-slate-400 hidden sm:inline">
              (All species combined in {plot.name})
            </span>
            {activeTierFilter && (
              <button
                onClick={() => onSelectTierFilter(null)}
                className="text-xs text-amber-400 hover:underline flex items-center gap-1 bg-amber-950/40 border border-amber-800/60 px-2 py-0.5 rounded"
              >
                Filtered: {HEIGHT_TIERS.find((t) => t.id === activeTierFilter)?.label} (Click to clear)
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-baseline gap-1.5 bg-slate-800/90 border border-slate-700 px-2.5 py-0.5 rounded-lg">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Total Plants:</span>
              <span className="text-sm sm:text-base font-extrabold text-white font-mono-numbers">{grandTotal}</span>
            </div>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="sm:hidden text-xs text-slate-400 p-1 hover:text-white rounded"
              aria-label="Toggle details"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* 9 Height Increments Grid - Always visible and scannable */}
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-1.5 sm:gap-2">
          {HEIGHT_TIERS.map((tier) => {
            const count = tierTotals[tier.id];
            const pct = grandTotal > 0 ? Math.round((count / grandTotal) * 100) : 0;
            const isSelected = activeTierFilter === tier.id;

            return (
              <button
                key={tier.id}
                onClick={() => onSelectTierFilter(isSelected ? null : tier.id)}
                className={`flex flex-col items-center justify-between p-1.5 sm:p-2 rounded-xl transition-all border text-left relative overflow-hidden ${
                  isSelected
                    ? 'ring-2 ring-emerald-400 bg-slate-800 border-emerald-500 scale-[1.02] shadow-lg'
                    : count > 0
                    ? 'bg-slate-800/80 border-slate-700/80 hover:border-slate-600 hover:bg-slate-800'
                    : 'bg-slate-900/60 border-slate-800/60 opacity-70 hover:opacity-100 hover:border-slate-700'
                }`}
                title={`Click to filter species with plants in ${tier.rangeText}`}
              >
                {/* Visual bar fill indicator at the bottom */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500/60 transition-all"
                  style={{ width: `${pct}%` }}
                />

                <div className="w-full flex items-center justify-between text-[11px] sm:text-xs">
                  <span className={`font-bold truncate ${isSelected ? 'text-emerald-300' : 'text-slate-300'}`}>
                    {tier.label}
                  </span>
                  {count > 0 && (
                    <span className="text-[10px] text-slate-400 font-mono-numbers hidden lg:inline">
                      {pct}%
                    </span>
                  )}
                </div>

                <div className="w-full flex items-baseline justify-between mt-1">
                  <span className="text-base sm:text-lg font-black text-white font-mono-numbers">
                    {count}
                  </span>
                  <span className="text-[9px] uppercase tracking-tight text-slate-400 truncate max-w-[50px] hidden sm:inline">
                    {tier.stratum.split('/')[0]}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

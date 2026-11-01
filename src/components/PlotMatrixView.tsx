import React, { useState } from 'react';
import { HEIGHT_TIERS, HeightTierId, PlotData, SpeciesRecord } from '../types/survey';
import { Plus, Minus, Sprout, ArrowRight, Table, Sparkles } from 'lucide-react';
import { playTallySound, triggerHaptic } from '../utils/audio';

interface PlotMatrixViewProps {
  plot: PlotData;
  onSelectSpecies: (speciesId: string) => void;
  onTally: (speciesId: string, tierId: HeightTierId, delta: number) => void;
  onAddSpeciesModalOpen: () => void;
  soundEnabled: boolean;
  hapticEnabled: boolean;
}

export const PlotMatrixView: React.FC<PlotMatrixViewProps> = ({
  plot,
  onSelectSpecies,
  onTally,
  onAddSpeciesModalOpen,
  soundEnabled,
  hapticEnabled,
}) => {
  // Compute column totals (summary total for each of the 9 categories)
  const columnTotals: Record<HeightTierId, number> = {
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
      columnTotals[tier.id] += val;
      grandTotal += val;
    });
  });

  const handleCellIncrement = (speciesId: string, tierId: HeightTierId, e: React.MouseEvent) => {
    e.stopPropagation();
    if (soundEnabled) playTallySound('increment');
    if (hapticEnabled) triggerHaptic(20);
    onTally(speciesId, tierId, 1);
  };

  const handleCellDecrement = (speciesId: string, tierId: HeightTierId, current: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (current <= 0) return;
    if (soundEnabled) playTallySound('decrement');
    if (hapticEnabled) triggerHaptic(15);
    onTally(speciesId, tierId, -1);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 py-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Table className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Full Plot Survey Matrix</h3>
              <p className="text-xs text-slate-400">
                Species by 9 height increments. Click any species row or cell to jump into large button tally mode.
              </p>
            </div>
          </div>

          <button
            onClick={onAddSpeciesModalOpen}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Species</span>
          </button>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/70 border-b border-slate-800 text-slate-400">
                <th className="p-3 font-bold uppercase tracking-wider sticky left-0 bg-slate-950/95 z-10 min-w-[180px]">
                  Species
                </th>
                {HEIGHT_TIERS.map((tier) => (
                  <th key={tier.id} className="p-2.5 text-center font-bold min-w-[85px] border-l border-slate-800/60">
                    <div className="text-white font-extrabold">{tier.label}</div>
                    <div className="text-[10px] text-slate-500 font-normal">{tier.stratum.split('/')[0]}</div>
                  </th>
                ))}
                <th className="p-3 text-right font-black text-emerald-400 uppercase tracking-wider min-w-[90px] border-l border-slate-800 bg-slate-950/80">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {plot.speciesList.length === 0 ? (
                <tr>
                  <td colSpan={11} className="p-8 text-center text-slate-500">
                    No species in this plot yet. Click &quot;Add Species&quot; to begin.
                  </td>
                </tr>
              ) : (
                plot.speciesList.map((sp) => {
                  const speciesSum = Object.values(sp.counts).reduce((a, b) => a + b, 0);

                  return (
                    <tr
                      key={sp.id}
                      onClick={() => onSelectSpecies(sp.id)}
                      className="hover:bg-slate-800/60 cursor-pointer transition-colors group"
                    >
                      {/* Species name cell (sticky left) */}
                      <td className="p-3 sticky left-0 bg-slate-900 group-hover:bg-slate-800/90 z-10 border-r border-slate-800/80">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: sp.colorTag || '#10b981' }}
                          />
                          <div className="flex flex-col">
                            <span className="font-bold text-white group-hover:text-emerald-300 transition-colors">
                              {sp.name}
                            </span>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                              {sp.code && <span className="font-mono-numbers">{sp.code}</span>}
                              {sp.growthForm && <span>&bull; {sp.growthForm}</span>}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 9 Height Tier Cells */}
                      {HEIGHT_TIERS.map((tier) => {
                        const count = sp.counts[tier.id] || 0;
                        return (
                          <td
                            key={tier.id}
                            className={`p-1.5 text-center border-l border-slate-800/40 relative ${
                              count > 0 ? 'bg-slate-800/30' : ''
                            }`}
                          >
                            <div className="flex items-center justify-center gap-1">
                              {count > 0 && (
                                <button
                                  onClick={(e) => handleCellDecrement(sp.id, tier.id, count, e)}
                                  className="w-5 h-5 rounded flex items-center justify-center bg-slate-800 hover:bg-red-950/80 text-slate-400 hover:text-red-300 transition opacity-0 group-hover:opacity-100"
                                  title="Minus 1"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                              )}

                              <span
                                className={`font-mono-numbers font-bold text-sm min-w-[24px] ${
                                  count > 0 ? 'text-white font-extrabold' : 'text-slate-600'
                                }`}
                              >
                                {count}
                              </span>

                              <button
                                onClick={(e) => handleCellIncrement(sp.id, tier.id, e)}
                                className="w-5 h-5 rounded flex items-center justify-center bg-slate-800 hover:bg-emerald-600 text-slate-400 hover:text-white transition opacity-0 group-hover:opacity-100"
                                title="Add 1"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                        );
                      })}

                      {/* Species Total */}
                      <td className="p-3 text-right font-black font-mono-numbers text-sm text-emerald-300 border-l border-slate-800 bg-slate-900/50">
                        {speciesSum}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {/* Summary Totals Row (always visible at bottom of matrix) */}
            <tfoot>
              <tr className="bg-slate-950 font-black border-t-2 border-emerald-600/80 text-white">
                <td className="p-3 sticky left-0 bg-slate-950 z-10 text-emerald-400 uppercase tracking-wider text-xs">
                  CATEGORY TOTALS
                </td>
                {HEIGHT_TIERS.map((tier) => (
                  <td key={tier.id} className="p-3 text-center border-l border-slate-800 text-sm font-mono-numbers">
                    <span className="text-white drop-shadow-sm">
                      {columnTotals[tier.id]}
                    </span>
                  </td>
                ))}
                <td className="p-3 text-right text-base font-black font-mono-numbers text-emerald-400 border-l border-slate-800">
                  {grandTotal}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

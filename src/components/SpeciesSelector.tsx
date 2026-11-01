import React, { useState } from 'react';
import { PlotData, SpeciesRecord } from '../types/survey';
import { Plus, X, Check, Edit2, Trash2, Sprout, ChevronRight } from 'lucide-react';
import { playTallySound } from '../utils/audio';

interface SpeciesSelectorProps {
  plot: PlotData;
  activeSpeciesId: string | null;
  onSelectSpecies: (speciesId: string | null) => void;
  onAddSpeciesModalOpen: () => void;
  onDeleteSpecies: (speciesId: string) => void;
  soundEnabled: boolean;
}

export const SpeciesSelector: React.FC<SpeciesSelectorProps> = ({
  plot,
  activeSpeciesId,
  onSelectSpecies,
  onAddSpeciesModalOpen,
  onDeleteSpecies,
  soundEnabled,
}) => {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleSelect = (id: string) => {
    if (activeSpeciesId === id) {
      // Click off to deselect
      if (soundEnabled) playTallySound('switch');
      onSelectSpecies(null);
    } else {
      if (soundEnabled) playTallySound('switch');
      onSelectSpecies(id);
    }
  };

  const getSpeciesTotal = (sp: SpeciesRecord) => {
    return Object.values(sp.counts).reduce((sum, val) => sum + val, 0);
  };

  return (
    <div className="w-full bg-slate-900/60 border-b border-slate-800 p-3 sm:p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sprout className="w-3.5 h-3.5 text-emerald-400" />
              <span>Plot Species ({plot.speciesList.length})</span>
            </span>
            <span className="text-[11px] text-slate-500 hidden sm:inline">
              — Tap a species to tally; tap again or click off to deselect.
            </span>
          </div>

          <div className="flex items-center gap-2">
            {activeSpeciesId && (
              <button
                onClick={() => {
                  if (soundEnabled) playTallySound('switch');
                  onSelectSpecies(null);
                }}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              >
                Click off (Deselect)
              </button>
            )}

            <button
              onClick={onAddSpeciesModalOpen}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Species</span>
            </button>
          </div>
        </div>

        {/* Horizontal or Wrap Chips */}
        {plot.speciesList.length === 0 ? (
          <div className="p-6 text-center rounded-2xl border-2 border-dashed border-slate-800 bg-slate-950/40">
            <Sprout className="w-8 h-8 mx-auto text-slate-600 mb-2" />
            <p className="text-sm font-semibold text-slate-300">No species added to this plot yet</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Add your first plant species to start counting across the 9 height increments.
            </p>
            <button
              onClick={onAddSpeciesModalOpen}
              className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Species</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 sm:gap-2.5 items-stretch">
            {plot.speciesList.map((sp, idx) => {
              const isActive = activeSpeciesId === sp.id;
              const totalCount = getSpeciesTotal(sp);
              const isConfirmingDelete = deleteConfirmId === sp.id;

              return (
                <div
                  key={sp.id}
                  className={`group relative flex items-center rounded-xl transition-all border select-none ${
                    isActive
                      ? 'bg-emerald-950/60 border-emerald-400 ring-2 ring-emerald-500/80 shadow-lg shadow-emerald-950/30'
                      : 'bg-slate-800/90 border-slate-700 hover:border-slate-500 hover:bg-slate-800'
                  }`}
                >
                  {/* Color bar on left edge */}
                  <div
                    className="w-1.5 self-stretch rounded-l-xl"
                    style={{ backgroundColor: sp.colorTag || '#10b981' }}
                  />

                  {/* Main Clickable Area to switch into this species */}
                  <button
                    onClick={() => handleSelect(sp.id)}
                    className="flex items-center gap-2.5 py-2 px-3 text-left focus:outline-none"
                    title={`Click to select ${sp.name} for height tallying`}
                  >
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-xs sm:text-sm font-bold leading-tight ${
                            isActive ? 'text-emerald-200' : 'text-slate-100'
                          }`}
                        >
                          {sp.name}
                        </span>
                        {sp.code && (
                          <span className="text-[10px] font-mono-numbers px-1.5 py-0.2 rounded bg-slate-700/80 text-slate-300 font-semibold">
                            {sp.code}
                          </span>
                        )}
                      </div>
                      {sp.growthForm && (
                        <span className="text-[10px] text-slate-400 mt-0.5">
                          {sp.growthForm}
                        </span>
                      )}
                    </div>

                    {/* Total Count badge */}
                    <div
                      className={`ml-2 px-2.5 py-0.5 rounded-lg text-xs font-black font-mono-numbers ${
                        isActive
                          ? 'bg-emerald-500 text-slate-950 font-bold'
                          : totalCount > 0
                          ? 'bg-slate-700 text-slate-200'
                          : 'bg-slate-900/80 text-slate-500'
                      }`}
                    >
                      {totalCount}
                    </div>

                    {isActive && (
                      <span className="text-emerald-400 animate-pulse ml-0.5">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    )}
                  </button>

                  {/* Delete / remove button */}
                  <div className="pr-1.5 pl-0.5 border-l border-slate-700/50">
                    {isConfirmingDelete ? (
                      <div className="flex items-center gap-1 bg-red-950/80 px-1.5 py-1 rounded-lg border border-red-700">
                        <button
                          onClick={() => {
                            onDeleteSpecies(sp.id);
                            setDeleteConfirmId(null);
                          }}
                          className="text-[10px] font-bold text-red-300 hover:text-white px-1"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="text-slate-400 hover:text-white p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirmId(sp.id);
                        }}
                        className="p-1 rounded-md text-slate-500 hover:text-red-400 hover:bg-slate-700/60 opacity-60 group-hover:opacity-100 transition"
                        title="Remove species from plot"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

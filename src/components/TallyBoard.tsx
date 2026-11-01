import React, { useEffect, useState } from 'react';
import { HEIGHT_TIERS, HeightTierId, PlotData, SpeciesRecord } from '../types/survey';
import { playTallySound, triggerHaptic } from '../utils/audio';
import { Undo2, Minus, Plus, Check, ArrowRight, MousePointerClick, Volume2, VolumeX, Sparkles } from 'lucide-react';

interface TallyBoardProps {
  plot: PlotData;
  activeSpecies: SpeciesRecord | null;
  onTally: (speciesId: string, tierId: HeightTierId, delta: number) => void;
  onUndo: () => void;
  canUndo: boolean;
  onDeselect: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  hapticEnabled: boolean;
  onToggleHaptic: () => void;
  onSelectSpecies: (speciesId: string) => void;
}

export const TallyBoard: React.FC<TallyBoardProps> = ({
  plot,
  activeSpecies,
  onTally,
  onUndo,
  canUndo,
  onDeselect,
  soundEnabled,
  onToggleSound,
  hapticEnabled,
  onToggleHaptic,
  onSelectSpecies,
}) => {
  const [stepSize, setStepSize] = useState<number>(1);
  const [lastTappedTier, setLastTappedTier] = useState<HeightTierId | null>(null);

  // Compute plot-wide category totals
  const plotCategoryTotals: Record<HeightTierId, number> = {
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

  plot.speciesList.forEach((sp) => {
    HEIGHT_TIERS.forEach((tier) => {
      plotCategoryTotals[tier.id] += sp.counts[tier.id] || 0;
    });
  });

  const handleIncrement = (tierId: HeightTierId, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!activeSpecies) return;

    if (soundEnabled) playTallySound('increment');
    if (hapticEnabled) triggerHaptic(25);

    setLastTappedTier(tierId);
    setTimeout(() => setLastTappedTier(null), 300);

    onTally(activeSpecies.id, tierId, stepSize);
  };

  const handleDecrement = (tierId: HeightTierId, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activeSpecies) return;
    const currentCount = activeSpecies.counts[tierId] || 0;
    if (currentCount <= 0) return;

    const actualDelta = Math.min(stepSize, currentCount);
    if (soundEnabled) playTallySound('decrement');
    if (hapticEnabled) triggerHaptic(15);

    onTally(activeSpecies.id, tierId, -actualDelta);
  };

  // Keyboard number keys 1-9 for rapid tallying
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (!activeSpecies) return;

      const key = e.key;
      if (key >= '1' && key <= '9') {
        const index = parseInt(key, 10) - 1;
        if (index >= 0 && index < HEIGHT_TIERS.length) {
          const tier = HEIGHT_TIERS[index];
          if (e.shiftKey) {
            // Shift + number = decrement
            const current = activeSpecies.counts[tier.id] || 0;
            if (current > 0) {
              if (soundEnabled) playTallySound('decrement');
              onTally(activeSpecies.id, tier.id, -1);
            }
          } else {
            if (soundEnabled) playTallySound('increment');
            if (hapticEnabled) triggerHaptic(25);
            setLastTappedTier(tier.id);
            setTimeout(() => setLastTappedTier(null), 300);
            onTally(activeSpecies.id, tier.id, stepSize);
          }
        }
      } else if (key === 'z' && (e.ctrlKey || e.metaKey)) {
        if (canUndo) onUndo();
      } else if (key === 'Escape') {
        onDeselect();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeSpecies, stepSize, soundEnabled, hapticEnabled, canUndo, onTally, onUndo, onDeselect]);

  // If no species is selected, prompt user to select one
  if (!activeSpecies) {
    return (
      <div className="w-full max-w-4xl mx-auto my-6 px-4">
        <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 text-center shadow-xl">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <MousePointerClick className="w-8 h-8 animate-bounce" />
          </div>
          <h2 className="text-xl font-extrabold text-white">Click a Species to Start Tallying</h2>
          <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
            Select one of the species above (or click one below) to activate the 9 height tally buttons. You can click off anytime to switch species.
          </p>

          {plot.speciesList.length > 0 && (
            <div className="mt-6 flex flex-wrap justify-center gap-2.5 max-w-2xl mx-auto">
              {plot.speciesList.map((sp) => {
                const total = Object.values(sp.counts).reduce((a, b) => a + b, 0);
                return (
                  <button
                    key={sp.id}
                    onClick={() => onSelectSpecies(sp.id)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-emerald-950/60 hover:border-emerald-500 border border-slate-700 transition active:scale-95 text-left group"
                  >
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: sp.colorTag || '#10b981' }}
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white group-hover:text-emerald-300">
                        {sp.name}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {sp.growthForm || 'Flora'} &bull; {total} tallied
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 ml-1" />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  const speciesTotalCount = Object.values(activeSpecies.counts).reduce((a, b) => a + b, 0);

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 py-4">
      {/* Active Species Control Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md mb-4">
        {/* Active Species Info */}
        <div className="flex items-center gap-3">
          <div
            className="w-3.5 h-10 rounded-full"
            style={{ backgroundColor: activeSpecies.colorTag || '#10b981' }}
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-400">
                ACTIVE SPECIES:
              </span>
              {activeSpecies.code && (
                <span className="text-[10px] font-mono-numbers px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                  {activeSpecies.code}
                </span>
              )}
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white leading-tight">
              {activeSpecies.name}
            </h2>
            <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
              <span>{activeSpecies.growthForm || 'Botanical'}</span>
              <span>&bull;</span>
              <span className="text-emerald-300 font-bold font-mono-numbers">
                {speciesTotalCount} plants in this species
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls: Step size, Undo, Sound toggle, Click Off */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Step Size Selector */}
          <div className="flex items-center bg-slate-800 rounded-xl p-1 border border-slate-700">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 hidden sm:inline">
              Step:
            </span>
            {[1, 5, 10].map((step) => (
              <button
                key={step}
                onClick={() => setStepSize(step)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                  stepSize === step
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title={`Count by ${step} per press`}
              >
                +{step}
              </button>
            ))}
          </div>

          {/* Undo Button */}
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border transition ${
              canUndo
                ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 active:scale-95'
                : 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
            }`}
            title="Undo last tally (Ctrl+Z)"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Undo</span>
          </button>

          {/* Sound / Haptic Quick Toggles */}
          <button
            onClick={onToggleSound}
            className={`p-2 rounded-xl border text-xs transition ${
              soundEnabled
                ? 'bg-slate-800 border-slate-700 text-emerald-400'
                : 'bg-slate-900 border-slate-800 text-slate-600'
            }`}
            title={soundEnabled ? 'Mute tally clicks' : 'Enable tally clicks'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Click off button */}
          <button
            onClick={onDeselect}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            title="Deselect species (Esc)"
          >
            <span>Click off</span>
          </button>
        </div>
      </div>

      {/* 9 Height Increments Tally Buttons Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        {HEIGHT_TIERS.map((tier, idx) => {
          const currentCount = activeSpecies.counts[tier.id] || 0;
          const plotTierTotal = plotCategoryTotals[tier.id] || 0;
          const isJustTapped = lastTappedTier === tier.id;

          return (
            <div
              key={tier.id}
              onClick={(e) => handleIncrement(tier.id, e)}
              className={`tally-button group relative flex flex-col justify-between p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all active:scale-[0.98] select-none ${
                tier.colorClass.border
              } ${tier.colorClass.bg} ${
                isJustTapped ? 'ring-4 ring-emerald-400 scale-[0.98]' : 'hover:border-slate-500'
              } shadow-lg`}
              role="button"
              tabIndex={0}
              aria-label={`Tally ${activeSpecies.name} at ${tier.label}`}
            >
              {/* Top Row: Height increment label & key shortcut badge */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      {tier.label}
                    </span>
                    <span className="text-[10px] font-mono-numbers px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-400">
                      Key: {idx + 1}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 block mt-0.5">
                    {tier.stratum}
                  </span>
                </div>

                {/* Plot Total comparison pill */}
                <div
                  className="flex flex-col items-end text-right px-2 py-1 rounded-lg bg-slate-900/80 border border-slate-800"
                  title="Summary total for this height category across all species in this plot"
                >
                  <span className="text-[9px] uppercase font-bold text-slate-400">Plot Total</span>
                  <span className="text-xs font-black text-slate-200 font-mono-numbers">
                    {plotTierTotal}
                  </span>
                </div>
              </div>

              {/* Main Counter Display */}
              <div className="my-3 flex items-baseline justify-center gap-2">
                <span className="text-5xl sm:text-6xl font-black text-white font-mono-numbers drop-shadow-md">
                  {currentCount}
                </span>
                <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400">
                  plants
                </span>
              </div>

              {/* Bottom Buttons: Massive tap area indicator and Decrement button */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-700/40">
                {/* Decrement Button */}
                <button
                  onClick={(e) => handleDecrement(tier.id, e)}
                  disabled={currentCount <= 0}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    currentCount > 0
                      ? 'bg-slate-800/90 hover:bg-red-950/80 hover:text-red-300 text-slate-300 border border-slate-700 active:scale-95'
                      : 'opacity-30 text-slate-600 cursor-not-allowed border border-transparent'
                  }`}
                  title="Subtract count (-1)"
                >
                  <Minus className="w-3.5 h-3.5" />
                  <span>1</span>
                </button>

                {/* Big Primary Tap Action Area */}
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-xl shadow-md transition group-hover:shadow-emerald-600/30">
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>+{stepSize} TAP</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Helpful keyboard hint for fieldwork tablets/laptops */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 px-2">
        <span>
          Tip: Press numeric keys <strong className="text-slate-400 font-mono">1–9</strong> for fast touch/keyboard tallies. Hold Shift + number to decrement.
        </span>
        <button
          onClick={onDeselect}
          className="text-emerald-400 hover:text-emerald-300 font-semibold"
        >
          Click off to view plot matrix &rarr;
        </button>
      </div>
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  PlotData,
  SpeciesRecord,
  HeightTierId,
  HEIGHT_TIERS,
  TallyHistoryEntry,
} from './types/survey';
import { createDefaultPlot, createBlankPlot } from './utils/presets';
import { SummaryBar } from './components/SummaryBar';
import { SpeciesSelector } from './components/SpeciesSelector';
import { TallyBoard } from './components/TallyBoard';
import { PlotMatrixView } from './components/PlotMatrixView';
import { AddSpeciesModal } from './components/AddSpeciesModal';
import { ExportModal } from './components/ExportModal';
import { PlotSettingsModal } from './components/PlotSettingsModal';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import {
  Sprout,
  Table,
  Layers,
  FileSpreadsheet,
  Settings,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Vibrate,
  VibrateOff,
  RotateCcw,
} from 'lucide-react';

const STORAGE_KEY = 'floraplot_survey_active_plot_v1';

export default function App() {
  // Load initial plot from localStorage or default botanical survey
  const [plot, setPlot] = useState<PlotData>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && Array.isArray(parsed.speciesList)) {
            return parsed;
          }
        }
      } catch {
        // Fallback to default
      }
    }
    return createDefaultPlot();
  });

  // Active species ID for counting: null means "clicked off"
  const [activeSpeciesId, setActiveSpeciesId] = useState<string | null>(() => {
    return plot.speciesList.length > 0 ? plot.speciesList[0].id : null;
  });

  // Action history for Undo functionality
  const [history, setHistory] = useState<TallyHistoryEntry[]>([]);

  // Modals & UI View state
  const [viewMode, setViewMode] = useState<'tally' | 'matrix'>('tally');
  const [isAddSpeciesOpen, setIsAddSpeciesOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTierFilter, setActiveTierFilter] = useState<HeightTierId | null>(null);

  // Field UX options: Sound, Haptics, High-contrast Sunlight mode
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const [sunlightMode, setSunlightMode] = useState(false);

  // Sync to localStorage for safety in the field (even though data doesn't strictly need to save,
  // preventing accidental loss if mobile browser suspends tab is critical for field work)
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(plot));
    } catch {
      // Ignore quota errors
    }
  }, [plot]);

  // Find currently active species
  const activeSpecies = useMemo(() => {
    if (!activeSpeciesId) return null;
    return plot.speciesList.find((sp) => sp.id === activeSpeciesId) || null;
  }, [plot.speciesList, activeSpeciesId]);

  // Handle tally increment or decrement
  const handleTally = (speciesId: string, tierId: HeightTierId, delta: number) => {
    setPlot((prevPlot) => {
      const targetSp = prevPlot.speciesList.find((sp) => sp.id === speciesId);
      if (!targetSp) return prevPlot;

      const currentVal = targetSp.counts[tierId] || 0;
      const newVal = Math.max(0, currentVal + delta);
      const actualDelta = newVal - currentVal;

      if (actualDelta === 0) return prevPlot;

      // Record in undo history
      setHistory((prevH) => [
        ...prevH.slice(-30),
        {
          speciesId,
          speciesName: targetSp.name,
          tierId,
          delta: actualDelta,
          timestamp: Date.now(),
        },
      ]);

      const updatedSpeciesList = prevPlot.speciesList.map((sp) => {
        if (sp.id !== speciesId) return sp;
        return {
          ...sp,
          counts: {
            ...sp.counts,
            [tierId]: newVal,
          },
        };
      });

      return {
        ...prevPlot,
        speciesList: updatedSpeciesList,
      };
    });
  };

  // Undo last action
  const handleUndo = () => {
    if (history.length === 0) return;

    const lastAction = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));

    setPlot((prevPlot) => {
      const updatedSpeciesList = prevPlot.speciesList.map((sp) => {
        if (sp.id !== lastAction.speciesId) return sp;
        const currentVal = sp.counts[lastAction.tierId] || 0;
        const reversedVal = Math.max(0, currentVal - lastAction.delta);
        return {
          ...sp,
          counts: {
            ...sp.counts,
            [lastAction.tierId]: reversedVal,
          },
        };
      });

      return {
        ...prevPlot,
        speciesList: updatedSpeciesList,
      };
    });
  };

  // Add species to plot
  const handleAddSpecies = (newSpecies: SpeciesRecord) => {
    setPlot((prev) => ({
      ...prev,
      speciesList: [...prev.speciesList, newSpecies],
    }));
    // Automatically select the newly added species
    setActiveSpeciesId(newSpecies.id);
  };

  // Delete species from plot
  const handleDeleteSpecies = (speciesId: string) => {
    setPlot((prev) => ({
      ...prev,
      speciesList: prev.speciesList.filter((sp) => sp.id !== speciesId),
    }));
    if (activeSpeciesId === speciesId) {
      setActiveSpeciesId(null);
    }
  };

  // Update plot metadata
  const handleUpdatePlot = (updated: Partial<PlotData>) => {
    setPlot((prev) => ({
      ...prev,
      ...updated,
    }));
  };

  // Reset all tallies in plot
  const handleResetPlotCounts = () => {
    setPlot((prev) => ({
      ...prev,
      speciesList: prev.speciesList.map((sp) => ({
        ...sp,
        counts: {
          under_0_1: 0,
          '0_1_to_0_5': 0,
          '0_5_to_1_0': 0,
          '1_0_to_1_5': 0,
          '1_5_to_2_0': 0,
          '2_0_to_2_5': 0,
          '2_5_to_5_0': 0,
          '5_0_to_10_0': 0,
          over_10: 0,
        },
      })),
    }));
    setHistory([]);
  };

  // Create brand new blank plot
  const handleNewPlot = () => {
    const newPlot = createBlankPlot(`Plot ${Math.floor(Math.random() * 90 + 10)}`);
    setPlot(newPlot);
    setActiveSpeciesId(null);
    setHistory([]);
  };

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors ${
        sunlightMode
          ? 'bg-neutral-950 text-neutral-100'
          : 'bg-slate-950 text-slate-100'
      }`}
    >
      {/* Offline Status Badge */}
      <OfflineIndicator />

      {/* Primary Field Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 flex items-center justify-between gap-3">
          {/* Logo & Plot Title */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center shadow-md shadow-emerald-900/30 text-white shrink-0">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-white leading-tight">
                  FloraPlot
                </h1>
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  PWA
                </span>
              </div>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-emerald-300 transition text-left"
                title="Edit plot metadata or switch plots"
              >
                <span className="font-semibold text-slate-300 truncate max-w-[140px] sm:max-w-xs">
                  {plot.name}
                </span>
                <span className="text-[10px] text-slate-500">({plot.dimensions || 'Plot'})</span>
              </button>
            </div>
          </div>

          {/* View Toggles & Field Tools */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* View Mode Toggle: Tally Pad vs Matrix Table */}
            <div className="flex items-center bg-slate-800 p-0.5 rounded-xl border border-slate-700">
              <button
                onClick={() => setViewMode('tally')}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                  viewMode === 'tally'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Tally Buttons Mode"
              >
                <Layers className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Tally Pad</span>
              </button>
              <button
                onClick={() => setViewMode('matrix')}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                  viewMode === 'matrix'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Datasheet Table View"
              >
                <Table className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Matrix</span>
              </button>
            </div>

            {/* Sunlight High Contrast Toggle */}
            <button
              onClick={() => setSunlightMode(!sunlightMode)}
              className={`p-2 rounded-xl border text-xs transition ${
                sunlightMode
                  ? 'bg-amber-400 text-neutral-950 border-amber-300 shadow'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
              }`}
              title={sunlightMode ? 'Exit High Contrast Sunlight Mode' : 'Sunlight High-Contrast Mode'}
            >
              <Sun className="w-4 h-4" />
            </button>

            {/* Export Button */}
            <button
              onClick={() => setIsExportOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition"
              title="Download CSV / Copy Summary"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Export</span>
            </button>

            {/* Plot Settings */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition"
              title="Plot details & settings"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* PWA In-App Install Button */}
            <PWAInstallButton />
          </div>
        </div>
      </header>

      {/* SUMMARY BAR: Real-time Category Totals for all 9 height increments visible on screen */}
      <SummaryBar
        plot={plot}
        activeTierFilter={activeTierFilter}
        onSelectTierFilter={(tierId) => setActiveTierFilter(tierId)}
      />

      {/* SPECIES SELECTOR: Fast "click into another species" and "click off" */}
      <SpeciesSelector
        plot={plot}
        activeSpeciesId={activeSpeciesId}
        onSelectSpecies={(id) => setActiveSpeciesId(id)}
        onAddSpeciesModalOpen={() => setIsAddSpeciesOpen(true)}
        onDeleteSpecies={handleDeleteSpecies}
        soundEnabled={soundEnabled}
      />

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 pb-16">
        {viewMode === 'tally' ? (
          <TallyBoard
            plot={plot}
            activeSpecies={activeSpecies}
            onTally={handleTally}
            onUndo={handleUndo}
            canUndo={history.length > 0}
            onDeselect={() => setActiveSpeciesId(null)}
            soundEnabled={soundEnabled}
            onToggleSound={() => setSoundEnabled(!soundEnabled)}
            hapticEnabled={hapticEnabled}
            onToggleHaptic={() => setHapticEnabled(!hapticEnabled)}
            onSelectSpecies={(id) => setActiveSpeciesId(id)}
          />
        ) : (
          <PlotMatrixView
            plot={plot}
            onSelectSpecies={(id) => {
              setActiveSpeciesId(id);
              setViewMode('tally');
            }}
            onTally={handleTally}
            onAddSpeciesModalOpen={() => setIsAddSpeciesOpen(true)}
            soundEnabled={soundEnabled}
            hapticEnabled={hapticEnabled}
          />
        )}
      </main>

      {/* Bottom Sticky Helper Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-slate-900/95 border-t border-slate-800 backdrop-blur-md px-4 py-2 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-300">
            {plot.speciesList.length} Species in {plot.name}
          </span>
          {activeSpecies ? (
            <span className="text-emerald-400 font-bold flex items-center gap-1 truncate max-w-[200px]">
              Tallying: {activeSpecies.name}
            </span>
          ) : (
            <span className="text-slate-500 hidden sm:inline">
              (No species active &bull; Click any species above to count)
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {activeSpecies && (
            <button
              onClick={() => setActiveSpeciesId(null)}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-[11px] border border-slate-700"
            >
              Click off
            </button>
          )}
          <button
            onClick={() => setIsExportOpen(true)}
            className="px-2.5 py-1 rounded bg-emerald-600/90 hover:bg-emerald-500 text-white font-bold text-[11px]"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* MODALS */}
      <AddSpeciesModal
        isOpen={isAddSpeciesOpen}
        onClose={() => setIsAddSpeciesOpen(false)}
        onAddSpecies={handleAddSpecies}
        existingCount={plot.speciesList.length}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        plot={plot}
      />

      <PlotSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        plot={plot}
        onUpdatePlot={handleUpdatePlot}
        onResetPlotCounts={handleResetPlotCounts}
        onNewPlot={handleNewPlot}
      />
    </div>
  );
}

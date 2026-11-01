import React, { useState } from 'react';
import { PlotData } from '../types/survey';
import { X, Settings, RotateCcw, Plus, Trash2 } from 'lucide-react';

interface PlotSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  plot: PlotData;
  onUpdatePlot: (updated: Partial<PlotData>) => void;
  onResetPlotCounts: () => void;
  onNewPlot: () => void;
}

export const PlotSettingsModal: React.FC<PlotSettingsModalProps> = ({
  isOpen,
  onClose,
  plot,
  onUpdatePlot,
  onResetPlotCounts,
  onNewPlot,
}) => {
  const [name, setName] = useState(plot.name);
  const [dimensions, setDimensions] = useState(plot.dimensions || '10m × 10m');
  const [surveyor, setSurveyor] = useState(plot.surveyor || '');
  const [date, setDate] = useState(plot.date);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePlot({
      name: name.trim() || 'Survey Plot',
      dimensions: dimensions.trim(),
      surveyor: surveyor.trim(),
      date,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-5 sm:p-6 text-left">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Plot Details & Settings</h3>
              <p className="text-xs text-slate-400">Configure survey metadata</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-4 space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Plot Name / Code
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Plot 01 - North Transect"
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Plot Dimensions
              </label>
              <input
                type="text"
                value={dimensions}
                onChange={(e) => setDimensions(e.target.value)}
                placeholder="e.g. 10m × 10m"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Survey Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Surveyor Name
            </label>
            <input
              type="text"
              value={surveyor}
              onChange={(e) => setSurveyor(e.target.value)}
              placeholder="e.g. J. Doe"
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="submit"
              className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow transition"
            >
              Save Plot Details
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition"
            >
              Cancel
            </button>
          </div>
        </form>

        {/* Danger / Reset zone */}
        <div className="mt-6 pt-4 border-t border-slate-800 space-y-2.5">
          <button
            onClick={() => {
              onNewPlot();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition border border-slate-700"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Start Brand New Blank Plot</span>
          </button>

          {showResetConfirm ? (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-center">
              <p className="text-xs text-red-200 mb-2 font-semibold">
                Reset all counts for all species in this plot to zero?
              </p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => {
                    onResetPlotCounts();
                    setShowResetConfirm(false);
                    onClose();
                  }}
                  className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold"
                >
                  Yes, Reset to 0
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-lg transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset all counts to zero</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

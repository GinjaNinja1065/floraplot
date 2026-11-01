import React, { useState } from 'react';
import { SpeciesRecord, createEmptyCounts } from '../types/survey';
import { COMMON_PRESET_SPECIES, generateSpeciesCode, getNextSpeciesColor } from '../utils/presets';
import { X, Plus, Search, Sprout, Check } from 'lucide-react';

interface AddSpeciesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSpecies: (species: SpeciesRecord) => void;
  existingCount: number;
}

export const AddSpeciesModal: React.FC<AddSpeciesModalProps> = ({
  isOpen,
  onClose,
  onAddSpecies,
  existingCount,
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [growthForm, setGrowthForm] = useState('Tree');
  const [searchFilter, setSearchFilter] = useState('');

  if (!isOpen) return null;

  const handleNameChange = (val: string) => {
    setName(val);
    if (!code || code === generateSpeciesCode(name)) {
      setCode(generateSpeciesCode(val));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newSpecies: SpeciesRecord = {
      id: `sp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: name.trim(),
      code: code.trim().toUpperCase() || generateSpeciesCode(name),
      growthForm,
      colorTag: getNextSpeciesColor(existingCount),
      counts: createEmptyCounts(),
    };

    onAddSpecies(newSpecies);
    setName('');
    setCode('');
    onClose();
  };

  const handleSelectPreset = (preset: { name: string; code: string; growthForm: string; colorTag: string }) => {
    const newSpecies: SpeciesRecord = {
      id: `sp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: preset.name,
      code: preset.code,
      growthForm: preset.growthForm,
      colorTag: preset.colorTag || getNextSpeciesColor(existingCount),
      counts: createEmptyCounts(),
    };
    onAddSpecies(newSpecies);
    onClose();
  };

  const filteredPresets = COMMON_PRESET_SPECIES.filter(
    (p) =>
      p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.code.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.growthForm.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-5 sm:p-6 text-left my-8">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Add Species to Plot</h3>
              <p className="text-xs text-slate-400">Enter custom taxon name or tap a common preset</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Custom Species Input Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Species / Taxon Name *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Acer campestre, Heather, Sedge sp."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Botanic Code (Optional)
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. ACECAM"
                maxLength={8}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono-numbers text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Growth Form / Habit
              </label>
              <select
                value={growthForm}
                onChange={(e) => setGrowthForm(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Tree">Tree</option>
                <option value="Tall Shrub">Tall Shrub</option>
                <option value="Shrub">Shrub</option>
                <option value="Low Shrub">Low Shrub</option>
                <option value="Sapling">Sapling</option>
                <option value="Herb / Forb">Herb / Forb</option>
                <option value="Graminoid">Graminoid / Grass</option>
                <option value="Fern">Fern</option>
                <option value="Climber">Climber / Liana</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-sm shadow transition active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>Add to Survey Plot</span>
          </button>
        </form>

        {/* Quick Presets Section */}
        <div className="mt-6 pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Quick Presets (Tap to Add Instantly)
            </span>
          </div>

          <div className="relative mb-3">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search common flora presets..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
            {filteredPresets.slice(0, 10).map((preset) => (
              <button
                key={preset.code}
                onClick={() => handleSelectPreset(preset)}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700/60 text-left transition group"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: preset.colorTag }}
                  />
                  <div className="truncate">
                    <div className="text-xs font-semibold text-slate-200 group-hover:text-emerald-300 truncate">
                      {preset.name}
                    </div>
                    <div className="text-[10px] text-slate-400">{preset.growthForm}</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono-numbers px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 shrink-0 ml-1">
                  {preset.code}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Plant Survey Plot & Height Increments Types
 */

export type HeightTierId =
  | 'under_0_1'
  | '0_1_to_0_5'
  | '0_5_to_1_0'
  | '1_0_to_1_5'
  | '1_5_to_2_0'
  | '2_0_to_2_5'
  | '2_5_to_5_0'
  | '5_0_to_10_0'
  | 'over_10';

export interface HeightTier {
  id: HeightTierId;
  label: string; // e.g. "<0.1 m"
  shortLabel: string; // e.g. "<0.1m"
  rangeText: string; // e.g. "< 0.1 meters"
  stratum: string; // e.g. "Seedling / Ground"
  colorClass: {
    bg: string;
    border: string;
    text: string;
    badgeBg: string;
    accent: string;
    activeRing: string;
  };
}

export const HEIGHT_TIERS: HeightTier[] = [
  {
    id: 'under_0_1',
    label: '<0.1 m',
    shortLabel: '<0.1m',
    rangeText: '< 0.1 meters (Seedlings)',
    stratum: 'Seedling / Ground',
    colorClass: {
      bg: 'bg-emerald-950/40 hover:bg-emerald-900/50',
      border: 'border-emerald-700/60',
      text: 'text-emerald-300',
      badgeBg: 'bg-emerald-900/80 text-emerald-200',
      accent: '#10b981',
      activeRing: 'ring-emerald-500',
    },
  },
  {
    id: '0_1_to_0_5',
    label: '0.1–0.5 m',
    shortLabel: '0.1-0.5m',
    rangeText: '0.1 – 0.5 meters',
    stratum: 'Low Ground / Sprout',
    colorClass: {
      bg: 'bg-teal-950/40 hover:bg-teal-900/50',
      border: 'border-teal-700/60',
      text: 'text-teal-300',
      badgeBg: 'bg-teal-900/80 text-teal-200',
      accent: '#14b8a6',
      activeRing: 'ring-teal-500',
    },
  },
  {
    id: '0_5_to_1_0',
    label: '0.5–1.0 m',
    shortLabel: '0.5-1.0m',
    rangeText: '0.5 – 1.0 meters',
    stratum: 'Low Shrub Layer',
    colorClass: {
      bg: 'bg-cyan-950/40 hover:bg-cyan-900/50',
      border: 'border-cyan-700/60',
      text: 'text-cyan-300',
      badgeBg: 'bg-cyan-900/80 text-cyan-200',
      accent: '#06b6d4',
      activeRing: 'ring-cyan-500',
    },
  },
  {
    id: '1_0_to_1_5',
    label: '1.0–1.5 m',
    shortLabel: '1.0-1.5m',
    rangeText: '1.0 – 1.5 meters',
    stratum: 'Mid Shrub Layer',
    colorClass: {
      bg: 'bg-blue-950/40 hover:bg-blue-900/50',
      border: 'border-blue-700/60',
      text: 'text-blue-300',
      badgeBg: 'bg-blue-900/80 text-blue-200',
      accent: '#3b82f6',
      activeRing: 'ring-blue-500',
    },
  },
  {
    id: '1_5_to_2_0',
    label: '1.5–2.0 m',
    shortLabel: '1.5-2.0m',
    rangeText: '1.5 – 2.0 meters',
    stratum: 'Tall Shrub Layer',
    colorClass: {
      bg: 'bg-indigo-950/40 hover:bg-indigo-900/50',
      border: 'border-indigo-700/60',
      text: 'text-indigo-300',
      badgeBg: 'bg-indigo-900/80 text-indigo-200',
      accent: '#6366f1',
      activeRing: 'ring-indigo-500',
    },
  },
  {
    id: '2_0_to_2_5',
    label: '2.0–2.5 m',
    shortLabel: '2.0-2.5m',
    rangeText: '2.0 – 2.5 meters',
    stratum: 'Sapling / Low Understory',
    colorClass: {
      bg: 'bg-violet-950/40 hover:bg-violet-900/50',
      border: 'border-violet-700/60',
      text: 'text-violet-300',
      badgeBg: 'bg-violet-900/80 text-violet-200',
      accent: '#8b5cf6',
      activeRing: 'ring-violet-500',
    },
  },
  {
    id: '2_5_to_5_0',
    label: '2.5–5.0 m',
    shortLabel: '2.5-5.0m',
    rangeText: '2.5 – 5.0 meters',
    stratum: 'Sub-canopy / Small Trees',
    colorClass: {
      bg: 'bg-amber-950/40 hover:bg-amber-900/50',
      border: 'border-amber-700/60',
      text: 'text-amber-300',
      badgeBg: 'bg-amber-900/80 text-amber-200',
      accent: '#f59e0b',
      activeRing: 'ring-amber-500',
    },
  },
  {
    id: '5_0_to_10_0',
    label: '5.0–10.0 m',
    shortLabel: '5.0-10m',
    rangeText: '5.0 – 10.0 meters',
    stratum: 'Mid Canopy',
    colorClass: {
      bg: 'bg-orange-950/40 hover:bg-orange-900/50',
      border: 'border-orange-700/60',
      text: 'text-orange-300',
      badgeBg: 'bg-orange-900/80 text-orange-200',
      accent: '#f97316',
      activeRing: 'ring-orange-500',
    },
  },
  {
    id: 'over_10',
    label: '>10 m',
    shortLabel: '>10m',
    rangeText: '> 10.0 meters (Mature / Emergent)',
    stratum: 'Upper Canopy / Emergent',
    colorClass: {
      bg: 'bg-rose-950/40 hover:bg-rose-900/50',
      border: 'border-rose-700/60',
      text: 'text-rose-300',
      badgeBg: 'bg-rose-900/80 text-rose-200',
      accent: '#f43f5e',
      activeRing: 'ring-rose-500',
    },
  },
];

export type CountsByTier = Record<HeightTierId, number>;

export const createEmptyCounts = (): CountsByTier => ({
  under_0_1: 0,
  '0_1_to_0_5': 0,
  '0_5_to_1_0': 0,
  '1_0_to_1_5': 0,
  '1_5_to_2_0': 0,
  '2_0_to_2_5': 0,
  '2_5_to_5_0': 0,
  '5_0_to_10_0': 0,
  over_10: 0,
});

export interface SpeciesRecord {
  id: string;
  name: string; // Scientific / Botanical or common name
  code?: string; // 4 or 6 letter botanic code (e.g. EUCGLO)
  growthForm?: string; // e.g. "Tree", "Shrub", "Herb", "Graminoid", "Fern"
  colorTag?: string; // Hex or identifier color for chip
  counts: CountsByTier;
  notes?: string;
}

export interface PlotData {
  id: string;
  name: string; // e.g. "Plot 01"
  locationDesc?: string;
  dimensions?: string; // e.g. "20m x 20m"
  date: string;
  surveyor?: string;
  speciesList: SpeciesRecord[];
}

export interface TallyHistoryEntry {
  speciesId: string;
  speciesName: string;
  tierId: HeightTierId;
  delta: number; // e.g. +1, +5, -1
  timestamp: number;
}

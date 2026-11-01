import { PlotData, createEmptyCounts } from '../types/survey';

export interface PresetSpeciesTemplate {
  name: string;
  code: string;
  growthForm: string;
  colorTag: string;
}

export const COMMON_PRESET_SPECIES: PresetSpeciesTemplate[] = [
  { name: 'Quercus robur (English Oak)', code: 'QUEROB', growthForm: 'Tree', colorTag: '#059669' },
  { name: 'Pinus sylvestris (Scots Pine)', code: 'PINSYL', growthForm: 'Tree', colorTag: '#0d9488' },
  { name: 'Betula pendula (Silver Birch)', code: 'BETPEN', growthForm: 'Tree', colorTag: '#0284c7' },
  { name: 'Corylus avellana (Hazel)', code: 'CORAVE', growthForm: 'Tall Shrub', colorTag: '#4f46e5' },
  { name: 'Crataegus monogyna (Hawthorn)', code: 'CRAMON', growthForm: 'Tall Shrub', colorTag: '#7c3aed' },
  { name: 'Rubus fruticosus (Bramble)', code: 'RUBFRU', growthForm: 'Shrub', colorTag: '#c026d3' },
  { name: 'Calluna vulgaris (Heather)', code: 'CALVUL', growthForm: 'Low Shrub', colorTag: '#db2777' },
  { name: 'Vaccinium myrtillus (Bilberry)', code: 'VACMYR', growthForm: 'Low Shrub', colorTag: '#e11d48' },
  { name: 'Pteridium aquilinum (Bracken)', code: 'PTEAQU', growthForm: 'Fern', colorTag: '#ea580c' },
  { name: 'Carex flacca (Glaucous Sedge)', code: 'CARFLA', growthForm: 'Graminoid', colorTag: '#d97706' },
  { name: 'Poa pratensis (Meadow Grass)', code: 'POAPRA', growthForm: 'Graminoid', colorTag: '#65a30d' },
  { name: 'Fraxinus excelsior (Ash)', code: 'FRAEXC', growthForm: 'Tree', colorTag: '#16a34a' },
  { name: 'Fagus sylvatica (Beech)', code: 'FAGSYL', growthForm: 'Tree', colorTag: '#15803d' },
  { name: 'Acer pseudoplatanus (Sycamore)', code: 'ACEPSE', growthForm: 'Tree', colorTag: '#0e7490' },
  { name: 'Ulex europaeus (Gorse)', code: 'ULEEUR', growthForm: 'Shrub', colorTag: '#eab308' },
];

export const SPECIES_PALETTE = [
  '#10b981', // emerald
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#f59e0b', // amber
  '#14b8a6', // teal
  '#f97316', // orange
  '#a855f7', // purple
  '#84cc16', // lime
];

export function getNextSpeciesColor(index: number): string {
  return SPECIES_PALETTE[index % SPECIES_PALETTE.length];
}

export function generateSpeciesCode(name: string): string {
  const parts = name.trim().split(/[\s-]+/);
  if (parts.length >= 2) {
    return (parts[0].slice(0, 3) + parts[1].slice(0, 3)).toUpperCase();
  }
  return name.slice(0, 6).toUpperCase();
}

export function createDefaultPlot(): PlotData {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];

  return {
    id: `plot-${Date.now()}`,
    name: 'Survey Plot 01',
    locationDesc: 'Transect North-Facing',
    dimensions: '10m × 10m (100 m²)',
    date: dateStr,
    surveyor: 'Field Surveyor',
    speciesList: [
      {
        id: 'sp-1',
        name: 'Quercus robur',
        code: 'QUEROB',
        growthForm: 'Tree',
        colorTag: '#10b981',
        counts: {
          under_0_1: 4,
          '0_1_to_0_5': 6,
          '0_5_to_1_0': 3,
          '1_0_to_1_5': 2,
          '1_5_to_2_0': 1,
          '2_0_to_2_5': 0,
          '2_5_to_5_0': 2,
          '5_0_to_10_0': 1,
          over_10: 1,
        },
      },
      {
        id: 'sp-2',
        name: 'Corylus avellana',
        code: 'CORAVE',
        growthForm: 'Tall Shrub',
        colorTag: '#06b6d4',
        counts: {
          under_0_1: 8,
          '0_1_to_0_5': 12,
          '0_5_to_1_0': 7,
          '1_0_to_1_5': 5,
          '1_5_to_2_0': 3,
          '2_0_to_2_5': 2,
          '2_5_to_5_0': 1,
          '5_0_to_10_0': 0,
          over_10: 0,
        },
      },
      {
        id: 'sp-3',
        name: 'Rubus fruticosus',
        code: 'RUBFRU',
        growthForm: 'Shrub',
        colorTag: '#f59e0b',
        counts: {
          under_0_1: 15,
          '0_1_to_0_5': 24,
          '0_5_to_1_0': 18,
          '1_0_to_1_5': 8,
          '1_5_to_2_0': 2,
          '2_0_to_2_5': 0,
          '2_5_to_5_0': 0,
          '5_0_to_10_0': 0,
          over_10: 0,
        },
      },
    ],
  };
}

export function createBlankPlot(name = 'New Survey Plot'): PlotData {
  const now = new Date();
  return {
    id: `plot-${Date.now()}`,
    name,
    locationDesc: '',
    dimensions: '10m × 10m',
    date: now.toISOString().split('T')[0],
    speciesList: [],
  };
}

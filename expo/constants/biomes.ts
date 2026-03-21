import { BiomeType } from './types';

export interface BiomeInfo {
  name: string;
  type: BiomeType;
  description: string;
  floors: number;
  color: string;
}

export const BIOMES: BiomeInfo[] = [
  { name: 'Savanna', type: 'savanna', description: 'Sun-scorched plains teeming with predators', floors: 4, color: '#e8963a' },
  { name: 'Ocean', type: 'ocean', description: 'Deep waters hiding ancient leviathans', floors: 4, color: '#3a8ee8' },
  { name: 'Jungle', type: 'jungle', description: 'Dense canopy concealing deadly creatures', floors: 4, color: '#3dba5e' },
  { name: 'Arctic', type: 'arctic', description: 'Frozen tundra ruled by apex survivors', floors: 4, color: '#5cd9e8' },
];

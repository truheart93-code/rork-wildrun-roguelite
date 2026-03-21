import { ItemTemplate } from './types';

export const ITEM_TEMPLATES: ItemTemplate[] = [
  { id: 'potion', name: 'Potion', description: 'Heals 30 HP', category: 'consumable', effect: 'heal', value: 30 },
  { id: 'mega_potion', name: 'Mega Potion', description: 'Heals 60 HP', category: 'consumable', effect: 'heal', value: 60 },
  { id: 'strength_tonic', name: 'Strength Tonic', description: '+5 ATK this battle', category: 'consumable', effect: 'atk_boost', value: 5 },
  { id: 'shield_berry', name: 'Shield Berry', description: '+5 DEF this battle', category: 'consumable', effect: 'def_boost', value: 5 },
  { id: 'smoke_bomb', name: 'Smoke Bomb', description: 'Flee from non-boss fights', category: 'support', effect: 'flee', value: 0 },
  { id: 'swift_seed', name: 'Swift Seed', description: '+5 SPD this battle', category: 'consumable', effect: 'spd_boost', value: 5 },
  { id: 'revival_herb', name: 'Revival Herb', description: 'Revive with 25% HP', category: 'support', effect: 'revive', value: 25 },
];

export function getRandomItem(): ItemTemplate {
  const roll = Math.random();
  if (roll < 0.35) return ITEM_TEMPLATES[0];
  if (roll < 0.50) return ITEM_TEMPLATES[1];
  if (roll < 0.65) return ITEM_TEMPLATES[2];
  if (roll < 0.78) return ITEM_TEMPLATES[3];
  if (roll < 0.88) return ITEM_TEMPLATES[4];
  if (roll < 0.95) return ITEM_TEMPLATES[5];
  return ITEM_TEMPLATES[6];
}

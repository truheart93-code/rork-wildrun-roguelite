import { AnimalTemplate } from './types';

export interface AnimalAbility {
  name: string;
  description: string;
  effect: 'double_hit' | 'sprint' | 'trample' | 'ink' | 'poison' | 'shield' | 'heal' | 'stun' | 'rage' | 'camouflage' | 'echo' | 'current';
  value: number;
  unlockLevel: number;
}

export interface AnimalWithAbility extends AnimalTemplate {
  ability: AnimalAbility;
  rivalId?: string;
  synergyId?: string;
}

export const ANIMALS: AnimalWithAbility[] = [
  { id: 'lion', name: 'Lion', biome: 'savanna', hp: 52, atk: 18, def: 8, spd: 12, funFact: "A lion's roar can be heard from 5 miles away.", catchTip: 'Weaken below half HP before bonding.', ability: { name: 'Apex Roar', description: 'Stuns enemy for 1 turn', effect: 'stun', value: 1, unlockLevel: 3 }, rivalId: 'hyena', synergyId: 'cheetah' },
  { id: 'elephant', name: 'Elephant', biome: 'savanna', hp: 90, atk: 12, def: 14, spd: 5, funFact: 'Elephants are the only animals that cannot jump.', catchTip: 'High HP — be patient and chip away.', ability: { name: 'Trample', description: 'Hits twice this turn', effect: 'trample', value: 2, unlockLevel: 3 }, synergyId: 'zebra' },
  { id: 'cheetah', name: 'Cheetah', biome: 'savanna', hp: 38, atk: 22, def: 4, spd: 20, funFact: 'Cheetahs reach 70 mph in 3 seconds.', catchTip: 'Fast but fragile. Strike hard, bond quick.', ability: { name: 'Sprint', description: '+10 SPD and attacks first for 2 turns', effect: 'sprint', value: 10, unlockLevel: 3 }, synergyId: 'lion' },
  { id: 'zebra', name: 'Zebra', biome: 'savanna', hp: 55, atk: 14, def: 8, spd: 14, funFact: 'Each zebra has a unique stripe pattern.', catchTip: 'Moderate stats. A reliable early bond.', ability: { name: 'Herd Shield', description: 'Reduces next hit by 50%', effect: 'shield', value: 50, unlockLevel: 3 }, synergyId: 'elephant' },
  { id: 'giraffe', name: 'Giraffe', biome: 'savanna', hp: 60, atk: 13, def: 10, spd: 8, funFact: "A giraffe's tongue is 18 inches long.", catchTip: 'Tall HP pool. Chip it down steadily.', ability: { name: 'Reach', description: 'Attack ignores enemy DEF this turn', effect: 'rage', value: 0, unlockLevel: 3 } },
  { id: 'hyena', name: 'Hyena', biome: 'savanna', hp: 45, atk: 16, def: 7, spd: 13, funFact: 'Hyenas have stronger jaws than lions.', catchTip: 'Balanced stats. Bond when HP is low.', ability: { name: 'Cackle', description: 'ATK +3 when below 50% HP', effect: 'rage', value: 3, unlockLevel: 3 }, rivalId: 'lion' },
  { id: 'orca', name: 'Orca', biome: 'ocean', hp: 80, atk: 20, def: 12, spd: 10, funFact: 'Orcas are actually the largest dolphins.', catchTip: 'Tank-level HP. Commit to a long fight.', ability: { name: 'Echolocation', description: '+4 ATK on next hit', effect: 'echo', value: 4, unlockLevel: 3 }, synergyId: 'dolphin' },
  { id: 'shark', name: 'Shark', biome: 'ocean', hp: 65, atk: 22, def: 8, spd: 14, funFact: 'Sharks detect a drop of blood in 25 gallons.', catchTip: 'High ATK. Bond fast or get hurt.', ability: { name: 'Frenzy', description: 'ATK +5 when enemy HP below 30%', effect: 'rage', value: 5, unlockLevel: 3 }, rivalId: 'dolphin' },
  { id: 'dolphin', name: 'Dolphin', biome: 'ocean', hp: 42, atk: 16, def: 6, spd: 18, funFact: 'Dolphins sleep with one eye open.', catchTip: 'Quick and light. Easy to weaken.', ability: { name: 'Sonar Burst', description: 'Stuns enemy for 1 turn', effect: 'stun', value: 1, unlockLevel: 3 }, rivalId: 'shark', synergyId: 'orca' },
  { id: 'narwhal', name: 'Narwhal', biome: 'ocean', hp: 55, atk: 18, def: 10, spd: 10, funFact: "A narwhal's tusk is actually a tooth.", catchTip: 'Horn gives it punch. Watch your HP.', ability: { name: 'Horn Pierce', description: 'Ignores all enemy DEF', effect: 'rage', value: 0, unlockLevel: 3 } },
  { id: 'mantaray', name: 'Manta Ray', biome: 'ocean', hp: 50, atk: 12, def: 8, spd: 12, funFact: 'Manta rays have the largest brain of any fish.', catchTip: 'Low ATK means safe to weaken slowly.', ability: { name: 'Current Rider', description: '+6 SPD for 2 turns', effect: 'current', value: 6, unlockLevel: 3 } },
  { id: 'octopus', name: 'Octopus', biome: 'ocean', hp: 48, atk: 14, def: 6, spd: 11, funFact: 'Octopuses have three hearts.', catchTip: 'Moderate all-round. Standard approach.', ability: { name: 'Ink Cloud', description: 'Reduces enemy ATK by 5 for 2 turns', effect: 'ink', value: 5, unlockLevel: 3 } },
  { id: 'gorilla', name: 'Gorilla', biome: 'jungle', hp: 75, atk: 20, def: 12, spd: 8, funFact: 'Gorillas share 98% of DNA with humans.', catchTip: 'High HP tank. Wear it down patiently.', ability: { name: 'Chest Beat', description: 'ATK +6 and stuns enemy', effect: 'stun', value: 1, unlockLevel: 3 }, rivalId: 'jaguar' },
  { id: 'jaguar', name: 'Jaguar', biome: 'jungle', hp: 50, atk: 24, def: 6, spd: 16, funFact: 'Jaguars have the strongest bite of big cats.', catchTip: 'Highest ATK in jungle. Bond carefully.', ability: { name: 'Ambush', description: 'First strike deals 2x damage', effect: 'double_hit', value: 2, unlockLevel: 3 }, rivalId: 'gorilla' },
  { id: 'anaconda', name: 'Anaconda', biome: 'jungle', hp: 58, atk: 16, def: 10, spd: 6, funFact: 'Anacondas hold their breath for 10 minutes.', catchTip: 'Tanky snake. Slow but dangerous.', ability: { name: 'Constrict', description: 'Poisons enemy — 5 dmg/turn for 3 turns', effect: 'poison', value: 5, unlockLevel: 3 } },
  { id: 'toucan', name: 'Toucan', biome: 'jungle', hp: 35, atk: 14, def: 4, spd: 16, funFact: 'Toucans regulate heat through their beaks.', catchTip: 'Fragile. A few hits and bondable.', ability: { name: 'Screech', description: 'Reduces enemy DEF by 4 for 2 turns', effect: 'ink', value: -4, unlockLevel: 3 }, synergyId: 'jaguar' },
  { id: 'capybara', name: 'Capybara', biome: 'jungle', hp: 62, atk: 10, def: 10, spd: 6, funFact: "Capybaras are the world's largest rodents.", catchTip: 'Very chill. High HP, low threat.', ability: { name: 'Chill Aura', description: 'Heals 15 HP', effect: 'heal', value: 15, unlockLevel: 3 } },
  { id: 'poison_frog', name: 'Poison Frog', biome: 'jungle', hp: 32, atk: 20, def: 3, spd: 18, funFact: 'Poison frogs get toxins from their diet.', catchTip: 'Glass cannon. One big hit then bond.', ability: { name: 'Toxic Skin', description: 'Poisons attacker when hit', effect: 'poison', value: 4, unlockLevel: 3 } },
  { id: 'polar_bear', name: 'Polar Bear', biome: 'arctic', hp: 80, atk: 22, def: 14, spd: 8, funFact: 'Polar bears have black skin under white fur.', catchTip: 'Top-tier tank. Long fight ahead.', ability: { name: 'Blizzard Charge', description: 'Hits twice, reduces enemy SPD by 4', effect: 'trample', value: 2, unlockLevel: 3 } },
  { id: 'arctic_fox', name: 'Arctic Fox', biome: 'arctic', hp: 40, atk: 18, def: 5, spd: 17, funFact: 'Arctic foxes survive temps of -58F.', catchTip: 'Low HP makes for quick bonds.', ability: { name: 'White Out', description: 'Enemy misses next attack', effect: 'camouflage', value: 1, unlockLevel: 3 }, synergyId: 'snowy_owl' },
  { id: 'walrus', name: 'Walrus', biome: 'arctic', hp: 70, atk: 14, def: 12, spd: 5, funFact: 'Walruses slow their heartbeat in cold water.', catchTip: 'Bulky. Patience is key.', ability: { name: 'Tusk Gore', description: 'Hits twice for full damage', effect: 'trample', value: 2, unlockLevel: 3 } },
  { id: 'snowy_owl', name: 'Snowy Owl', biome: 'arctic', hp: 38, atk: 20, def: 5, spd: 16, funFact: 'Snowy owls turn their heads 270 degrees.', catchTip: 'Fragile but hits hard.', ability: { name: 'Silent Strike', description: 'Guaranteed critical hit', effect: 'rage', value: 0, unlockLevel: 3 }, synergyId: 'arctic_fox' },
  { id: 'wolverine', name: 'Wolverine', biome: 'arctic', hp: 52, atk: 19, def: 9, spd: 13, funFact: 'Wolverines take down prey 5x their size.', catchTip: 'Balanced and fierce. Standard approach.', ability: { name: 'Berserker', description: 'Double damage when below 25% HP', effect: 'rage', value: 2, unlockLevel: 3 } },
  { id: 'beluga', name: 'Beluga', biome: 'arctic', hp: 58, atk: 15, def: 11, spd: 9, funFact: 'Belugas are called the canaries of the sea.', catchTip: 'Solid all-round arctic pick.', ability: { name: 'Sonar Heal', description: 'Heals 20 HP', effect: 'heal', value: 20, unlockLevel: 3 } },
];

export function getAnimalsByBiome(biome: string) { return ANIMALS.filter(a => a.biome === biome); }
export function getRandomAnimals(count: number, biome?: string) {
  const pool = biome ? getAnimalsByBiome(biome) : ANIMALS;
  return [...pool].sort(() => Math.random() - 0.5).slice(0, count);
}
export function getStarterAnimals() { return [...ANIMALS].sort(() => Math.random() - 0.5).slice(0, 4); }
export function getAbilityForAnimal(id: string) { return ANIMALS.find(a => a.id === id)?.ability ?? null; }
export function getSynergyBonus(animalIds: string[]) {
  for (const animal of ANIMALS) {
    if (animal.synergyId && animalIds.includes(animal.id) && animalIds.includes(animal.synergyId)) {
      return { bonus: 3, pair: animal.name + ' + ' + (ANIMALS.find(a => a.id === animal.synergyId)?.name ?? '') };
    }
  }
  return null;
}
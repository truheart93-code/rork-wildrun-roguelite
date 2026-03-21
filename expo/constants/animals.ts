import { AnimalTemplate } from './types';

export const ANIMALS: AnimalTemplate[] = [
  { id: 'lion', name: 'Lion', biome: 'savanna', hp: 52, atk: 18, def: 8, spd: 12, funFact: "A lion's roar can be heard from 5 miles away.", catchTip: 'Weaken below half HP before bonding.' },
  { id: 'elephant', name: 'Elephant', biome: 'savanna', hp: 90, atk: 12, def: 14, spd: 5, funFact: 'Elephants are the only animals that cannot jump.', catchTip: 'High HP — be patient and chip away.' },
  { id: 'cheetah', name: 'Cheetah', biome: 'savanna', hp: 38, atk: 22, def: 4, spd: 20, funFact: 'Cheetahs reach 70 mph in 3 seconds.', catchTip: 'Fast but fragile. Strike hard, bond quick.' },
  { id: 'zebra', name: 'Zebra', biome: 'savanna', hp: 55, atk: 14, def: 8, spd: 14, funFact: 'Each zebra has a unique stripe pattern.', catchTip: 'Moderate stats. A reliable early bond.' },
  { id: 'giraffe', name: 'Giraffe', biome: 'savanna', hp: 60, atk: 13, def: 10, spd: 8, funFact: "A giraffe's tongue is 18 inches long.", catchTip: 'Tall HP pool. Chip it down steadily.' },
  { id: 'hyena', name: 'Hyena', biome: 'savanna', hp: 45, atk: 16, def: 7, spd: 13, funFact: 'Hyenas have stronger jaws than lions.', catchTip: 'Balanced stats. Bond when HP is low.' },

  { id: 'orca', name: 'Orca', biome: 'ocean', hp: 80, atk: 20, def: 12, spd: 10, funFact: 'Orcas are actually the largest dolphins.', catchTip: 'Tank-level HP. Commit to a long fight.' },
  { id: 'shark', name: 'Shark', biome: 'ocean', hp: 65, atk: 22, def: 8, spd: 14, funFact: 'Sharks detect a drop of blood in 25 gallons.', catchTip: 'High ATK. Bond fast or get hurt.' },
  { id: 'dolphin', name: 'Dolphin', biome: 'ocean', hp: 42, atk: 16, def: 6, spd: 18, funFact: 'Dolphins sleep with one eye open.', catchTip: 'Quick and light. Easy to weaken.' },
  { id: 'narwhal', name: 'Narwhal', biome: 'ocean', hp: 55, atk: 18, def: 10, spd: 10, funFact: "A narwhal's tusk is actually a tooth.", catchTip: 'Horn gives it punch. Watch your HP.' },
  { id: 'mantaray', name: 'Mantaray', biome: 'ocean', hp: 50, atk: 12, def: 8, spd: 12, funFact: 'Manta rays have the largest brain of any fish.', catchTip: 'Low ATK means safe to weaken slowly.' },
  { id: 'octopus', name: 'Octopus', biome: 'ocean', hp: 48, atk: 14, def: 6, spd: 11, funFact: 'Octopuses have three hearts.', catchTip: 'Moderate all-round. Standard approach.' },

  { id: 'gorilla', name: 'Gorilla', biome: 'jungle', hp: 75, atk: 20, def: 12, spd: 8, funFact: 'Gorillas share 98% of DNA with humans.', catchTip: 'High HP tank. Wear it down patiently.' },
  { id: 'jaguar', name: 'Jaguar', biome: 'jungle', hp: 50, atk: 24, def: 6, spd: 16, funFact: 'Jaguars have the strongest bite of big cats.', catchTip: 'Highest ATK in jungle. Bond carefully.' },
  { id: 'anaconda', name: 'Anaconda', biome: 'jungle', hp: 58, atk: 16, def: 10, spd: 6, funFact: 'Anacondas hold their breath for 10 minutes.', catchTip: 'Tanky snake. Slow but dangerous.' },
  { id: 'toucan', name: 'Toucan', biome: 'jungle', hp: 35, atk: 14, def: 4, spd: 16, funFact: 'Toucans regulate heat through their beaks.', catchTip: 'Fragile. A few hits and bondable.' },
  { id: 'capybara', name: 'Capybara', biome: 'jungle', hp: 62, atk: 10, def: 10, spd: 6, funFact: "Capybaras are the world's largest rodents.", catchTip: 'Very chill. High HP, low threat.' },
  { id: 'poison_frog', name: 'Poison Frog', biome: 'jungle', hp: 32, atk: 20, def: 3, spd: 18, funFact: 'Poison frogs get toxins from their diet.', catchTip: 'Glass cannon. One big hit then bond.' },

  { id: 'polar_bear', name: 'Polar Bear', biome: 'arctic', hp: 80, atk: 22, def: 14, spd: 8, funFact: 'Polar bears have black skin under white fur.', catchTip: 'Top-tier tank. Long fight ahead.' },
  { id: 'arctic_fox', name: 'Arctic Fox', biome: 'arctic', hp: 40, atk: 18, def: 5, spd: 17, funFact: 'Arctic foxes survive temps of -58°F.', catchTip: 'Low HP makes for quick bonds.' },
  { id: 'walrus', name: 'Walrus', biome: 'arctic', hp: 70, atk: 14, def: 12, spd: 5, funFact: 'Walruses slow their heartbeat in cold water.', catchTip: 'Bulky. Patience is key.' },
  { id: 'snowy_owl', name: 'Snowy Owl', biome: 'arctic', hp: 38, atk: 20, def: 5, spd: 16, funFact: 'Snowy owls turn their heads 270 degrees.', catchTip: 'Fragile but hits hard.' },
  { id: 'wolverine', name: 'Wolverine', biome: 'arctic', hp: 52, atk: 19, def: 9, spd: 13, funFact: 'Wolverines take down prey 5x their size.', catchTip: 'Balanced and fierce. Standard approach.' },
  { id: 'arctic_narwhal', name: 'Narwhal', biome: 'arctic', hp: 55, atk: 18, def: 10, spd: 10, funFact: 'Arctic narwhals dive up to 5,000 feet deep.', catchTip: 'Reliable stats. Weaken and bond.' },
];

export function getAnimalsByBiome(biome: string): AnimalTemplate[] {
  return ANIMALS.filter(a => a.biome === biome);
}

export function getRandomAnimals(count: number, biome?: string): AnimalTemplate[] {
  const pool = biome ? getAnimalsByBiome(biome) : ANIMALS;
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function getStarterAnimals(): AnimalTemplate[] {
  const biomes = ['savanna', 'ocean', 'jungle', 'arctic'] as const;
  const starters: AnimalTemplate[] = [];
  for (const biome of biomes) {
    const pool = getAnimalsByBiome(biome);
    const pick = pool[Math.floor(Math.random() * pool.length)];
    if (pick) starters.push(pick);
  }
  return starters;
}

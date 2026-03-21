export type BiomeType = 'savanna' | 'ocean' | 'jungle' | 'arctic';

export interface AnimalTemplate {
  id: string;
  name: string;
  biome: BiomeType;
  hp: number;
  atk: number;
  def: number;
  spd: number;
  funFact: string;
  catchTip: string;
}

export interface Animal extends AnimalTemplate {
  uniqueId: string;
  currentHp: number;
  maxHp: number;
  level: number;
}

export type RoomType = 'fight' | 'catchable' | 'treasure' | 'rest' | 'boss';
export type RoomStatus = 'locked' | 'available' | 'current' | 'visited';

export interface DungeonRoom {
  id: number;
  type: RoomType;
  status: RoomStatus;
  enemyId?: string;
  row: number;
  col: number;
  connections: number[];
}

export interface ItemTemplate {
  id: string;
  name: string;
  description: string;
  category: 'consumable' | 'passive' | 'support';
  effect: string;
  value: number;
}

export interface ItemInstance extends ItemTemplate {
  uniqueId: string;
}

export interface Upgrades {
  squadSize: number;
  bondAttempts: number;
  atkBonus: number;
  hpBonus: number;
}

export interface BattleRewards {
  clawsEarned: number;
  skullsEarned: number;
  caughtAnimal?: string;
  addedToSquad?: boolean;
}

export interface BattleState {
  enemy: Animal;
  activeSquadIndex: number;
  isCatchable: boolean;
  messages: string[];
  turnPhase: 'player' | 'enemy' | 'resolving' | 'victory' | 'defeat' | 'caught';
  damageNumbers: DamageNumber[];
  catchChance: number;
  rewards?: BattleRewards;
}

export interface DamageNumber {
  id: string;
  value: number;
  isPlayer: boolean;
  timestamp: number;
}

export interface RunState {
  isActive: boolean;
  squad: Animal[];
  claws: number;
  items: ItemInstance[];
  currentBiomeIndex: number;
  currentFloor: number;
  biomesCleared: boolean[];
  bondAttemptsRemaining: number;
  dungeonRooms: DungeonRoom[];
  currentRoomIndex: number;
  floorsCleared: number;
  animalsCaught: number;
}

export interface MetaState {
  totalRuns: number;
  bestFloor: number;
  skulls: number;
  upgrades: Upgrades;
  journal: string[];
}

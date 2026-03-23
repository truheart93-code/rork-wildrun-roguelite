import { Animal, AnimalTemplate, DungeonRoom, RoomType, Upgrades } from '@/constants/types';
import { getAnimalsByBiome } from '@/constants/animals';

let nextUniqueId = 0;
export function generateUniqueId(): string {
  nextUniqueId += 1;
  return `uid_${Date.now()}_${nextUniqueId}`;
}

export function createAnimalFromTemplate(template: AnimalTemplate, upgrades?: Upgrades): Animal {
  const hpBonus = upgrades?.hpBonus ?? 0;
  const atkBonus = upgrades?.atkBonus ?? 0;
  const maxHp = template.hp + (hpBonus * 5);
  return {
    ...template,
    uniqueId: generateUniqueId(),
    currentHp: maxHp,
    maxHp,
    level: 1,
    xp: 0,
    xpToNext: 20,
    atk: template.atk + (atkBonus * 2),
  };
}

export function createEnemyAnimal(biome: string, floor: number, isBoss: boolean): Animal {
  const pool = getAnimalsByBiome(biome);
  const template = pool[Math.floor(Math.random() * pool.length)];
  const levelBonus = floor - 1;
  const bossMultiplier = isBoss ? 1.5 : 1;
  const maxHp = Math.round((template.hp + levelBonus * 5) * bossMultiplier);
  return {
    ...template,
    uniqueId: generateUniqueId(),
    currentHp: maxHp,
    maxHp,
    level: 1 + levelBonus,
    xp: 0,
    xpToNext: 20,
    atk: Math.round((template.atk + levelBonus * 2) * (isBoss ? 1.3 : 1)),
    def: Math.round((template.def + levelBonus) * (isBoss ? 1.2 : 1)),
    spd: template.spd + levelBonus,
  };
}

export function generateDungeon(_floor: number): DungeonRoom[] {
  const totalRows = 7;
  const rowSizes = [2, 3, 4, 3, 4, 3, 1];
  const rooms: DungeonRoom[] = [];
  let idCounter = 0;

  const rowStartIndices: number[] = [];

  for (let row = 0; row < totalRows; row++) {
    rowStartIndices.push(rooms.length);
    const cols = rowSizes[row];
    const isFirst = row === 0;
    const isBoss = row === totalRows - 1;

    for (let col = 0; col < cols; col++) {
      let type: RoomType;
      if (isBoss) {
        type = 'boss';
      } else if (isFirst) {
        type = Math.random() < 0.5 ? 'fight' : 'catchable';
      } else {
        const pool: RoomType[] = ['fight', 'fight', 'catchable', 'treasure', 'rest'];
        type = pool[Math.floor(Math.random() * pool.length)];
      }

      rooms.push({
        id: idCounter++,
        type,
        status: isFirst ? 'available' : 'locked',
        row,
        col,
        connections: [],
      });
    }
  }

  for (let row = 0; row < totalRows - 1; row++) {
    const currentStart = rowStartIndices[row];
    const currentSize = rowSizes[row];
    const nextStart = rowStartIndices[row + 1];
    const nextSize = rowSizes[row + 1];

    for (let ci = 0; ci < currentSize; ci++) {
      const roomIdx = currentStart + ci;
      const ratio = currentSize === 1 ? 0.5 : ci / (currentSize - 1);
      const centerNext = ratio * (nextSize - 1);
      const minNext = Math.max(0, Math.floor(centerNext - 0.6));
      const maxNext = Math.min(nextSize - 1, Math.ceil(centerNext + 0.6));

      for (let ni = minNext; ni <= maxNext; ni++) {
        const targetIdx = nextStart + ni;
        if (!rooms[roomIdx].connections.includes(targetIdx)) {
          rooms[roomIdx].connections.push(targetIdx);
        }
      }
    }
  }

  for (let row = 1; row < totalRows; row++) {
    const start = rowStartIndices[row];
    const size = rowSizes[row];
    for (let ci = 0; ci < size; ci++) {
      const roomIdx = start + ci;
      const hasParent = rooms.some(r => r.row === row - 1 && r.connections.includes(roomIdx));
      if (!hasParent) {
        const prevStart = rowStartIndices[row - 1];
        const prevSize = rowSizes[row - 1];
        const ratio = size === 1 ? 0.5 : ci / (size - 1);
        const bestParent = Math.round(ratio * (prevSize - 1));
        rooms[prevStart + bestParent].connections.push(roomIdx);
      }
    }
  }

  return rooms;
}

export function calculateDamage(attackerAtk: number, defenderDef: number): number {
  const baseDmg = Math.max(1, attackerAtk - Math.floor(defenderDef / 2));
  const variance = Math.floor(Math.random() * 5) - 2;
  return Math.max(1, baseDmg + variance);
}

export function calculateCatchChance(enemy: Animal): number {
  const hpRatio = enemy.currentHp / enemy.maxHp;
  return Math.min(95, Math.max(5, Math.round((1 - hpRatio) * 80)));
}

export function rollCatch(chance: number): boolean {
  return Math.random() * 100 < chance;
}

import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { Animal, AnimalTemplate, BattleRewards, BattleState, DamageNumber, MetaState, RunState, Upgrades } from '@/constants/types';
import { getStarterAnimals } from '@/constants/animals';
import { getRandomItem } from '@/constants/items';
import { createAnimalFromTemplate, createEnemyAnimal, generateDungeon, calculateDamage, calculateCatchChance, rollCatch, generateUniqueId } from '@/utils/gameUtils';

const DEFAULT_META: MetaState = {
  totalRuns: 0,
  bestFloor: 0,
  skulls: 0,
  upgrades: { squadSize: 3, bondAttempts: 2, atkBonus: 0, hpBonus: 0 },
  journal: [],
};

const DEFAULT_RUN: RunState = {
  isActive: false,
  squad: [],
  claws: 0,
  items: [],
  currentBiomeIndex: 0,
  currentFloor: 1,
  biomesCleared: [false, false, false, false],
  bondAttemptsRemaining: 2,
  dungeonRooms: [],
  currentRoomIndex: -1,
  floorsCleared: 0,
  animalsCaught: 0,
};

const STORAGE_KEY = 'wildrun_meta';

function useGameState() {
  const [meta, setMeta] = useState<MetaState>(DEFAULT_META);
  const [run, setRun] = useState<RunState>(DEFAULT_RUN);
  const [battle, setBattle] = useState<BattleState | null>(null);
  const [starters, setStarters] = useState<AnimalTemplate[]>([]);
  const [metaLoaded, setMetaLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(stored => {
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as MetaState;
          setMeta({ ...DEFAULT_META, ...parsed, upgrades: { ...DEFAULT_META.upgrades, ...parsed.upgrades } });
        } catch (e) {
          console.log('Failed to parse meta state:', e);
        }
      }
      setMetaLoaded(true);
    }).catch(() => setMetaLoaded(true));
  }, []);

  const saveMeta = useCallback((newMeta: MetaState) => {
    setMeta(newMeta);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newMeta)).catch(e => console.log('Save error:', e));
  }, []);

  const startNewRun = useCallback(() => {
    const newStarters = getStarterAnimals();
    setStarters(newStarters);
    setRun({
      ...DEFAULT_RUN,
      isActive: true,
      bondAttemptsRemaining: meta.upgrades.bondAttempts,
    });
    setBattle(null);
    saveMeta({ ...meta, totalRuns: meta.totalRuns + 1 });
  }, [meta, saveMeta]);

  const rerollStarters = useCallback(() => {
    setStarters(getStarterAnimals());
  }, []);

  const selectStarter = useCallback((template: AnimalTemplate) => {
    setRun(prev => {
      if (prev.squad.length >= meta.upgrades.squadSize) return prev;
      if (prev.squad.find(a => a.id === template.id)) return prev;
      const animal = createAnimalFromTemplate(template, meta.upgrades);
      return { ...prev, squad: [...prev.squad, animal] };
    });
  }, [meta.upgrades]);

  const removeStarter = useCallback((uniqueId: string) => {
    setRun(prev => ({
      ...prev,
      squad: prev.squad.filter(a => a.uniqueId !== uniqueId),
    }));
  }, []);

  const enterBiome = useCallback((biomeIndex: number) => {
    const rooms = generateDungeon(run.currentFloor);
    setRun(prev => ({
      ...prev,
      currentBiomeIndex: biomeIndex,
      dungeonRooms: rooms,
      currentRoomIndex: -1,
    }));
  }, [run.currentFloor]);

  const enterRoom = useCallback((roomIndex: number) => {
    setRun(prev => {
      const rooms = prev.dungeonRooms.map((r, i) => {
        if (i === roomIndex) return { ...r, status: 'current' as const };
        if (r.status === 'available') return { ...r, status: 'locked' as const };
        return r;
      });
      return { ...prev, dungeonRooms: rooms, currentRoomIndex: roomIndex };
    });

    const room = run.dungeonRooms[roomIndex];
    if (room && (room.type === 'fight' || room.type === 'catchable' || room.type === 'boss')) {
      const biome = ['savanna', 'ocean', 'jungle', 'arctic'][run.currentBiomeIndex];
      const enemy = createEnemyAnimal(biome, run.currentFloor, room.type === 'boss');
      const catchChance = calculateCatchChance(enemy);
      setBattle({
        enemy,
        activeSquadIndex: run.squad.findIndex(a => a.currentHp > 0),
        isCatchable: room.type === 'catchable' || room.type === 'boss',
        messages: [`A wild ${enemy.name} Lv.${enemy.level} appeared!`],
        turnPhase: 'player',
        damageNumbers: [],
        catchChance,
      });
    }
  }, [run.dungeonRooms, run.currentBiomeIndex, run.currentFloor, run.squad]);

  const completeRoom = useCallback(() => {
    setRun(prev => {
      const currentRoom = prev.dungeonRooms[prev.currentRoomIndex];
      const connectedIds = currentRoom?.connections ?? [];
      const rooms = prev.dungeonRooms.map((r, i) => {
        if (i === prev.currentRoomIndex) return { ...r, status: 'visited' as const };
        if (connectedIds.includes(i) && r.status === 'locked') return { ...r, status: 'available' as const };
        return r;
      });
      return { ...prev, dungeonRooms: rooms };
    });
    setBattle(null);
  }, []);

  const completeBiomeFloor = useCallback(() => {
    setRun(prev => {
      const newFloor = prev.currentFloor + 1;
      const floorsCleared = prev.floorsCleared + 1;
      const totalFloors = 4;
      const biomeComplete = (prev.currentFloor % totalFloors === 0);
      const newBiomesCleared = [...prev.biomesCleared];
      if (biomeComplete) {
        newBiomesCleared[prev.currentBiomeIndex] = true;
      }

      const newBestFloor = Math.max(meta.bestFloor, floorsCleared);
      saveMeta({ ...meta, bestFloor: newBestFloor });

      return {
        ...prev,
        currentFloor: newFloor,
        floorsCleared,
        biomesCleared: newBiomesCleared,
        dungeonRooms: [],
        currentRoomIndex: -1,
      };
    });
  }, [meta, saveMeta]);

  const attack = useCallback(() => {
    if (!battle || battle.turnPhase !== 'player') return;

    const attacker = run.squad[battle.activeSquadIndex];
    if (!attacker || attacker.currentHp <= 0) return;

    const dmgToEnemy = calculateDamage(attacker.atk, battle.enemy.def);
    const newEnemyHp = Math.max(0, battle.enemy.currentHp - dmgToEnemy);
    const enemyDead = newEnemyHp <= 0;

    const dmgNumber: DamageNumber = {
      id: generateUniqueId(),
      value: dmgToEnemy,
      isPlayer: false,
      timestamp: Date.now(),
    };

    if (enemyDead) {
      const currentRoom = run.dungeonRooms[run.currentRoomIndex];
      const isBoss = currentRoom?.type === 'boss';
      const clawsEarned = 8 + run.currentFloor * 4 + Math.floor(Math.random() * 11);
      const skullChance = isBoss ? 1 : 0.25;
      const skullsEarned = Math.random() < skullChance ? Math.floor(Math.random() * 3) + 1 : 0;

      const rewards: BattleRewards = { clawsEarned, skullsEarned };

      setRun(prev => ({
        ...prev,
        claws: prev.claws + clawsEarned,
      }));
      if (skullsEarned > 0) {
        saveMeta({ ...meta, skulls: meta.skulls + skullsEarned });
      }
      setBattle(prev => prev ? {
        ...prev,
        enemy: { ...prev.enemy, currentHp: 0 },
        messages: [...prev.messages, `${attacker.name} dealt ${dmgToEnemy} damage!`, `${prev.enemy.name} was defeated!`],
        turnPhase: 'victory',
        damageNumbers: [...prev.damageNumbers, dmgNumber],
        rewards,
      } : null);
      return;
    }

    const catchChance = calculateCatchChance({ ...battle.enemy, currentHp: newEnemyHp } as Animal);

    setBattle(prev => prev ? {
      ...prev,
      enemy: { ...prev.enemy, currentHp: newEnemyHp },
      messages: [...prev.messages, `${attacker.name} dealt ${dmgToEnemy} damage!`],
      turnPhase: 'enemy',
      damageNumbers: [...prev.damageNumbers, dmgNumber],
      catchChance,
    } : null);
  }, [battle, run.squad, run.currentFloor, run.currentRoomIndex, run.dungeonRooms, meta, saveMeta]);

  useEffect(() => {
    if (!battle || battle.turnPhase !== 'enemy') return;
    const currentBattle = battle;

    const timer = setTimeout(() => {
      void currentBattle;
      setBattle(prev => {
        if (!prev || prev.turnPhase !== 'enemy') return prev;

        const activeAnimal = run.squad[prev.activeSquadIndex];
        if (!activeAnimal) return prev;

        const dmgToPlayer = calculateDamage(prev.enemy.atk, activeAnimal.def);
        const newPlayerHp = Math.max(0, activeAnimal.currentHp - dmgToPlayer);

        const playerDmgNumber: DamageNumber = {
          id: generateUniqueId(),
          value: dmgToPlayer,
          isPlayer: true,
          timestamp: Date.now(),
        };

        const newSquad = run.squad.map((a, i) =>
          i === prev.activeSquadIndex ? { ...a, currentHp: newPlayerHp } : a
        );

        const allDead = newSquad.every(a => a.currentHp <= 0);
        const needSwap = newPlayerHp <= 0 && !allDead;
        const nextAlive = needSwap ? newSquad.findIndex(a => a.currentHp > 0) : prev.activeSquadIndex;

        setRun(r => ({ ...r, squad: newSquad }));

        const msgs = [
          ...prev.messages,
          `${prev.enemy.name} dealt ${dmgToPlayer} to ${activeAnimal.name}!`,
        ];
        if (newPlayerHp <= 0) msgs.push(`${activeAnimal.name} fainted!`);
        if (needSwap) msgs.push(`${newSquad[nextAlive]?.name} steps in!`);

        return {
          ...prev,
          messages: msgs,
          turnPhase: allDead ? 'defeat' : 'player',
          activeSquadIndex: nextAlive,
          damageNumbers: [...prev.damageNumbers, playerDmgNumber],
        };
      });
    }, 900);

    return () => clearTimeout(timer);
  }, [battle, run.squad]);

  const bond = useCallback(() => {
    if (!battle || battle.turnPhase !== 'player') return;
    if (run.bondAttemptsRemaining <= 0) return;
    if (!battle.isCatchable) return;

    const chance = calculateCatchChance(battle.enemy);
    const success = rollCatch(chance);

    setRun(prev => ({
      ...prev,
      bondAttemptsRemaining: prev.bondAttemptsRemaining - 1,
    }));

    if (success) {
      const caughtAnimal = createAnimalFromTemplate(battle.enemy, meta.upgrades);
      caughtAnimal.currentHp = Math.max(1, Math.floor(caughtAnimal.maxHp * 0.5));
      const canAddToSquad = run.squad.length < meta.upgrades.squadSize;

      const clawsEarned = 8 + run.currentFloor * 4 + Math.floor(Math.random() * 11);

      const newJournal = meta.journal.includes(battle.enemy.id)
        ? meta.journal
        : [...meta.journal, battle.enemy.id];
      saveMeta({ ...meta, journal: newJournal });

      setRun(prev => ({
        ...prev,
        squad: canAddToSquad ? [...prev.squad, caughtAnimal] : prev.squad,
        animalsCaught: prev.animalsCaught + 1,
        claws: prev.claws + clawsEarned,
      }));

      const rewards: BattleRewards = {
        clawsEarned,
        skullsEarned: 0,
        caughtAnimal: battle.enemy.name,
        addedToSquad: canAddToSquad,
      };

      setBattle(prev => prev ? {
        ...prev,
        messages: [
          ...prev.messages,
          `Bond attempt... ${chance}% chance...`,
          `${prev.enemy.name} was caught!`,
        ],
        turnPhase: 'caught',
        rewards,
      } : null);
    } else {
      const dmgToPlayer = calculateDamage(battle.enemy.atk, run.squad[battle.activeSquadIndex].def);
      const newPlayerHp = Math.max(0, run.squad[battle.activeSquadIndex].currentHp - dmgToPlayer);
      const newSquad = run.squad.map((a, i) =>
        i === battle.activeSquadIndex ? { ...a, currentHp: newPlayerHp } : a
      );
      const allDead = newSquad.every(a => a.currentHp <= 0);
      const needSwap = newPlayerHp <= 0 && !allDead;
      const nextAlive = needSwap ? newSquad.findIndex(a => a.currentHp > 0) : battle.activeSquadIndex;

      setRun(prev => ({ ...prev, squad: newSquad }));

      setBattle(prev => prev ? {
        ...prev,
        messages: [
          ...prev.messages,
          `Bond attempt... ${chance}% chance... Failed!`,
          `${prev.enemy.name} retaliates for ${dmgToPlayer}!`,
        ],
        turnPhase: allDead ? 'defeat' : 'player',
        activeSquadIndex: nextAlive,
      } : null);
    }
  }, [battle, run.squad, run.bondAttemptsRemaining, run.currentFloor, meta, saveMeta]);

  const swapAnimal = useCallback((index: number) => {
    if (!battle || battle.turnPhase !== 'player') return;
    if (run.squad[index].currentHp <= 0) return;
    if (index === battle.activeSquadIndex) return;

    setBattle(prev => prev ? {
      ...prev,
      activeSquadIndex: index,
      messages: [...prev.messages, `Swapped to ${run.squad[index].name}!`],
    } : null);
  }, [battle, run.squad]);

  const useItem = useCallback((itemIndex: number) => {
    if (!battle || battle.turnPhase !== 'player') return;
    const item = run.items[itemIndex];
    if (!item) return;

    const activeAnimal = run.squad[battle.activeSquadIndex];
    let msg = '';

    if (item.effect === 'heal') {
      const newHp = Math.min(activeAnimal.maxHp, activeAnimal.currentHp + item.value);
      const healed = newHp - activeAnimal.currentHp;
      setRun(prev => ({
        ...prev,
        squad: prev.squad.map((a, i) => i === battle.activeSquadIndex ? { ...a, currentHp: newHp } : a),
        items: prev.items.filter((_, i) => i !== itemIndex),
      }));
      msg = `${activeAnimal.name} healed ${healed} HP!`;
    } else if (item.effect === 'flee') {
      const room = run.dungeonRooms[run.currentRoomIndex];
      if (room?.type === 'boss') {
        msg = "Can't flee from a boss!";
        return;
      }
      setRun(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== itemIndex),
      }));
      completeRoom();
      return;
    } else {
      setRun(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== itemIndex),
      }));
      msg = `Used ${item.name}!`;
    }

    setBattle(prev => prev ? {
      ...prev,
      messages: [...prev.messages, msg],
    } : null);
  }, [battle, run.squad, run.items, run.dungeonRooms, run.currentRoomIndex, completeRoom]);

  const restSquad = useCallback(() => {
    setRun(prev => ({
      ...prev,
      squad: prev.squad.map(a => ({
        ...a,
        currentHp: Math.min(a.maxHp, a.currentHp + Math.floor(a.maxHp * 0.3)),
      })),
    }));
  }, []);

  const collectTreasure = useCallback(() => {
    const clawsEarned = 15 + Math.floor(Math.random() * 25);
    const skullsEarned = Math.random() < 0.3 ? Math.floor(Math.random() * 3) + 1 : 0;
    const hasItem = Math.random() < 0.6;
    const item = hasItem ? getRandomItem() : null;

    setRun(prev => ({
      ...prev,
      claws: prev.claws + clawsEarned,
      items: item ? [...prev.items, { ...item, uniqueId: generateUniqueId() }] : prev.items,
    }));

    if (skullsEarned > 0) {
      saveMeta({ ...meta, skulls: meta.skulls + skullsEarned });
    }

    return { clawsEarned, skullsEarned, item };
  }, [meta, saveMeta]);

  const endRun = useCallback((victory: boolean) => {
    const skullsEarned = victory ? 10 + run.floorsCleared * 3 : Math.floor(run.floorsCleared * 1.5);
    const newBestFloor = Math.max(meta.bestFloor, run.floorsCleared);
    saveMeta({
      ...meta,
      skulls: meta.skulls + skullsEarned,
      bestFloor: newBestFloor,
    });
    setRun(DEFAULT_RUN);
    setBattle(null);
    return skullsEarned;
  }, [meta, run.floorsCleared, saveMeta]);

  const purchaseUpgrade = useCallback((type: keyof Upgrades) => {
    const costs: Record<keyof Upgrades, number[]> = {
      squadSize: [20, 999],
      bondAttempts: [10, 20, 35, 999],
      atkBonus: [8, 15, 25, 40, 999],
      hpBonus: [8, 15, 25, 40, 999],
    };
    const level = meta.upgrades[type];
    const cost = costs[type][level] ?? 999;
    if (meta.skulls < cost) return false;

    saveMeta({
      ...meta,
      skulls: meta.skulls - cost,
      upgrades: { ...meta.upgrades, [type]: level + 1 },
    });
    return true;
  }, [meta, saveMeta]);

  const getUpgradeCost = useCallback((type: keyof Upgrades) => {
    const costs: Record<keyof Upgrades, number[]> = {
      squadSize: [20, 999],
      bondAttempts: [10, 20, 35, 999],
      atkBonus: [8, 15, 25, 40, 999],
      hpBonus: [8, 15, 25, 40, 999],
    };
    const level = meta.upgrades[type];
    return costs[type][level] ?? 999;
  }, [meta.upgrades]);

  return {
    meta,
    run,
    battle,
    starters,
    metaLoaded,
    startNewRun,
    rerollStarters,
    selectStarter,
    removeStarter,
    enterBiome,
    enterRoom,
    completeRoom,
    completeBiomeFloor,
    attack,
    bond,
    swapAnimal,
    useItem,
    restSquad,
    collectTreasure,
    endRun,
    purchaseUpgrade,
    getUpgradeCost,
    setBattle,
  };
}

export const [GameProvider, useGame] = createContextHook(useGameState);

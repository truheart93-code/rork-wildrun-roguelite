import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { Animal, AnimalTemplate, BattleState, DamageNumber, MetaState, RunState, Upgrades } from '@/constants/types';
import { getStarterAnimals } from '@/constants/animals';
import { getRandomItem } from '@/constants/items';
import { createAnimalFromTemplate, createEnemyAnimal, generateDungeon, calculateDamage, calculateCatchChance, rollCatch, generateUniqueId } from '@/utils/gameUtils';

const DEFAULT_META: MetaState = {
  totalRuns: 0, bestFloor: 0, skulls: 0,
  upgrades: { squadSize: 3, bondAttempts: 2, atkBonus: 0, hpBonus: 0 },
  journal: [],
};

const DEFAULT_RUN: RunState = {
  isActive: false, squad: [], claws: 0, items: [],
  currentBiomeIndex: 0, currentFloor: 1,
  biomesCleared: [false, false, false, false],
  bondAttemptsRemaining: 2, dungeonRooms: [], currentRoomIndex: -1,
  floorsCleared: 0, animalsCaught: 0,
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
        } catch (e) { console.log('Failed to parse meta state:', e); }
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
    setRun({ ...DEFAULT_RUN, isActive: true, bondAttemptsRemaining: meta.upgrades.bondAttempts });
    setBattle(null);
    saveMeta({ ...meta, totalRuns: meta.totalRuns + 1 });
  }, [meta, saveMeta]);

  const rerollStarters = useCallback(() => { setStarters(getStarterAnimals()); }, []);

  const selectStarter = useCallback((template: AnimalTemplate) => {
    setRun(prev => {
      if (prev.squad.length >= meta.upgrades.squadSize) return prev;
      if (prev.squad.find(a => a.id === template.id)) return prev;
      return { ...prev, squad: [...prev.squad, createAnimalFromTemplate(template, meta.upgrades)] };
    });
  }, [meta.upgrades]);

  const removeStarter = useCallback((uniqueId: string) => {
    setRun(prev => ({ ...prev, squad: prev.squad.filter(a => a.uniqueId !== uniqueId) }));
  }, []);

  const enterBiome = useCallback((biomeIndex: number) => {
    const rooms = generateDungeon(run.currentFloor);
    setRun(prev => ({ ...prev, currentBiomeIndex: biomeIndex, dungeonRooms: rooms, currentRoomIndex: -1 }));
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
      setBattle({
        enemy, activeSquadIndex: run.squad.findIndex(a => a.currentHp > 0),
        isCatchable: room.type === 'catchable' || room.type === 'boss',
        messages: [`A wild ${enemy.name} Lv.${enemy.level} appeared!`],
        turnPhase: 'player', damageNumbers: [], catchChance: calculateCatchChance(enemy),
      });
    }
  }, [run.dungeonRooms, run.currentBiomeIndex, run.currentFloor, run.squad]);

  const completeRoom = useCallback(() => {
    setRun(prev => {
      const currentRoom = prev.dungeonRooms[prev.currentRoomIndex];
      const updated = prev.dungeonRooms.map((r, i) => {
        if (i === prev.currentRoomIndex) return { ...r, status: 'visited' as const };
        if (currentRoom?.connections.includes(i)) return { ...r, status: 'available' as const };
        return r;
      });
      return { ...prev, dungeonRooms: updated };
    });
    setBattle(null);
  }, []);

  const completeBiomeFloor = useCallback(() => {
    setRun(prev => {
      const floorsCleared = prev.floorsCleared + 1;
      const newBiomesCleared = [...prev.biomesCleared];
      newBiomesCleared[prev.currentBiomeIndex] = true;
      saveMeta({ ...meta, bestFloor: Math.max(meta.bestFloor, floorsCleared) });
      return { ...prev, currentFloor: prev.currentFloor + 1, floorsCleared, biomesCleared: newBiomesCleared, dungeonRooms: [], currentRoomIndex: -1 };
    });
  }, [meta, saveMeta]);

  const attack = useCallback(() => {
    if (!battle || battle.turnPhase !== 'player') return;
    const attacker = run.squad[battle.activeSquadIndex];
    if (!attacker || attacker.currentHp <= 0) return;

    const effectiveAtk = attacker.atk + (attacker.tempAtk ?? 0);
    const dmgToEnemy = calculateDamage(effectiveAtk, battle.enemy.def);
    const newEnemyHp = Math.max(0, battle.enemy.currentHp - dmgToEnemy);
    const dmgNumber: DamageNumber = { id: generateUniqueId(), value: dmgToEnemy, isPlayer: false, timestamp: Date.now() };

    if (newEnemyHp <= 0) {
      const clawsEarned = 8 + battle.enemy.level * 4 + Math.floor(Math.random() * 10);
      const isBoss = battle.enemy.level >= run.currentFloor + 2;
      const skullsEarned = isBoss ? Math.floor(Math.random() * 3) + 1 : Math.random() < 0.25 ? 1 : 0;
      setRun(prev => ({ ...prev, claws: prev.claws + clawsEarned }));
      if (skullsEarned > 0) saveMeta({ ...meta, skulls: meta.skulls + skullsEarned });
      setBattle(prev => prev ? { ...prev, enemy: { ...prev.enemy, currentHp: 0 }, messages: [...prev.messages, `${attacker.name} dealt ${dmgToEnemy} damage!`, `${prev.enemy.name} was defeated!`], turnPhase: 'victory', damageNumbers: [...prev.damageNumbers, dmgNumber], rewards: { clawsEarned, skullsEarned } } : null);
      return;
    }

    // Snapshot values needed in the timeout Ã¢ÂÂ avoids stale closure bug
    const attackerName = attacker.name;
    const enemyAtk = battle.enemy.atk;
    const activeSquadIndex = battle.activeSquadIndex;
    const newCatchChance = calculateCatchChance({ ...battle.enemy, currentHp: newEnemyHp } as Animal);

    setBattle(prev => prev ? { ...prev, enemy: { ...prev.enemy, currentHp: newEnemyHp }, messages: [...prev.messages, `${attackerName} dealt ${dmgToEnemy} damage!`], turnPhase: 'enemy', damageNumbers: [...prev.damageNumbers, dmgNumber], catchChance: newCatchChance } : null);

    // Enemy counterattack Ã¢ÂÂ reads live state from setRun updater, not stale closure
    setTimeout(() => {
      setRun(runPrev => {
        const currentAttacker = runPrev.squad[activeSquadIndex];
        if (!currentAttacker || currentAttacker.currentHp <= 0) {
          setBattle(b => b ? { ...b, turnPhase: 'player' } : null);
          return runPrev;
        }
        const effectiveDef = currentAttacker.def + (currentAttacker.tempDef ?? 0);
        const dmgToPlayer = calculateDamage(enemyAtk, effectiveDef);
        const newPlayerHp = Math.max(0, currentAttacker.currentHp - dmgToPlayer);
        const playerDmgNumber: DamageNumber = { id: generateUniqueId(), value: dmgToPlayer, isPlayer: true, timestamp: Date.now() };
        const newSquad = runPrev.squad.map((a, i) => i === activeSquadIndex ? { ...a, currentHp: newPlayerHp } : a);
        const allDead = newSquad.every(a => a.currentHp <= 0);
        const needSwap = newPlayerHp <= 0 && !allDead;
        const nextAlive = needSwap ? newSquad.findIndex(a => a.currentHp > 0) : activeSquadIndex;
        const msgs: string[] = [`${currentAttacker.name} took ${dmgToPlayer} damage!`];
        if (newPlayerHp <= 0) msgs.push(`${currentAttacker.name} fainted!`);
        if (needSwap && newSquad[nextAlive]) msgs.push(`${newSquad[nextAlive].name} steps in!`);
        setBattle(b => b ? { ...b, messages: [...b.messages, ...msgs], turnPhase: allDead ? 'defeat' : 'player', activeSquadIndex: needSwap ? nextAlive : activeSquadIndex, damageNumbers: [...b.damageNumbers, playerDmgNumber] } : null);
        return { ...runPrev, squad: newSquad };
      });
    }, 900);
  }, [battle, run.squad, run.currentFloor, meta, saveMeta]);

  const bond = useCallback(() => {
    if (!battle || battle.turnPhase !== 'player') return;
    if (run.bondAttemptsRemaining <= 0) { setBattle(prev => prev ? { ...prev, messages: [...prev.messages, 'No bond attempts remaining!'] } : null); return; }
    if (!battle.isCatchable) return;
    const chance = calculateCatchChance(battle.enemy);
    const success = rollCatch(chance);
    setRun(prev => ({ ...prev, bondAttemptsRemaining: prev.bondAttemptsRemaining - 1 }));
    if (success) {
      const caughtAnimal = createAnimalFromTemplate(battle.enemy, meta.upgrades);
      caughtAnimal.currentHp = Math.max(1, Math.floor(caughtAnimal.maxHp * 0.5));
      const canAddToSquad = run.squad.length < meta.upgrades.squadSize;
      setRun(prev => ({ ...prev, squad: canAddToSquad ? [...prev.squad, caughtAnimal] : prev.squad, animalsCaught: prev.animalsCaught + 1, claws: prev.claws + 10 + Math.floor(Math.random() * 10) }));
      saveMeta({ ...meta, journal: meta.journal.includes(battle.enemy.id) ? meta.journal : [...meta.journal, battle.enemy.id] });
      setBattle(prev => prev ? { ...prev, messages: [...prev.messages, `Bond attempt... ${chance}% chance...`, `${prev.enemy.name} was caught!${canAddToSquad ? ' Joins your squad!' : ' Logged in journal.'}`], turnPhase: 'caught', rewards: { clawsEarned: 10, skullsEarned: 0, caughtAnimal: battle.enemy.name, addedToSquad: canAddToSquad } } : null);
    } else {
      const activeAnimal = run.squad[battle.activeSquadIndex];
      const dmgToPlayer = calculateDamage(battle.enemy.atk, activeAnimal.def);
      const newPlayerHp = Math.max(0, activeAnimal.currentHp - dmgToPlayer);
      const newSquad = run.squad.map((a, i) => i === battle.activeSquadIndex ? { ...a, currentHp: newPlayerHp } : a);
      const allDead = newSquad.every(a => a.currentHp <= 0);
      const needSwap = newPlayerHp <= 0 && !allDead;
      const nextAlive = needSwap ? newSquad.findIndex(a => a.currentHp > 0) : battle.activeSquadIndex;
      setRun(prev => ({ ...prev, squad: newSquad }));
      setBattle(prev => prev ? { ...prev, messages: [...prev.messages, `Bond attempt... ${chance}% chance... Failed!`, `${prev.enemy.name} retaliates for ${dmgToPlayer}!`, ...(newPlayerHp <= 0 ? [`${activeAnimal.name} fainted!`] : []), ...(needSwap && newSquad[nextAlive] ? [`${newSquad[nextAlive].name} steps in!`] : [])], turnPhase: allDead ? 'defeat' : 'player', activeSquadIndex: needSwap ? nextAlive : prev.activeSquadIndex } : null);
    }
  }, [battle, run.squad, run.bondAttemptsRemaining, meta, saveMeta]);

  const swapAnimal = useCallback((index: number) => {
    if (!battle || battle.turnPhase !== 'player') return;
    if (run.squad[index].currentHp <= 0) return;
    if (index === battle.activeSquadIndex) return;
    setBattle(prev => prev ? { ...prev, activeSquadIndex: index, messages: [...prev.messages, `Swapped to ${run.squad[index].name}!`] } : null);
  }, [battle, run.squad]);

  const useItem = useCallback((itemIndex: number) => {
    if (!battle || battle.turnPhase !== 'player') return;
    const item = run.items[itemIndex];
    if (!item) return;
    const activeAnimal = run.squad[battle.activeSquadIndex];
    let msg = '';
    let squadUpdate = [...run.squad];
    if (item.effect === 'heal') {
      const newHp = Math.min(activeAnimal.maxHp, activeAnimal.currentHp + item.value);
      squadUpdate = squadUpdate.map((a, i) => i === battle.activeSquadIndex ? { ...a, currentHp: newHp } : a);
      msg = `${activeAnimal.name} healed ${newHp - activeAnimal.currentHp} HP!`;
    } else if (item.effect === 'atk_boost') {
      squadUpdate = squadUpdate.map((a, i) => i === battle.activeSquadIndex ? { ...a, tempAtk: (a.tempAtk ?? 0) + item.value } : a);
      msg = `${activeAnimal.name}'s ATK rose by ${item.value}!`;
    } else if (item.effect === 'def_boost') {
      squadUpdate = squadUpdate.map((a, i) => i === battle.activeSquadIndex ? { ...a, tempDef: (a.tempDef ?? 0) + item.value } : a);
      msg = `${activeAnimal.name}'s DEF rose by ${item.value}!`;
    } else if (item.effect === 'spd_boost') {
      squadUpdate = squadUpdate.map((a, i) => i === battle.activeSquadIndex ? { ...a, tempSpd: (a.tempSpd ?? 0) + item.value } : a);
      msg = `${activeAnimal.name}'s SPD rose by ${item.value}!`;
    } else if (item.effect === 'revive') {
      const faintedIndex = run.squad.findIndex(a => a.currentHp <= 0);
      if (faintedIndex === -1) { setBattle(prev => prev ? { ...prev, messages: [...prev.messages, 'No fainted animals to revive!'] } : null); return; }
      const reviveHp = Math.floor(run.squad[faintedIndex].maxHp * (item.value / 100));
      squadUpdate = squadUpdate.map((a, i) => i === faintedIndex ? { ...a, currentHp: reviveHp } : a);
      msg = `${run.squad[faintedIndex].name} revived with ${reviveHp} HP!`;
    } else if (item.effect === 'flee') {
      if (run.dungeonRooms[run.currentRoomIndex]?.type === 'boss') { setBattle(prev => prev ? { ...prev, messages: [...prev.messages, "Can't flee from a boss!"] } : null); return; }
      setRun(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== itemIndex) }));
      completeRoom(); return;
    } else { msg = `Used ${item.name}!`; }
    setRun(prev => ({ ...prev, squad: squadUpdate, items: prev.items.filter((_, i) => i !== itemIndex) }));
    setBattle(prev => prev ? { ...prev, messages: [...prev.messages, msg] } : null);
  }, [battle, run.squad, run.items, run.dungeonRooms, run.currentRoomIndex, completeRoom]);

  const restSquad = useCallback(() => {
    setRun(prev => ({
      ...prev,
      squad: prev.squad.map(a => ({
        ...a,
        currentHp: a.currentHp <= 0 ? 0 : Math.min(a.maxHp, a.currentHp + Math.floor(a.maxHp * 0.3)),
      })),
    }));
  }, []);

  const collectTreasure = useCallback(() => {
    const clawsEarned = 15 + Math.floor(Math.random() * 25);
    const skullsEarned = Math.random() < 0.3 ? Math.floor(Math.random() * 3) + 1 : 0;
    const item = Math.random() < 0.6 ? getRandomItem() : null;
    setRun(prev => ({ ...prev, claws: prev.claws + clawsEarned, items: item ? [...prev.items, { ...item, uniqueId: generateUniqueId() }] : prev.items }));
    if (skullsEarned > 0) saveMeta({ ...meta, skulls: meta.skulls + skullsEarned });
    return { clawsEarned, skullsEarned, item };
  }, [meta, saveMeta]);

  const endRun = useCallback((victory: boolean) => {
    const skullsEarned = victory ? 10 + run.floorsCleared * 3 : Math.max(1, Math.floor(run.floorsCleared * 1.5));
    saveMeta({ ...meta, skulls: meta.skulls + skullsEarned, bestFloor: Math.max(meta.bestFloor, run.floorsCleared) });
    setRun(DEFAULT_RUN);
    setBattle(null);
    return skullsEarned;
  }, [meta, run.floorsCleared, saveMeta]);

  const purchaseUpgrade = useCallback((type: keyof Upgrades) => {
    const costs: Record<keyof Upgrades, number[]> = { squadSize: [20, 999], bondAttempts: [10, 20, 35, 999], atkBonus: [8, 15, 25, 40, 999], hpBonus: [8, 15, 25, 40, 999] };
    const cost = costs[type][meta.upgrades[type]] ?? 999;
    if (meta.skulls < cost) return false;
    saveMeta({ ...meta, skulls: meta.skulls - cost, upgrades: { ...meta.upgrades, [type]: meta.upgrades[type] + 1 } });
    return true;
  }, [meta, saveMeta]);

  const getUpgradeCost = useCallback((type: keyof Upgrades) => {
    const costs: Record<keyof Upgrades, number[]> = { squadSize: [20, 999], bondAttempts: [10, 20, 35, 999], atkBonus: [8, 15, 25, 40, 999], hpBonus: [8, 15, 25, 40, 999] };
    return costs[type][meta.upgrades[type]] ?? 999;
  }, [meta.upgrades]);



  const useAbility = useCallback(() => {
    if (!battle || battle.turnPhase !== 'player') return;
    const attacker = run.squad[battle.activeSquadIndex];
    if (!attacker || attacker.currentHp <= 0) return;
    const { ANIMALS } = require('@/constants/animals');
    const animalData = ANIMALS.find((a: any) => a.id === attacker.id);
    const ability = animalData?.ability;
    if (!ability || attacker.level < ability.unlockLevel) return;
    let msg = attacker.name + ' used ' + ability.name + '!';
    const enemyAtk = battle.enemy.atk;
    const activeIdx = battle.activeSquadIndex;
    if (ability.effect === 'heal') {
      const newHp = Math.min(attacker.maxHp, attacker.currentHp + ability.value);
      setRun(prev => ({ ...prev, squad: prev.squad.map((a,i) => i === activeIdx ? { ...a, currentHp: newHp } : a) }));
      msg += ' Healed ' + ability.value + ' HP!';
      setBattle(prev => prev ? { ...prev, messages: [...prev.messages, msg], turnPhase: 'player' } : null);
    } else if (ability.effect === 'stun') {
      setBattle(prev => prev ? { ...prev, messages: [...prev.messages, msg + ' Enemy stunned!'], turnPhase: 'player' } : null);
    } else if (ability.effect === 'trample') {
      const dmg1 = calculateDamage(attacker.atk + (attacker.tempAtk ?? 0), battle.enemy.def);
      const dmg2 = calculateDamage(attacker.atk + (attacker.tempAtk ?? 0), battle.enemy.def);
      const total = dmg1 + dmg2;
      const newHp = Math.max(0, battle.enemy.currentHp - total);
      setRun(prev => ({ ...prev, stats: { ...prev.stats, totalDamageDealt: prev.stats.totalDamageDealt + total } }));
      setBattle(prev => prev ? { ...prev, enemy: { ...prev.enemy, currentHp: newHp }, messages: [...prev.messages, msg + ' Hit twice for ' + total + ' damage!'], turnPhase: newHp <= 0 ? 'victory' : 'player', rewards: newHp <= 0 ? { clawsEarned: 8 + battle.enemy.level * 4, skullsEarned: 0 } : prev.rewards } : null);
    } else if (ability.effect === 'poison') {
      setBattle(prev => prev ? { ...prev, messages: [...prev.messages, msg + ' Enemy poisoned for ' + ability.value + ' dmg/turn!'], turnPhase: 'player' } : null);
    } else if (ability.effect === 'shield') {
      setRun(prev => ({ ...prev, squad: prev.squad.map((a,i) => i === activeIdx ? { ...a, tempDef: (a.tempDef ?? 0) + Math.floor(a.def * 0.5) } : a) }));
      setBattle(prev => prev ? { ...prev, messages: [...prev.messages, msg + ' Defense boosted!'], turnPhase: 'player' } : null);
    } else if (ability.effect === 'ink') {
      setBattle(prev => prev ? { ...prev, enemy: { ...prev.enemy, atk: Math.max(1, prev.enemy.atk - 5) }, messages: [...prev.messages, msg + ' Enemy ATK reduced!'], turnPhase: 'player' } : null);
    } else if (ability.effect === 'sprint') {
      setRun(prev => ({ ...prev, squad: prev.squad.map((a,i) => i === activeIdx ? { ...a, tempSpd: (a.tempSpd ?? 0) + ability.value } : a) }));
      setBattle(prev => prev ? { ...prev, messages: [...prev.messages, msg + ' SPD +' + ability.value + '!'], turnPhase: 'player' } : null);
    } else if (ability.effect === 'camouflage') {
      setBattle(prev => prev ? { ...prev, messages: [...prev.messages, msg + ' Enemy will miss next attack!'], turnPhase: 'player' } : null);
    } else if (ability.effect === 'double_hit') {
      const dmg = calculateDamage((attacker.atk + (attacker.tempAtk ?? 0)) * 2, battle.enemy.def);
      const newHp = Math.max(0, battle.enemy.currentHp - dmg);
      setBattle(prev => prev ? { ...prev, enemy: { ...prev.enemy, currentHp: newHp }, messages: [...prev.messages, msg + ' Ambush strike: ' + dmg + ' damage!'], turnPhase: newHp <= 0 ? 'victory' : 'player', rewards: newHp <= 0 ? { clawsEarned: 8 + battle.enemy.level * 4, skullsEarned: 0 } : prev.rewards } : null);
    } else if (ability.effect === 'echo') {
      setRun(prev => ({ ...prev, squad: prev.squad.map((a,i) => i === activeIdx ? { ...a, tempAtk: (a.tempAtk ?? 0) + ability.value } : a) }));
      setBattle(prev => prev ? { ...prev, messages: [...prev.messages, msg + ' ATK +' + ability.value + '!'], turnPhase: 'player' } : null);
    } else if (ability.effect === 'current') {
      setRun(prev => ({ ...prev, squad: prev.squad.map((a,i) => i === activeIdx ? { ...a, tempSpd: (a.tempSpd ?? 0) + ability.value } : a) }));
      setBattle(prev => prev ? { ...prev, messages: [...prev.messages, msg + ' SPD +' + ability.value + '!'], turnPhase: 'player' } : null);
    } else if (ability.effect === 'rage') {
      const bonusDmg = calculateDamage((attacker.atk + (attacker.tempAtk ?? 0)) * 1.8, battle.enemy.def);
      const newHp = Math.max(0, battle.enemy.currentHp - bonusDmg);
      setBattle(prev => prev ? { ...prev, enemy: { ...prev.enemy, currentHp: newHp }, messages: [...prev.messages, msg + ' Dealt ' + bonusDmg + ' damage!'], turnPhase: newHp <= 0 ? 'victory' : 'player', rewards: newHp <= 0 ? { clawsEarned: 8 + battle.enemy.level * 4, skullsEarned: 0 } : prev.rewards } : null);
    }
  }, [battle, run.squad, run.bondAttemptsRemaining]);

  return { meta, run, battle, starters, metaLoaded, startNewRun, rerollStarters, selectStarter, removeStarter, enterBiome, enterRoom, completeRoom, completeBiomeFloor, attack, bond, swapAnimal, useItem, restSquad, collectTreasure, endRun, purchaseUpgrade, getUpgradeCost, setBattle, applyRelicBuff, useAbility };
}

export const [GameProvider, useGame] = createContextHook(useGameState);
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { Animal, AnimalTemplate, BattleState, DamageNumber, MetaState, RunState, RunStats, Upgrades } from '@/constants/types';
import { getStarterAnimals, ANIMALS, getAbilityForAnimal } from '@/constants/animals';
import { getRandomItem } from '@/constants/items';
import { createAnimalFromTemplate, createEnemyAnimal, generateDungeon, calculateDamage, calculateCatchChance, rollCatch, generateUniqueId } from '@/utils/gameUtils';

const DEFAULT_STATS: RunStats = {
  floorsCleared: 0,
  animalsCaught: 0,
  claws: 0,
  totalDamageDealt: 0,
  totalDamageTaken: 0,
  criticalHits: 0,
  totalAttacks: 0,
  biggestHit: 0,
  biggestHitAnimal: '',
  longestStreak: 0,
  currentStreak: 0,
  biomesVisited: [],
  animalKOs: 0,
  favoriteAnimal: '',
  totalBondAttempts: 0,
  successfulBonds: 0,
  turnsPlayed: 0,
};

const DEFAULT_META: MetaState = {
  totalRuns: 0,
  bestFloor: 0,
  skulls: 0,
  claws: 0,
  upgrades: { squadSize: 3, bondAttempts: 2, atkBonus: 0, hpBonus: 0 },
  journal: [],
  totalCriticalHits: 0,
  longestWinStreak: 0,
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
  stats: { ...DEFAULT_STATS },
  winStreak: 0,
};

const STORAGE_KEY = 'wildrun_meta';

// XP needed to reach next level
function xpToNextLevel(level: number): number {
  return 20 + level * 15;
}

// Roll for critical hit - 15% base chance
function rollCrit(): boolean {
  return Math.random() < 0.15;
}

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
          setMeta({
            ...DEFAULT_META, ...parsed,
            upgrades: { ...DEFAULT_META.upgrades, ...parsed.upgrades },
          });
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
    setRun({
      ...DEFAULT_RUN,
      isActive: true,
      bondAttemptsRemaining: meta.upgrades.bondAttempts,
      stats: { ...DEFAULT_STATS },
    });
    setBattle(null);
    saveMeta({ ...meta, totalRuns: meta.totalRuns + 1 });
  }, [meta, saveMeta]);

  const rerollStarters = useCallback(() => { setStarters(getStarterAnimals()); }, []);

  const selectStarter = useCallback((template: AnimalTemplate) => {
    setRun(prev => {
      if (prev.squad.length >= meta.upgrades.squadSize) return prev;
      if (prev.squad.find(a => a.id === template.id)) return prev;
      const animal = createAnimalFromTemplate(template, meta.upgrades);
      // Add to journal when selecting starter
      if (!meta.journal.includes(template.id)) {
        saveMeta({ ...meta, journal: [...meta.journal, template.id] });
      }
      return { ...prev, squad: [...prev.squad, animal] };
    });
  }, [meta.upgrades, meta.journal, saveMeta]);

  const removeStarter = useCallback((uniqueId: string) => {
    setRun(prev => ({ ...prev, squad: prev.squad.filter(a => a.uniqueId !== uniqueId) }));
  }, []);

  const enterBiome = useCallback((biomeIndex: number) => {
    const rooms = generateDungeon(run.currentFloor);
    const biomeName = ['Savanna', 'Ocean', 'Jungle', 'Arctic'][biomeIndex];
    setRun(prev => ({
      ...prev,
      currentBiomeIndex: biomeIndex,
      dungeonRooms: rooms,
      currentRoomIndex: -1,
      stats: {
        ...prev.stats,
        biomesVisited: prev.stats.biomesVisited.includes(biomeName)
          ? prev.stats.biomesVisited
          : [...prev.stats.biomesVisited, biomeName],
      },
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
    
    // Check if there's a saved battle state to restore
    if (room && room.savedBattle) {
      setBattle(room.savedBattle);
      return;
    }
    
    // Otherwise create a new battle
    if (room && (room.type === 'fight' || room.type === 'catchable' || room.type === 'boss')) {
      const biome = ['savanna', 'ocean', 'jungle', 'arctic'][run.currentBiomeIndex];
      const enemy = createEnemyAnimal(biome, run.currentFloor, room.type === 'boss');
      setBattle({
        enemy,
        activeSquadIndex: run.squad.findIndex(a => a.currentHp > 0),
        isCatchable: room.type === 'catchable' || room.type === 'boss',
        messages: [
          room.type === 'boss'
            ? `⚠ BOSS: ${enemy.name} Lv.${enemy.level} blocks the path!`
            : `A wild ${enemy.name} Lv.${enemy.level} appeared!`
        ],
        turnPhase: 'player',
        damageNumbers: [],
        catchChance: calculateCatchChance(enemy),
        comboCount: 0,
        abilitiesUsed: [],
        activeEffects: [],
      });
    }
  }, [run.dungeonRooms, run.currentBiomeIndex, run.currentFloor, run.squad]);

  const leaveRoom = useCallback(() => {
    // Save current battle state to room before leaving
    if (battle && battle.turnPhase !== 'victory' && battle.turnPhase !== 'defeat' && battle.turnPhase !== 'caught') {
      setRun(prev => {
        const updated = prev.dungeonRooms.map((r, i) => 
          i === prev.currentRoomIndex ? { ...r, savedBattle: battle } : r
        );
        return { ...prev, dungeonRooms: updated };
      });
    }
    setBattle(null);
  }, [battle]);

  const completeRoom = useCallback(() => {
    setRun(prev => {
      const currentRoom = prev.dungeonRooms[prev.currentRoomIndex];
      const updated = prev.dungeonRooms.map((r, i) => {
        if (i === prev.currentRoomIndex) return { ...r, status: 'visited' as const, savedBattle: undefined };
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
      return {
        ...prev,
        currentFloor: prev.currentFloor + 1,
        floorsCleared,
        biomesCleared: newBiomesCleared,
        dungeonRooms: [],
        currentRoomIndex: -1,
        stats: { ...prev.stats, floorsCleared },
      };
    });
  }, [meta, saveMeta]);

  // Grant XP to active animal and level up if threshold reached
  const grantXp = useCallback((squadIndex: number, xpAmount: number) => {
    setRun(prev => {
      const newSquad = prev.squad.map((a, i) => {
        if (i !== squadIndex) return a;
        const newXp = a.xp + xpAmount;
        const needed = xpToNextLevel(a.level);
        if (newXp >= needed) {
          // Level up!
          const newLevel = a.level + 1;
          const hpGain = 8 + Math.floor(Math.random() * 5);
          const atkGain = Math.random() < 0.6 ? 1 : 0;
          const defGain = Math.random() < 0.4 ? 1 : 0;
          return {
            ...a,
            level: newLevel,
            xp: newXp - needed,
            xpToNext: xpToNextLevel(newLevel),
            maxHp: a.maxHp + hpGain,
            currentHp: Math.min(a.maxHp + hpGain, a.currentHp + hpGain),
            atk: a.atk + atkGain,
            def: a.def + defGain,
          };
        }
        return { ...a, xp: newXp };
      });
      return { ...prev, squad: newSquad };
    });
  }, []);

  const attack = useCallback(() => {
    if (!battle || battle.turnPhase !== 'player') return;
    const attacker = run.squad[battle.activeSquadIndex];
    if (!attacker || attacker.currentHp <= 0) return;

    const isCrit = rollCrit();
    const effectiveAtk = attacker.atk + (attacker.tempAtk ?? 0);
    const baseDmg = calculateDamage(effectiveAtk, battle.enemy.def);
    const dmgToEnemy = isCrit ? Math.floor(baseDmg * 1.5) : baseDmg;
    const newEnemyHp = Math.max(0, battle.enemy.currentHp - dmgToEnemy);
    const newCombo = isCrit ? battle.comboCount + 2 : battle.comboCount + 1;

    const dmgNumber: DamageNumber = {
      id: generateUniqueId(), value: dmgToEnemy, isPlayer: false,
      timestamp: Date.now(), isCrit,
    };

    // Update run stats
    setRun(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        totalDamageDealt: prev.stats.totalDamageDealt + dmgToEnemy,
        totalAttacks: prev.stats.totalAttacks + 1,
        criticalHits: prev.stats.criticalHits + (isCrit ? 1 : 0),
        biggestHit: dmgToEnemy > prev.stats.biggestHit ? dmgToEnemy : prev.stats.biggestHit,
        biggestHitAnimal: dmgToEnemy > prev.stats.biggestHit ? attacker.name : prev.stats.biggestHitAnimal,
        turnsPlayed: prev.stats.turnsPlayed + 1,
      },
    }));

    if (newEnemyHp <= 0) {
      const clawsEarned = 8 + battle.enemy.level * 4 + Math.floor(Math.random() * 10);
      const isBoss = battle.enemy.level >= run.currentFloor + 2;
      const skullsEarned = isBoss ? Math.floor(Math.random() * 3) + 1 : Math.random() < 0.25 ? 1 : 0;
      const xpEarned = 5 + battle.enemy.level * 3 + (isBoss ? 10 : 0);

      setRun(prev => ({
        ...prev,
        claws: prev.claws + clawsEarned,
        winStreak: prev.winStreak + 1,
        stats: {
          ...prev.stats,
          animalKOs: prev.stats.animalKOs + 1,
          currentStreak: prev.stats.currentStreak + 1,
          longestStreak: Math.max(prev.stats.longestStreak, prev.stats.currentStreak + 1),
        },
      }));

      grantXp(battle.activeSquadIndex, xpEarned);

      // Save claws and skulls to meta immediately
      const metaUpdate: Partial<MetaState> = {
        claws: meta.claws + clawsEarned,
      };
      if (skullsEarned > 0) {
        metaUpdate.skulls = meta.skulls + skullsEarned;
        metaUpdate.totalCriticalHits = (meta.totalCriticalHits ?? 0) + (isCrit ? 1 : 0);
      }
      saveMeta({ ...meta, ...metaUpdate });

      const msgs = [`${attacker.name} dealt ${dmgToEnemy} damage!${isCrit ? ' CRITICAL HIT!' : ''}`, `${battle.enemy.name} was defeated!`];
      if (newCombo >= 3) msgs.push(`🔥 ${newCombo}-hit combo!`);

      setBattle(prev => prev ? {
        ...prev,
        enemy: { ...prev.enemy, currentHp: 0 },
        messages: [...prev.messages, ...msgs],
        turnPhase: 'victory',
        damageNumbers: [...prev.damageNumbers, dmgNumber],
        rewards: { clawsEarned, skullsEarned },
        isCrit,
        comboCount: newCombo,
      } : null);
      return;
    }

    // Snapshot for timeout
    const attackerName = attacker.name;
    const enemyAtk = battle.enemy.atk;
    const activeSquadIndex = battle.activeSquadIndex;
    const newCatchChance = calculateCatchChance({ ...battle.enemy, currentHp: newEnemyHp } as Animal);

    setBattle(prev => prev ? {
      ...prev,
      enemy: { ...prev.enemy, currentHp: newEnemyHp },
      messages: [...prev.messages, `${attackerName} dealt ${dmgToEnemy} damage!${isCrit ? ' CRITICAL HIT!' : ''}`],
      turnPhase: 'enemy',
      damageNumbers: [...prev.damageNumbers, dmgNumber],
      catchChance: newCatchChance,
      isCrit,
      comboCount: newCombo,
    } : null);

    // Enemy counter-attack - reads live state from setRun updater
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

        setBattle(b => b ? {
          ...b,
          messages: [...b.messages, ...msgs],
          turnPhase: allDead ? 'defeat' : 'player',
          activeSquadIndex: needSwap ? nextAlive : activeSquadIndex,
          damageNumbers: [...b.damageNumbers, playerDmgNumber],
          comboCount: allDead ? b.comboCount : 0, // reset combo on taking damage
        } : null);

        return {
          ...runPrev,
          squad: newSquad,
          winStreak: allDead ? 0 : runPrev.winStreak,
          stats: {
            ...runPrev.stats,
            totalDamageTaken: runPrev.stats.totalDamageTaken + dmgToPlayer,
            currentStreak: allDead ? 0 : runPrev.stats.currentStreak,
          },
        };
      });
    }, 900);
  }, [battle, run.squad, run.currentFloor, meta, saveMeta, grantXp]);

  const bond = useCallback(() => {
    if (!battle || battle.turnPhase !== 'player') return;
    if (run.bondAttemptsRemaining <= 0) {
      setBattle(prev => prev ? { ...prev, messages: [...prev.messages, 'No bond attempts remaining!'] } : null);
      return;
    }
    if (!battle.isCatchable) return;

    const chance = calculateCatchChance(battle.enemy);
    const success = rollCatch(chance);
    setRun(prev => ({
      ...prev,
      bondAttemptsRemaining: prev.bondAttemptsRemaining - 1,
      stats: { ...prev.stats, totalBondAttempts: prev.stats.totalBondAttempts + 1 },
    }));

    if (success) {
      // Find the base template for this animal (without enemy scaling)
      const baseTemplate = ANIMALS.find(a => a.id === battle.enemy.id);
      if (!baseTemplate) {
        console.error('Could not find base template for enemy:', battle.enemy.id);
        return;
      }
      
      const caughtAnimal = createAnimalFromTemplate(baseTemplate, meta.upgrades);
      caughtAnimal.currentHp = Math.max(1, Math.floor(caughtAnimal.maxHp * 0.5));
      const canAddToSquad = run.squad.length < meta.upgrades.squadSize;
      const clawsEarned = 10 + Math.floor(Math.random() * 10);
      setRun(prev => ({
        ...prev,
        squad: canAddToSquad ? [...prev.squad, caughtAnimal] : prev.squad,
        animalsCaught: prev.animalsCaught + 1,
        claws: prev.claws + clawsEarned,
        stats: {
          ...prev.stats,
          animalsCaught: prev.stats.animalsCaught + 1,
          successfulBonds: prev.stats.successfulBonds + 1,
        },
      }));
      // Save claws to meta and add to journal
      saveMeta({ 
        ...meta, 
        claws: meta.claws + clawsEarned,
        journal: meta.journal.includes(battle.enemy.id) ? meta.journal : [...meta.journal, battle.enemy.id] 
      });
      setBattle(prev => prev ? {
        ...prev,
        messages: [...prev.messages, `Bond attempt... ${chance}% chance...`, `${prev.enemy.name} was caught!${canAddToSquad ? ' Joins your squad!' : ' Logged in journal.'}`],
        turnPhase: 'caught',
        rewards: { clawsEarned, skullsEarned: 0, caughtAnimal: battle.enemy.name, addedToSquad: canAddToSquad },
      } : null);
    } else {
      const activeAnimal = run.squad[battle.activeSquadIndex];
      const dmgToPlayer = calculateDamage(battle.enemy.atk, activeAnimal.def);
      const newPlayerHp = Math.max(0, activeAnimal.currentHp - dmgToPlayer);
      const newSquad = run.squad.map((a, i) => i === battle.activeSquadIndex ? { ...a, currentHp: newPlayerHp } : a);
      const allDead = newSquad.every(a => a.currentHp <= 0);
      const needSwap = newPlayerHp <= 0 && !allDead;
      const nextAlive = needSwap ? newSquad.findIndex(a => a.currentHp > 0) : battle.activeSquadIndex;
      setRun(prev => ({
        ...prev,
        squad: newSquad,
        stats: { ...prev.stats, totalDamageTaken: prev.stats.totalDamageTaken + dmgToPlayer },
      }));
      setBattle(prev => prev ? {
        ...prev,
        messages: [...prev.messages, `Bond attempt... ${chance}% chance... Failed!`, `${prev.enemy.name} retaliates for ${dmgToPlayer}!`, ...(newPlayerHp <= 0 ? [`${activeAnimal.name} fainted!`] : []), ...(needSwap && newSquad[nextAlive] ? [`${newSquad[nextAlive].name} steps in!`] : [])],
        turnPhase: allDead ? 'defeat' : 'player',
        activeSquadIndex: needSwap ? nextAlive : prev.activeSquadIndex,
      } : null);
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

  const useAbility = useCallback(() => {
    if (!battle || battle.turnPhase !== 'player') return;
    
    const attacker = run.squad[battle.activeSquadIndex];
    if (!attacker || attacker.currentHp <= 0) return;
    
    // Check if ability is unlocked
    const ability = getAbilityForAnimal(attacker.id);
    if (!ability || attacker.level < ability.unlockLevel) return;
    
    // Check if ANY ability has been used this battle (once per team)
    if (battle.abilitiesUsed.length > 0) {
      setBattle(prev => prev ? { ...prev, messages: [...prev.messages, 'Team ability already used this battle!'] } : null);
      return;
    }
    
    // Mark ability as used for the entire team
    const newAbilitiesUsed = [attacker.uniqueId];
    let msgs: string[] = [`${attacker.name} used ${ability.name}!`];
    let newSquad = [...run.squad];
    let newEnemy = { ...battle.enemy };
    let newEffects = [...battle.activeEffects];
    
    // Apply ability effects
    switch (ability.effect) {
      case 'heal':
        const healAmount = ability.value;
        newSquad = newSquad.map((a, i) => 
          i === battle.activeSquadIndex 
            ? { ...a, currentHp: Math.min(a.maxHp, a.currentHp + healAmount) }
            : a
        );
        msgs.push(`${attacker.name} restored ${healAmount} HP!`);
        break;
        
      case 'poison':
        newEffects.push({ type: 'poison', value: ability.value, duration: 3, targetIsEnemy: true });
        msgs.push(`${battle.enemy.name} is poisoned!`);
        break;
        
      case 'shield':
        newEffects.push({ type: 'shield', value: ability.value, duration: 1, targetIsEnemy: false });
        msgs.push(`${attacker.name} raised a shield!`);
        break;
        
      case 'sprint':
        newSquad = newSquad.map((a, i) => 
          i === battle.activeSquadIndex 
            ? { ...a, tempSpd: (a.tempSpd ?? 0) + ability.value }
            : a
        );
        newEffects.push({ type: 'sprint', value: ability.value, duration: 2, targetIsEnemy: false });
        msgs.push(`${attacker.name}'s SPD rose by ${ability.value}!`);
        break;
        
      case 'ink':
        // ink is used for both ATK reduction and DEF reduction
        // Positive value = reduce enemy ATK, Negative value = reduce enemy DEF
        if (ability.value > 0) {
          newEnemy = { ...newEnemy, tempAtk: (newEnemy.tempAtk ?? 0) - ability.value };
          newEffects.push({ type: 'ink', value: ability.value, duration: 2, targetIsEnemy: true });
          msgs.push(`${battle.enemy.name}'s ATK fell by ${ability.value}!`);
        } else {
          const defReduction = Math.abs(ability.value);
          newEnemy = { ...newEnemy, tempDef: (newEnemy.tempDef ?? 0) - defReduction };
          newEffects.push({ type: 'ink', value: ability.value, duration: 2, targetIsEnemy: true });
          msgs.push(`${battle.enemy.name}'s DEF fell by ${defReduction}!`);
        }
        break;
        
      case 'current':
        newSquad = newSquad.map((a, i) => 
          i === battle.activeSquadIndex 
            ? { ...a, tempSpd: (a.tempSpd ?? 0) + ability.value }
            : a
        );
        newEffects.push({ type: 'current', value: ability.value, duration: 2, targetIsEnemy: false });
        msgs.push(`${attacker.name}'s SPD rose by ${ability.value}!`);
        break;
        
      case 'camouflage':
        newEffects.push({ type: 'camouflage', value: 1, duration: 1, targetIsEnemy: false });
        msgs.push(`${attacker.name} vanished from sight!`);
        break;
        
      case 'rage':
        // Rage gives ATK boost - Gorilla gets +6 ATK
        newSquad = newSquad.map((a, i) => 
          i === battle.activeSquadIndex 
            ? { ...a, tempAtk: (a.tempAtk ?? 0) + ability.value }
            : a
        );
        msgs.push(`${attacker.name}'s ATK rose by ${ability.value}!`);
        // Gorilla also reduces enemy DEF by 4
        if (attacker.id === 'gorilla') {
          newEnemy = { ...newEnemy, tempDef: (newEnemy.tempDef ?? 0) - 4 };
          msgs.push(`${battle.enemy.name}'s DEF fell by 4!`);
        }
        break;
        
      case 'echo':
        // Orca's echolocation - boost next hit
        newSquad = newSquad.map((a, i) => 
          i === battle.activeSquadIndex 
            ? { ...a, tempAtk: (a.tempAtk ?? 0) + ability.value }
            : a
        );
        msgs.push(`${attacker.name} charged up power!`);
        break;
        
      case 'double_hit':
      case 'trample':
        // These trigger during attack, just show message
        msgs.push(`${attacker.name} is ready to strike!`);
        break;
    }
    
    setRun(prev => ({ ...prev, squad: newSquad }));
    
    // Ability use ends player's turn - enemy attacks
    setBattle(prev => prev ? {
      ...prev,
      enemy: newEnemy,
      messages: [...prev.messages, ...msgs],
      turnPhase: 'enemy',
      abilitiesUsed: newAbilitiesUsed,
      activeEffects: newEffects,
    } : null);
    
    // Enemy counter-attack (same logic as attack function)
    setTimeout(() => {
      setRun(runPrev => {
        const currentAttacker = runPrev.squad[battle.activeSquadIndex];
        if (!currentAttacker || currentAttacker.currentHp <= 0) {
          setBattle(b => b ? { ...b, turnPhase: 'player' } : null);
          return runPrev;
        }
        
        // Check for camouflage effect
        const hasCamo = newEffects.some(e => e.type === 'camouflage' && !e.targetIsEnemy);
        if (hasCamo) {
          setBattle(b => b ? {
            ...b,
            messages: [...b.messages, `${battle.enemy.name} attacked but missed!`],
            turnPhase: 'player',
            activeEffects: b.activeEffects.filter(e => e.type !== 'camouflage'),
          } : null);
          return runPrev;
        }
        
        const effectiveDef = currentAttacker.def + (currentAttacker.tempDef ?? 0);
        const dmgToPlayer = calculateDamage(newEnemy.atk + (newEnemy.tempAtk ?? 0), effectiveDef);
        
        // Apply shield reduction if present
        const shieldEffect = newEffects.find(e => e.type === 'shield' && !e.targetIsEnemy);
        const finalDmg = shieldEffect ? Math.floor(dmgToPlayer * (1 - shieldEffect.value / 100)) : dmgToPlayer;
        
        const newPlayerHp = Math.max(0, currentAttacker.currentHp - finalDmg);
        const playerDmgNumber: DamageNumber = { id: generateUniqueId(), value: finalDmg, isPlayer: true, timestamp: Date.now() };
        const newSquadAfterDmg = runPrev.squad.map((a, i) => i === battle.activeSquadIndex ? { ...a, currentHp: newPlayerHp } : a);
        const allDead = newSquadAfterDmg.every(a => a.currentHp <= 0);
        const needSwap = newPlayerHp <= 0 && !allDead;
        const nextAlive = needSwap ? newSquadAfterDmg.findIndex(a => a.currentHp > 0) : battle.activeSquadIndex;
        const counterMsgs: string[] = [`${currentAttacker.name} took ${finalDmg} damage!`];
        if (shieldEffect) counterMsgs.push('Shield absorbed some damage!');
        if (newPlayerHp <= 0) counterMsgs.push(`${currentAttacker.name} fainted!`);
        if (needSwap && newSquadAfterDmg[nextAlive]) counterMsgs.push(`${newSquadAfterDmg[nextAlive].name} steps in!`);
        
        setBattle(b => b ? {
          ...b,
          messages: [...b.messages, ...counterMsgs],
          turnPhase: allDead ? 'defeat' : 'player',
          activeSquadIndex: needSwap ? nextAlive : battle.activeSquadIndex,
          damageNumbers: [...b.damageNumbers, playerDmgNumber],
          activeEffects: b.activeEffects.filter(e => e.type !== 'shield'),
        } : null);
        
        return {
          ...runPrev,
          squad: newSquadAfterDmg,
          winStreak: allDead ? 0 : runPrev.winStreak,
          stats: {
            ...runPrev.stats,
            totalDamageTaken: runPrev.stats.totalDamageTaken + finalDmg,
            currentStreak: allDead ? 0 : runPrev.stats.currentStreak,
          },
        };
      });
    }, 900);
  }, [battle, run.squad]);

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
    // Save claws and skulls to meta
    const metaUpdate: Partial<MetaState> = { claws: meta.claws + clawsEarned };
    if (skullsEarned > 0) metaUpdate.skulls = meta.skulls + skullsEarned;
    saveMeta({ ...meta, ...metaUpdate });
    return { clawsEarned, skullsEarned, item };
  }, [meta, saveMeta]);

  const endRun = useCallback((victory: boolean) => {
    const floorsCleared = run.floorsCleared;
    const skullsEarned = victory ? 10 + floorsCleared * 3 : Math.max(1, Math.floor(floorsCleared * 1.5));
    const newBestFloor = Math.max(meta.bestFloor, floorsCleared);
    const newLongestStreak = Math.max(meta.longestWinStreak ?? 0, run.stats.longestStreak);
    saveMeta({
      ...meta,
      skulls: meta.skulls + skullsEarned,
      claws: meta.claws + run.claws,
      bestFloor: newBestFloor,
      totalCriticalHits: (meta.totalCriticalHits ?? 0) + run.stats.criticalHits,
      longestWinStreak: newLongestStreak,
    });
    // Store final stats before clearing
    const finalStats = { ...run.stats, claws: run.claws, floorsCleared };
    setRun(DEFAULT_RUN);
    setBattle(null);
    return { skullsEarned, finalStats };
  }, [meta, run.floorsCleared, run.stats, run.claws, saveMeta]);

  const purchaseUpgrade = useCallback((type: keyof Upgrades) => {
    const costs: Record<keyof Upgrades, number[]> = { squadSize: [20, 999], bondAttempts: [10, 20, 35, 999], atkBonus: [8, 15, 25, 40, 999], hpBonus: [8, 15, 25, 40, 999] };
    const cost = costs[type][meta.upgrades[type]] ?? 999;
    if (meta.skulls < cost) return false;
    saveMeta({ ...meta, skulls: meta.skulls - cost, upgrades: { ...meta.upgrades, [type]: meta.upgrades[type] + 1 } });
    return true;
  }, [meta, saveMeta]);

  const purchaseWithClaws = useCallback((cost: number) => {
    if (meta.claws < cost) return false;
    saveMeta({ ...meta, claws: meta.claws - cost });
    return true;
  }, [meta, saveMeta]);

  const getUpgradeCost = useCallback((type: keyof Upgrades) => {
    const costs: Record<keyof Upgrades, number[]> = { squadSize: [20, 999], bondAttempts: [10, 20, 35, 999], atkBonus: [8, 15, 25, 40, 999], hpBonus: [8, 15, 25, 40, 999] };
    return costs[type][meta.upgrades[type]] ?? 999;
  }, [meta.upgrades]);

  return {
    meta, run, battle, starters, metaLoaded,
    startNewRun, rerollStarters, selectStarter, removeStarter,
    enterBiome, enterRoom, leaveRoom, completeRoom, completeBiomeFloor,
    attack, bond, swapAnimal, useItem, useAbility,
    restSquad, collectTreasure, endRun,
    purchaseUpgrade, purchaseWithClaws, getUpgradeCost,
    setBattle, grantXp,
  };
}

export const [GameProvider, useGame] = createContextHook(useGameState);

import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/colors';
import { useGame } from '@/context/GameContext';
import { RunStats } from '@/constants/types';
import WrenDebrief from '@/components/WrenDebrief';

const EMPTY_STATS: RunStats = {
  floorsCleared: 0, animalsCaught: 0, claws: 0,
  totalDamageDealt: 0, totalDamageTaken: 0, criticalHits: 0,
  totalAttacks: 0, biggestHit: 0, biggestHitAnimal: '',
  longestStreak: 0, currentStreak: 0, biomesVisited: [],
  animalKOs: 0, favoriteAnimal: '', totalBondAttempts: 0,
  successfulBonds: 0, turnsPlayed: 0,
};

export default function GameOverScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { meta, run, endRun } = useGame();
  const hasEndedRun = useRef(false);
  const [debriefData, setDebriefData] = useState<{
    stats: RunStats; skullsEarned: number; totalSkulls: number; victory: boolean;
  } | null>(null);

  useEffect(() => {
    if (hasEndedRun.current) return;
    hasEndedRun.current = true;
    const victory = run.biomesCleared?.every(b => b) ?? false;
    const stats: RunStats = {
      ...EMPTY_STATS,
      ...(run.stats ?? {}),
      floorsCleared: run.floorsCleared ?? 0,
      animalsCaught: run.animalsCaught ?? 0,
      claws: run.claws ?? 0,
      biomesVisited: run.stats?.biomesVisited ?? [],
    };
    const result = endRun(victory);
    const skullsEarned = result?.skullsEarned ?? 0;
    setDebriefData({
      stats,
      skullsEarned,
      totalSkulls: (meta.skulls ?? 0) + skullsEarned,
      victory,
    });
  }, []);

  if (!debriefData) {
    return <View style={[styles.container, { paddingTop: insets.top }]} />;
  }

  return (
    <WrenDebrief
      stats={debriefData.stats}
      skullsEarned={debriefData.skullsEarned}
      totalSkulls={debriefData.totalSkulls}
      victory={debriefData.victory}
      onContinue={() => router.replace('/')}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
});
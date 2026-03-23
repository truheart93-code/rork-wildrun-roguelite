import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/colors';
import { useGame } from '@/context/GameContext';
import { RunStats } from '@/constants/types';
import WrenDebrief from '@/components/WrenDebrief';

export default function GameOverScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { meta, run, endRun } = useGame();

  const [debriefData, setDebriefData] = useState<{
    stats: RunStats;
    skullsEarned: number;
    totalSkulls: number;
    victory: boolean;
  } | null>(null);

  const hasEndedRun = useRef(false);

  useEffect(() => {
    if (!hasEndedRun.current) {
      hasEndedRun.current = true;
      const victory = run.biomesCleared.every(b => b);
      const stats = { ...run.stats, floorsCleared: run.floorsCleared, animalsCaught: run.animalsCaught, claws: run.claws };
      const result = endRun(victory);
      setDebriefData({
        stats,
        skullsEarned: result.skullsEarned,
        totalSkulls: meta.skulls + result.skullsEarned,
        victory,
      });
    }
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

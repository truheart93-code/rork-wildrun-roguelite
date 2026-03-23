import React, { useRef, useEffect, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/colors';
import { useGame } from '@/context/GameContext';
import RetroText from '@/components/RetroText';
import { Skull, Trophy, Footprints, Heart, Zap } from 'lucide-react-native';

export default function GameOverScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { meta, run, endRun } = useGame();

  const [stats] = useState(() => ({
    floorsCleared: run.floorsCleared,
    animalsCaught: run.animalsCaught,
    claws: run.claws,
    victory: run.biomesCleared.every(b => b),
  }));
  const [skullsEarned, setSkullsEarned] = useState(0);
  const hasEndedRun = useRef(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    if (!hasEndedRun.current) {
      hasEndedRun.current = true;
      const earned = endRun(stats.victory);
      setSkullsEarned(earned);
    }
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
      <Animated.View style={[styles.headerArea, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        {stats.victory ? (
          <>
            <Trophy size={40} color={COLORS.gold} />
            <RetroText variant="heading" color={COLORS.gold} style={styles.title}>VICTORY!</RetroText>
            <RetroText variant="body" color={COLORS.gray} style={styles.subtitle}>You conquered all biomes!</RetroText>
          </>
        ) : (
          <>
            <Skull size={40} color={COLORS.red} />
            <RetroText variant="heading" color={COLORS.red} style={styles.title}>RUN OVER</RetroText>
            <RetroText variant="body" color={COLORS.gray} style={styles.subtitle}>Your squad has fallen.</RetroText>
          </>
        )}
      </Animated.View>

      <Animated.View style={[styles.statsCard, { opacity: fadeAnim }]}>
        <RetroText variant="label" color={COLORS.gray} style={styles.sectionLabel}>RUN STATS</RetroText>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Footprints size={16} color={COLORS.green} />
            <RetroText variant="body" color={COLORS.gray} style={styles.statLabel}>Floors</RetroText>
            <RetroText variant="bodyBold" color={COLORS.white} style={styles.statValue}>{stats.floorsCleared}</RetroText>
          </View>
          <View style={styles.statItem}>
            <Heart size={16} color={COLORS.green} />
            <RetroText variant="body" color={COLORS.gray} style={styles.statLabel}>Caught</RetroText>
            <RetroText variant="bodyBold" color={COLORS.white} style={styles.statValue}>{stats.animalsCaught}</RetroText>
          </View>
          <View style={styles.statItem}>
            <Zap size={16} color={COLORS.gold} />
            <RetroText variant="body" color={COLORS.gray} style={styles.statLabel}>Claws</RetroText>
            <RetroText variant="bodyBold" color={COLORS.gold} style={styles.statValue}>{stats.claws}</RetroText>
          </View>
          <View style={styles.statItem}>
            <Skull size={16} color={COLORS.gold} />
            <RetroText variant="body" color={COLORS.gray} style={styles.statLabel}>Skulls</RetroText>
            <RetroText variant="bodyBold" color={COLORS.gold} style={styles.statValue}>+{skullsEarned}</RetroText>
          </View>
        </View>
      </Animated.View>

      <Animated.View style={[styles.skullsTotal, { opacity: fadeAnim }]}>
        <Skull size={20} color={COLORS.gold} />
        <RetroText variant="heading" color={COLORS.gold} style={styles.skullsTotalText}>{meta.skulls} Total Skulls</RetroText>
      </Animated.View>

      <RetroText variant="body" color={COLORS.gray} style={styles.hint}>
        Spend Skulls in the Field Store to upgrade your squad.
      </RetroText>

      <View style={[styles.bottomArea, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity style={styles.returnBtn} onPress={() => router.replace('/')} activeOpacity={0.8}>
          <RetroText variant="label" color={COLORS.bg} style={{ fontSize: 11 }}>RETURN TO TITLE</RetroText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, alignItems: 'center', paddingHorizontal: 24 },
  headerArea: { alignItems: 'center', gap: 8, marginBottom: 28 },
  title: { fontSize: 20 },
  subtitle: { fontSize: 15, textAlign: 'center' as const },
  statsCard: { backgroundColor: COLORS.bgCard, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#222826', width: '100%', marginBottom: 20 },
  sectionLabel: { fontSize: 8, marginBottom: 12, textAlign: 'center' as const },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center', gap: 4 },
  statLabel: { fontSize: 12 },
  statValue: { fontSize: 20 },
  skullsTotal: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  skullsTotalText: { fontSize: 14 },
  hint: { fontSize: 13, textAlign: 'center' as const, color: COLORS.grayDark, paddingHorizontal: 16 },
  bottomArea: { position: 'absolute', bottom: 0, left: 24, right: 24 },
  returnBtn: { backgroundColor: COLORS.green, paddingVertical: 16, borderRadius: 8, alignItems: 'center' },
});
import React, { useRef, useEffect, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/colors';
import { useGame } from '@/context/GameContext';
import { Upgrades } from '@/constants/types';
import RetroText from '@/components/RetroText';
import { Skull, Trophy, Footprints, Heart, Swords, Shield, Zap } from 'lucide-react-native';

const UPGRADE_INFO: Record<keyof Upgrades, { label: string; desc: string; icon: React.ReactNode; maxLevel: number }> = {
  squadSize: { label: 'Squad Size', desc: '+1 Squad Slot', icon: <Heart size={18} color={COLORS.green} />, maxLevel: 1 },
  bondAttempts: { label: 'Bond Attempts', desc: '+1 Bond per Run', icon: <Heart size={18} color={COLORS.blue} />, maxLevel: 3 },
  atkBonus: { label: 'ATK Bonus', desc: '+2 Base ATK', icon: <Swords size={18} color={COLORS.red} />, maxLevel: 4 },
  hpBonus: { label: 'HP Bonus', desc: '+5 Base HP', icon: <Shield size={18} color={COLORS.hpGreen} />, maxLevel: 4 },
};

export default function GameOverScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { meta, run, endRun, purchaseUpgrade, getUpgradeCost } = useGame();
  const [skullsEarned, setSkullsEarned] = useState(0);
  const [runEnded, setRunEnded] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  const victory = run.biomesCleared.every(b => b);

  useEffect(() => {
    if (!runEnded) {
      const earned = endRun(victory);
      setSkullsEarned(earned);
      setRunEnded(true);
    }

    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
      <Animated.View style={[styles.headerArea, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        {victory ? (
          <>
            <Trophy size={40} color={COLORS.gold} />
            <RetroText variant="heading" color={COLORS.gold} style={styles.title}>
              VICTORY!
            </RetroText>
          </>
        ) : (
          <>
            <Skull size={40} color={COLORS.red} />
            <RetroText variant="heading" color={COLORS.red} style={styles.title}>
              RUN OVER
            </RetroText>
          </>
        )}
      </Animated.View>

      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.statsCard, { opacity: fadeAnim }]}>
          <RetroText variant="label" color={COLORS.gray} style={styles.sectionLabel}>
            RUN STATS
          </RetroText>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Footprints size={16} color={COLORS.green} />
              <RetroText variant="body" color={COLORS.gray} style={styles.statLabel}>Floors</RetroText>
              <RetroText variant="bodyBold" color={COLORS.white} style={styles.statValue}>{run.floorsCleared}</RetroText>
            </View>
            <View style={styles.statItem}>
              <Heart size={16} color={COLORS.green} />
              <RetroText variant="body" color={COLORS.gray} style={styles.statLabel}>Caught</RetroText>
              <RetroText variant="bodyBold" color={COLORS.white} style={styles.statValue}>{run.animalsCaught}</RetroText>
            </View>
            <View style={styles.statItem}>
              <Zap size={16} color={COLORS.gold} />
              <RetroText variant="body" color={COLORS.gray} style={styles.statLabel}>Claws</RetroText>
              <RetroText variant="bodyBold" color={COLORS.gold} style={styles.statValue}>{run.claws}</RetroText>
            </View>
            <View style={styles.statItem}>
              <Skull size={16} color={COLORS.gold} />
              <RetroText variant="body" color={COLORS.gray} style={styles.statLabel}>Skulls</RetroText>
              <RetroText variant="bodyBold" color={COLORS.gold} style={styles.statValue}>+{skullsEarned}</RetroText>
            </View>
          </View>
        </Animated.View>

        <View style={styles.upgradeSection}>
          <RetroText variant="label" color={COLORS.gray} style={styles.sectionLabel}>
            PERMANENT UPGRADES
          </RetroText>
          <View style={styles.skullsInfo}>
            <Skull size={14} color={COLORS.gold} />
            <RetroText variant="bodyBold" color={COLORS.gold}>
              {meta.skulls} Skulls
            </RetroText>
          </View>
          {(Object.keys(UPGRADE_INFO) as Array<keyof Upgrades>).map(key => {
            const info = UPGRADE_INFO[key];
            const level = meta.upgrades[key];
            const cost = getUpgradeCost(key);
            const maxed = level >= info.maxLevel;
            const canAfford = meta.skulls >= cost;

            return (
              <View key={key} style={styles.upgradeRow}>
                <View style={styles.upgradeIcon}>{info.icon}</View>
                <View style={styles.upgradeInfo}>
                  <RetroText variant="bodyBold" color={COLORS.white}>{info.label}</RetroText>
                  <RetroText variant="body" color={COLORS.gray} style={{ fontSize: 13 }}>
                    {maxed ? 'MAX LEVEL' : info.desc}
                  </RetroText>
                  <View style={styles.levelPips}>
                    {Array.from({ length: info.maxLevel }).map((_, i) => (
                      <View key={i} style={[styles.levelPip, i < level && { backgroundColor: COLORS.green }]} />
                    ))}
                  </View>
                </View>
                {!maxed && (
                  <TouchableOpacity
                    style={[styles.buyBtn, !canAfford && styles.buyBtnDisabled]}
                    onPress={() => purchaseUpgrade(key)}
                    disabled={!canAfford}
                    activeOpacity={0.7}
                  >
                    <Skull size={12} color={canAfford ? COLORS.bg : COLORS.grayDark} />
                    <RetroText
                      variant="label"
                      color={canAfford ? COLORS.bg : COLORS.grayDark}
                      style={{ fontSize: 8 }}
                    >
                      {cost}
                    </RetroText>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>

      <View style={[styles.bottomArea, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={styles.returnBtn}
          onPress={() => router.replace('/')}
          activeOpacity={0.8}
        >
          <RetroText variant="label" color={COLORS.bg} style={{ fontSize: 11 }}>
            RETURN TO TITLE
          </RetroText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  headerArea: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 20,
    paddingBottom: 20,
  },
  statsCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#222826',
  },
  sectionLabel: {
    fontSize: 8,
    marginBottom: 10,
    textAlign: 'center' as const,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  statValue: {
    fontSize: 20,
  },
  upgradeSection: {
    gap: 10,
  },
  skullsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 4,
  },
  upgradeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#222826',
    gap: 10,
  },
  upgradeIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: COLORS.bgLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  upgradeInfo: {
    flex: 1,
    gap: 2,
  },
  levelPips: {
    flexDirection: 'row',
    gap: 3,
    marginTop: 2,
  },
  levelPip: {
    width: 14,
    height: 5,
    borderRadius: 2,
    backgroundColor: COLORS.grayDark,
  },
  buyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.gold,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
  },
  buyBtnDisabled: {
    backgroundColor: COLORS.bgLight,
  },
  bottomArea: {
    paddingHorizontal: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#1a1e1c',
  },
  returnBtn: {
    backgroundColor: COLORS.green,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
});

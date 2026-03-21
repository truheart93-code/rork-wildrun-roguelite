import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/colors';
import { useGame } from '@/context/GameContext';
import { Upgrades } from '@/constants/types';
import RetroText from '@/components/RetroText';
import { Store, Skull, X, Heart, Swords, Shield, Zap } from 'lucide-react-native';

const UPGRADE_CONFIG: Array<{ key: keyof Upgrades; label: string; desc: string; icon: React.ReactNode; maxLevel: number }> = [
  { key: 'squadSize', label: 'Squad Size', desc: '+1 Squad Slot (max 4)', icon: <Heart size={20} color={COLORS.green} />, maxLevel: 1 },
  { key: 'bondAttempts', label: 'Bond Attempts', desc: '+1 Bond per Run', icon: <Zap size={20} color={COLORS.blue} />, maxLevel: 3 },
  { key: 'atkBonus', label: 'ATK Bonus', desc: '+2 Base ATK per level', icon: <Swords size={20} color={COLORS.red} />, maxLevel: 4 },
  { key: 'hpBonus', label: 'HP Bonus', desc: '+5 Base HP per level', icon: <Shield size={20} color={COLORS.hpGreen} />, maxLevel: 4 },
];

export default function FieldStoreScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { meta, purchaseUpgrade, getUpgradeCost } = useGame();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <View style={styles.header}>
        <Store size={20} color={COLORS.gold} />
        <RetroText variant="heading" color={COLORS.gold} style={styles.title}>
          FIELD STORE
        </RetroText>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <X size={22} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.currencyBar}>
        <Skull size={18} color={COLORS.gold} />
        <RetroText variant="heading" color={COLORS.gold} style={styles.currencyValue}>
          {meta.skulls}
        </RetroText>
        <RetroText variant="body" color={COLORS.gray}>Skulls</RetroText>
      </View>

      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.upgradesList}>
        {UPGRADE_CONFIG.map(upgrade => {
          const level = meta.upgrades[upgrade.key];
          const cost = getUpgradeCost(upgrade.key);
          const maxed = level >= upgrade.maxLevel;
          const canAfford = meta.skulls >= cost;

          return (
            <View key={upgrade.key} style={styles.upgradeCard}>
              <View style={styles.upgradeTop}>
                <View style={styles.iconWrap}>{upgrade.icon}</View>
                <View style={styles.upgradeDetails}>
                  <RetroText variant="bodyBold" color={COLORS.white} style={styles.upgradeName}>
                    {upgrade.label}
                  </RetroText>
                  <RetroText variant="body" color={COLORS.gray} style={styles.upgradeDesc}>
                    {upgrade.desc}
                  </RetroText>
                </View>
              </View>
              <View style={styles.upgradeBottom}>
                <View style={styles.levelBar}>
                  {Array.from({ length: upgrade.maxLevel }).map((_, i) => (
                    <View
                      key={i}
                      style={[
                        styles.levelSegment,
                        i < level && { backgroundColor: COLORS.green },
                      ]}
                    />
                  ))}
                </View>
                {maxed ? (
                  <View style={styles.maxBadge}>
                    <RetroText variant="label" color={COLORS.green} style={{ fontSize: 8 }}>MAXED</RetroText>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[styles.buyButton, !canAfford && styles.buyButtonDisabled]}
                    onPress={() => purchaseUpgrade(upgrade.key)}
                    disabled={!canAfford}
                    activeOpacity={0.7}
                  >
                    <Skull size={12} color={canAfford ? COLORS.bg : COLORS.grayDark} />
                    <RetroText variant="label" color={canAfford ? COLORS.bg : COLORS.grayDark} style={{ fontSize: 9 }}>
                      {cost}
                    </RetroText>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
    position: 'relative',
  },
  title: {
    fontSize: 12,
  },
  closeBtn: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  currencyBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    marginBottom: 20,
  },
  currencyValue: {
    fontSize: 24,
  },
  scrollArea: {
    flex: 1,
  },
  upgradesList: {
    paddingHorizontal: 16,
    gap: 12,
    paddingBottom: 30,
  },
  upgradeCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#222826',
    gap: 10,
  },
  upgradeTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: COLORS.bgLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  upgradeDetails: {
    flex: 1,
    gap: 2,
  },
  upgradeName: {
    fontSize: 16,
  },
  upgradeDesc: {
    fontSize: 13,
  },
  upgradeBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  levelBar: {
    flexDirection: 'row',
    gap: 4,
    flex: 1,
  },
  levelSegment: {
    height: 6,
    flex: 1,
    borderRadius: 3,
    backgroundColor: COLORS.grayDark,
  },
  maxBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.green,
    marginLeft: 12,
  },
  buyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.gold,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 12,
  },
  buyButtonDisabled: {
    backgroundColor: COLORS.bgLight,
  },
});

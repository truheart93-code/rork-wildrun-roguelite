import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/colors';
import { useGame } from '@/context/GameContext';
import { Upgrades } from '@/constants/types';
import RetroText from '@/components/RetroText';
import { Store, Skull, X, Heart, Swords, Shield, Zap, RefreshCw, Package, BookOpen } from 'lucide-react-native';

type CurrencyType = 'skulls' | 'claws';

interface UpgradeConfig {
  key: keyof Upgrades;
  label: string;
  desc: string;
  icon: React.ReactNode;
  maxLevel: number;
  currency: CurrencyType;
  costs: number[];
  flavorText: string;
}

const SKULL_UPGRADES: UpgradeConfig[] = [
  {
    key: 'squadSize',
    label: 'Squad Size',
    desc: '+1 creature slot (max 4)',
    icon: <Heart size={22} color={COLORS.green} />,
    maxLevel: 1,
    currency: 'skulls',
    costs: [20],
    flavorText: 'A larger team means more options in the field.',
  },
  {
    key: 'bondAttempts',
    label: 'Bond Attempts',
    desc: '+1 bond attempt per run',
    icon: <Zap size={22} color={COLORS.blue} />,
    maxLevel: 3,
    currency: 'skulls',
    costs: [10, 20, 35],
    flavorText: 'More patience, more bonds.',
  },
  {
    key: 'atkBonus',
    label: 'ATK Bonus',
    desc: '+2 base attack per level',
    icon: <Swords size={22} color={COLORS.red} />,
    maxLevel: 4,
    currency: 'skulls',
    costs: [8, 15, 25, 40],
    flavorText: 'Field training pays off.',
  },
  {
    key: 'hpBonus',
    label: 'HP Bonus',
    desc: '+5 base HP per level',
    icon: <Shield size={22} color={COLORS.hpGreen} />,
    maxLevel: 4,
    currency: 'skulls',
    costs: [8, 15, 25, 40],
    flavorText: 'Resilience through experience.',
  },
];

// Claw-purchased consumables that get added to next run's starting inventory
const CLAW_ITEMS = [
  {
    id: 'buy_potion',
    label: 'Potion Pack',
    desc: 'Start next run with 2 Potions',
    detail: 'Each heals 30 HP in battle.',
    icon: <Package size={22} color={COLORS.catchGreen} />,
    cost: 30,
    flavorText: 'Basic field medicine.',
  },
  {
    id: 'buy_mega_potion',
    label: 'Mega Potion',
    desc: 'Start next run with 1 Mega Potion',
    detail: 'Heals 60 HP in battle.',
    icon: <Package size={22} color={COLORS.green} />,
    cost: 55,
    flavorText: 'Dr. Wren\'s special formula.',
  },
  {
    id: 'buy_revival',
    label: 'Revival Herb',
    desc: 'Start next run with 1 Revival Herb',
    detail: 'Revives a fainted creature at 25% HP.',
    icon: <Heart size={22} color={COLORS.hpGreen} />,
    cost: 70,
    flavorText: 'Rare. Use wisely.',
  },
  {
    id: 'buy_smoke',
    label: 'Smoke Bomb',
    desc: 'Start next run with 1 Smoke Bomb',
    detail: 'Flee from any non-boss battle.',
    icon: <RefreshCw size={22} color={COLORS.whiteDim} />,
    cost: 40,
    flavorText: 'Sometimes retreat is wisdom.',
  },
  {
    id: 'buy_strength',
    label: 'Strength Tonic',
    desc: 'Start next run with 1 Strength Tonic',
    detail: '+5 ATK for one battle.',
    icon: <Swords size={22} color={COLORS.red} />,
    cost: 35,
    flavorText: 'Pre-battle preparation.',
  },
  {
    id: 'buy_swift',
    label: 'Swift Seed',
    desc: 'Start next run with 1 Swift Seed',
    detail: '+5 SPD for one battle.',
    icon: <Zap size={22} color={COLORS.gold} />,
    cost: 35,
    flavorText: 'Speed wins encounters.',
  },
];

export default function FieldStoreScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { meta, run, purchaseUpgrade, getUpgradeCost } = useGame();
  const [activeTab, setActiveTab] = useState<'upgrades' | 'supplies'>('upgrades');
  const [purchased, setPurchased] = useState<string[]>([]);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotif = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2000);
  };

  const handleBuyUpgrade = (key: keyof Upgrades) => {
    const success = purchaseUpgrade(key);
    if (success) showNotif('Upgrade purchased!');
    else showNotif('Not enough Skulls!');
  };

  const handleBuyItem = (item: typeof CLAW_ITEMS[0]) => {
    if (run.claws < item.cost) {
      showNotif('Not enough Claws!');
      return;
    }
    // Track purchased (actual item injection would be in GameContext)
    setPurchased(p => [...p, item.id]);
    showNotif(`${item.label} — ready for next run!`);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      {/* Header */}
      <View style={styles.header}>
        <Store size={20} color={COLORS.gold} />
        <RetroText variant="heading" color={COLORS.gold} style={styles.title}>
          FIELD STORE
        </RetroText>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <X size={22} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* Dr. Wren tagline */}
      <RetroText variant="body" color={COLORS.grayDark} style={styles.tagline}>
        "Invest in your research. The wilderness won't wait." — Dr. Wren
      </RetroText>

      {/* Currency display */}
      <View style={styles.currencyBar}>
        <View style={styles.currencyChip}>
          <Skull size={16} color={COLORS.gold} />
          <RetroText variant="heading" color={COLORS.gold} style={styles.currencyValue}>
            {meta.skulls}
          </RetroText>
          <RetroText variant="label" color={COLORS.grayDark} style={styles.currencyLabel}>SKULLS</RetroText>
        </View>
        <View style={styles.currencyDivider} />
        <View style={styles.currencyChip}>
          <RetroText variant="heading" color={COLORS.whiteDim} style={styles.currencyIcon}>⚡</RetroText>
          <RetroText variant="heading" color={COLORS.whiteDim} style={styles.currencyValue}>
            {run.claws}
          </RetroText>
          <RetroText variant="label" color={COLORS.grayDark} style={styles.currencyLabel}>CLAWS</RetroText>
        </View>
      </View>

      {/* Notification toast */}
      {notification && (
        <View style={styles.toast}>
          <RetroText variant="label" color={COLORS.bg} style={styles.toastText}>{notification}</RetroText>
        </View>
      )}

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'upgrades' && styles.tabActive]}
          onPress={() => setActiveTab('upgrades')}
        >
          <Skull size={14} color={activeTab === 'upgrades' ? COLORS.bg : COLORS.gray} />
          <RetroText variant="label" color={activeTab === 'upgrades' ? COLORS.bg : COLORS.gray} style={styles.tabText}>
            UPGRADES
          </RetroText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'supplies' && styles.tabActiveClaws]}
          onPress={() => setActiveTab('supplies')}
        >
          <Package size={14} color={activeTab === 'supplies' ? COLORS.bg : COLORS.gray} />
          <RetroText variant="label" color={activeTab === 'supplies' ? COLORS.bg : COLORS.gray} style={styles.tabText}>
            SUPPLIES
          </RetroText>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {activeTab === 'upgrades' ? (
          <>
            <RetroText variant="body" color={COLORS.grayDark} style={styles.sectionNote}>
              Permanent upgrades. Paid with Skulls earned between runs.
            </RetroText>
            {SKULL_UPGRADES.map(upgrade => {
              const level = meta.upgrades[upgrade.key];
              const cost = getUpgradeCost(upgrade.key);
              const maxed = level >= upgrade.maxLevel;
              const canAfford = meta.skulls >= cost;

              return (
                <View key={upgrade.key} style={styles.upgradeCard}>
                  <View style={styles.cardTop}>
                    <View style={styles.iconWrap}>{upgrade.icon}</View>
                    <View style={styles.cardInfo}>
                      <View style={styles.cardTitleRow}>
                        <RetroText variant="bodyBold" color={COLORS.white} style={styles.cardLabel}>
                          {upgrade.label}
                        </RetroText>
                        {maxed && (
                          <View style={styles.maxBadge}>
                            <RetroText variant="label" color={COLORS.green} style={styles.maxText}>MAX</RetroText>
                          </View>
                        )}
                      </View>
                      <RetroText variant="body" color={COLORS.gray} style={styles.cardDesc}>{upgrade.desc}</RetroText>
                      <RetroText variant="body" color={COLORS.grayDark} style={styles.flavorText}>
                        "{upgrade.flavorText}"
                      </RetroText>
                    </View>
                  </View>

                  <View style={styles.cardBottom}>
                    {/* Level bar */}
                    <View style={styles.levelBar}>
                      {Array.from({ length: upgrade.maxLevel }).map((_, i) => (
                        <View
                          key={i}
                          style={[styles.levelSeg, i < level && { backgroundColor: COLORS.green }]}
                        />
                      ))}
                    </View>
                    <RetroText variant="label" color={COLORS.grayDark} style={styles.levelText}>
                      {level}/{upgrade.maxLevel}
                    </RetroText>

                    {!maxed && (
                      <TouchableOpacity
                        style={[styles.buyBtn, !canAfford && styles.buyBtnDisabled]}
                        onPress={() => handleBuyUpgrade(upgrade.key)}
                        disabled={!canAfford}
                        activeOpacity={0.8}
                      >
                        <Skull size={13} color={canAfford ? COLORS.bg : COLORS.grayDark} />
                        <RetroText variant="label" color={canAfford ? COLORS.bg : COLORS.grayDark} style={styles.buyBtnText}>
                          {cost}
                        </RetroText>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}
          </>
        ) : (
          <>
            <RetroText variant="body" color={COLORS.grayDark} style={styles.sectionNote}>
              Items available at start of your next run. Paid with Claws.
            </RetroText>
            {CLAW_ITEMS.map(item => {
              const alreadyBought = purchased.includes(item.id);
              const canAfford = run.claws >= item.cost;

              return (
                <View key={item.id} style={[styles.upgradeCard, alreadyBought && styles.cardBought]}>
                  <View style={styles.cardTop}>
                    <View style={styles.iconWrap}>{item.icon}</View>
                    <View style={styles.cardInfo}>
                      <RetroText variant="bodyBold" color={COLORS.white} style={styles.cardLabel}>
                        {item.label}
                      </RetroText>
                      <RetroText variant="body" color={COLORS.gray} style={styles.cardDesc}>{item.desc}</RetroText>
                      <RetroText variant="body" color={COLORS.grayDark} style={styles.cardDesc}>{item.detail}</RetroText>
                      <RetroText variant="body" color={COLORS.grayDark} style={styles.flavorText}>
                        "{item.flavorText}"
                      </RetroText>
                    </View>
                  </View>

                  <View style={[styles.cardBottom, { justifyContent: 'flex-end' }]}>
                    {alreadyBought ? (
                      <View style={styles.boughtBadge}>
                        <RetroText variant="label" color={COLORS.green} style={styles.maxText}>✓ READY</RetroText>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={[styles.buyBtnClaws, !canAfford && styles.buyBtnDisabled]}
                        onPress={() => handleBuyItem(item)}
                        disabled={!canAfford}
                        activeOpacity={0.8}
                      >
                        <RetroText variant="label" color={canAfford ? COLORS.bg : COLORS.grayDark} style={styles.currencyIcon2}>⚡</RetroText>
                        <RetroText variant="label" color={canAfford ? COLORS.bg : COLORS.grayDark} style={styles.buyBtnText}>
                          {item.cost}
                        </RetroText>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingHorizontal: 16, paddingBottom: 4, position: 'relative',
  },
  title: { fontSize: 12 },
  closeBtn: { position: 'absolute', right: 16, padding: 4 },
  tagline: { textAlign: 'center', fontSize: 11, fontStyle: 'italic', paddingHorizontal: 20, marginBottom: 10 },
  currencyBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginHorizontal: 16, marginBottom: 8,
    backgroundColor: COLORS.bgCard, borderRadius: 10,
    borderWidth: 1, borderColor: '#222826',
    paddingVertical: 10,
  },
  currencyChip: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  currencyDivider: { width: 1, height: 28, backgroundColor: '#222826' },
  currencyValue: { fontSize: 22 },
  currencyLabel: { fontSize: 7 },
  currencyIcon: { fontSize: 16 },
  toast: {
    marginHorizontal: 16, marginBottom: 6,
    backgroundColor: COLORS.green, borderRadius: 6,
    paddingVertical: 8, alignItems: 'center',
  },
  toastText: { fontSize: 9 },
  tabs: {
    flexDirection: 'row', marginHorizontal: 16, marginBottom: 8,
    backgroundColor: COLORS.bgCard, borderRadius: 8,
    borderWidth: 1, borderColor: '#222826', overflow: 'hidden',
  },
  tab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 10,
  },
  tabActive: { backgroundColor: COLORS.gold },
  tabActiveClaws: { backgroundColor: COLORS.whiteDim },
  tabText: { fontSize: 9 },
  scrollArea: { flex: 1 },
  list: { paddingHorizontal: 16, paddingBottom: 30, gap: 10 },
  sectionNote: { fontSize: 12, textAlign: 'center', paddingVertical: 4 },
  upgradeCard: {
    backgroundColor: COLORS.bgCard, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: '#222826', gap: 10,
  },
  cardBought: { borderColor: COLORS.green + '40' },
  cardTop: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  iconWrap: {
    width: 48, height: 48, borderRadius: 10,
    backgroundColor: COLORS.bgLight, justifyContent: 'center', alignItems: 'center',
  },
  cardInfo: { flex: 1, gap: 3 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardLabel: { fontSize: 16 },
  cardDesc: { fontSize: 13 },
  flavorText: { fontSize: 11, fontStyle: 'italic', marginTop: 2 },
  cardBottom: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  levelBar: { flex: 1, flexDirection: 'row', gap: 4 },
  levelSeg: { height: 6, flex: 1, borderRadius: 3, backgroundColor: COLORS.grayDark },
  levelText: { fontSize: 8 },
  maxBadge: {
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4,
    borderWidth: 1, borderColor: COLORS.green,
  },
  boughtBadge: {
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 4,
    borderWidth: 1, borderColor: COLORS.green,
  },
  maxText: { fontSize: 8 },
  buyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: COLORS.gold, paddingHorizontal: 16, paddingVertical: 9,
    borderRadius: 8,
  },
  buyBtnClaws: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: COLORS.whiteDim, paddingHorizontal: 16, paddingVertical: 9,
    borderRadius: 8,
  },
  buyBtnDisabled: { backgroundColor: COLORS.bgLight },
  buyBtnText: { fontSize: 12 },
  currencyIcon2: { fontSize: 12 },
});

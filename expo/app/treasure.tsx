import React, { useState, useRef, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/colors';
import { useGame } from '@/context/GameContext';
import { ItemTemplate } from '@/constants/types';
import RetroText from '@/components/RetroText';
import { Gift, Skull } from 'lucide-react-native';

export default function TreasureScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { collectTreasure, completeRoom } = useGame();
  const [treasure, setTreasure] = useState<{ clawsEarned: number; skullsEarned: number; item: ItemTemplate | null } | null>(null);
  const [chestOpened, setChestOpened] = useState(false);

  const chestScale = useRef(new Animated.Value(0.8)).current;
  const chestRotate = useRef(new Animated.Value(0)).current;
  const rewardFade = useRef(new Animated.Value(0)).current;
  const rewardSlide = useRef(new Animated.Value(30)).current;
  const glowPulse = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.spring(chestScale, { toValue: 1, friction: 4, useNativeDriver: true }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, { toValue: 0.6, duration: 1000, useNativeDriver: true }),
        Animated.timing(glowPulse, { toValue: 0.3, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const openChest = () => {
    if (chestOpened) return;

    Animated.sequence([
      Animated.timing(chestRotate, { toValue: -0.05, duration: 100, useNativeDriver: true }),
      Animated.timing(chestRotate, { toValue: 0.05, duration: 100, useNativeDriver: true }),
      Animated.timing(chestRotate, { toValue: -0.03, duration: 80, useNativeDriver: true }),
      Animated.timing(chestRotate, { toValue: 0, duration: 80, useNativeDriver: true }),
      Animated.timing(chestScale, { toValue: 1.2, duration: 200, useNativeDriver: true }),
      Animated.timing(chestScale, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      const result = collectTreasure();
      setTreasure(result);
      setChestOpened(true);

      Animated.parallel([
        Animated.timing(rewardFade, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(rewardSlide, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]).start();
    });
  };

  const handleCollect = () => {
    completeRoom();
    router.back();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 40 }]}>
      <RetroText variant="heading" color={COLORS.gold} style={styles.title}>
        TREASURE
      </RetroText>

      <View style={styles.chestArea}>
        <Animated.View style={[styles.glow, { opacity: glowPulse }]} />
        <Animated.View
          style={{
            transform: [
              { scale: chestScale },
              { rotate: chestRotate.interpolate({ inputRange: [-1, 1], outputRange: ['-30deg', '30deg'] }) },
            ],
          }}
        >
          <TouchableOpacity
            onPress={openChest}
            activeOpacity={0.8}
            disabled={chestOpened}
            style={styles.chestTouch}
          >
            <View style={[styles.chest, chestOpened && styles.chestOpened]}>
              <Gift size={60} color={chestOpened ? COLORS.gold : COLORS.goldDark} />
            </View>
          </TouchableOpacity>
        </Animated.View>

        {!chestOpened && (
          <RetroText variant="body" color={COLORS.gray} style={styles.tapHint}>
            Tap to open
          </RetroText>
        )}
      </View>

      {treasure && (
        <Animated.View style={[styles.rewardsArea, { opacity: rewardFade, transform: [{ translateY: rewardSlide }] }]}>
          <View style={styles.rewardRow}>
            <View style={styles.rewardItem}>
              <RetroText variant="body" color={COLORS.gray} style={styles.rewardLabel}>
                Claws
              </RetroText>
              <RetroText variant="heading" color={COLORS.gold} style={styles.rewardValue}>
                +{treasure.clawsEarned}
              </RetroText>
            </View>
            {treasure.skullsEarned > 0 && (
              <View style={styles.rewardItem}>
                <Skull size={16} color={COLORS.gold} />
                <RetroText variant="heading" color={COLORS.gold} style={styles.rewardValue}>
                  +{treasure.skullsEarned}
                </RetroText>
              </View>
            )}
          </View>
          {treasure.item && (
            <View style={styles.itemReward}>
              <RetroText variant="bodyBold" color={COLORS.green}>
                Found: {treasure.item.name}
              </RetroText>
              <RetroText variant="body" color={COLORS.gray} style={{ fontSize: 13 }}>
                {treasure.item.description}
              </RetroText>
            </View>
          )}
        </Animated.View>
      )}

      <View style={[styles.bottomArea, { paddingBottom: insets.bottom + 16 }]}>
        {chestOpened && (
          <TouchableOpacity style={styles.collectBtn} onPress={handleCollect} activeOpacity={0.8}>
            <RetroText variant="label" color={COLORS.bg} style={{ fontSize: 11 }}>
              COLLECT
            </RetroText>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    textShadowColor: COLORS.gold,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  chestArea: {
    marginTop: 40,
    alignItems: 'center',
  },
  glow: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: COLORS.gold,
  },
  chestTouch: {
    padding: 20,
  },
  chest: {
    width: 120,
    height: 100,
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: COLORS.goldDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chestOpened: {
    borderColor: COLORS.gold,
    backgroundColor: COLORS.gold + '15',
  },
  tapHint: {
    marginTop: 12,
    fontSize: 14,
  },
  rewardsArea: {
    marginTop: 30,
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 24,
  },
  rewardRow: {
    flexDirection: 'row',
    gap: 24,
  },
  rewardItem: {
    alignItems: 'center',
    gap: 4,
  },
  rewardLabel: {
    fontSize: 13,
  },
  rewardValue: {
    fontSize: 20,
  },
  itemReward: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.green + '40',
    alignItems: 'center',
    gap: 4,
  },
  bottomArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
  },
  collectBtn: {
    backgroundColor: COLORS.gold,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
});

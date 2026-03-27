import React, { useState, useRef, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/colors';
import { useGame } from '@/context/GameContext';
import { ItemTemplate } from '@/constants/types';
import RetroText from '@/components/RetroText';
import { Gift, Skull, BookOpen } from 'lucide-react-native';

type TreasureVariant = 'chest' | 'relic' | 'field_notes';

const FIELD_NOTES = [
  { title: 'Hunting Patterns', note: 'Predators tire after 3 missed strikes. Wait for the opening.' },
  { title: 'Defensive Posture', note: 'Prey animals shield their young. Use that instinct against them.' },
  { title: 'Migration Data', note: 'Animals weaken when far from their native biome. Use terrain.' },
  { title: 'Bonding Theory', note: "Lower HP = higher bond rate. Patience is the researcher's greatest weapon." },
  { title: 'Alpha Dynamics', note: 'Bosses have a tell — they always strike hardest when cornered.' },
  { title: 'Speed Observations', note: 'The fastest animal always strikes first. Never underestimate SPD.' },
];

const RELIC_BUFFS = [
  { name: 'Ancient Fang', desc: '+3 ATK to your entire squad this run', statKey: 'atk', value: 3 },
  { name: 'Stone Hide', desc: '+4 DEF to your entire squad this run', statKey: 'def', value: 4 },
  { name: 'Spirit Root', desc: '+15 HP to your entire squad this run', statKey: 'hp', value: 15 },
  { name: 'Wind Charm', desc: '+3 SPD to your entire squad this run', statKey: 'spd', value: 3 },
];

function getTreasureVariant(): TreasureVariant {
  const r = Math.random();
  if (r < 0.6) return 'chest';
  if (r < 0.82) return 'relic';
  return 'field_notes';
}

export default function TreasureScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { collectTreasure, completeRoom, applyRelicBuff } = useGame();
  const [variant] = useState<TreasureVariant>(getTreasureVariant);
  const [fieldNote] = useState(() => FIELD_NOTES[Math.floor(Math.random() * FIELD_NOTES.length)]);
  const [relic] = useState(() => RELIC_BUFFS[Math.floor(Math.random() * RELIC_BUFFS.length)]);
  const [treasure, setTreasure] = useState<{ clawsEarned: number; skullsEarned: number; item: ItemTemplate | null } | null>(null);
  const [opened, setOpened] = useState(false);
  const chestScale = useRef(new Animated.Value(0.85)).current;
  const rewardFade = useRef(new Animated.Value(0)).current;
  const rewardSlide = useRef(new Animated.Value(30)).current;
  const glowPulse = useRef(new Animated.Value(0.3)).current;
  const iconBob = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(chestScale, { toValue: 1, friction: 4, useNativeDriver: true }).start();
    Animated.loop(Animated.sequence([
      Animated.timing(glowPulse, { toValue: 0.7, duration: 1100, useNativeDriver: true }),
      Animated.timing(glowPulse, { toValue: 0.3, duration: 1100, useNativeDriver: true }),
    ])).start();
    Animated.loop(Animated.sequence([
      Animated.timing(iconBob, { toValue: -8, duration: 1400, useNativeDriver: true }),
      Animated.timing(iconBob, { toValue: 0, duration: 1400, useNativeDriver: true }),
    ])).start();
  }, []);

  const open = () => {
    if (opened) return;
    Animated.sequence([
      Animated.timing(chestScale, { toValue: 1.25, duration: 180, useNativeDriver: true }),
      Animated.timing(chestScale, { toValue: 1, duration: 180, useNativeDriver: true }),
    ]).start(() => {
      if (variant === 'chest') { const result = collectTreasure(); setTreasure(result); }
      else if (variant === 'relic') { applyRelicBuff?.(relic.statKey as any, relic.value); }
      else if (variant === 'field_notes') { collectTreasure(); }
      setOpened(true);
      Animated.parallel([
        Animated.timing(rewardFade, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(rewardSlide, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]).start();
    });
  };

  const handleCollect = () => { completeRoom(); router.back(); };

  const cfg = {
    chest: { color: COLORS.gold, label: 'TREASURE CHEST', icon: '📦' },
    relic: { color: '#b06aff', label: 'ANCIENT RELIC', icon: '🏺' },
    field_notes: { color: COLORS.green, label: "DR. WREN'S FIELD NOTES", icon: '📋' },
  }[variant];

  return (
    <View style={[styles.container, { paddingTop: insets.top + 30 }]}>
      <RetroText variant="heading" color={cfg.color} style={styles.title}>{cfg.label}</RetroText>
      <View style={styles.chestArea}>
        <Animated.View style={[styles.glow, { backgroundColor: cfg.color, opacity: glowPulse }]} />
        <Animated.View style={{ transform: [{ scale: chestScale }, { translateY: iconBob }] }}>
          <TouchableOpacity onPress={open} disabled={opened} activeOpacity={0.8} style={styles.chestTouch}>
            <View style={[styles.chest, opened && { borderColor: cfg.color, backgroundColor: cfg.color + '15' }]}>
              <RetroText variant="heading" color={cfg.color} style={styles.chestEmoji}>{cfg.icon}</RetroText>
            </View>
          </TouchableOpacity>
        </Animated.View>
        {!opened && <RetroText variant="body" color={COLORS.gray} style={styles.tapHint}>Tap to open</RetroText>}
      </View>
      {opened && (
        <Animated.View style={[styles.rewardsArea, { opacity: rewardFade, transform: [{ translateY: rewardSlide }] }]}>
          {variant === 'chest' && treasure && (
            <>
              <View style={styles.rewardRow}>
                <View style={styles.rewardItem}>
                  <RetroText variant="label" color={COLORS.grayDark} style={styles.rewardLabel}>CLAWS</RetroText>
                  <RetroText variant="heading" color={COLORS.gold} style={styles.rewardValue}>+{treasure.clawsEarned}</RetroText>
                </View>
                {(treasure.skullsEarned ?? 0) > 0 && (
                  <View style={styles.rewardItem}>
                    <Skull size={18} color={COLORS.gold} />
                    <RetroText variant="heading" color={COLORS.gold} style={styles.rewardValue}>+{treasure.skullsEarned}</RetroText>
                  </View>
                )}
              </View>
              {treasure.item && (
                <View style={styles.itemBox}>
                  <RetroText variant="bodyBold" color={COLORS.green} style={styles.itemName}>🎁 {treasure.item.name}</RetroText>
                  <RetroText variant="body" color={COLORS.gray} style={styles.itemDesc}>{treasure.item.description}</RetroText>
                </View>
              )}
            </>
          )}
          {variant === 'relic' && (
            <View style={[styles.relicBox, { borderColor: '#b06aff40' }]}>
              <RetroText variant="heading" color="#b06aff" style={styles.relicName}>✦ {relic.name}</RetroText>
              <RetroText variant="body" color={COLORS.whiteDim} style={styles.relicDesc}>{relic.desc}</RetroText>
              <View style={styles.relicBadge}><RetroText variant="label" color="#b06aff" style={styles.relicBadgeText}>PERMANENT THIS RUN</RetroText></View>
            </View>
          )}
          {variant === 'field_notes' && (
            <>
              <View style={styles.notesBox}>
                <View style={styles.notesHeader}>
                  <BookOpen size={16} color={COLORS.green} />
                  <RetroText variant="bodyBold" color={COLORS.green} style={styles.notesTitle}>{fieldNote.title}</RetroText>
                </View>
                <RetroText variant="body" color={COLORS.whiteDim} style={styles.notesText}>"{fieldNote.note}"</RetroText>
                <RetroText variant="label" color={COLORS.grayDark} style={styles.notesAttrib}>— Dr. Wren</RetroText>
              </View>
              <View style={styles.rewardRow}>
                <View style={styles.rewardItem}>
                  <Skull size={16} color={COLORS.gold} />
                  <RetroText variant="heading" color={COLORS.gold} style={styles.rewardValue}>+2</RetroText>
                  <RetroText variant="body" color={COLORS.gray} style={styles.rewardLabel}>Skulls</RetroText>
                </View>
              </View>
            </>
          )}
        </Animated.View>
      )}
      <View style={[styles.bottomArea, { paddingBottom: insets.bottom + 16 }]}>
        {opened && (
          <TouchableOpacity style={[styles.collectBtn, { backgroundColor: cfg.color }]} onPress={handleCollect} activeOpacity={0.8}>
            <RetroText variant="label" color={COLORS.bg} style={styles.collectText}>COLLECT & CONTINUE →</RetroText>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, alignItems: 'center' },
  title: { fontSize: 13, textAlign: 'center', paddingHorizontal: 20 },
  chestArea: { marginTop: 30, alignItems: 'center', gap: 12 },
  glow: { position: 'absolute', width: 180, height: 180, borderRadius: 90 },
  chestTouch: { padding: 16 },
  chest: { width: 120, height: 110, backgroundColor: COLORS.bgCard, borderRadius: 16, borderWidth: 2, borderColor: COLORS.goldDark, justifyContent: 'center', alignItems: 'center' },
  chestEmoji: { fontSize: 48 },
  tapHint: { fontSize: 14 },
  rewardsArea: { marginTop: 24, alignItems: 'center', gap: 16, paddingHorizontal: 24, width: '100%' },
  rewardRow: { flexDirection: 'row', gap: 28 },
  rewardItem: { alignItems: 'center', gap: 4 },
  rewardLabel: { fontSize: 11 },
  rewardValue: { fontSize: 22 },
  itemBox: { backgroundColor: COLORS.bgCard, borderRadius: 10, padding: 14, borderWidth: 1, borderColor: COLORS.green + '40', alignItems: 'center', gap: 4, width: '100%' },
  itemName: { fontSize: 16 },
  itemDesc: { fontSize: 13, textAlign: 'center' },
  relicBox: { backgroundColor: COLORS.bgCard, borderRadius: 12, padding: 18, borderWidth: 1, alignItems: 'center', gap: 10, width: '100%' },
  relicName: { fontSize: 16 },
  relicDesc: { fontSize: 14, textAlign: 'center', lineHeight: 22 },
  relicBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4, borderWidth: 1, borderColor: '#b06aff60' },
  relicBadgeText: { fontSize: 8 },
  notesBox: { backgroundColor: COLORS.bgCard, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: COLORS.green + '30', width: '100%', gap: 8 },
  notesHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  notesTitle: { fontSize: 15 },
  notesText: { fontSize: 14, lineHeight: 22, fontStyle: 'italic' },
  notesAttrib: { fontSize: 10, textAlign: 'right' },
  bottomArea: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 24 },
  collectBtn: { paddingVertical: 16, borderRadius: 10, alignItems: 'center' },
  collectText: { fontSize: 11 },
});
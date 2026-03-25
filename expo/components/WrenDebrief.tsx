import React, { useState, useRef, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/colors';
import { RunStats } from '@/constants/types';
import RetroText from '@/components/RetroText';
import AnimalSilhouette from '@/components/AnimalSilhouette';
import { Trophy, Skull, ChevronRight } from 'lucide-react-native';

interface DebriefProps {
  stats: RunStats;
  skullsEarned: number;
  totalSkulls: number;
  victory: boolean;
  onContinue: () => void;
}

// Generate Dr. Wren's personalised commentary based on run stats
function generateWrenLines(stats: RunStats, victory: boolean, skullsEarned: number): string[] {
  const lines: string[] = [];

  // Opening
  if (victory) {
    lines.push("Extraordinary. You've cleared all four biomes. The data we've collected is unprecedented.");
  } else if (stats.floorsCleared === 0) {
    lines.push("That was... brief. But every expedition teaches us something. Even the short ones.");
  } else if (stats.floorsCleared < 3) {
    lines.push("A rough outing. The wilderness doesn't give second chances - but we do. That's what the Field Store is for.");
  } else {
    lines.push(`${stats.floorsCleared} floors. Not bad at all. You pushed deep into territory most researchers never reach.`);
  }

  // Combat analysis
  if (stats.criticalHits > 5) {
    lines.push(`${stats.criticalHits} critical hits! Your timing is exceptional. The creatures barely knew what hit them.`);
  } else if (stats.criticalHits > 0) {
    lines.push(`${stats.criticalHits} critical hit${stats.criticalHits > 1 ? 's' : ''}. Keep reading your opponents - you'll land more.`);
  }

  if (stats.biggestHit > 0) {
    lines.push(`Biggest hit: ${stats.biggestHit} damage from ${stats.biggestHitAnimal || 'your squad'}. That's the kind of power that clears boss rooms.`);
  }

  // Bond analysis
  if (stats.successfulBonds > 0 && stats.totalBondAttempts > 0) {
    const bondPct = Math.round((stats.successfulBonds / stats.totalBondAttempts) * 100);
    lines.push(`Bond success rate: ${bondPct}%. ${bondPct >= 70 ? "Remarkable instincts." : bondPct >= 40 ? "Room to improve, but solid effort." : "Bonding is an art. Keep at it."}`);
  } else if (stats.totalBondAttempts === 0) {
    lines.push("You didn't attempt a single bond this run. Remember - catching creatures is how we build the Field Journal.");
  }

  // Damage taken
  if (stats.totalDamageTaken === 0 && stats.floorsCleared > 0) {
    lines.push("You took zero damage. Flawless field work. I'm genuinely impressed.");
  } else if (stats.totalDamageTaken > 200) {
    lines.push(`You absorbed ${stats.totalDamageTaken} total damage. Consider upgrading HP or leaning on Rest rooms more.`);
  }

  // Streak
  if (stats.longestStreak >= 5) {
    lines.push(`A ${stats.longestStreak}-win streak! Your squad found its rhythm. That kind of momentum is hard to stop.`);
  }

  // Biomes
  if (stats.biomesVisited.length > 1) {
    lines.push(`You explored ${stats.biomesVisited.join(', ')}. A well-rounded expedition.`);
  } else if (stats.biomesVisited.length === 1) {
    lines.push(`You only reached the ${stats.biomesVisited[0]}. Three more biomes await - each with creatures we've never catalogued.`);
  }

  // Motivation for next run
  if (victory) {
    lines.push("The Field Journal grows. But there's always more to discover. Rest up, researcher. The wild never sleeps.");
  } else {
    const motivation = [
      `You've earned ${skullsEarned} Skulls. Spend them wisely in the Field Store before your next expedition.`,
      "Every run makes you sharper. The creatures you faced today will be easier to handle next time.",
      "Failure is just data we haven't analyzed yet. Come back stronger.",
      "The biomes will still be there. So will we. Regroup and try again.",
    ];
    lines.push(motivation[Math.floor(Math.random() * motivation.length)]);
  }

  return lines;
}

export default function WrenDebriefScreen({ stats, skullsEarned, totalSkulls, victory, onContinue }: DebriefProps) {
  const insets = useSafeAreaInsets();
  const [page, setPage] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [typing, setTyping] = useState(true);
  const typingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const wrenFloat = useRef(new Animated.Value(0)).current;
  const lines = useRef(generateWrenLines(stats, victory, skullsEarned)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(wrenFloat, { toValue: -6, duration: 2000, useNativeDriver: true }),
        Animated.timing(wrenFloat, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    setDisplayedText('');
    setTyping(true);
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();

    const fullText = lines[page];
    let i = 0;
    if (typingRef.current) clearInterval(typingRef.current);
    typingRef.current = setInterval(() => {
      i++;
      setDisplayedText(fullText.slice(0, i));
      if (i >= fullText.length) {
        clearInterval(typingRef.current!);
        setTyping(false);
      }
    }, 20);
    return () => { if (typingRef.current) clearInterval(typingRef.current); };
  }, [page]);

  const handleNext = () => {
    if (typing) {
      if (typingRef.current) clearInterval(typingRef.current);
      setDisplayedText(lines[page]);
      setTyping(false);
      return;
    }
    if (page < lines.length - 1) {
      setPage(p => p + 1);
    } else {
      onContinue();
    }
  };

  const isLast = page === lines.length - 1;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Background */}
      <View style={[styles.bg, { backgroundColor: victory ? '#0a1a0e' : '#0f0a0a' }]} />

      {/* Header */}
      <View style={styles.header}>
        {victory ? (
          <Trophy size={24} color={COLORS.gold} />
        ) : (
          <Skull size={24} color={COLORS.red} />
        )}
        <RetroText variant="heading" color={victory ? COLORS.gold : COLORS.red} style={styles.headerTitle}>
          {victory ? 'RUN COMPLETE' : 'RUN ENDED'}
        </RetroText>
      </View>

      {/* Run stats strip */}
      <View style={styles.statsStrip}>
        <View style={styles.statPill}>
          <RetroText variant="label" color={COLORS.grayDark} style={styles.statPillLabel}>FLOORS</RetroText>
          <RetroText variant="bodyBold" color={COLORS.white} style={styles.statPillValue}>{stats.floorsCleared}</RetroText>
        </View>
        <View style={styles.statPill}>
          <RetroText variant="label" color={COLORS.grayDark} style={styles.statPillLabel}>CAUGHT</RetroText>
          <RetroText variant="bodyBold" color={COLORS.green} style={styles.statPillValue}>{stats.animalsCaught}</RetroText>
        </View>
        <View style={styles.statPill}>
          <RetroText variant="label" color={COLORS.grayDark} style={styles.statPillLabel}>CRITS</RetroText>
          <RetroText variant="bodyBold" color={COLORS.gold} style={styles.statPillValue}>{stats.criticalHits}</RetroText>
        </View>
        <View style={styles.statPill}>
          <RetroText variant="label" color={COLORS.grayDark} style={styles.statPillLabel}>SKULLS</RetroText>
          <RetroText variant="bodyBold" color={COLORS.gold} style={styles.statPillValue}>+{skullsEarned}</RetroText>
        </View>
      </View>

      {/* Dr. Wren scene */}
      <View style={styles.sceneArea}>
        <Animated.View style={[styles.wrenArea, { transform: [{ translateY: wrenFloat }] }]}>
          <View style={styles.wrenBadge}>
            <View style={[styles.wrenDot, { backgroundColor: victory ? COLORS.green : COLORS.red }]} />
            <RetroText variant="label" color={victory ? COLORS.green : COLORS.red} style={styles.wrenName}>
              DR. WREN
            </RetroText>
            <RetroText variant="body" color={COLORS.grayDark} style={styles.wrenRole}>
              Post-Run Analysis
            </RetroText>
          </View>
          <View style={styles.wrenAnimals}>
            <AnimalSilhouette animalId="snowy_owl" color={victory ? COLORS.green : COLORS.grayDark} size={48} />
            <AnimalSilhouette animalId="capybara" color={victory ? COLORS.green : COLORS.grayDark} size={40} />
          </View>
        </Animated.View>

        {/* Detailed stats (visible mid-scroll) */}
        <View style={styles.detailStats}>
          <View style={styles.detailRow}>
            <RetroText variant="label" color={COLORS.grayDark} style={styles.detailLabel}>DAMAGE DEALT</RetroText>
            <RetroText variant="bodyBold" color={COLORS.red} style={styles.detailValue}>{stats.totalDamageDealt}</RetroText>
          </View>
          <View style={styles.detailRow}>
            <RetroText variant="label" color={COLORS.grayDark} style={styles.detailLabel}>DAMAGE TAKEN</RetroText>
            <RetroText variant="bodyBold" color={COLORS.whiteDim} style={styles.detailValue}>{stats.totalDamageTaken}</RetroText>
          </View>
          <View style={styles.detailRow}>
            <RetroText variant="label" color={COLORS.grayDark} style={styles.detailLabel}>BEST HIT</RetroText>
            <RetroText variant="bodyBold" color={COLORS.gold} style={styles.detailValue}>
              {stats.biggestHit} {stats.biggestHitAnimal ? `(${stats.biggestHitAnimal})` : ''}
            </RetroText>
          </View>
          <View style={styles.detailRow}>
            <RetroText variant="label" color={COLORS.grayDark} style={styles.detailLabel}>WIN STREAK</RetroText>
            <RetroText variant="bodyBold" color={COLORS.green} style={styles.detailValue}>{stats.longestStreak}</RetroText>
          </View>
          <View style={styles.detailRow}>
            <RetroText variant="label" color={COLORS.grayDark} style={styles.detailLabel}>TURNS PLAYED</RetroText>
            <RetroText variant="bodyBold" color={COLORS.whiteDim} style={styles.detailValue}>{stats.turnsPlayed}</RetroText>
          </View>
          <View style={styles.detailRow}>
            <RetroText variant="label" color={COLORS.grayDark} style={styles.detailLabel}>TOTAL SKULLS</RetroText>
            <RetroText variant="bodyBold" color={COLORS.gold} style={styles.detailValue}>{totalSkulls}</RetroText>
          </View>
        </View>
      </View>

      {/* Dialogue box */}
      <Animated.View style={[styles.dialogueBox, { opacity: fadeAnim, borderTopColor: victory ? COLORS.green + '60' : COLORS.red + '40' }]}>
        <View style={styles.dialogueHeader}>
          <View style={[styles.speakerDot, { backgroundColor: victory ? COLORS.green : COLORS.red }]} />
          <RetroText variant="label" color={victory ? COLORS.green : COLORS.red} style={styles.speakerName}>
            DR. WREN
          </RetroText>
          <RetroText variant="label" color={COLORS.grayDark} style={styles.pageCount}>
            {page + 1}/{lines.length}
          </RetroText>
        </View>

        <View style={styles.textArea}>
          <RetroText variant="body" color={COLORS.whiteDim} style={styles.dialogueText}>
            {displayedText}
          </RetroText>
        </View>

        <TouchableOpacity style={[styles.nextBtn, { backgroundColor: victory ? COLORS.green : COLORS.red }]} onPress={handleNext} activeOpacity={0.8}>
          <RetroText variant="label" color={COLORS.bg} style={styles.nextText}>
            {typing ? 'SKIP ›' : isLast ? 'RETURN TO TITLE →' : 'NEXT →'}
          </RetroText>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  bg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 14 },
  headerTitle: { fontSize: 14 },
  statsStrip: {
    flexDirection: 'row', marginHorizontal: 12, marginBottom: 8,
    backgroundColor: COLORS.bgCard, borderRadius: 10, overflow: 'hidden',
    borderWidth: 1, borderColor: '#222826',
  },
  statPill: { flex: 1, alignItems: 'center', paddingVertical: 10, gap: 3 },
  statPillLabel: { fontSize: 7 },
  statPillValue: { fontSize: 18 },
  sceneArea: { flex: 1, paddingHorizontal: 16, gap: 12 },
  wrenArea: { alignItems: 'center', gap: 8, paddingVertical: 8 },
  wrenBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: COLORS.bgCard, borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1, borderColor: '#222826',
  },
  wrenDot: { width: 8, height: 8, borderRadius: 4 },
  wrenName: { fontSize: 10 },
  wrenRole: { fontSize: 11 },
  wrenAnimals: { flexDirection: 'row', gap: 10, alignItems: 'flex-end' },
  detailStats: {
    backgroundColor: COLORS.bgCard, borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: '#222826', gap: 8,
  },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailLabel: { fontSize: 8 },
  detailValue: { fontSize: 14 },
  dialogueBox: {
    backgroundColor: COLORS.bgCard,
    borderTopWidth: 2,
    paddingHorizontal: 16, paddingTop: 14, paddingBottom: 12,
    gap: 10,
  },
  dialogueHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  speakerDot: { width: 8, height: 8, borderRadius: 4 },
  speakerName: { fontSize: 9, flex: 1 },
  pageCount: { fontSize: 8 },
  textArea: { minHeight: 60 },
  dialogueText: { fontSize: 14, lineHeight: 22 },
  nextBtn: { paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
  nextText: { fontSize: 10 },
});

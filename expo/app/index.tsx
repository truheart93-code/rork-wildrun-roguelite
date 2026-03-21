import React, { useEffect, useRef, useMemo } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/colors';
import { useGame } from '@/context/GameContext';
import RetroText from '@/components/RetroText';
import AnimalSilhouette from '@/components/AnimalSilhouette';
import { Skull, BookOpen, Store } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const FLOATING_ANIMALS = [
  { id: 'lion', color: COLORS.savanna, x: 0.12, y: 0.18 },
  { id: 'orca', color: COLORS.ocean, x: 0.68, y: 0.14 },
  { id: 'gorilla', color: COLORS.jungle, x: 0.15, y: 0.32 },
  { id: 'polar_bear', color: COLORS.arctic, x: 0.65, y: 0.30 },
];

export default function TitleScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { meta, startNewRun, metaLoaded } = useGame();

  const floatAnims = useRef(FLOATING_ANIMALS.map(() => new Animated.Value(0))).current;
  const glowAnim = useRef(new Animated.Value(0.6)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;

  // Generate particle positions once on mount — not on every render
  const particles = useMemo(() =>
    Array.from({ length: 20 }).map((_, i) => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      width: 2 + Math.random() * 3,
      height: 2 + Math.random() * 3,
      opacity: 0.1 + Math.random() * 0.2,
      color: i % 3 === 0 ? COLORS.green : i % 3 === 1 ? COLORS.gold : COLORS.arctic,
    })),
  []);

  useEffect(() => {
    floatAnims.forEach((anim, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: -10 - i * 3, duration: 1800 + i * 400, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 10 + i * 2, duration: 1800 + i * 400, useNativeDriver: true }),
        ])
      ).start();
    });

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.6, duration: 2000, useNativeDriver: true }),
      ])
    ).start();

    Animated.spring(logoScale, { toValue: 1, friction: 4, tension: 40, useNativeDriver: true }).start();
  }, []);

  const handleNewRun = () => {
    startNewRun();
    router.push('/starter-camp');
  };

  if (!metaLoaded) return <View style={styles.container} />;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>

      {/* Background particles — positions stable via useMemo */}
      <View style={styles.particlesContainer}>
        {particles.map((p, i) => (
          <View
            key={i}
            style={[
              styles.particle,
              {
                left: `${p.left}%` as never,
                top: `${p.top}%` as never,
                width: p.width,
                height: p.height,
                opacity: p.opacity,
                backgroundColor: p.color,
              },
            ]}
          />
        ))}
      </View>

      {/* Floating animal silhouettes */}
      <View style={styles.silhouettesContainer}>
        {FLOATING_ANIMALS.map((animal, i) => (
          <Animated.View
            key={animal.id}
            style={[
              styles.floatingAnimal,
              {
                left: animal.x * SCREEN_WIDTH,
                top: animal.y * 300,
                transform: [{ translateY: floatAnims[i] }],
                opacity: 0.25,
              },
            ]}
          >
            <AnimalSilhouette animalId={animal.id} color={animal.color} size={64} />
          </Animated.View>
        ))}
      </View>

      {/* Logo — single text with animated opacity for glow effect */}
      <View style={styles.logoSection}>
        <Animated.View style={{ transform: [{ scale: logoScale }] }}>
          <Animated.View style={{ opacity: glowAnim }}>
            <RetroText
              variant="heading"
              color={COLORS.green}
              style={styles.logoTextMain}
            >
              WILDRUN
            </RetroText>
          </Animated.View>
        </Animated.View>
        <RetroText variant="body" color={COLORS.gray} style={styles.subtitle}>
          creature roguelite
        </RetroText>
      </View>

      {/* Buttons */}
      <View style={styles.buttonsSection}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleNewRun}
          activeOpacity={0.8}
          testID="new-run-button"
        >
          <RetroText variant="label" color={COLORS.bg} style={styles.buttonText}>
            NEW RUN
          </RetroText>
        </TouchableOpacity>

        <View style={styles.secondaryRow}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push('/field-journal')}
            activeOpacity={0.8}
            testID="journal-button"
          >
            <BookOpen size={16} color={COLORS.green} />
            <RetroText variant="label" color={COLORS.green} style={styles.secButtonText}>
              JOURNAL
            </RetroText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push('/field-store')}
            activeOpacity={0.8}
            testID="store-button"
          >
            <Store size={16} color={COLORS.gold} />
            <RetroText variant="label" color={COLORS.gold} style={styles.secButtonText}>
              STORE
            </RetroText>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats row */}
      <View style={[styles.statsRow, { paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.statItem}>
          <RetroText variant="label" color={COLORS.grayDark} style={styles.statLabel}>
            RUNS
          </RetroText>
          <RetroText variant="bodyBold" color={COLORS.white} style={styles.statValue}>
            {meta.totalRuns}
          </RetroText>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <RetroText variant="label" color={COLORS.grayDark} style={styles.statLabel}>
            BEST FLOOR
          </RetroText>
          <RetroText variant="bodyBold" color={COLORS.white} style={styles.statValue}>
            {meta.bestFloor}
          </RetroText>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Skull size={12} color={COLORS.gold} />
          <RetroText variant="bodyBold" color={COLORS.gold} style={styles.statValue}>
            {meta.skulls}
          </RetroText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  particlesContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  particle: {
    position: 'absolute',
    borderRadius: 4,
  },
  silhouettesContainer: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    height: 300,
  },
  floatingAnimal: {
    position: 'absolute',
  },
  logoSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  logoTextMain: {
    fontSize: 32,
    textShadowColor: COLORS.green,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    textAlign: 'center' as const,
  },
  subtitle: {
    fontSize: 20,
    marginTop: 8,
    letterSpacing: 4,
    textTransform: 'uppercase' as const,
  },
  buttonsSection: {
    paddingHorizontal: 40,
    gap: 14,
    paddingBottom: 30,
  },
  primaryButton: {
    backgroundColor: COLORS.green,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: COLORS.green,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonText: {
    fontSize: 14,
    letterSpacing: 2,
  },
  secondaryRow: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.bgCard,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.grayDark,
  },
  secButtonText: {
    fontSize: 10,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1a1e1c',
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
    flexDirection: 'row',
  },
  statLabel: {
    fontSize: 7,
    marginRight: 6,
  },
  statValue: {
    fontSize: 18,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.grayDark,
  },
});

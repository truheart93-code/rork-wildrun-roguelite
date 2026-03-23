import React, { useEffect, useRef, useMemo, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '@/constants/colors';
import { useGame } from '@/context/GameContext';
import RetroText from '@/components/RetroText';
import AnimalSilhouette from '@/components/AnimalSilhouette';
import { Skull, BookOpen, Store, Zap } from 'lucide-react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const BIOME_CYCLE = [
  { name: 'SAVANNA', color: COLORS.savanna, bg: ['#1a0e04', '#3d1e06', '#7a3d10'] as [string,string,string], animals: ['lion', 'cheetah', 'zebra'] },
  { name: 'OCEAN', color: COLORS.ocean, bg: ['#020810', '#041830', '#072850'] as [string,string,string], animals: ['orca', 'shark', 'narwhal'] },
  { name: 'JUNGLE', color: COLORS.jungle, bg: ['#010a01', '#041404', '#082808'] as [string,string,string], animals: ['gorilla', 'jaguar', 'toucan'] },
  { name: 'ARCTIC', color: COLORS.arctic, bg: ['#05080f', '#0a1020', '#101828'] as [string,string,string], animals: ['polar_bear', 'snowy_owl', 'wolverine'] },
];

const FLOATING_ANIMALS = [
  { id: 'lion', color: COLORS.savanna, x: 0.08, y: 0.12 },
  { id: 'orca', color: COLORS.ocean, x: 0.70, y: 0.10 },
  { id: 'gorilla', color: COLORS.jungle, x: 0.06, y: 0.28 },
  { id: 'polar_bear', color: COLORS.arctic, x: 0.68, y: 0.26 },
  { id: 'jaguar', color: COLORS.jungle, x: 0.72, y: 0.42 },
  { id: 'snowy_owl', color: COLORS.arctic, x: 0.05, y: 0.44 },
];

export default function TitleScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { meta, startNewRun, metaLoaded } = useGame();

  const [biomeIndex, setBiomeIndex] = useState(0);
  const biomeAnim = useRef(new Animated.Value(1)).current;

  const floatAnims = useRef(FLOATING_ANIMALS.map((_, i) => new Animated.Value(0))).current;
  const glowAnim = useRef(new Animated.Value(0.5)).current;
  const logoScale = useRef(new Animated.Value(0.85)).current;
  const logoY = useRef(new Animated.Value(-20)).current;
  const btnScale = useRef(new Animated.Value(0.95)).current;

  const particles = useMemo(() =>
    Array.from({ length: 24 }).map((_, i) => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: 1.5 + Math.random() * 2.5,
      opacity: 0.08 + Math.random() * 0.18,
      color: i % 4 === 0 ? COLORS.green : i % 4 === 1 ? COLORS.gold : i % 4 === 2 ? COLORS.arctic : COLORS.savanna,
    })),
  []);

  // Biome cycling
  useEffect(() => {
    const interval = setInterval(() => {
      Animated.timing(biomeAnim, { toValue: 0, duration: 600, useNativeDriver: true }).start(() => {
        setBiomeIndex(i => (i + 1) % BIOME_CYCLE.length);
        Animated.timing(biomeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
      });
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Float animals
    floatAnims.forEach((anim, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: -12 - i * 2, duration: 2000 + i * 300, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 8 + i * 2, duration: 2000 + i * 300, useNativeDriver: true }),
        ])
      ).start();
    });

    // Glow pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 2200, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.5, duration: 2200, useNativeDriver: true }),
      ])
    ).start();

    // Logo entrance
    Animated.parallel([
      Animated.spring(logoScale, { toValue: 1, friction: 5, tension: 50, useNativeDriver: true }),
      Animated.timing(logoY, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();

    // Button pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(btnScale, { toValue: 1.02, duration: 900, useNativeDriver: true }),
        Animated.timing(btnScale, { toValue: 0.98, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleNewRun = () => {
    startNewRun();
    router.push('/intro');
  };

  const currentBiome = BIOME_CYCLE[biomeIndex];

  if (!metaLoaded) return <View style={styles.container} />;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Animated biome gradient background */}
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: biomeAnim }]}>
        <LinearGradient
          colors={currentBiome.bg}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
      </Animated.View>

      {/* Dark overlay so content stays readable */}
      <LinearGradient
        colors={['rgba(10,12,11,0.3)', 'rgba(10,12,11,0.7)', 'rgba(10,12,11,0.95)']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* Particles */}
      <View style={styles.particlesContainer}>
        {particles.map((p, i) => (
          <View key={i} style={[styles.particle, {
            left: `${p.left}%` as any,
            top: `${p.top}%` as any,
            width: p.size, height: p.size,
            opacity: p.opacity,
            backgroundColor: p.color,
          }]} />
        ))}
      </View>

      {/* Floating animal silhouettes */}
      <View style={styles.silhouettesContainer}>
        {FLOATING_ANIMALS.map((animal, i) => (
          <Animated.View
            key={animal.id}
            style={[styles.floatingAnimal, {
              left: animal.x * SCREEN_WIDTH,
              top: animal.y * SCREEN_HEIGHT * 0.6,
              transform: [{ translateY: floatAnims[i] }],
            }]}
          >
            <AnimalSilhouette animalId={animal.id} color={animal.color} size={52} />
          </Animated.View>
        ))}
      </View>

      {/* Biome indicator */}
      <Animated.View style={[styles.biomeIndicator, { opacity: biomeAnim }]}>
        <View style={[styles.biomeDot, { backgroundColor: currentBiome.color }]} />
        <RetroText variant="label" color={currentBiome.color} style={styles.biomeLabel}>
          {currentBiome.name}
        </RetroText>
      </Animated.View>

      {/* Logo section */}
      <View style={styles.logoSection}>
        <Animated.View style={{
          transform: [{ scale: logoScale }, { translateY: logoY }],
          alignItems: 'center',
        }}>
          <Animated.View style={{ opacity: glowAnim }}>
            <RetroText variant="heading" color={COLORS.green} style={styles.logoText}>
              WILDRUN
            </RetroText>
          </Animated.View>
          <RetroText variant="body" color={COLORS.gray} style={styles.tagline}>
            creature roguelite
          </RetroText>
        </Animated.View>

        {/* Biome animal showcase */}
        <Animated.View style={[styles.biomeShowcase, { opacity: biomeAnim }]}>
          {currentBiome.animals.map((id, i) => (
            <AnimalSilhouette
              key={id}
              animalId={id}
              color={currentBiome.color}
              size={32 + i * 4}
            />
          ))}
        </Animated.View>
      </View>

      {/* Buttons section */}
      <View style={styles.buttonsSection}>
        <Animated.View style={{ transform: [{ scale: btnScale }] }}>
          <TouchableOpacity
            style={[styles.primaryButton, { shadowColor: COLORS.green }]}
            onPress={handleNewRun}
            activeOpacity={0.85}
          >
            <Zap size={18} color={COLORS.bg} />
            <RetroText variant="label" color={COLORS.bg} style={styles.primaryBtnText}>
              NEW RUN
            </RetroText>
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.secondaryRow}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push('/field-journal')}
            activeOpacity={0.8}
          >
            <BookOpen size={15} color={COLORS.green} />
            <RetroText variant="label" color={COLORS.green} style={styles.secBtnText}>JOURNAL</RetroText>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push('/field-store')}
            activeOpacity={0.8}
          >
            <Store size={15} color={COLORS.gold} />
            <RetroText variant="label" color={COLORS.gold} style={styles.secBtnText}>STORE</RetroText>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats row */}
      <View style={[styles.statsRow, { paddingBottom: insets.bottom + 14 }]}>
        <View style={styles.statItem}>
          <RetroText variant="label" color={COLORS.grayDark} style={styles.statLabel}>RUNS</RetroText>
          <RetroText variant="bodyBold" color={COLORS.white} style={styles.statValue}>{meta.totalRuns}</RetroText>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <RetroText variant="label" color={COLORS.grayDark} style={styles.statLabel}>BEST</RetroText>
          <RetroText variant="bodyBold" color={COLORS.white} style={styles.statValue}>{meta.bestFloor}</RetroText>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <RetroText variant="label" color={COLORS.grayDark} style={styles.statLabel}>STREAK</RetroText>
          <RetroText variant="bodyBold" color={COLORS.green} style={styles.statValue}>{meta.longestWinStreak ?? 0}</RetroText>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Skull size={11} color={COLORS.gold} />
          <RetroText variant="bodyBold" color={COLORS.gold} style={styles.statValue}>{meta.skulls}</RetroText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  particlesContainer: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  particle: { position: 'absolute', borderRadius: 4 },
  silhouettesContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' },
  floatingAnimal: { position: 'absolute', opacity: 0.2 },
  biomeIndicator: {
    position: 'absolute', top: 16, left: 16,
    flexDirection: 'row', alignItems: 'center', gap: 6,
  },
  biomeDot: { width: 6, height: 6, borderRadius: 3 },
  biomeLabel: { fontSize: 8, letterSpacing: 2 },
  logoSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  logoText: {
    fontSize: 36,
    textShadowColor: COLORS.green,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
    letterSpacing: 4,
  },
  tagline: {
    fontSize: 16,
    letterSpacing: 6,
    textTransform: 'uppercase',
    marginTop: 6,
  },
  biomeShowcase: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'flex-end',
    opacity: 0.7,
  },
  buttonsSection: {
    paddingHorizontal: 32,
    gap: 10,
    paddingBottom: 16,
  },
  primaryButton: {
    backgroundColor: COLORS.green,
    paddingVertical: 18,
    borderRadius: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 8,
  },
  primaryBtnText: { fontSize: 14, letterSpacing: 3 },
  secondaryRow: { flexDirection: 'row', gap: 10 },
  secondaryButton: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 7,
    backgroundColor: COLORS.bgCard,
    paddingVertical: 14, borderRadius: 8,
    borderWidth: 1, borderColor: COLORS.grayDark,
  },
  secBtnText: { fontSize: 9 },
  statsRow: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    gap: 12, paddingHorizontal: 20, paddingTop: 12,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)',
  },
  statItem: { alignItems: 'center', gap: 3, flexDirection: 'row' },
  statLabel: { fontSize: 7, marginRight: 5 },
  statValue: { fontSize: 16 },
  statDivider: { width: 1, height: 20, backgroundColor: COLORS.grayDark },
});

import React, { useEffect, useState, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, BIOME_COLORS } from '@/constants/colors';
import { useGame } from '@/context/GameContext';
import RetroText from '@/components/RetroText';
import AnimalSilhouette from '@/components/AnimalSilhouette';
import HpBar from '@/components/HpBar';
import { Moon } from 'lucide-react-native';

export default function RestScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { run, restSquad, completeRoom } = useGame();
  const [healed, setHealed] = useState(false);
  const [preHealHp, setPreHealHp] = useState([]);
  const [healAmounts, setHealAmounts] = useState([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const floatAnims = useRef(run.squad.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const currentHps = run.squad.map(a => a.currentHp);
    const amounts = run.squad.map(a => {
      if (a.currentHp <= 0) return 0;
      const heal = Math.floor(a.maxHp * 0.3);
      return Math.min(heal, a.maxHp - a.currentHp);
    });
    setPreHealHp(currentHps);
    setHealAmounts(amounts);
    const timer = setTimeout(() => {
      restSquad();
      setHealed(true);
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    }, 800);
    floatAnims.forEach((anim, i) => {
      Animated.loop(Animated.sequence([
        Animated.timing(anim, { toValue: -6, duration: 2000 + i * 300, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 6, duration: 2000 + i * 300, useNativeDriver: true }),
      ])).start();
    });
    return () => clearTimeout(timer);
  }, []);

  const handleContinue = () => { completeRoom(); router.back(); };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
      <View style={styles.sceneHeader}>
        <Moon size={28} color={COLORS.blue} />
        <RetroText variant="heading" color={COLORS.blue} style={styles.title}>REST CAMP</RetroText>
        <RetroText variant="body" color={COLORS.gray} style={styles.subtitle}>Your squad rests and recovers...</RetroText>
      </View>
      <View style={styles.animalsArea}>
        {run.squad.map((animal, i) => {
          const biomeColor = BIOME_COLORS[animal.biome] ?? COLORS.green;
          const isFainted = (preHealHp[i] ?? animal.currentHp) <= 0;
          const displayHp = healed ? animal.currentHp : (preHealHp[i] ?? animal.currentHp);
          return (
            <Animated.View key={animal.uniqueId} style={[styles.animalRow, isFainted && styles.animalRowFainted, { transform: [{ translateY: floatAnims[i] ?? new Animated.Value(0) }] }]}>
              <View style={styles.silhouetteWrap}>
                <AnimalSilhouette animalId={animal.id} color={isFainted ? COLORS.grayDark : biomeColor} size={52} />
                {isFainted && <View style={styles.faintedBadge}><RetroText variant="label" color={COLORS.red} style={styles.faintedText}>FAINTED</RetroText></View>}
              </View>
              <View style={styles.animalInfo}>
                <RetroText variant="bodyBold" color={isFainted ? COLORS.grayDark : COLORS.white}>{animal.name}</RetroText>
                {isFainted
                  ? <RetroText variant="body" color={COLORS.grayDark} style={{ fontSize: 12 }}>Cannot heal while fainted</RetroText>
                  : <HpBar current={displayHp} max={animal.maxHp} width={100} height={8} showNumbers />
                }
              </View>
              {healed && !isFainted && (healAmounts[i] ?? 0) > 0 && (
                <Animated.View style={{ opacity: fadeAnim }}><RetroText variant="bodyBold" color={COLORS.hpGreen} style={styles.healText}>+{healAmounts[i]}</RetroText></Animated.View>
              )}
              {healed && !isFainted && (healAmounts[i] ?? 0) === 0 && (
                <Animated.View style={{ opacity: fadeAnim }}><RetroText variant="body" color={COLORS.grayDark} style={styles.healText}>Full</RetroText></Animated.View>
              )}
            </Animated.View>
          );
        })}
      </View>
      <View style={styles.campfire}>
        <View style={styles.fireGlow} />
        <RetroText variant="body" color={COLORS.gold} style={styles.fireEmoji}>🔥</RetroText>
      </View>
      <View style={[styles.bottomArea, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity style={[styles.continueBtn, !healed && { opacity: 0.5 }]} onPress={handleContinue} activeOpacity={0.8} disabled={!healed}>
          <RetroText variant="label" color={COLORS.bg} style={{ fontSize: 11 }}>CONTINUE</RetroText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, alignItems: 'center' },
  sceneHeader: { alignItems: 'center', gap: 6, marginBottom: 30 },
  title: { fontSize: 14 },
  subtitle: { fontSize: 15 },
  animalsArea: { gap: 16, paddingHorizontal: 24, width: '100%' },
  animalRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgCard, borderRadius: 12, padding: 12, gap: 12, borderWidth: 1, borderColor: '#222826' },
  animalRowFainted: { opacity: 0.6, borderColor: COLORS.red + '40' },
  silhouetteWrap: { alignItems: 'center', position: 'relative' },
  faintedBadge: { marginTop: 2 },
  faintedText: { fontSize: 7, color: COLORS.red },
  animalInfo: { flex: 1, gap: 4 },
  healText: { fontSize: 18 },
  campfire: { marginTop: 30, alignItems: 'center' },
  fireGlow: { position: 'absolute', width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.gold, opacity: 0.1 },
  fireEmoji: { fontSize: 40 },
  bottomArea: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 24 },
  continueBtn: { backgroundColor: COLORS.blue, paddingVertical: 16, borderRadius: 8, alignItems: 'center' },
});
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
  const [healAmounts, setHealAmounts] = useState<number[]>([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const floatAnims = useRef(run.squad.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const amounts = run.squad.map(a => {
      const heal = Math.floor(a.maxHp * 0.3);
      const actual = Math.min(heal, a.maxHp - a.currentHp);
      return actual;
    });
    setHealAmounts(amounts);

    const timer = setTimeout(() => {
      restSquad();
      setHealed(true);
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    }, 800);

    floatAnims.forEach((anim, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: -6, duration: 2000 + i * 300, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 6, duration: 2000 + i * 300, useNativeDriver: true }),
        ])
      ).start();
    });

    return () => clearTimeout(timer);
  }, []);

  const handleContinue = () => {
    completeRoom();
    router.back();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
      <View style={styles.sceneHeader}>
        <Moon size={28} color={COLORS.blue} />
        <RetroText variant="heading" color={COLORS.blue} style={styles.title}>
          REST CAMP
        </RetroText>
        <RetroText variant="body" color={COLORS.gray} style={styles.subtitle}>
          Your squad rests and recovers...
        </RetroText>
      </View>

      <View style={styles.animalsArea}>
        {run.squad.map((animal, i) => {
          const biomeColor = BIOME_COLORS[animal.biome] ?? COLORS.green;
          return (
            <Animated.View key={animal.uniqueId} style={[styles.animalRow, { transform: [{ translateY: floatAnims[i] ?? new Animated.Value(0) }] }]}>
              <AnimalSilhouette animalId={animal.id} color={biomeColor} size={52} />
              <View style={styles.animalInfo}>
                <RetroText variant="bodyBold" color={COLORS.white}>
                  {animal.name}
                </RetroText>
                <HpBar
                  current={healed ? Math.min(animal.maxHp, animal.currentHp) : animal.currentHp}
                  max={animal.maxHp}
                  width={100}
                  height={8}
                  showNumbers
                />
              </View>
              {healed && healAmounts[i] > 0 && (
                <Animated.View style={{ opacity: fadeAnim }}>
                  <RetroText variant="bodyBold" color={COLORS.hpGreen} style={styles.healText}>
                    +{healAmounts[i]}
                  </RetroText>
                </Animated.View>
              )}
            </Animated.View>
          );
        })}
      </View>

      <View style={styles.campfire}>
        <View style={styles.fireGlow} />
        <RetroText variant="body" color={COLORS.gold} style={styles.fireEmoji}>
          🔥
        </RetroText>
      </View>

      <View style={[styles.bottomArea, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={[styles.continueBtn, !healed && { opacity: 0.5 }]}
          onPress={handleContinue}
          activeOpacity={0.8}
          disabled={!healed}
        >
          <RetroText variant="label" color={COLORS.bg} style={{ fontSize: 11 }}>
            CONTINUE
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
    alignItems: 'center',
  },
  sceneHeader: {
    alignItems: 'center',
    gap: 6,
    marginBottom: 30,
  },
  title: {
    fontSize: 14,
  },
  subtitle: {
    fontSize: 15,
  },
  animalsArea: {
    gap: 16,
    paddingHorizontal: 24,
    width: '100%',
  },
  animalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: 12,
    padding: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#222826',
  },
  animalInfo: {
    flex: 1,
    gap: 4,
  },
  healText: {
    fontSize: 18,
  },
  campfire: {
    marginTop: 30,
    alignItems: 'center',
  },
  fireGlow: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.gold,
    opacity: 0.1,
  },
  fireEmoji: {
    fontSize: 40,
  },
  bottomArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
  },
  continueBtn: {
    backgroundColor: COLORS.blue,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
});

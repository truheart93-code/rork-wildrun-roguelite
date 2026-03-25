import React from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/colors';
import { BIOMES } from '@/constants/biomes';
import { useGame } from '@/context/GameContext';
import RetroText from '@/components/RetroText';
import SquadSlots from '@/components/SquadSlots';
import { Lock, ChevronRight, Map } from 'lucide-react-native';


const BIOME_LORE: Record<string, string> = {
  savanna: "Vast open plains where speed and strength rule. Lions, cheetahs, and elephants compete for dominance. Dr. Wren's Tip: bring fast creatures - slow ones get left behind.",
  ocean: "The deep holds ancient creatures with high HP and surprising intelligence. Orcas coordinate attacks. Dr. Wren's Tip: high DEF animals survive here longer.",
  jungle: "Dense canopy where poison and ambush tactics thrive. Visibility is low, danger is high. Dr. Wren's Tip: Anacondas and frogs use status effects - plan around them.",
  arctic: "Frozen tundra where only the toughest survive. Bosses here stun and freeze. Dr. Wren's Tip: bring a healer or high-SPD creature to act first.",
};
export default function WorldMapScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { run, meta, enterBiome } = useGame();
  const [loreBiome, setLoreBiome] = React.useState<string | null>(null);

  const handleSelectBiome = (index: number) => {
    const biome = BIOMES[index];
    if (!run.biomesCleared[index]) {
      setLoreBiome(biome.type);
      return;
    }
    enterBiome(index);
    router.push('/dungeon-map');
  };
  const confirmEnterBiome = (index: number) => {
    setLoreBiome(null);
    enterBiome(index);
    router.push('/dungeon-map');
  };

  const isBiomeUnlocked = (index: number) => {
    if (index === 0) return true;
    return run.biomesCleared[index - 1];
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <View style={styles.header}>
        <Map size={18} color={COLORS.green} />
        <RetroText variant="heading" color={COLORS.green} style={styles.title}>
          WORLD MAP
        </RetroText>
        <RetroText variant="body" color={COLORS.gray} style={styles.subtitle}>
          Floor {run.currentFloor} â Choose your next biome
        </RetroText>
      </View>

      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.biomesList}>
        {BIOMES.map((biome, index) => {
          const unlocked = isBiomeUnlocked(index);
          const cleared = run.biomesCleared[index];
          return (
            <TouchableOpacity
              key={biome.type}
              style={[styles.biomeRow, !unlocked && styles.biomeRowLocked]}
              onPress={() => unlocked && handleSelectBiome(index)}
              activeOpacity={unlocked ? 0.7 : 1}
              testID={`biome-${biome.type}`}
            >
              <View style={[styles.biomeSwatch, { backgroundColor: biome.color }]}>
                {!unlocked && (
                  <View style={styles.lockOverlay}>
                    <Lock size={20} color={COLORS.white} />
                  </View>
                )}
                {cleared && (
                  <RetroText variant="label" color={COLORS.white} style={{ fontSize: 8 }}>
                    CLEAR
                  </RetroText>
                )}
              </View>
              <View style={styles.biomeInfo}>
                <RetroText
                  variant="bodyBold"
                  color={unlocked ? COLORS.white : COLORS.grayDark}
                  style={styles.biomeName}
                >
                  {biome.name}
                </RetroText>
                <RetroText
                  variant="body"
                  color={unlocked ? COLORS.gray : COLORS.grayDark}
                  style={styles.biomeDesc}
                >
                  {biome.description}
                </RetroText>
                <View style={styles.floorPips}>
                  {Array.from({ length: biome.floors }).map((_, f) => (
                    <View
                      key={f}
                      style={[
                        styles.pip,
                        { backgroundColor: f < (cleared ? biome.floors : 0) ? biome.color : COLORS.grayDark },
                      ]}
                    />
                  ))}
                  <RetroText variant="body" color={COLORS.grayDark} style={styles.floorLabel}>
                    {biome.floors} floors
                  </RetroText>
                </View>
              </View>
              {unlocked && <ChevronRight size={20} color={COLORS.grayDark} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={[styles.bottomSection, { paddingBottom: insets.bottom + 8 }]}>
        <SquadSlots squad={run.squad} maxSlots={meta.upgrades.squadSize} showHp />
      </View>
      {loreBiome && (
        <View style={styles.loreOverlay}>
          <View style={styles.loreModal}>
            <RetroText variant="heading" color={COLORS[loreBiome as keyof typeof COLORS] ?? COLORS.green} style={styles.loreTitle}>
              {BIOMES.find(b => b.type === loreBiome)?.name.toUpperCase()}
            </RetroText>
            <RetroText variant="body" color={COLORS.whiteDim} style={styles.loreText}>
              {BIOME_LORE[loreBiome]}
            </RetroText>
            <View style={styles.loreBtns}>
              <TouchableOpacity style={styles.loreCancelBtn} onPress={() => setLoreBiome(null)} activeOpacity={0.8}>
                <RetroText variant="label" color={COLORS.gray} style={{ fontSize: 11 }}>BACK</RetroText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.loreEnterBtn, { backgroundColor: COLORS[loreBiome as keyof typeof COLORS] ?? COLORS.green }]}
                onPress={() => confirmEnterBiome(BIOMES.findIndex(b => b.type === loreBiome))}
                activeOpacity={0.8}
              >
                <RetroText variant="label" color={COLORS.bg} style={{ fontSize: 12 }}>ENTER BIOME →</RetroText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 4,
  },
  title: {
    fontSize: 14,
  },
  subtitle: {
    fontSize: 14,
  },
  scrollArea: {
    flex: 1,
  },
  biomesList: {
    paddingHorizontal: 16,
    gap: 10,
  },
  biomeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#222826',
  },
  biomeRowLocked: {
    opacity: 0.5,
  },
  biomeSwatch: {
    width: 56,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  biomeInfo: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 4,
  },
  biomeName: {
    fontSize: 18,
  },
  biomeDesc: {
    fontSize: 13,
  },
  floorPips: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  pip: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  floorLabel: {
    fontSize: 11,
    marginLeft: 4,
  },
  bottomSection: {
    backgroundColor: COLORS.bgLight,
    borderTopWidth: 1,
    borderTopColor: '#1a1e1c',
  },
  loreOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loreModal: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    gap: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  loreTitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  loreText: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },
  loreBtns: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  loreCancelBtn: {
    flex: 1,
    backgroundColor: COLORS.bgLight,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.grayDark,
  },
  loreEnterBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
});
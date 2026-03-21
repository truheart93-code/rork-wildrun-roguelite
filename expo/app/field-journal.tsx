import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, BIOME_COLORS } from '@/constants/colors';
import { useGame } from '@/context/GameContext';
import { ANIMALS } from '@/constants/animals';
import RetroText from '@/components/RetroText';
import AnimalSilhouette from '@/components/AnimalSilhouette';
import { BookOpen, X } from 'lucide-react-native';

export default function FieldJournalScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { meta } = useGame();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <View style={styles.header}>
        <BookOpen size={20} color={COLORS.green} />
        <RetroText variant="heading" color={COLORS.green} style={styles.title}>
          FIELD JOURNAL
        </RetroText>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <X size={22} color={COLORS.white} />
        </TouchableOpacity>
      </View>
      <RetroText variant="body" color={COLORS.gray} style={styles.subtitle}>
        {meta.journal.length}/{ANIMALS.length} creatures discovered
      </RetroText>

      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.grid}>
        {ANIMALS.map(animal => {
          const discovered = meta.journal.includes(animal.id);
          const biomeColor = BIOME_COLORS[animal.biome] ?? COLORS.green;
          return (
            <View key={animal.id} style={[styles.entry, !discovered && styles.entryUndiscovered]}>
              <View style={[styles.iconArea, { backgroundColor: discovered ? biomeColor + '20' : COLORS.bgLight }]}>
                {discovered ? (
                  <AnimalSilhouette animalId={animal.id} color={biomeColor} size={36} />
                ) : (
                  <RetroText variant="heading" color={COLORS.grayDark} style={{ fontSize: 18 }}>?</RetroText>
                )}
              </View>
              <RetroText
                variant="body"
                color={discovered ? COLORS.white : COLORS.grayDark}
                style={styles.entryName}
                numberOfLines={1}
              >
                {discovered ? animal.name : '???'}
              </RetroText>
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
  subtitle: {
    textAlign: 'center' as const,
    marginTop: 6,
    marginBottom: 12,
    fontSize: 14,
  },
  scrollArea: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 8,
    paddingBottom: 20,
  },
  entry: {
    width: '30%' as const,
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: 10,
    padding: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: '#222826',
  },
  entryUndiscovered: {
    opacity: 0.4,
  },
  iconArea: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  entryName: {
    fontSize: 12,
    textAlign: 'center' as const,
  },
});

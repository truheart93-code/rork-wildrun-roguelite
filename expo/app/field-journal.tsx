import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, BIOME_COLORS } from '@/constants/colors';
import { useGame } from '@/context/GameContext';
import { ANIMALS } from '@/constants/animals';
import RetroText from '@/components/RetroText';
import AnimalSilhouette from '@/components/AnimalSilhouette';
import { X, BookOpen, Lock } from 'lucide-react-native';

const { width: W } = Dimensions.get('window');

const ANIMAL_SIZES: Record<string, string> = {
  lion: '4.5 ft',
  elephant: '13 ft',
  cheetah: '4.8 ft',
  zebra: '5 ft',
  giraffe: '18 ft',
  hyena: '3.5 ft',
  orca: '23 ft',
  shark: '15 ft',
  dolphin: '8 ft',
  narwhal: '15 ft',
  mantaray: '23 ft',
  octopus: '4 ft',
  gorilla: '5.9 ft',
  jaguar: '5.5 ft',
  anaconda: '17 ft',
  toucan: '2 ft',
  capybara: '4.5 ft',
  poison_frog: '0.6 ft',
  polar_bear: '8 ft',
  arctic_fox: '2.5 ft',
  walrus: '11 ft',
  snowy_owl: '2.2 ft',
  wolverine: '3.5 ft',
  beluga: '15 ft',
};

const ANIMAL_WEIGHT: Record<string, string> = {
  lion: '420 lbs',
  elephant: '13,000 lbs',
  cheetah: '125 lbs',
  zebra: '770 lbs',
  giraffe: '2,600 lbs',
  hyena: '140 lbs',
  orca: '12,000 lbs',
  shark: '1,500 lbs',
  dolphin: '330 lbs',
  narwhal: '3,500 lbs',
  mantaray: '5,000 lbs',
  octopus: '22 lbs',
  gorilla: '440 lbs',
  jaguar: '210 lbs',
  anaconda: '550 lbs',
  toucan: '1.3 lbs',
  capybara: '140 lbs',
  poison_frog: '0.1 lbs',
  polar_bear: '1,500 lbs',
  arctic_fox: '15 lbs',
  walrus: '3,000 lbs',
  snowy_owl: '4 lbs',
  wolverine: '40 lbs',
  beluga: '3,000 lbs',
};

const BIOME_LABELS: Record<string, string> = {
  savanna: 'SAVANNA',
  ocean: 'OCEAN',
  jungle: 'JUNGLE',
  arctic: 'ARCTIC',
};

export default function FieldJournalScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { meta } = useGame();
  const [selected, setSelected] = useState<string | null>(null);
  const [filterBiome, setFilterBiome] = useState<string | null>(null);

  const discovered = (id: string) => meta.journal.includes(id);

  const filtered = filterBiome
    ? ANIMALS.filter(a => a.biome === filterBiome)
    : ANIMALS;

  const selectedAnimal = ANIMALS.find(a => a.id === selected);
  const selectedDiscovered = selected ? discovered(selected) : false;

  const biomeFilters = ['savanna', 'ocean', 'jungle', 'arctic'];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <BookOpen size={18} color={COLORS.green} />
        <RetroText variant="heading" color={COLORS.green} style={styles.title}>FIELD JOURNAL</RetroText>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <X size={22} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <RetroText variant="body" color={COLORS.gray} style={styles.subtitle}>
        {meta.journal.length}/{ANIMALS.length} species documented — Dr. Wren
      </RetroText>

      {/* Biome filter tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterTab, !filterBiome && styles.filterTabActive]}
          onPress={() => setFilterBiome(null)}
        >
          <RetroText variant="label" color={!filterBiome ? COLORS.bg : COLORS.gray} style={styles.filterText}>ALL</RetroText>
        </TouchableOpacity>
        {biomeFilters.map(b => (
          <TouchableOpacity
            key={b}
            style={[styles.filterTab, filterBiome === b && { backgroundColor: BIOME_COLORS[b] }]}
            onPress={() => setFilterBiome(filterBiome === b ? null : b)}
          >
            <RetroText variant="label" color={filterBiome === b ? COLORS.bg : COLORS.gray} style={styles.filterText}>
              {BIOME_LABELS[b]}
            </RetroText>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {selected && selectedAnimal ? (
        /* Detail view — Pokédex style */
        <View style={styles.detailContainer}>
          <TouchableOpacity style={styles.backRow} onPress={() => setSelected(null)}>
            <RetroText variant="label" color={COLORS.green} style={styles.backText}>‹ BACK</RetroText>
          </TouchableOpacity>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.detailCard}>
              {/* Top section */}
              <View style={[styles.detailHeader, { backgroundColor: BIOME_COLORS[selectedAnimal.biome] + '20' }]}>
                {selectedDiscovered ? (
                  <AnimalSilhouette animalId={selectedAnimal.id} color={BIOME_COLORS[selectedAnimal.biome]} size={96} />
                ) : (
                  <View style={styles.unknownSprite}>
                    <Lock size={32} color={COLORS.grayDark} />
                  </View>
                )}
                <View style={[styles.biomePill, { backgroundColor: BIOME_COLORS[selectedAnimal.biome] }]}>
                  <RetroText variant="label" color={COLORS.bg} style={styles.biomePillText}>
                    {BIOME_LABELS[selectedAnimal.biome]}
                  </RetroText>
                </View>
              </View>

              {/* Name + status */}
              <View style={styles.detailNameRow}>
                <RetroText variant="heading" color={selectedDiscovered ? COLORS.white : COLORS.grayDark} style={styles.detailName}>
                  {selectedDiscovered ? selectedAnimal.name.toUpperCase() : '???'}
                </RetroText>
                <View style={[styles.statusBadge, { backgroundColor: selectedDiscovered ? COLORS.green + '30' : COLORS.grayDark + '30' }]}>
                  <RetroText variant="label" color={selectedDiscovered ? COLORS.green : COLORS.grayDark} style={styles.statusText}>
                    {selectedDiscovered ? '✓ DOCUMENTED' : 'NOT FOUND'}
                  </RetroText>
                </View>
              </View>

              {selectedDiscovered ? (
                <>
                  {/* Stats grid */}
                  <View style={styles.statsGrid}>
                    {[
                      { label: 'HP', value: selectedAnimal.hp, color: COLORS.hpGreen },
                      { label: 'ATK', value: selectedAnimal.atk, color: COLORS.red },
                      { label: 'DEF', value: selectedAnimal.def, color: COLORS.blue },
                      { label: 'SPD', value: selectedAnimal.spd, color: COLORS.gold },
                    ].map(stat => (
                      <View key={stat.label} style={styles.statCell}>
                        <RetroText variant="label" color={COLORS.gray} style={styles.statCellLabel}>{stat.label}</RetroText>
                        <RetroText variant="heading" color={stat.color} style={styles.statCellValue}>{stat.value}</RetroText>
                        <View style={styles.statBar}>
                          <View style={[styles.statBarFill, { width: `${Math.min(100, (stat.value / 100) * 100)}%` as any, backgroundColor: stat.color }]} />
                        </View>
                      </View>
                    ))}
                  </View>

                  {/* Physical data */}
                  <View style={styles.physicalRow}>
                    <View style={styles.physicalCell}>
                      <RetroText variant="label" color={COLORS.grayDark} style={styles.physLabel}>LENGTH</RetroText>
                      <RetroText variant="bodyBold" color={COLORS.white} style={styles.physValue}>
                        {ANIMAL_SIZES[selectedAnimal.id] ?? 'Unknown'}
                      </RetroText>
                    </View>
                    <View style={styles.physDivider} />
                    <View style={styles.physicalCell}>
                      <RetroText variant="label" color={COLORS.grayDark} style={styles.physLabel}>WEIGHT</RetroText>
                      <RetroText variant="bodyBold" color={COLORS.white} style={styles.physValue}>
                        {ANIMAL_WEIGHT[selectedAnimal.id] ?? 'Unknown'}
                      </RetroText>
                    </View>
                    <View style={styles.physDivider} />
                    <View style={styles.physicalCell}>
                      <RetroText variant="label" color={COLORS.grayDark} style={styles.physLabel}>HABITAT</RetroText>
                      <RetroText variant="bodyBold" color={BIOME_COLORS[selectedAnimal.biome]} style={styles.physValue}>
                        {BIOME_LABELS[selectedAnimal.biome]}
                      </RetroText>
                    </View>
                  </View>

                  {/* Fun fact */}
                  <View style={styles.factBox}>
                    <RetroText variant="label" color={COLORS.green} style={styles.factLabel}>DR. WREN'S NOTES</RetroText>
                    <RetroText variant="body" color={COLORS.whiteDim} style={styles.factText}>
                      "{selectedAnimal.funFact}"
                    </RetroText>
                  </View>

                  {/* Bond tip */}
                  <View style={styles.tipBox}>
                    <RetroText variant="label" color={COLORS.gold} style={styles.factLabel}>BOND STRATEGY</RetroText>
                    <RetroText variant="body" color={COLORS.whiteDim} style={styles.factText}>
                      {selectedAnimal.catchTip}
                    </RetroText>
                  </View>
                </>
              ) : (
                <View style={styles.unknownBox}>
                  <RetroText variant="body" color={COLORS.grayDark} style={styles.unknownText}>
                    This creature has not been encountered yet. Explore the {BIOME_LABELS[selectedAnimal.biome]} biome to discover it.
                  </RetroText>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      ) : (
        /* Grid view */
        <ScrollView style={styles.scrollArea} contentContainerStyle={styles.grid}>
          {filtered.map(animal => {
            const found = discovered(animal.id);
            const biomeColor = BIOME_COLORS[animal.biome];
            return (
              <TouchableOpacity
                key={animal.id}
                style={[styles.entry, found && { borderColor: biomeColor + '60' }]}
                onPress={() => setSelected(animal.id)}
                activeOpacity={0.8}
              >
                <View style={[styles.iconArea, { backgroundColor: found ? biomeColor + '20' : COLORS.bgLight }]}>
                  {found ? (
                    <AnimalSilhouette animalId={animal.id} color={biomeColor} size={40} />
                  ) : (
                    <Lock size={18} color={COLORS.grayDark} />
                  )}
                </View>
                <RetroText
                  variant="body"
                  color={found ? COLORS.white : COLORS.grayDark}
                  style={styles.entryName}
                  numberOfLines={1}
                >
                  {found ? animal.name : '???'}
                </RetroText>
                {found && (
                  <View style={[styles.biomeDot, { backgroundColor: biomeColor }]} />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 12, position: 'relative' },
  title: { fontSize: 11 },
  closeBtn: { position: 'absolute', right: 16, padding: 4 },
  subtitle: { textAlign: 'center', fontSize: 12, marginBottom: 8 },
  filterScroll: { maxHeight: 44 },
  filterRow: { flexDirection: 'row', gap: 6, paddingHorizontal: 12, paddingBottom: 8 },
  filterTab: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.grayDark },
  filterTabActive: { backgroundColor: COLORS.green },
  filterText: { fontSize: 8 },
  scrollArea: { flex: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 10, gap: 8, paddingBottom: 20 },
  entry: { width: '30%', alignItems: 'center', backgroundColor: COLORS.bgCard, borderRadius: 10, padding: 8, gap: 6, borderWidth: 1, borderColor: '#222826' },
  iconArea: { width: 52, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center' },
  entryName: { fontSize: 11, textAlign: 'center' },
  biomeDot: { width: 6, height: 6, borderRadius: 3 },
  // Detail view
  detailContainer: { flex: 1 },
  backRow: { paddingHorizontal: 16, paddingVertical: 10 },
  backText: { fontSize: 9 },
  detailCard: { marginHorizontal: 12, backgroundColor: COLORS.bgCard, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: '#222826', marginBottom: 20 },
  detailHeader: { alignItems: 'center', paddingVertical: 24, position: 'relative' },
  unknownSprite: { width: 96, height: 96, alignItems: 'center', justifyContent: 'center' },
  biomePill: { position: 'absolute', top: 12, right: 12, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  biomePillText: { fontSize: 7 },
  detailNameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#222826' },
  detailName: { fontSize: 16 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  statusText: { fontSize: 7 },
  statsGrid: { flexDirection: 'row', padding: 12, gap: 8 },
  statCell: { flex: 1, alignItems: 'center', gap: 4 },
  statCellLabel: { fontSize: 7 },
  statCellValue: { fontSize: 18 },
  statBar: { width: '100%', height: 4, backgroundColor: COLORS.bgLight, borderRadius: 2 },
  statBarFill: { height: 4, borderRadius: 2 },
  physicalRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#222826', paddingVertical: 12 },
  physicalCell: { flex: 1, alignItems: 'center', gap: 4 },
  physDivider: { width: 1, backgroundColor: '#222826' },
  physLabel: { fontSize: 7 },
  physValue: { fontSize: 14 },
  factBox: { margin: 12, padding: 12, backgroundColor: COLORS.green + '10', borderRadius: 8, borderWidth: 1, borderColor: COLORS.green + '30', gap: 6 },
  tipBox: { marginHorizontal: 12, marginBottom: 12, padding: 12, backgroundColor: COLORS.gold + '10', borderRadius: 8, borderWidth: 1, borderColor: COLORS.gold + '30', gap: 6 },
  factLabel: { fontSize: 7 },
  factText: { fontSize: 13, lineHeight: 20, fontStyle: 'italic' },
  unknownBox: { padding: 20, alignItems: 'center' },
  unknownText: { textAlign: 'center', fontSize: 13, lineHeight: 20 },
});

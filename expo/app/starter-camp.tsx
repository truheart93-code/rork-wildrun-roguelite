import React, { useCallback } from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, BIOME_COLORS } from '@/constants/colors';
import { useGame } from '@/context/GameContext';
import { AnimalTemplate } from '@/constants/types';
import { ANIMALS } from '@/constants/animals';
import RetroText from '@/components/RetroText';
import AnimalSilhouette from '@/components/AnimalSilhouette';
import SquadSlots from '@/components/SquadSlots';
import { RefreshCw, Swords, Heart, Shield, Zap, Info, Sparkles } from 'lucide-react-native';

export default function StarterCampScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { starters, run, meta, selectStarter, removeStarter, rerollStarters } = useGame();

  const handleSelect = useCallback((template: AnimalTemplate) => {
    if (run.squad.find(a => a.id === template.id)) {
      const existing = run.squad.find(a => a.id === template.id);
      if (existing) removeStarter(existing.uniqueId);
    } else { selectStarter(template); }
  }, [run.squad, selectStarter, removeStarter]);

  const isSelected = (id: string) => run.squad.some(a => a.id === id);
  const canSelect = run.squad.length < meta.upgrades.squadSize;

  const StatBar = ({ value, max, color }: { value: number; max: number; color: string }) => (
    <View style={styles.statBarBg}>
      <View style={[styles.statBarFill, { width: (Math.min(100, (value / max) * 100) + '%') as any, backgroundColor: color }]} />
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <View style={styles.header}>
        <RetroText variant="heading" color={COLORS.green} style={styles.title}>STARTER CAMP</RetroText>
        <RetroText variant="body" color={COLORS.gray} style={styles.subtitle}>
          Choose up to {meta.upgrades.squadSize} creatures • They grow stronger with you
        </RetroText>
      </View>
      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.cardList} showsVerticalScrollIndicator={false}>
        {starters.map((animal) => {
          const selected = isSelected(animal.id);
          const biomeColor = BIOME_COLORS[animal.biome] ?? COLORS.green;
          const disabled = !selected && !canSelect;
          const animalData = ANIMALS.find(a => a.id === animal.id);
          const ability = (animalData as any)?.ability;
          return (
            <TouchableOpacity key={animal.id} style={[styles.card, selected && { borderColor: biomeColor, borderWidth: 2 }, disabled && { opacity: 0.45 }]} onPress={() => handleSelect(animal)} activeOpacity={0.8} disabled={disabled}>
              <View style={[styles.cardHeader, { backgroundColor: biomeColor + '18' }]}>
                <AnimalSilhouette animalId={animal.id} color={biomeColor} size={64} />
                <View style={styles.cardHeaderInfo}>
                  <View style={styles.nameRow}>
                    <RetroText variant="bodyBold" color={COLORS.white} style={styles.animalName}>{animal.name}</RetroText>
                    {selected && <View style={[styles.selectedBadge, { backgroundColor: biomeColor }]}><RetroText variant="label" color={COLORS.bg} style={styles.selectedText}>✓ IN SQUAD</RetroText></View>}
                  </View>
                  <View style={[styles.biomePill, { backgroundColor: biomeColor + '30' }]}>
                    <RetroText variant="label" color={biomeColor} style={styles.biomeText}>{animal.biome.toUpperCase()}</RetroText>
                  </View>
                </View>
              </View>
              <View style={styles.statsSection}>
                {[
                  { icon: <Swords size={12} color={COLORS.red} />, label: 'ATK', value: animal.atk, max: 30, color: COLORS.red },
                  { icon: <Heart size={12} color={COLORS.hpGreen} />, label: 'HP', value: animal.hp, max: 100, color: COLORS.hpGreen },
                  { icon: <Shield size={12} color={COLORS.blue} />, label: 'DEF', value: animal.def, max: 20, color: COLORS.blue },
                  { icon: <Zap size={12} color={COLORS.gold} />, label: 'SPD', value: animal.spd, max: 25, color: COLORS.gold },
                ].map(s => (
                  <View key={s.label} style={styles.statRow}>
                    {s.icon}
                    <RetroText variant="label" color={COLORS.grayDark} style={styles.statLabel}>{s.label}</RetroText>
                    <StatBar value={s.value} max={s.max} color={s.color} />
                    <RetroText variant="bodyBold" color={s.color} style={styles.statNum}>{s.value}</RetroText>
                  </View>
                ))}
              </View>
              {ability && (
                <View style={[styles.abilityRow, { borderColor: biomeColor + '30', backgroundColor: biomeColor + '08' }]}>
                  <Sparkles size={12} color={biomeColor} />
                  <View style={{ flex: 1 }}>
                    <RetroText variant="bodyBold" color={biomeColor} style={styles.abilityName}>
                      {ability.name}{' '}
                      <RetroText variant="label" color={COLORS.grayDark} style={styles.abilityUnlock}>(Lv.{ability.unlockLevel})</RetroText>
                    </RetroText>
                    <RetroText variant="body" color={COLORS.gray} style={styles.abilityDesc}>{ability.description}</RetroText>
                  </View>
                </View>
              )}
              <View style={styles.factRow}>
                <Info size={10} color={COLORS.grayDark} />
                <RetroText variant="body" color={COLORS.grayDark} style={styles.funFact} numberOfLines={2}>{animal.funFact}</RetroText>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <View style={[styles.bottomSection, { paddingBottom: insets.bottom + 8 }]}>
        <SquadSlots squad={run.squad} maxSlots={meta.upgrades.squadSize} onTap={(i) => { const a = run.squad[i]; if (a) removeStarter(a.uniqueId); }} showHp={false} />
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.rerollBtn} onPress={rerollStarters} activeOpacity={0.7}>
            <RefreshCw size={15} color={COLORS.white} />
            <RetroText variant="label" color={COLORS.white} style={styles.rerollText}>REROLL</RetroText>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.beginBtn, run.squad.length === 0 && styles.beginBtnDisabled]} onPress={() => router.replace('/world-map')} disabled={run.squad.length === 0} activeOpacity={0.8}>
            <RetroText variant="label" color={run.squad.length > 0 ? COLORS.bg : COLORS.grayDark} style={styles.beginText}>BEGIN RUN →</RetroText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { paddingHorizontal: 20, paddingBottom: 10, alignItems: 'center', gap: 4 },
  title: { fontSize: 13 },
  subtitle: { fontSize: 13, textAlign: 'center' },
  scrollArea: { flex: 1 },
  cardList: { paddingHorizontal: 14, gap: 10, paddingBottom: 10 },
  card: { backgroundColor: COLORS.bgCard, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.grayDark },
  cardHeader: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 14 },
  cardHeaderInfo: { flex: 1, gap: 6 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  animalName: { fontSize: 18, flex: 1 },
  selectedBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  selectedText: { fontSize: 7 },
  biomePill: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  biomeText: { fontSize: 7 },
  statsSection: { paddingHorizontal: 14, paddingBottom: 10, gap: 6 },
  statRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statLabel: { fontSize: 8, width: 24 },
  statBarBg: { flex: 1, height: 5, backgroundColor: COLORS.bgLight, borderRadius: 3, overflow: 'hidden' },
  statBarFill: { height: 5, borderRadius: 3 },
  statNum: { fontSize: 13, width: 26, textAlign: 'right' },
  abilityRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginHorizontal: 10, marginBottom: 8, padding: 10, borderRadius: 8, borderWidth: 1 },
  abilityName: { fontSize: 13 },
  abilityUnlock: { fontSize: 9 },
  abilityDesc: { fontSize: 12, marginTop: 1 },
  factRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, paddingHorizontal: 14, paddingBottom: 12 },
  funFact: { fontSize: 12, flex: 1, lineHeight: 17, fontStyle: 'italic' },
  bottomSection: { backgroundColor: COLORS.bgLight, borderTopWidth: 1, borderTopColor: '#1a1e1c', paddingTop: 8 },
  actionRow: { flexDirection: 'row', paddingHorizontal: 14, gap: 10, paddingTop: 8 },
  rerollBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: COLORS.bgCard, paddingVertical: 13, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1, borderColor: COLORS.grayDark },
  rerollText: { fontSize: 9 },
  beginBtn: { flex: 1, backgroundColor: COLORS.green, paddingVertical: 14, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  beginBtnDisabled: { backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.grayDark },
  beginText: { fontSize: 10, letterSpacing: 2 },
});
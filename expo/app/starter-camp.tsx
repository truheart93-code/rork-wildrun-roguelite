import React, { useCallback } from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, BIOME_COLORS } from '@/constants/colors';
import { useGame } from '@/context/GameContext';
import { AnimalTemplate } from '@/constants/types';
import RetroText from '@/components/RetroText';
import AnimalSilhouette from '@/components/AnimalSilhouette';
import SquadSlots from '@/components/SquadSlots';
import { RefreshCw, Swords, Heart, Info } from 'lucide-react-native';

export default function StarterCampScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { starters, run, meta, selectStarter, removeStarter, rerollStarters } = useGame();

  const handleSelect = useCallback((template: AnimalTemplate) => {
    if (run.squad.find(a => a.id === template.id)) {
      const existing = run.squad.find(a => a.id === template.id);
      if (existing) removeStarter(existing.uniqueId);
    } else {
      selectStarter(template);
    }
  }, [run.squad, selectStarter, removeStarter]);

  const handleBeginRun = () => {
    router.replace('/world-map');
  };

  const isSelected = (id: string) => run.squad.some(a => a.id === id);
  const canSelect = run.squad.length < meta.upgrades.squadSize;

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <View style={styles.header}>
        <RetroText variant="heading" color={COLORS.green} style={styles.title}>
          STARTER CAMP
        </RetroText>
        <RetroText variant="body" color={COLORS.gray} style={styles.subtitle}>
          Pick up to {meta.upgrades.squadSize} creatures for your squad
        </RetroText>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.cardsGrid}
        showsVerticalScrollIndicator={false}
      >
        {starters.map((animal) => {
          const selected = isSelected(animal.id);
          const biomeColor = BIOME_COLORS[animal.biome] ?? COLORS.green;
          return (
            <TouchableOpacity
              key={animal.id}
              style={[
                styles.card,
                selected && { borderColor: biomeColor, borderWidth: 2 },
                !selected && !canSelect && { opacity: 0.5 },
              ]}
              onPress={() => handleSelect(animal)}
              activeOpacity={0.8}
              disabled={!selected && !canSelect}
              testID={`starter-card-${animal.id}`}
            >
              <View style={[styles.cardHeader, { backgroundColor: biomeColor + '20' }]}>
                <AnimalSilhouette animalId={animal.id} color={biomeColor} size={52} />
                {selected && (
                  <View style={[styles.selectedBadge, { backgroundColor: biomeColor }]}>
                    <RetroText variant="label" color={COLORS.bg} style={{ fontSize: 7 }}>
                      IN SQUAD
                    </RetroText>
                  </View>
                )}
              </View>
              <View style={styles.cardBody}>
                <RetroText variant="bodyBold" color={COLORS.white} style={styles.cardName}>
                  {animal.name}
                </RetroText>
                <View style={styles.statsRow}>
                  <View style={[styles.statChip, { backgroundColor: COLORS.red + '30' }]}>
                    <Swords size={12} color={COLORS.red} />
                    <RetroText variant="body" color={COLORS.red} style={styles.statText}>
                      {animal.atk}
                    </RetroText>
                  </View>
                  <View style={[styles.statChip, { backgroundColor: COLORS.hpGreen + '30' }]}>
                    <Heart size={12} color={COLORS.hpGreen} />
                    <RetroText variant="body" color={COLORS.hpGreen} style={styles.statText}>
                      {animal.hp}
                    </RetroText>
                  </View>
                </View>
                <View style={styles.infoSection}>
                  <Info size={10} color={COLORS.grayDark} />
                  <RetroText variant="body" color={COLORS.gray} style={styles.funFact} numberOfLines={2}>
                    {animal.funFact}
                  </RetroText>
                </View>
                <RetroText variant="body" color={COLORS.grayDark} style={styles.catchTip} numberOfLines={1}>
                  Tip: {animal.catchTip}
                </RetroText>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={[styles.bottomSection, { paddingBottom: insets.bottom + 8 }]}>
        <SquadSlots
          squad={run.squad}
          maxSlots={meta.upgrades.squadSize}
          onTap={(i) => {
            const a = run.squad[i];
            if (a) removeStarter(a.uniqueId);
          }}
          showHp={false}
        />
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.rerollButton}
            onPress={rerollStarters}
            activeOpacity={0.7}
          >
            <RefreshCw size={16} color={COLORS.white} />
            <RetroText variant="label" color={COLORS.white} style={{ fontSize: 9 }}>
              REROLL
            </RetroText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.beginButton,
              run.squad.length === 0 && styles.beginButtonDisabled,
            ]}
            onPress={handleBeginRun}
            activeOpacity={0.8}
            disabled={run.squad.length === 0}
          >
            <RetroText
              variant="label"
              color={run.squad.length > 0 ? COLORS.bg : COLORS.grayDark}
              style={styles.beginText}
            >
              BEGIN RUN
            </RetroText>
          </TouchableOpacity>
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
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 14,
    textAlign: 'center' as const,
  },
  subtitle: {
    textAlign: 'center' as const,
    marginTop: 4,
    fontSize: 15,
  },
  scrollArea: {
    flex: 1,
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 10,
    justifyContent: 'center',
  },
  card: {
    width: '47%' as const,
    backgroundColor: COLORS.bgCard,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.grayDark,
  },
  cardHeader: {
    alignItems: 'center',
    paddingVertical: 12,
    position: 'relative',
  },
  selectedBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  cardBody: {
    padding: 10,
    gap: 6,
  },
  cardName: {
    fontSize: 16,
    textAlign: 'center' as const,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statText: {
    fontSize: 14,
    fontWeight: '700' as const,
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
    paddingTop: 2,
  },
  funFact: {
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
  },
  catchTip: {
    fontSize: 11,
    fontStyle: 'italic' as const,
  },
  bottomSection: {
    backgroundColor: COLORS.bgLight,
    borderTopWidth: 1,
    borderTopColor: '#1a1e1c',
    paddingTop: 8,
  },
  actionRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
    paddingTop: 8,
  },
  rerollButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.bgCard,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.grayDark,
  },
  beginButton: {
    flex: 1,
    backgroundColor: COLORS.green,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  beginButtonDisabled: {
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.grayDark,
  },
  beginText: {
    fontSize: 11,
    letterSpacing: 2,
  },
});

import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, BIOME_COLORS } from '@/constants/colors';
import { Animal } from '@/constants/types';
import AnimalSilhouette from './AnimalSilhouette';
import HpBar from './HpBar';
import RetroText from './RetroText';

interface SquadSlotsProps {
  squad: Animal[];
  maxSlots: number;
  activeIndex?: number;
  onTap?: (index: number) => void;
  showHp?: boolean;
  compact?: boolean;
}

export default React.memo(function SquadSlots({ squad, maxSlots, activeIndex, onTap, showHp = true, compact = false }: SquadSlotsProps) {
  const slots = Array.from({ length: maxSlots }, (_, i) => squad[i] ?? null);

  return (
    <View style={[styles.container, compact && styles.compactContainer]}>
      {slots.map((animal, index) => {
        const isActive = activeIndex === index;
        return (
          <TouchableOpacity
            key={index}
            style={[
              styles.slot,
              compact && styles.compactSlot,
              isActive && styles.activeSlot,
              !animal && styles.emptySlot,
            ]}
            onPress={() => animal && onTap?.(index)}
            activeOpacity={0.7}
            disabled={!onTap || !animal}
          >
            {animal ? (
              <>
                <AnimalSilhouette
                  animalId={animal.id}
                  color={BIOME_COLORS[animal.biome] ?? COLORS.green}
                  size={compact ? 28 : 36}
                />
                {!compact && (
                  <RetroText variant="body" style={styles.name} numberOfLines={1}>
                    {animal.name}
                  </RetroText>
                )}
                {showHp && (
                  <HpBar
                    current={animal.currentHp}
                    max={animal.maxHp}
                    width={compact ? 36 : 52}
                    height={compact ? 4 : 6}
                    compact
                  />
                )}
              </>
            ) : (
              <View style={styles.emptyInner}>
                <RetroText variant="label" color={COLORS.grayDark} style={{ fontSize: 8 }}>
                  EMPTY
                </RetroText>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  compactContainer: {
    gap: 6,
    paddingVertical: 4,
  },
  slot: {
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: 10,
    padding: 8,
    minWidth: 70,
    borderWidth: 1.5,
    borderColor: COLORS.grayDark,
    gap: 4,
  },
  compactSlot: {
    padding: 6,
    minWidth: 50,
    borderRadius: 8,
  },
  activeSlot: {
    borderColor: COLORS.gold,
    borderWidth: 2,
  },
  emptySlot: {
    borderStyle: 'dashed' as const,
    borderColor: COLORS.grayDark,
    opacity: 0.5,
  },
  emptyInner: {
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 12,
    textAlign: 'center' as const,
  },
});

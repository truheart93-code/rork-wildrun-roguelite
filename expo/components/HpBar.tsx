import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/colors';
import RetroText from './RetroText';

interface HpBarProps {
  current: number;
  max: number;
  width?: number;
  height?: number;
  showNumbers?: boolean;
  compact?: boolean;
}

export default React.memo(function HpBar({ current, max, width = 120, height = 10, showNumbers = false, compact = false }: HpBarProps) {
  const ratio = Math.max(0, Math.min(1, current / max));
  const barColor = ratio > 0.5 ? COLORS.hpGreen : ratio > 0.25 ? COLORS.hpYellow : COLORS.hpRed;

  return (
    <View style={compact ? styles.compactContainer : styles.container}>
      <View style={[styles.barBg, { width, height }]}>
        <View style={[styles.barFill, { width: width * ratio, height, backgroundColor: barColor }]} />
      </View>
      {showNumbers && (
        <RetroText variant="body" style={styles.numbers} color={COLORS.whiteDim}>
          {current}/{max}
        </RetroText>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  barBg: {
    backgroundColor: '#1a1e1c',
    borderRadius: 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2a2e2c',
  },
  barFill: {
    borderRadius: 2,
  },
  numbers: {
    fontSize: 13,
  },
});

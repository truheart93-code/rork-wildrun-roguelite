import React from 'react';
import { Text, TextStyle, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/colors';

interface RetroTextProps {
  children: React.ReactNode;
  style?: TextStyle | TextStyle[];
  variant?: 'heading' | 'body' | 'bodyBold' | 'label';
  color?: string;
  numberOfLines?: number;
  testID?: string;
}

export default React.memo(function RetroText({ children, style, variant = 'body', color, numberOfLines, testID }: RetroTextProps) {
  const fontMap = {
    heading: 'PressStart2P_400Regular',
    body: 'BarlowCondensed_400Regular',
    bodyBold: 'BarlowCondensed_700Bold',
    label: 'PressStart2P_400Regular',
  } as const;

  const sizeMap = {
    heading: 16,
    body: 17,
    bodyBold: 17,
    label: 10,
  } as const;

  return (
    <Text
      testID={testID}
      numberOfLines={numberOfLines}
      style={[
        { fontFamily: fontMap[variant], fontSize: sizeMap[variant], color: color ?? COLORS.white },
        variant === 'heading' && styles.heading,
        variant === 'label' && styles.label,
        style,
      ]}
    >
      {children}
    </Text>
  );
});

const styles = StyleSheet.create({
  heading: {
    letterSpacing: 2,
  },
  label: {
    letterSpacing: 1,
    textTransform: 'uppercase' as const,
  },
});

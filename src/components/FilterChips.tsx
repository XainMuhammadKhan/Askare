import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Colors, Typography, BorderRadius, Spacing } from '../theme';

interface FilterChipsProps {
  chips: string[];
  selected: string;
  onSelect: (chip: string) => void;
}

export const FilterChips: React.FC<FilterChipsProps> = ({ chips, selected, onSelect }) => {
  const { width } = useWindowDimensions();

  // Responsive chip sizing — keeps chips consistent across screen sizes
  const chipHeight = Math.round(Math.max(36, Math.min(56, width * 0.11)));
  const chipPaddingHorizontal = Math.round(Math.max(12, width * 0.04));
  const chipMinWidth = Math.round(Math.max(72, width * 0.22));

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {chips.map((chip) => (
        <TouchableOpacity
          key={chip}
          style={[
            styles.chip,
            { height: chipHeight, paddingHorizontal: chipPaddingHorizontal, borderRadius: chipHeight / 2, minWidth: chipMinWidth },
            selected === chip && styles.chipActive,
          ]}
          onPress={() => onSelect(chip)}
          activeOpacity={0.7}
        >
          <Text style={[styles.chipText, selected === chip && styles.chipTextActive]}>{chip}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    // allow chips to visually overflow and sit above following content
    overflow: 'visible',
    zIndex: 20,
    elevation: 20,
    marginBottom: Spacing.sm,
  },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHighest,
    marginRight: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 96,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    ...Typography.labelLarge,
    color: Colors.onSurfaceVariant,
    fontSize: 13,
    textTransform: 'none',
  },
  chipTextActive: {
    color: Colors.onPrimary,
  },
});

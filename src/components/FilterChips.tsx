import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Colors, Typography, BorderRadius, Spacing } from '../theme';

export type ChipItem = string | { id: string | number; label: string };

interface FilterChipsProps<T extends string | number = any> {
  chips: ChipItem[];
  selected: T;
  onSelect: (id: T) => void;
}

export const FilterChips = <T extends string | number = any>({
  chips,
  selected,
  onSelect,
}: FilterChipsProps<T>) => {
  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {chips.map((chip) => {
          const id = (typeof chip === 'string' ? chip : chip.id) as T;
          const label = typeof chip === 'string' ? chip : chip.label;
          const isActive = selected === id;

          return (
            <TouchableOpacity
              key={String(id)}
              style={[styles.chip, isActive && styles.chipActive]}
              onPress={() => onSelect(id)}
              activeOpacity={0.75}
            >
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: Spacing.xs,
  },
  container: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHighest,
    alignItems: 'center',
    justifyContent: 'center',
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

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography, Shadows } from '../../../theme';

interface Props {
  tip?: string | null;
  aiGenerated?: boolean;
  date?: string;
}

export const HealthTipCard: React.FC<Props> = ({ tip, aiGenerated, date }) => {
  if (!tip) return null;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <MaterialIcons name="auto-awesome" size={20} color={Colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>DAILY AI HEALTH TIP</Text>
          {date ? <Text style={styles.date}>{date}</Text> : null}
        </View>
        {aiGenerated && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>AI PERSONALIZED</Text>
          </View>
        )}
      </View>
      <Text style={styles.tipText}>{tip}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: `${Colors.primary}20`,
    ...Shadows.subtle,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${Colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...Typography.labelSmall,
    color: Colors.primary,
    fontSize: 10,
  },
  date: {
    ...Typography.bodySmall,
    color: Colors.onSurfaceVariant,
    fontSize: 11,
  },
  badge: {
    backgroundColor: `${Colors.primary}12`,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgeText: {
    ...Typography.labelSmall,
    color: Colors.primary,
    fontSize: 8,
  },
  tipText: {
    ...Typography.bodyMedium,
    color: Colors.onSurface,
    lineHeight: 20,
  },
});

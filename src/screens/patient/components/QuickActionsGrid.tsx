import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography, Shadows } from '../../../theme';

interface QuickActionItem {
  key: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  bg: string;
  onPress: () => void;
}

interface Props {
  onNavigate: (route: string) => void;
}

export const QuickActionsGrid: React.FC<Props> = ({ onNavigate }) => {
  const actions: QuickActionItem[] = [
    {
      key: 'FindSpecialist',
      title: 'Find Specialist',
      subtitle: 'Book a doctor',
      icon: 'person-search',
      color: Colors.primary,
      bg: `${Colors.primary}15`,
      onPress: () => onNavigate('FindSpecialist'),
    },
    {
      key: 'Assistant',
      title: 'AI Assistant',
      subtitle: 'Symptom checker',
      icon: 'smart-toy',
      color: Colors.secondary,
      bg: Colors.secondaryContainer,
      onPress: () => onNavigate('Assistant'),
    },
    {
      key: 'ClinicalArchive',
      title: 'Medical Records',
      subtitle: 'History & Rx',
      icon: 'folder-shared',
      color: Colors.primary,
      bg: `${Colors.primary}12`,
      onPress: () => onNavigate('ClinicalArchive'),
    },
    {
      key: 'MyDocuments',
      title: 'My Documents',
      subtitle: 'Lab reports & AI',
      icon: 'description',
      color: Colors.tertiary,
      bg: `${Colors.tertiary}15`,
      onPress: () => onNavigate('MyDocuments'),
    },
    {
      key: 'HealthReport',
      title: 'Health Report',
      subtitle: 'Monthly summary',
      icon: 'insights',
      color: Colors.secondary,
      bg: `${Colors.secondary}15`,
      onPress: () => onNavigate('HealthReport'),
    },
    {
      key: 'PaymentHistory',
      title: 'Payments',
      subtitle: 'Receipts & status',
      icon: 'receipt-long',
      color: Colors.primary,
      bg: `${Colors.primary}15`,
      onPress: () => onNavigate('PaymentHistory'),
    },
  ];

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.grid}>
        {actions.map((a) => (
          <TouchableOpacity
            key={a.key}
            style={styles.card}
            onPress={a.onPress}
            activeOpacity={0.75}
          >
            <View style={[styles.iconCircle, { backgroundColor: a.bg }]}>
              <MaterialIcons name={a.icon as any} size={22} color={a.color} />
            </View>
            <Text style={styles.title}>{a.title}</Text>
            <Text style={styles.subtitle}>{a.subtitle}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    ...Typography.titleLarge,
    color: Colors.onSurface,
    fontSize: 18,
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    width: '48%',
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 18,
    padding: 16,
    ...Shadows.subtle,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 15,
    fontFamily: 'Manrope_700Bold',
    color: Colors.onSurface,
  },
  subtitle: {
    ...Typography.bodySmall,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
});

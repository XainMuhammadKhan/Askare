import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography, Shadows } from '../../../theme';
import { MedicalProfile } from '../../../api';

interface Props {
  profile: MedicalProfile | null;
  patientInfo?: {
    name?: string;
    gender?: string;
    dateOfBirth?: string;
    bloodGroup?: string;
  } | null;
  onEdit: () => void;
}

export const ArchiveProfileCard: React.FC<Props> = ({ profile, patientInfo, onEdit }) => {
  const conditions = profile?.conditions ?? [];
  const allergies = profile?.allergies ?? [];
  const medications = profile?.currentMedications ?? [];

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.titleRow}>
          <MaterialIcons name="badge" size={20} color={Colors.primary} />
          <Text style={styles.cardTitle}>Health Profile Summary</Text>
        </View>
        <TouchableOpacity onPress={onEdit} style={styles.editBtn}>
          <MaterialIcons name="edit" size={14} color={Colors.primary} />
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>BLOOD</Text>
          <Text style={styles.metricVal}>{patientInfo?.bloodGroup || '—'}</Text>
        </View>
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>HEIGHT</Text>
          <Text style={styles.metricVal}>
            {profile?.heightCm ? `${profile.heightCm} cm` : '—'}
          </Text>
        </View>
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>WEIGHT</Text>
          <Text style={styles.metricVal}>
            {profile?.weightKg ? `${profile.weightKg} kg` : '—'}
          </Text>
        </View>
      </View>

      <View style={styles.tagsGroup}>
        <Text style={styles.groupLabel}>CONDITIONS</Text>
        <Text style={styles.groupValue}>
          {conditions.length > 0 ? conditions.join(', ') : 'None recorded'}
        </Text>
      </View>

      <View style={styles.tagsGroup}>
        <Text style={styles.groupLabel}>ALLERGIES</Text>
        <Text style={[styles.groupValue, allergies.length > 0 && { color: Colors.error }]}>
          {allergies.length > 0 ? allergies.join(', ') : 'No known allergies'}
        </Text>
      </View>

      {medications.length > 0 && (
        <View style={styles.tagsGroup}>
          <Text style={styles.groupLabel}>CURRENT MEDICATIONS</Text>
          <Text style={styles.groupValue}>{medications.join(', ')}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
    ...Shadows.subtle,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: 'Manrope_700Bold',
    color: Colors.onSurface,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: `${Colors.primary}12`,
  },
  editText: {
    fontSize: 12,
    fontFamily: 'Manrope_600SemiBold',
    color: Colors.primary,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  metricBox: {
    flex: 1,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
  },
  metricLabel: {
    ...Typography.labelSmall,
    color: Colors.onSurfaceVariant,
    fontSize: 9,
  },
  metricVal: {
    fontSize: 15,
    fontFamily: 'Manrope_700Bold',
    color: Colors.primary,
    marginTop: 2,
  },
  tagsGroup: {
    marginTop: 8,
  },
  groupLabel: {
    ...Typography.labelSmall,
    color: Colors.onSurfaceVariant,
    fontSize: 9,
    marginBottom: 2,
  },
  groupValue: {
    ...Typography.bodyMedium,
    color: Colors.onSurface,
    fontFamily: 'Manrope_500Medium',
  },
});

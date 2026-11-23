import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography, Shadows } from '../../../theme';
import { Prescription, PrescriptionItem } from '../../../api';
import { doctorName, formatDate } from '../../../utils/format';

interface Props {
  activeMedicines: PrescriptionItem[];
  latestPrescription: (Prescription & { doctor?: { name?: string } }) | null;
  onViewRecords: () => void;
}

export const ActiveMedicinesSection: React.FC<Props> = ({
  activeMedicines,
  latestPrescription,
  onViewRecords,
}) => {
  const meds = activeMedicines?.length
    ? activeMedicines
    : latestPrescription?.items ?? [];

  return (
    <View style={styles.section}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Active Medicines & Prescription</Text>
        <TouchableOpacity onPress={onViewRecords}>
          <Text style={styles.viewAll}>Medical Records</Text>
        </TouchableOpacity>
      </View>

      {meds.length === 0 ? (
        <View style={styles.emptyBox}>
          <MaterialIcons name="medication" size={24} color={Colors.outlineVariant} />
          <Text style={styles.emptyText}>No active medications prescribed yet.</Text>
        </View>
      ) : (
        <View style={styles.card}>
          {latestPrescription && (
            <View style={styles.rxHeader}>
              <MaterialIcons name="receipt-long" size={18} color={Colors.primary} />
              <Text style={styles.rxMeta}>
                Latest Rx {latestPrescription.doctor?.name ? `by ${doctorName(latestPrescription.doctor.name)}` : ''}{' '}
                {latestPrescription.createdAt ? `• ${formatDate(latestPrescription.createdAt)}` : ''}
              </Text>
            </View>
          )}

          {meds.map((m, idx) => (
            <View key={idx} style={[styles.medRow, idx > 0 && styles.medBorder]}>
              <View style={styles.medIcon}>
                <MaterialIcons name="medication" size={18} color={Colors.secondary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.medName}>
                  {m.medicine} {m.dosage ? `(${m.dosage})` : ''}
                </Text>
                <Text style={styles.medSub}>
                  {m.frequency}
                  {m.durationDays ? ` • ${m.durationDays} days` : ''}
                  {m.instructions ? ` • ${m.instructions}` : ''}
                </Text>
              </View>
            </View>
          ))}

          {latestPrescription?.notes ? (
            <Text style={styles.rxNotes}>Note: {latestPrescription.notes}</Text>
          ) : null}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    ...Typography.titleLarge,
    color: Colors.onSurface,
    fontSize: 18,
  },
  viewAll: {
    ...Typography.bodyMedium,
    color: Colors.primary,
    fontFamily: 'Manrope_600SemiBold',
  },
  card: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 18,
    padding: 16,
    ...Shadows.subtle,
  },
  rxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingBottom: 10,
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceContainerHighest,
  },
  rxMeta: {
    ...Typography.bodySmall,
    color: Colors.primary,
    fontFamily: 'Manrope_600SemiBold',
  },
  medRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  medBorder: {
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceContainerLow,
  },
  medIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medName: {
    fontSize: 14,
    fontFamily: 'Manrope_700Bold',
    color: Colors.onSurface,
  },
  medSub: {
    ...Typography.bodySmall,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  rxNotes: {
    ...Typography.bodySmall,
    color: Colors.onSurfaceVariant,
    fontStyle: 'italic',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceContainerHighest,
  },
  emptyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 16,
  },
  emptyText: {
    ...Typography.bodyMedium,
    color: Colors.onSurfaceVariant,
  },
});

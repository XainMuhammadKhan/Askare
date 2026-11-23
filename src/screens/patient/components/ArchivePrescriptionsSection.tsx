import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography, Shadows } from '../../../theme';
import { Prescription, patientService } from '../../../api';
import { doctorName, formatDate } from '../../../utils/format';

interface Props {
  prescriptions: (Prescription & { doctor?: { name?: string } })[];
}

export const ArchivePrescriptionsSection: React.FC<Props> = ({ prescriptions }) => {
  const handleOpenPdf = async (prescriptionId: number) => {
    try {
      const url = patientService.prescriptionPdfUrl(prescriptionId);
      await Linking.openURL(url);
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Unable to open prescription PDF.');
    }
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Prescriptions ({prescriptions.length})</Text>
      {prescriptions.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No prescriptions on file.</Text>
        </View>
      ) : (
        prescriptions.map((p) => (
          <View key={p.id} style={styles.card}>
            <View style={styles.headerRow}>
              <View style={styles.iconCircle}>
                <MaterialIcons name="medication" size={20} color={Colors.secondary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.docText}>
                  {p.doctor?.name ? doctorName(p.doctor.name) : `Prescription #${p.id}`}
                </Text>
                <Text style={styles.dateText}>{formatDate(p.createdAt)}</Text>
              </View>
              <TouchableOpacity
                style={styles.pdfBtn}
                onPress={() => handleOpenPdf(p.id)}
              >
                <MaterialIcons name="picture-as-pdf" size={14} color={Colors.primary} />
                <Text style={styles.pdfText}>PDF</Text>
              </TouchableOpacity>
            </View>

            {(p.items ?? []).map((item, idx) => (
              <View key={idx} style={styles.itemRow}>
                <View style={styles.bullet} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.medName}>
                    {item.medicine} {item.dosage && item.dosage !== '-' ? `• ${item.dosage}` : ''}
                  </Text>
                  <Text style={styles.medMeta}>
                    {item.frequency}
                    {item.durationDays ? ` for ${item.durationDays} days` : ''}
                    {item.instructions ? ` (${item.instructions})` : ''}
                  </Text>
                </View>
              </View>
            ))}

            {p.labTests && p.labTests.length > 0 && (
              <View style={styles.labRow}>
                <Text style={styles.labLabel}>Recommended Lab Tests: </Text>
                <Text style={styles.labVal}>{p.labTests.join(', ')}</Text>
              </View>
            )}

            {p.notes ? <Text style={styles.notesText}>Note: {p.notes}</Text> : null}
          </View>
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Manrope_700Bold',
    color: Colors.onSurface,
    marginBottom: 12,
  },
  card: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    ...Shadows.subtle,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceContainerHighest,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docText: {
    fontSize: 15,
    fontFamily: 'Manrope_700Bold',
    color: Colors.onSurface,
  },
  dateText: {
    ...Typography.bodySmall,
    color: Colors.onSurfaceVariant,
  },
  pdfBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: `${Colors.primary}12`,
  },
  pdfText: {
    fontSize: 11,
    fontFamily: 'Manrope_700Bold',
    color: Colors.primary,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginTop: 7,
  },
  medName: {
    fontSize: 14,
    fontFamily: 'Manrope_600SemiBold',
    color: Colors.onSurface,
  },
  medMeta: {
    ...Typography.bodySmall,
    color: Colors.onSurfaceVariant,
  },
  labRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceContainerLow,
  },
  labLabel: {
    fontSize: 12,
    fontFamily: 'Manrope_700Bold',
    color: Colors.tertiary,
  },
  labVal: {
    fontSize: 12,
    fontFamily: 'Manrope_500Medium',
    color: Colors.onSurface,
  },
  notesText: {
    ...Typography.bodySmall,
    color: Colors.onSurfaceVariant,
    fontStyle: 'italic',
    marginTop: 8,
  },
  emptyCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 14,
    padding: 16,
  },
  emptyText: {
    ...Typography.bodyMedium,
    color: Colors.onSurfaceVariant,
  },
});

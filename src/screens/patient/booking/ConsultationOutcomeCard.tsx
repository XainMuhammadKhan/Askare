import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography, BorderRadius, Spacing } from '../../../theme';
import { AppointmentDetail, patientService } from '../../../api';
import { formatDate } from '../../../utils/format';

interface Props {
  appointment: AppointmentDetail;
  onViewFullSummary?: () => void;
}

export const ConsultationOutcomeCard: React.FC<Props> = ({ appointment, onViewFullSummary }) => {
  const { consultation, prescription } = appointment;
  const hasConsultation = Boolean(
    consultation &&
      (consultation.diagnosis ||
        consultation.symptoms ||
        consultation.notes ||
        consultation.advice ||
        consultation.followUpDate)
  );
  const hasPrescription = Boolean(
    prescription && ((prescription.items && prescription.items.length > 0) || prescription.notes)
  );

  if (!hasConsultation && !hasPrescription) {
    return null;
  }

  const handleOpenPrescriptionPdf = async () => {
    if (!prescription?.id) return;
    try {
      const url = patientService.prescriptionPdfUrl(prescription.id);
      await Linking.openURL(url);
    } catch {
      Alert.alert('Error', 'Could not open prescription PDF.');
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <MaterialIcons name="assignment" size={20} color={Colors.primary} />
        <Text style={styles.cardTitle}>Clinical Notes & Prescription</Text>
      </View>

      {hasConsultation && consultation && (
        <View style={styles.section}>
          {consultation.diagnosis ? (
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>DIAGNOSIS</Text>
              <Text style={styles.fieldValue}>{consultation.diagnosis}</Text>
            </View>
          ) : null}

          {consultation.symptoms ? (
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>SYMPTOMS</Text>
              <Text style={styles.fieldValue}>{consultation.symptoms}</Text>
            </View>
          ) : null}

          {consultation.advice || consultation.notes ? (
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>DOCTOR'S ADVICE & NOTES</Text>
              <Text style={styles.fieldValue}>
                {[consultation.advice, consultation.notes].filter(Boolean).join('\n')}
              </Text>
            </View>
          ) : null}

          {consultation.followUpDate ? (
            <View style={styles.followUpRow}>
              <MaterialIcons name="event-repeat" size={16} color={Colors.primary} />
              <Text style={styles.followUpText}>
                Recommended Follow-up: {formatDate(consultation.followUpDate)}
              </Text>
            </View>
          ) : null}
        </View>
      )}

      {hasPrescription && prescription && (
        <View style={styles.section}>
          <Text style={styles.fieldLabel}>PRESCRIBED MEDICINES</Text>
          {(prescription.items ?? []).map((item, idx) => (
            <View key={idx} style={styles.medItem}>
              <View style={styles.medDot} />
              <View style={{ flex: 1 }}>
                <Text style={styles.medName}>
                  {item.medicine} • {item.dosage}
                </Text>
                <Text style={styles.medMeta}>
                  {item.frequency}
                  {item.durationDays ? ` for ${item.durationDays} days` : ''}
                  {item.instructions ? ` (${item.instructions})` : ''}
                </Text>
              </View>
            </View>
          ))}

          {prescription.labTests && prescription.labTests.length > 0 ? (
            <View style={{ marginTop: 8 }}>
              <Text style={styles.fieldLabel}>RECOMMENDED LAB TESTS</Text>
              <Text style={styles.fieldValue}>{prescription.labTests.join(', ')}</Text>
            </View>
          ) : null}

          {prescription.id ? (
            <TouchableOpacity style={styles.pdfBtn} onPress={handleOpenPrescriptionPdf}>
              <MaterialIcons name="picture-as-pdf" size={17} color={Colors.primary} />
              <Text style={styles.pdfBtnText}>Download Prescription PDF</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      )}

      {onViewFullSummary && (
        <TouchableOpacity style={styles.summaryBtn} onPress={onViewFullSummary}>
          <Text style={styles.summaryBtnText}>Open Full Consultation Summary</Text>
          <MaterialIcons name="arrow-forward" size={16} color={Colors.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHighest,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  cardTitle: { fontSize: 16, fontFamily: 'Manrope_700Bold', color: Colors.onSurface },
  section: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: BorderRadius.md,
    padding: 14,
    marginBottom: 10,
    gap: 10,
  },
  field: { gap: 2 },
  fieldLabel: {
    fontSize: 10,
    fontFamily: 'Manrope_700Bold',
    color: Colors.onSurfaceVariant,
    letterSpacing: 1,
  },
  fieldValue: {
    ...Typography.bodyMedium,
    color: Colors.onSurface,
    lineHeight: 20,
  },
  followUpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  followUpText: {
    ...Typography.bodySmall,
    color: Colors.primary,
    fontFamily: 'Manrope_700Bold',
  },
  medItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 4,
  },
  medDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginTop: 7,
  },
  medName: { fontSize: 14, fontFamily: 'Manrope_700Bold', color: Colors.onSurface },
  medMeta: { ...Typography.bodySmall, color: Colors.onSurfaceVariant },
  pdfBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    backgroundColor: `${Colors.primary}12`,
  },
  pdfBtnText: { fontSize: 13, fontFamily: 'Manrope_700Bold', color: Colors.primary },
  summaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  summaryBtnText: { fontSize: 13, fontFamily: 'Manrope_700Bold', color: Colors.primary },
});

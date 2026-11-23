import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  RefreshControl,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Typography, BorderRadius, Spacing } from '../../theme';
import { Header, PrimaryButton, StateView } from '../../components';
import { AppointmentDetail, patientService } from '../../api';
import { useApi } from '../../hooks/useApi';
import { doctorName, formatDate, formatTime, specializationOf } from '../../utils/format';

type Props = { navigation: NativeStackNavigationProp<any>; route?: any };

export const ConsultationSummaryScreen: React.FC<Props> = ({ navigation, route }) => {
  const fallbackAppt = route?.params?.appointment as AppointmentDetail | undefined;
  const appointmentId = Number(route?.params?.appointmentId ?? fallbackAppt?.id ?? 0);

  const {
    data: fetchedAppt,
    loading,
    error,
    refresh,
  } = useApi(
    async () => {
      if (!appointmentId) return fallbackAppt ?? null;
      return patientService.appointment(appointmentId);
    },
    [appointmentId]
  );

  const appt = fetchedAppt ?? fallbackAppt ?? null;
  const consultation = appt?.consultation;
  const prescription = appt?.prescription;
  const medicines = prescription?.items ?? [];
  const labTests = prescription?.labTests ?? [];

  const handleOpenPdf = async () => {
    if (!prescription?.id) return;
    try {
      const url = patientService.prescriptionPdfUrl(prescription.id);
      await Linking.openURL(url);
    } catch {
      Alert.alert('Error', 'Unable to open the prescription PDF.');
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Consultation Summary"
        showBack
        onBack={() => navigation.goBack()}
        onNotification={() => navigation.navigate('Notifications')}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} tintColor={Colors.primary} />
        }
      >
        <StateView
          loading={loading && !appt}
          error={!appt ? error : null}
          empty={!loading && !appt}
          emptyText="No consultation summary is available for this appointment."
          onRetry={refresh}
        >
          {appt && (
            <>
              {/* Doctor & Visit Meta */}
              <View style={styles.headerCard}>
                <View style={styles.aiIcon}>
                  <MaterialIcons name="medical-information" size={26} color={Colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.doctorTitle}>{doctorName(appt.doctor?.name)}</Text>
                  <Text style={styles.doctorSub}>
                    {specializationOf(appt.doctor)}
                    {appt.doctor?.hospital?.name ? ` • ${appt.doctor.hospital.name}` : ''}
                  </Text>
                  <View style={styles.metaRow}>
                    <MaterialIcons name="event" size={14} color={Colors.onSurfaceVariant} />
                    <Text style={styles.metaText}>{formatDate(appt.slot?.startAt)}</Text>
                    <MaterialIcons name="schedule" size={14} color={Colors.onSurfaceVariant} />
                    <Text style={styles.metaText}>{formatTime(appt.slot?.startAt)}</Text>
                  </View>
                </View>
              </View>

              {/* Diagnosis */}
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <MaterialIcons name="coronavirus" size={18} color={Colors.tertiary} />
                  <Text style={styles.sectionLabel}>DIAGNOSIS</Text>
                </View>
                <Text style={styles.sectionBody}>
                  {consultation?.diagnosis || 'No formal diagnosis recorded yet.'}
                </Text>
              </View>

              {/* Symptoms */}
              {consultation?.symptoms ? (
                <View style={styles.sectionCard}>
                  <View style={styles.sectionHeader}>
                    <MaterialIcons name="healing" size={18} color={Colors.primary} />
                    <Text style={styles.sectionLabel}>PRESENTING SYMPTOMS</Text>
                  </View>
                  <Text style={styles.sectionBody}>{consultation.symptoms}</Text>
                </View>
              ) : null}

              {/* Clinical Notes & Advice */}
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <MaterialIcons name="medical-services" size={18} color={Colors.primary} />
                  <Text style={styles.sectionLabel}>CLINICAL NOTES & ADVICE</Text>
                </View>
                <Text style={styles.sectionBody}>
                  {[consultation?.notes, consultation?.advice].filter(Boolean).join('\n\n') ||
                    'No additional clinical notes recorded.'}
                </Text>

                {consultation?.followUpDate ? (
                  <View style={styles.followUpBanner}>
                    <MaterialIcons name="event-repeat" size={18} color={Colors.primary} />
                    <Text style={styles.followUpText}>
                      Follow-up advised on {formatDate(consultation.followUpDate)}
                    </Text>
                  </View>
                ) : null}
              </View>

              {/* Prescribed Medicines */}
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <MaterialIcons name="medication" size={18} color={Colors.primary} />
                  <Text style={styles.sectionLabel}>PRESCRIBED MEDICINES</Text>
                </View>

                {medicines.length === 0 ? (
                  <Text style={styles.emptySectionText}>No medicines prescribed.</Text>
                ) : (
                  medicines.map((med, i) => (
                    <View key={i} style={styles.medRow}>
                      <View style={styles.medDot} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.medTitle}>
                          {med.medicine} — {med.dosage}
                        </Text>
                        <Text style={styles.medSub}>
                          {med.frequency}
                          {med.durationDays ? ` • ${med.durationDays} days` : ''}
                        </Text>
                        {med.instructions ? (
                          <Text style={styles.medInstructions}>Note: {med.instructions}</Text>
                        ) : null}
                      </View>
                    </View>
                  ))
                )}

                {prescription?.notes ? (
                  <Text style={[styles.sectionBody, { marginTop: 8 }]}>
                    Prescription Notes: {prescription.notes}
                  </Text>
                ) : null}
              </View>

              {/* Lab Tests */}
              {labTests.length > 0 && (
                <View style={[styles.sectionCard, styles.labCard]}>
                  <View style={styles.sectionHeader}>
                    <MaterialIcons name="biotech" size={18} color={Colors.tertiary} />
                    <Text style={[styles.sectionLabel, { color: Colors.tertiary }]}>
                      RECOMMENDED LAB TESTS
                    </Text>
                  </View>
                  {labTests.map((test, idx) => (
                    <View key={idx} style={styles.labRow}>
                      <Text style={styles.labBullet}>•</Text>
                      <Text style={styles.labText}>{test}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Actions */}
              {prescription?.id ? (
                <TouchableOpacity style={styles.pdfBtn} onPress={handleOpenPdf} activeOpacity={0.8}>
                  <MaterialIcons name="picture-as-pdf" size={20} color={Colors.primary} />
                  <Text style={styles.pdfBtnText}>Download Official Prescription PDF</Text>
                </TouchableOpacity>
              ) : null}

              <PrimaryButton
                title="Done"
                onPress={() => navigation.goBack()}
                style={{ marginTop: Spacing.md }}
              />
            </>
          )}
        </StateView>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: Spacing.lg, paddingBottom: 100 },
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHighest,
  },
  aiIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: `${Colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doctorTitle: { fontSize: 17, fontFamily: 'Manrope_700Bold', color: Colors.onSurface },
  doctorSub: {
    ...Typography.bodySmall,
    color: Colors.primary,
    fontFamily: 'Manrope_600SemiBold',
    marginTop: 2,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  metaText: { ...Typography.bodySmall, color: Colors.onSurfaceVariant, marginRight: 6 },
  sectionCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHighest,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  sectionLabel: {
    fontSize: 10,
    fontFamily: 'Manrope_700Bold',
    color: Colors.onSurfaceVariant,
    letterSpacing: 1.2,
  },
  sectionBody: {
    ...Typography.bodyMedium,
    color: Colors.onSurface,
    lineHeight: 22,
  },
  emptySectionText: {
    ...Typography.bodySmall,
    color: Colors.onSurfaceVariant,
    fontStyle: 'italic',
  },
  followUpBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: `${Colors.primary}12`,
    padding: 12,
    borderRadius: BorderRadius.md,
    marginTop: 12,
  },
  followUpText: {
    ...Typography.bodySmall,
    color: Colors.primary,
    fontFamily: 'Manrope_700Bold',
  },
  medRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceContainerLow,
  },
  medDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: Colors.primary,
    marginTop: 7,
  },
  medTitle: { fontSize: 14, fontFamily: 'Manrope_700Bold', color: Colors.onSurface },
  medSub: { ...Typography.bodySmall, color: Colors.onSurfaceVariant, marginTop: 2 },
  medInstructions: {
    ...Typography.bodySmall,
    color: Colors.primary,
    marginTop: 2,
  },
  labCard: {
    backgroundColor: `${Colors.tertiary}08`,
    borderColor: `${Colors.tertiary}25`,
  },
  labRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 6 },
  labBullet: { fontSize: 16, color: Colors.tertiary, marginTop: -2 },
  labText: { ...Typography.bodyMedium, color: Colors.onSurface, flex: 1 },
  pdfBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}10`,
  },
  pdfBtnText: {
    ...Typography.labelLarge,
    color: Colors.primary,
    fontSize: 14,
  },
});

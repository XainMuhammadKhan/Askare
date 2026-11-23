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
import { Colors, Typography, Shadows } from '../../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { doctorService } from '../../api';
import { useApi } from '../../hooks/useApi';
import { StateView } from '../../components/StateView';
import { formatDate, initials, doctorName } from '../../utils/format';

type Props = { navigation: NativeStackNavigationProp<any>; route: any };

export const PatientDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const patientId = Number(route?.params?.patientId);
  const insets = useSafeAreaInsets();

  const { data, loading, error, refresh } = useApi<any>(
    () => doctorService.patient(patientId),
    [patientId]
  );

  const patient = data?.patient ?? {};
  const profile = data?.profile ?? null;
  const consultations: any[] = Array.isArray(data?.consultations) ? data.consultations : [];
  const prescriptions: any[] = Array.isArray(data?.prescriptions) ? data.prescriptions : [];
  const documents: any[] = Array.isArray(data?.documents) ? data.documents : [];

  const openDocument = async (url?: string) => {
    if (!url) return;
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('Cannot Open File', 'Unable to open document link on this device.');
    }
  };

  const renderChipList = (items?: string[], emptyLabel = 'None reported', isAlert = false) => {
    if (!items || items.length === 0) {
      return <Text style={styles.emptySmall}>{emptyLabel}</Text>;
    }
    return (
      <View style={styles.chipWrap}>
        {items.map((item, idx) => (
          <View
            key={idx}
            style={[
              styles.chip,
              isAlert && { backgroundColor: `${Colors.error}15`, borderColor: `${Colors.error}40` },
            ]}
          >
            <Text style={[styles.chipText, isAlert && { color: Colors.error }]}>{item}</Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={22} color={Colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Patient File</Text>
        <TouchableOpacity onPress={refresh} style={styles.backBtn}>
          <MaterialIcons name="refresh" size={22} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <StateView loading={loading && !data} error={error} onRetry={refresh}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
        >
          {/* Patient Demographics Card */}
          <View style={styles.profileCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials(patient?.name) || 'PT'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.patientName}>{patient?.name || 'Patient'}</Text>
              <Text style={styles.patientMeta}>
                {[
                  patient?.gender
                    ? patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1)
                    : null,
                  patient?.dateOfBirth ? `DOB: ${formatDate(patient.dateOfBirth)}` : null,
                ]
                  .filter(Boolean)
                  .join(' • ') || `Patient #${patientId}`}
              </Text>
            </View>
            {patient?.bloodGroup ? (
              <View style={styles.bloodBadge}>
                <MaterialIcons name="water-drop" size={14} color={Colors.error} />
                <Text style={styles.bloodText}>{patient.bloodGroup}</Text>
              </View>
            ) : null}
          </View>

          {/* Vitals & Medical Profile */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="monitor-heart" size={20} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Medical Profile</Text>
            </View>

            <View style={styles.vitalsRow}>
              <View style={styles.vitalBox}>
                <Text style={styles.vitalLabel}>HEIGHT</Text>
                <Text style={styles.vitalValue}>
                  {profile?.heightCm ? `${profile.heightCm} cm` : '—'}
                </Text>
              </View>
              <View style={styles.vitalBox}>
                <Text style={styles.vitalLabel}>WEIGHT</Text>
                <Text style={styles.vitalValue}>
                  {profile?.weightKg ? `${profile.weightKg} kg` : '—'}
                </Text>
              </View>
              <View style={styles.vitalBox}>
                <Text style={styles.vitalLabel}>BLOOD GROUP</Text>
                <Text style={styles.vitalValue}>{patient?.bloodGroup || '—'}</Text>
              </View>
            </View>

            <View style={styles.profileField}>
              <Text style={styles.fieldLabel}>Allergies</Text>
              {renderChipList(profile?.allergies, 'No known allergies', true)}
            </View>

            <View style={styles.profileField}>
              <Text style={styles.fieldLabel}>Chronic Conditions</Text>
              {renderChipList(profile?.conditions, 'No chronic conditions listed')}
            </View>

            <View style={styles.profileField}>
              <Text style={styles.fieldLabel}>Current Medications</Text>
              {renderChipList(profile?.currentMedications, 'No active medications')}
            </View>

            {profile?.pastSurgeries?.length > 0 && (
              <View style={styles.profileField}>
                <Text style={styles.fieldLabel}>Past Surgeries</Text>
                {renderChipList(profile.pastSurgeries)}
              </View>
            )}

            {profile?.familyHistory ? (
              <View style={styles.profileField}>
                <Text style={styles.fieldLabel}>Family History</Text>
                <Text style={styles.fieldText}>{profile.familyHistory}</Text>
              </View>
            ) : null}

            {profile?.emergencyContact ? (
              <View style={styles.profileField}>
                <Text style={styles.fieldLabel}>Emergency Contact</Text>
                <Text style={styles.fieldText}>{profile.emergencyContact}</Text>
              </View>
            ) : null}
          </View>

          {/* Past Consultations */}
          <Text style={styles.outerSectionTitle}>
            Past Consultations ({consultations.length})
          </Text>
          {consultations.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptySmall}>No consultation notes recorded yet.</Text>
            </View>
          ) : (
            consultations.map((c) => (
              <TouchableOpacity
                key={c.id}
                style={styles.itemCard}
                activeOpacity={0.8}
                onPress={() =>
                  c.appointmentId &&
                  navigation.navigate('DoctorAppointment', { appointmentId: c.appointmentId })
                }
              >
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>{c.diagnosis || 'Clinical Consultation'}</Text>
                  <Text style={styles.itemDate}>
                    {formatDate(c.appointment?.slot?.startAt || c.createdAt)}
                  </Text>
                </View>
                {c.doctor?.name && (
                  <Text style={styles.itemSub}>{doctorName(c.doctor.name)}</Text>
                )}
                {c.symptoms ? (
                  <Text style={styles.itemBody}>
                    <Text style={styles.boldLabel}>Symptoms: </Text>
                    {c.symptoms}
                  </Text>
                ) : null}
                {c.notes ? (
                  <Text style={styles.itemBody}>
                    <Text style={styles.boldLabel}>Notes: </Text>
                    {c.notes}
                  </Text>
                ) : null}
                {c.advice ? (
                  <Text style={styles.itemBody}>
                    <Text style={styles.boldLabel}>Advice: </Text>
                    {c.advice}
                  </Text>
                ) : null}
                {c.followUpDate ? (
                  <Text style={styles.followUpTag}>
                    Follow-up: {formatDate(c.followUpDate)}
                  </Text>
                ) : null}
              </TouchableOpacity>
            ))
          )}

          {/* Prescriptions */}
          <Text style={styles.outerSectionTitle}>Prescriptions ({prescriptions.length})</Text>
          {prescriptions.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptySmall}>No prescriptions issued yet.</Text>
            </View>
          ) : (
            prescriptions.map((rx) => (
              <View key={rx.id} style={styles.itemCard}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>Prescription #{rx.id}</Text>
                  <Text style={styles.itemDate}>{formatDate(rx.createdAt)}</Text>
                </View>
                {rx.doctor?.name && (
                  <Text style={styles.itemSub}>{doctorName(rx.doctor.name)}</Text>
                )}
                {(rx.items ?? []).map((med: any, idx: number) => (
                  <View key={idx} style={styles.medRow}>
                    <MaterialIcons name="medication" size={16} color={Colors.primary} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.medName}>
                        {med.medicine} ({med.dosage}) — {med.frequency}
                        {med.durationDays ? ` • ${med.durationDays}d` : ''}
                      </Text>
                      {med.instructions ? (
                        <Text style={styles.medInstr}>{med.instructions}</Text>
                      ) : null}
                    </View>
                  </View>
                ))}
                {rx.labTests && rx.labTests.length > 0 && (
                  <Text style={styles.itemBody}>
                    <Text style={styles.boldLabel}>Lab Tests: </Text>
                    {rx.labTests.join(', ')}
                  </Text>
                )}
                {rx.notes ? (
                  <Text style={styles.itemBody}>
                    <Text style={styles.boldLabel}>Notes: </Text>
                    {rx.notes}
                  </Text>
                ) : null}
              </View>
            ))
          )}

          {/* Uploaded Documents */}
          <Text style={styles.outerSectionTitle}>
            Uploaded Documents ({documents.length})
          </Text>
          {documents.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptySmall}>No lab reports or documents uploaded.</Text>
            </View>
          ) : (
            documents.map((doc) => (
              <View key={doc.id} style={styles.itemCard}>
                <View style={styles.itemHeader}>
                  <View style={styles.docTitleRow}>
                    <MaterialIcons name="description" size={18} color={Colors.primary} />
                    <Text style={styles.itemTitle}>{doc.title}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.openDocBtn}
                    onPress={() => openDocument(doc.fileUrl)}
                  >
                    <Text style={styles.openDocText}>View File</Text>
                    <MaterialIcons name="open-in-new" size={14} color={Colors.primary} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.itemSub}>
                  {doc.type || 'DOCUMENT'} • {formatDate(doc.recordedAt || doc.createdAt)}
                </Text>
                {doc.aiSummary ? (
                  <View style={styles.aiSummaryBox}>
                    <Text style={styles.aiSummaryLabel}>AI Report Summary</Text>
                    <Text style={styles.aiSummaryText}>{doc.aiSummary}</Text>
                  </View>
                ) : null}
              </View>
            ))
          )}

          <View style={{ height: 60 }} />
        </ScrollView>
      </StateView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontFamily: 'Manrope_700Bold', color: Colors.onSurface },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 40 },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    ...Shadows.subtle,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${Colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 20, fontFamily: 'Manrope_800ExtraBold', color: Colors.primary },
  patientName: { fontSize: 18, fontFamily: 'Manrope_700Bold', color: Colors.onSurface },
  patientMeta: { ...Typography.bodySmall, color: Colors.onSurfaceVariant, marginTop: 2 },
  bloodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: `${Colors.error}12`,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  bloodText: { fontSize: 13, fontFamily: 'Manrope_800ExtraBold', color: Colors.error },
  sectionCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
    ...Shadows.subtle,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 16, fontFamily: 'Manrope_700Bold', color: Colors.onSurface },
  vitalsRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  vitalBox: {
    flex: 1,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  vitalLabel: {
    fontSize: 9,
    fontFamily: 'Manrope_700Bold',
    color: Colors.onSurfaceVariant,
    letterSpacing: 0.8,
  },
  vitalValue: {
    fontSize: 15,
    fontFamily: 'Manrope_700Bold',
    color: Colors.onSurface,
    marginTop: 4,
  },
  profileField: { marginTop: 12 },
  fieldLabel: {
    fontSize: 12,
    fontFamily: 'Manrope_700Bold',
    color: Colors.onSurfaceVariant,
    marginBottom: 6,
  },
  fieldText: { ...Typography.bodyMedium, color: Colors.onSurface },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    backgroundColor: `${Colors.primary}12`,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: `${Colors.primary}25`,
  },
  chipText: { fontSize: 12, fontFamily: 'Manrope_600SemiBold', color: Colors.primary },
  emptySmall: { ...Typography.bodySmall, color: Colors.outlineVariant, fontStyle: 'italic' },
  outerSectionTitle: {
    fontSize: 17,
    fontFamily: 'Manrope_700Bold',
    color: Colors.onSurface,
    marginBottom: 10,
    marginTop: 4,
  },
  emptyBox: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    alignItems: 'center',
  },
  itemCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    ...Shadows.subtle,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  itemTitle: { fontSize: 15, fontFamily: 'Manrope_700Bold', color: Colors.onSurface, flex: 1 },
  itemDate: { fontSize: 12, fontFamily: 'Manrope_600SemiBold', color: Colors.primary },
  itemSub: {
    ...Typography.bodySmall,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
    marginBottom: 8,
  },
  itemBody: { ...Typography.bodyMedium, color: Colors.onSurface, marginTop: 6 },
  boldLabel: { fontFamily: 'Manrope_700Bold', color: Colors.onSurfaceVariant },
  followUpTag: {
    alignSelf: 'flex-start',
    marginTop: 8,
    backgroundColor: `${Colors.primary}12`,
    color: Colors.primary,
    fontSize: 11,
    fontFamily: 'Manrope_700Bold',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  medRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: Colors.surfaceContainerLow,
    padding: 10,
    borderRadius: 10,
    marginTop: 6,
  },
  medName: { fontSize: 13, fontFamily: 'Manrope_700Bold', color: Colors.onSurface },
  medInstr: { ...Typography.bodySmall, color: Colors.onSurfaceVariant, marginTop: 2 },
  docTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  openDocBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: `${Colors.primary}12`,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  openDocText: { fontSize: 12, fontFamily: 'Manrope_700Bold', color: Colors.primary },
  aiSummaryBox: {
    marginTop: 8,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 10,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  aiSummaryLabel: {
    fontSize: 11,
    fontFamily: 'Manrope_700Bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  aiSummaryText: { ...Typography.bodySmall, color: Colors.onSurface, lineHeight: 18 },
});

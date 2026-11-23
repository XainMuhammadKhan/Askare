import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography, Shadows } from '../../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { doctorService, AppointmentDetail } from '../../api';
import { useApi } from '../../hooks/useApi';
import { StateView } from '../../components/StateView';
import {
  formatDate,
  formatTime,
  formatMoney,
  initials,
  STATUS_LABEL,
  PAYMENT_LABEL,
  displayStatus,
} from '../../utils/format';
import { AiPatientBriefCard } from './components/AiPatientBriefCard';
import { ConsultationNotesForm } from './components/ConsultationNotesForm';
import { PrescriptionEditorCard } from './components/PrescriptionEditorCard';

type Props = { navigation: NativeStackNavigationProp<any>; route: any };

export const DoctorAppointmentScreen: React.FC<Props> = ({ navigation, route }) => {
  const appointmentId = Number(route?.params?.appointmentId);
  const insets = useSafeAreaInsets();
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const { data: appt, loading, error, refresh } = useApi<AppointmentDetail>(
    () => doctorService.appointment(appointmentId),
    [appointmentId]
  );

  const runAction = async (
    key: string,
    title: string,
    message: string,
    fn: () => Promise<unknown>,
    destructive = false
  ) => {
    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        style: destructive ? 'destructive' : 'default',
        onPress: async () => {
          setActionLoading(key);
          try {
            await fn();
            await refresh();
          } catch (e: any) {
            Alert.alert('Action Failed', e?.message ?? 'Could not complete action.');
          } finally {
            setActionLoading(null);
          }
        },
      },
    ]);
  };

  const isPending = appt?.status === 'PENDING';
  const isConfirmed = appt?.status === 'CONFIRMED';
  const isCompleted = appt?.status === 'COMPLETED';
  const canEditClinical = isConfirmed || isCompleted;
  const dStatus = appt ? displayStatus(appt) : 'upcoming';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <MaterialIcons name="arrow-back" size={22} color={Colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Appointment #{appointmentId}</Text>
        <TouchableOpacity onPress={refresh} style={styles.iconBtn}>
          <MaterialIcons name="refresh" size={22} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <StateView loading={loading && !appt} error={error} onRetry={refresh}>
        {appt && (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
          >
            {/* Patient Card */}
            <TouchableOpacity
              style={styles.patientCard}
              activeOpacity={0.8}
              onPress={() =>
                appt.patient?.id &&
                navigation.navigate('PatientDetail', { patientId: appt.patient.id })
              }
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {initials(appt.patient?.name) || 'PT'}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.patientName}>
                  {appt.patient?.name || 'Patient'}
                </Text>
                <Text style={styles.viewHistoryLink}>
                  Tap to view full medical records →
                </Text>
              </View>
              <View style={styles.statusPill}>
                <Text style={styles.statusPillText}>
                  {STATUS_LABEL[dStatus] || appt.status}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Slot & Payment Metadata */}
            <View style={styles.metaCard}>
              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>DATE & TIME</Text>
                  <Text style={styles.metaValue}>
                    {formatDate(appt.slot?.startAt)}
                  </Text>
                  <Text style={styles.metaSub}>
                    {formatTime(appt.slot?.startAt)} – {formatTime(appt.slot?.endAt)}
                  </Text>
                </View>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>TYPE & FEE</Text>
                  <Text style={styles.metaValue}>
                    {appt.consultationType === 'VIDEO' ? 'Video Call' : 'In-Person'}
                  </Text>
                  <Text style={styles.metaSub}>
                    {formatMoney(appt.consultationFee)} •{' '}
                    {PAYMENT_LABEL[appt.paymentStatus] || appt.paymentStatus}
                  </Text>
                </View>
              </View>

              {appt.reason ? (
                <View style={styles.reasonBox}>
                  <Text style={styles.metaLabel}>REASON FOR VISIT</Text>
                  <Text style={styles.reasonText}>{appt.reason}</Text>
                </View>
              ) : null}
            </View>

            {/* Pending Request Actions */}
            {isPending && (
              <View style={styles.pendingBanner}>
                <Text style={styles.pendingTitle}>Awaiting Your Decision</Text>
                <Text style={styles.pendingSub}>
                  Patient's payment is authorized on hold. Accepting charges the patient and confirms the appointment.
                </Text>
                <View style={styles.pendingBtns}>
                  <TouchableOpacity
                    style={styles.rejectBtn}
                    disabled={!!actionLoading}
                    onPress={() =>
                      runAction(
                        'reject',
                        'Reject Request',
                        'Release payment hold and reject this request?',
                        () => doctorService.reject(appointmentId, 'Doctor unavailable'),
                        true
                      )
                    }
                  >
                    {actionLoading === 'reject' ? (
                      <ActivityIndicator size="small" color={Colors.error} />
                    ) : (
                      <Text style={styles.rejectBtnText}>Reject</Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.acceptBtn}
                    disabled={!!actionLoading}
                    onPress={() =>
                      runAction(
                        'accept',
                        'Accept Request',
                        'Confirm this appointment and capture payment?',
                        () => doctorService.accept(appointmentId)
                      )
                    }
                  >
                    {actionLoading === 'accept' ? (
                      <ActivityIndicator size="small" color={Colors.white} />
                    ) : (
                      <Text style={styles.acceptBtnText}>Accept Request</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Video Call Button for CONFIRMED + VIDEO */}
            {isConfirmed && appt.consultationType === 'VIDEO' && (
              <TouchableOpacity
                style={styles.videoCallBtn}
                activeOpacity={0.85}
                onPress={() =>
                  navigation.navigate('VideoConsultation', { appointmentId })
                }
              >
                <View style={styles.videoIconWrap}>
                  <MaterialIcons name="videocam" size={24} color={Colors.white} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.videoCallTitle}>Join Video Call</Text>
                  <Text style={styles.videoCallSub}>
                    Enter WebRTC room with {appt.patient?.name || 'patient'}
                  </Text>
                </View>
                <MaterialIcons name="arrow-forward" size={22} color={Colors.white} />
              </TouchableOpacity>
            )}

            {/* AI Pre-Visit Brief */}
            <AiPatientBriefCard appointmentId={appointmentId} />

            {/* Consultation Notes Form */}
            {canEditClinical && (
              <ConsultationNotesForm
                appointmentId={appointmentId}
                initialConsultation={appt.consultation}
                editable={canEditClinical}
                onSaved={refresh}
              />
            )}

            {/* Prescription Editor */}
            {canEditClinical && (
              <PrescriptionEditorCard
                appointmentId={appointmentId}
                initialPrescription={appt.prescription}
                editable={canEditClinical}
                onSaved={refresh}
              />
            )}

            {/* Status Actions for CONFIRMED */}
            {isConfirmed && (
              <View style={styles.statusActionsCard}>
                <Text style={styles.statusActionsTitle}>Appointment Outcome</Text>
                <TouchableOpacity
                  style={styles.completeBtn}
                  disabled={!!actionLoading}
                  onPress={() =>
                    runAction(
                      'complete',
                      'Mark Consultation Complete',
                      'Mark this consultation as completed? The patient will be notified and can leave a review.',
                      () => doctorService.complete(appointmentId)
                    )
                  }
                >
                  {actionLoading === 'complete' ? (
                    <ActivityIndicator size="small" color={Colors.white} />
                  ) : (
                    <>
                      <MaterialIcons name="task-alt" size={18} color={Colors.white} />
                      <Text style={styles.completeBtnText}>
                        Mark Consultation Complete
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                <View style={styles.secondaryActionsRow}>
                  <TouchableOpacity
                    style={styles.noShowBtn}
                    disabled={!!actionLoading}
                    onPress={() =>
                      runAction(
                        'noshow',
                        'Mark No-Show',
                        'Mark that the patient did not attend this scheduled slot?',
                        () => doctorService.noShow(appointmentId),
                        true
                      )
                    }
                  >
                    <Text style={styles.noShowBtnText}>Mark No-Show</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.cancelApptBtn}
                    disabled={!!actionLoading}
                    onPress={() =>
                      runAction(
                        'cancel',
                        'Cancel Appointment',
                        'Cancelling will issue a full refund to the patient. Proceed?',
                        () =>
                          doctorService.cancel(
                            appointmentId,
                            'Cancelled by doctor'
                          ),
                        true
                      )
                    }
                  >
                    <Text style={styles.cancelApptBtnText}>Cancel Appointment</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <View style={{ height: 60 }} />
          </ScrollView>
        )}
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
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontFamily: 'Manrope_700Bold', color: Colors.onSurface },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 40 },
  patientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    ...Shadows.subtle,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: `${Colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 18, fontFamily: 'Manrope_700Bold', color: Colors.primary },
  patientName: { fontSize: 17, fontFamily: 'Manrope_700Bold', color: Colors.onSurface },
  viewHistoryLink: { fontSize: 12, fontFamily: 'Manrope_600SemiBold', color: Colors.primary, marginTop: 2 },
  statusPill: {
    backgroundColor: `${Colors.primary}15`,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusPillText: { fontSize: 11, fontFamily: 'Manrope_700Bold', color: Colors.primary },
  metaCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    ...Shadows.subtle,
  },
  metaRow: { flexDirection: 'row', gap: 12 },
  metaItem: {
    flex: 1,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 12,
    padding: 12,
  },
  metaLabel: {
    fontSize: 10,
    fontFamily: 'Manrope_700Bold',
    color: Colors.onSurfaceVariant,
    letterSpacing: 0.8,
  },
  metaValue: { fontSize: 14, fontFamily: 'Manrope_700Bold', color: Colors.onSurface, marginTop: 4 },
  metaSub: { ...Typography.bodySmall, color: Colors.onSurfaceVariant, marginTop: 2 },
  reasonBox: {
    marginTop: 12,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 12,
    padding: 12,
  },
  reasonText: { ...Typography.bodyMedium, color: Colors.onSurface, marginTop: 4 },
  pendingBanner: {
    backgroundColor: '#fffbeb',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  pendingTitle: { fontSize: 15, fontFamily: 'Manrope_700Bold', color: '#92400e' },
  pendingSub: { ...Typography.bodySmall, color: '#b45309', marginTop: 4, marginBottom: 12 },
  pendingBtns: { flexDirection: 'row', gap: 10 },
  rejectBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  rejectBtnText: { fontSize: 13, fontFamily: 'Manrope_700Bold', color: Colors.error },
  acceptBtn: {
    flex: 1.5,
    alignItems: 'center',
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: Colors.primary,
  },
  acceptBtnText: { fontSize: 13, fontFamily: 'Manrope_700Bold', color: Colors.white },
  videoCallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.primary,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    ...Shadows.card,
  },
  videoIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoCallTitle: { fontSize: 16, fontFamily: 'Manrope_700Bold', color: Colors.white },
  videoCallSub: { fontSize: 12, fontFamily: 'Manrope_500Medium', color: 'rgba(255,255,255,0.85)' },
  statusActionsCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    gap: 10,
    ...Shadows.subtle,
  },
  statusActionsTitle: { fontSize: 15, fontFamily: 'Manrope_700Bold', color: Colors.onSurface },
  completeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#16a34a',
    paddingVertical: 13,
    borderRadius: 14,
  },
  completeBtnText: { fontSize: 14, fontFamily: 'Manrope_700Bold', color: Colors.white },
  secondaryActionsRow: { flexDirection: 'row', gap: 10 },
  noShowBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: Colors.surfaceContainerLow,
  },
  noShowBtnText: { fontSize: 12, fontFamily: 'Manrope_700Bold', color: Colors.onSurfaceVariant },
  cancelApptBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: `${Colors.error}12`,
  },
  cancelApptBtnText: { fontSize: 12, fontFamily: 'Manrope_700Bold', color: Colors.error },
});

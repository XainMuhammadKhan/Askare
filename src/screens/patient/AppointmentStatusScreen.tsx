import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Typography, BorderRadius, Spacing } from '../../theme';
import { Header, PrimaryButton, SecondaryButton, StateView, AppointmentCard } from '../../components';
import { ApiError, AppointmentDetail, patientService } from '../../api';
import { useApi } from '../../hooks/useApi';
import { AppointmentInfoCard } from './booking/AppointmentInfoCard';
import { ConsultationOutcomeCard } from './booking/ConsultationOutcomeCard';
import { DoctorReviewCard } from './booking/DoctorReviewCard';

type Props = { navigation: NativeStackNavigationProp<any>; route?: any };

export const AppointmentStatusScreen: React.FC<Props> = ({ navigation, route }) => {
  const paramId = route?.params?.appointmentId ? Number(route.params.appointmentId) : null;
  const [selectedId, setSelectedId] = useState<number | null>(paramId);
  const [cancelling, setCancelling] = useState(false);

  const activeId = paramId ?? selectedId;

  // Fetch single appointment detail when an appointmentId is provided
  const {
    data: appointment,
    loading: detailLoading,
    error: detailError,
    refresh: refreshDetail,
  } = useApi(
    async () => {
      if (!activeId) return null;
      return patientService.appointment(activeId);
    },
    [activeId]
  );

  // Fallback list when navigated to without an appointmentId
  const {
    data: allAppointments,
    loading: listLoading,
    error: listError,
    refresh: refreshList,
  } = useApi(
    async () => {
      if (activeId) return [];
      return patientService.myAppointments();
    },
    [activeId]
  );

  const handleCancel = (appt: AppointmentDetail) => {
    const isConfirmed = appt.status === 'CONFIRMED';
    const warningMsg = isConfirmed
      ? 'Confirmed appointments can only be cancelled at least 24 hours before the scheduled start time for a full refund. Proceed with cancellation?'
      : 'This request is still pending doctor approval. Cancelling will immediately release the hold on your card with no charge.';

    Alert.alert('Cancel Appointment?', warningMsg, [
      { text: 'Keep Appointment', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          setCancelling(true);
          try {
            await patientService.cancelAppointment(appt.id, 'Cancelled by patient');
            Alert.alert('Appointment Cancelled', 'Your appointment has been cancelled.');
            await refreshDetail();
          } catch (err: any) {
            const msg =
              err instanceof ApiError
                ? err.message
                : err?.message || 'Unable to cancel this appointment.';
            Alert.alert('Cancellation Failed', msg);
          } finally {
            setCancelling(false);
          }
        },
      },
    ]);
  };

  if (!activeId) {
    const list = allAppointments ?? [];
    return (
      <View style={styles.container}>
        <Header
          title="Appointment Status"
          showBack
          onBack={() => navigation.goBack()}
          onNotification={() => navigation.navigate('Notifications')}
        />
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl refreshing={listLoading} onRefresh={refreshList} tintColor={Colors.primary} />
          }
        >
          <StateView
            loading={listLoading}
            error={listError}
            empty={!listLoading && list.length === 0}
            emptyText="You have no appointments yet."
            onRetry={refreshList}
          >
            {list.map((item) => (
              <AppointmentCard
                key={item.id}
                appointment={item}
                viewerRole="patient"
                onPress={() => setSelectedId(item.id)}
              />
            ))}
          </StateView>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title={`Appointment #${activeId}`}
        showBack
        onBack={() => {
          if (!paramId && selectedId) {
            setSelectedId(null);
          } else {
            navigation.goBack();
          }
        }}
        onNotification={() => navigation.navigate('Notifications')}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={detailLoading}
            onRefresh={refreshDetail}
            tintColor={Colors.primary}
          />
        }
      >
        <StateView
          loading={detailLoading && !appointment}
          error={!appointment ? detailError : null}
          empty={!detailLoading && !appointment}
          emptyText="Appointment details could not be loaded."
          onRetry={refreshDetail}
        >
          {appointment && (
            <>
              <AppointmentInfoCard appointment={appointment} />

              {/* Contextual Action Buttons */}
              <View style={styles.actionsSection}>
                {appointment.status === 'CONFIRMED' &&
                  appointment.consultationType === 'VIDEO' && (
                    <PrimaryButton
                      title="Join Video Consultation"
                      onPress={() =>
                        navigation.navigate('VideoConsultation', {
                          appointmentId: appointment.id,
                        })
                      }
                      icon={<MaterialIcons name="videocam" size={20} color={Colors.onPrimary} />}
                    />
                  )}

                {appointment.status === 'COMPLETED' && (
                  <PrimaryButton
                    title="View Consultation Summary"
                    onPress={() =>
                      navigation.navigate('ConsultationSummary', {
                        appointmentId: appointment.id,
                        appointment,
                      })
                    }
                    icon={<MaterialIcons name="summarize" size={20} color={Colors.onPrimary} />}
                  />
                )}

                {(appointment.status === 'PENDING' || appointment.status === 'CONFIRMED') && (
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => handleCancel(appointment)}
                    disabled={cancelling}
                    activeOpacity={0.8}
                  >
                    <MaterialIcons name="cancel" size={18} color={Colors.error} />
                    <Text style={styles.cancelBtnText}>
                      {cancelling ? 'Cancelling...' : 'Cancel Appointment'}
                    </Text>
                  </TouchableOpacity>
                )}

                {appointment.status === 'CANCELLED' && (
                  <SecondaryButton
                    title="Book Another Specialist"
                    onPress={() => navigation.navigate('FindSpecialist')}
                  />
                )}
              </View>

              {/* Consultation Notes & Prescription */}
              <ConsultationOutcomeCard
                appointment={appointment}
                onViewFullSummary={
                  appointment.status === 'COMPLETED'
                    ? () =>
                        navigation.navigate('ConsultationSummary', {
                          appointmentId: appointment.id,
                          appointment,
                        })
                    : undefined
                }
              />

              {/* Review Section (for COMPLETED appointments or existing review) */}
              <DoctorReviewCard
                appointmentId={appointment.id}
                canReview={appointment.status === 'COMPLETED'}
                existingReview={appointment.review}
                onReviewed={refreshDetail}
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
  actionsSection: {
    gap: 10,
    marginBottom: Spacing.md,
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: BorderRadius.xl,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: `${Colors.error}30`,
  },
  cancelBtnText: {
    ...Typography.labelLarge,
    color: Colors.error,
    fontSize: 14,
  },
});

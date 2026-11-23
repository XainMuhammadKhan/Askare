import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows, FontFamily } from '../../../theme';
import { hospitalAdminService } from '../../../api';
import { useApi } from '../../../hooks/useApi';
import { StateView } from '../../../components/StateView';
import {
  formatDateTime,
  formatMoney,
  doctorName,
} from '../../../utils/format';
import {
  AdminHeader,
  FilterChips,
  FilterChipOption,
  StatusBadge,
  ActionButton,
  AdminModal,
  FormField,
} from '../components';

type ApptStatusFilter = 'ALL' | 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

const STATUS_FILTERS: FilterChipOption<ApptStatusFilter>[] = [
  { key: 'ALL', label: 'All' },
  { key: 'PENDING', label: 'Pending' },
  { key: 'CONFIRMED', label: 'Confirmed' },
  { key: 'COMPLETED', label: 'Completed' },
  { key: 'CANCELLED', label: 'Cancelled' },
  { key: 'NO_SHOW', label: 'No-Show' },
];

export const HospitalAppointmentsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [statusFilter, setStatusFilter] = useState<ApptStatusFilter>('ALL');

  // Cancel modal state
  const [cancelTarget, setCancelTarget] = useState<any | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  // Reassign modal state
  const [reassignTarget, setReassignTarget] = useState<any | null>(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(null);
  const [freeSlots, setFreeSlots] = useState<any[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const [reassigning, setReassigning] = useState(false);

  const queryParams = useMemo(() => {
    const q: Record<string, string | undefined> = {};
    if (statusFilter !== 'ALL') q.status = statusFilter;
    return q;
  }, [statusFilter]);

  const {
    data: apptPage,
    loading,
    error,
    refresh,
  } = useApi(() => hospitalAdminService.appointments(queryParams), [statusFilter]);

  const { data: activeDoctorsData } = useApi(
    () => hospitalAdminService.doctors({ status: 'ACTIVE' }),
    []
  );

  const appointments: any[] = useMemo(() => {
    if (Array.isArray(apptPage?.items)) return apptPage.items;
    if (Array.isArray(apptPage)) return apptPage as any[];
    if (Array.isArray((apptPage as any)?.data)) return (apptPage as any).data;
    return [];
  }, [apptPage]);

  const activeDoctors: any[] = useMemo(() => {
    if (Array.isArray(activeDoctorsData)) return activeDoctorsData;
    if (Array.isArray((activeDoctorsData as any)?.items)) return (activeDoctorsData as any).items;
    return [];
  }, [activeDoctorsData]);

  const handleSelectReassignDoctor = async (docId: number) => {
    setSelectedDoctorId(docId);
    setSelectedSlotId(null);
    setLoadingSlots(true);
    try {
      const slots = await hospitalAdminService.doctorFreeSlots(docId);
      setFreeSlots(Array.isArray(slots) ? slots : (slots as any)?.items ?? []);
    } catch (e: any) {
      Alert.alert('Could Not Load Slots', e?.message ?? 'Failed to fetch free slots.');
      setFreeSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleConfirmReassign = async () => {
    if (!reassignTarget || !selectedDoctorId || !selectedSlotId) {
      Alert.alert('Select Doctor & Slot', 'Please pick both a target doctor and an available slot.');
      return;
    }
    setReassigning(true);
    try {
      await hospitalAdminService.reassign(reassignTarget.id, selectedDoctorId, selectedSlotId);
      setReassignTarget(null);
      setSelectedDoctorId(null);
      setSelectedSlotId(null);
      setFreeSlots([]);
      Alert.alert('Reassigned', 'Appointment moved to the selected doctor and slot.');
      await refresh();
    } catch (e: any) {
      Alert.alert('Reassign Failed', e?.message ?? 'Could not reassign appointment.');
    } finally {
      setReassigning(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await hospitalAdminService.cancelAppointment(
        cancelTarget.id,
        cancelReason.trim() || undefined
      );
      setCancelTarget(null);
      setCancelReason('');
      Alert.alert('Cancelled', 'Appointment cancelled and patient payment hold/refund processed.');
      await refresh();
    } catch (e: any) {
      Alert.alert('Cancel Failed', e?.message ?? 'Could not cancel appointment.');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AdminHeader
        title="Hospital Appointments"
        subtitle={`${appointments.length} appointment${appointments.length === 1 ? '' : 's'} listed`}
        badgeText="HOSPITAL ADMIN"
        onNotificationsPress={() => navigation.navigate('Notifications')}
        onRefresh={refresh}
      />

      <View style={styles.topControls}>
        <FilterChips
          options={STATUS_FILTERS}
          selected={statusFilter}
          onSelect={setStatusFilter}
        />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading && appointments.length > 0} onRefresh={refresh} tintColor={Colors.primary} />
        }
      >
        <StateView
          loading={loading && appointments.length === 0}
          error={error}
          empty={appointments.length === 0}
          emptyText="No appointments found for this filter."
          onRetry={refresh}
        >
          {appointments.map((appt) => {
            const status = String(appt?.status ?? 'PENDING').toUpperCase();
            const canModify = status === 'PENDING' || status === 'CONFIRMED';
            const slotStart = appt?.slot?.startAt ?? appt?.startAt;

            return (
              <View key={appt.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.apptIdText}>Appointment #{appt.id}</Text>
                    <Text style={styles.patientName}>
                      {appt?.patient?.name ?? 'Patient'}
                    </Text>
                    <Text style={styles.doctorName}>
                      with {doctorName(appt?.doctor?.name ?? 'Doctor')}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 4 }}>
                    <StatusBadge status={status} />
                    {appt?.paymentStatus ? (
                      <StatusBadge
                        status={appt.paymentStatus}
                        label={`Pay: ${appt.paymentStatus}`}
                      />
                    ) : null}
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <View style={styles.infoItem}>
                    <MaterialIcons name="schedule" size={15} color={Colors.primary} />
                    <Text style={styles.infoText}>
                      {slotStart ? formatDateTime(slotStart) : 'Scheduled slot'}
                    </Text>
                  </View>
                  <View style={styles.infoItem}>
                    <MaterialIcons
                      name={appt?.consultationType === 'VIDEO' ? 'videocam' : 'place'}
                      size={15}
                      color={Colors.secondary}
                    />
                    <Text style={styles.infoText}>
                      {appt?.consultationType ?? 'VIDEO'} • {formatMoney(appt?.consultationFee ?? 0)}
                    </Text>
                  </View>
                </View>

                {appt?.reason ? (
                  <Text style={styles.reasonText} numberOfLines={2}>
                    Reason: {appt.reason}
                  </Text>
                ) : null}

                {canModify ? (
                  <View style={styles.actionsRow}>
                    <ActionButton
                      small
                      variant="secondary"
                      icon="swap-horiz"
                      label="Reassign Doctor"
                      onPress={() => {
                        setReassignTarget(appt);
                        setSelectedDoctorId(null);
                        setSelectedSlotId(null);
                        setFreeSlots([]);
                      }}
                    />
                    <ActionButton
                      small
                      variant="danger"
                      icon="cancel"
                      label="Cancel"
                      onPress={() => {
                        setCancelTarget(appt);
                        setCancelReason('');
                      }}
                    />
                  </View>
                ) : null}
              </View>
            );
          })}
        </StateView>
      </ScrollView>

      {/* Cancel Appointment Modal */}
      <AdminModal
        visible={!!cancelTarget}
        title="Cancel Appointment"
        subtitle={
          cancelTarget
            ? `#${cancelTarget.id} • ${cancelTarget?.patient?.name ?? 'Patient'}`
            : ''
        }
        onClose={() => setCancelTarget(null)}
      >
        <FormField
          label="Cancellation Reason (optional)"
          value={cancelReason}
          onChangeText={setCancelReason}
          placeholder="e.g. Doctor unavailable due to emergency duty"
          multiline
        />
        <ActionButton
          label="Confirm Cancellation"
          variant="danger"
          icon="cancel"
          loading={cancelling}
          onPress={handleConfirmCancel}
        />
      </AdminModal>

      {/* Reassign Doctor Modal */}
      <AdminModal
        visible={!!reassignTarget}
        title="Reassign Appointment"
        subtitle={
          reassignTarget
            ? `Move #${reassignTarget.id} (${reassignTarget?.patient?.name ?? 'Patient'}) to another doctor`
            : ''
        }
        onClose={() => setReassignTarget(null)}
      >
        <Text style={styles.stepLabel}>1. Select Active Hospital Doctor</Text>
        <View style={styles.doctorPickerList}>
          {activeDoctors.length === 0 ? (
            <Text style={styles.emptySmall}>No active doctors available.</Text>
          ) : (
            activeDoctors.map((doc) => {
              const selected = selectedDoctorId === doc.id;
              return (
                <TouchableOpacity
                  key={doc.id}
                  style={[styles.pickerCard, selected && styles.pickerCardActive]}
                  onPress={() => handleSelectReassignDoctor(doc.id)}
                >
                  <MaterialIcons
                    name={selected ? 'radio-button-checked' : 'radio-button-unchecked'}
                    size={20}
                    color={selected ? Colors.primary : Colors.onSurfaceVariant}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.pickerTitle}>{doctorName(doc.name)}</Text>
                    <Text style={styles.pickerSub}>
                      {doc?.department?.name ?? 'Hospital Specialist'}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {selectedDoctorId ? (
          <>
            <Text style={styles.stepLabel}>2. Select Upcoming Free Slot</Text>
            {loadingSlots ? (
              <View style={{ padding: Spacing.lg, alignItems: 'center' }}>
                <ActivityIndicator color={Colors.primary} />
              </View>
            ) : freeSlots.length === 0 ? (
              <Text style={styles.emptySmall}>
                No upcoming free slots found for this doctor.
              </Text>
            ) : (
              <View style={styles.slotGrid}>
                {freeSlots.slice(0, 24).map((slot) => {
                  const selected = selectedSlotId === slot.id;
                  return (
                    <TouchableOpacity
                      key={slot.id}
                      style={[styles.slotChip, selected && styles.slotChipActive]}
                      onPress={() => setSelectedSlotId(slot.id)}
                    >
                      <Text style={[styles.slotChipText, selected && styles.slotChipTextActive]}>
                        {formatDateTime(slot.startAt)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </>
        ) : null}

        <ActionButton
          label="Confirm Reassignment"
          icon="swap-horiz"
          loading={reassigning}
          disabled={!selectedDoctorId || !selectedSlotId}
          onPress={handleConfirmReassign}
          style={{ marginTop: Spacing.md }}
        />
      </AdminModal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topControls: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing['4xl'],
    gap: Spacing.md,
  },
  card: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHigh,
    ...Shadows.subtle,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  apptIdText: {
    ...Typography.labelSmall,
    color: Colors.primary,
  },
  patientName: {
    ...Typography.titleMedium,
    color: Colors.onSurface,
    marginTop: 2,
  },
  doctorName: {
    ...Typography.bodySmall,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceContainerHigh,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  infoText: {
    ...Typography.bodySmall,
    color: Colors.onSurface,
    fontFamily: FontFamily.medium,
  },
  reasonText: {
    ...Typography.bodySmall,
    color: Colors.onSurfaceVariant,
    marginTop: Spacing.sm,
    fontStyle: 'italic',
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  stepLabel: {
    ...Typography.labelMedium,
    color: Colors.onSurfaceVariant,
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  doctorPickerList: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  pickerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHigh,
  },
  pickerCardActive: {
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}10`,
  },
  pickerTitle: {
    ...Typography.titleSmall,
    color: Colors.onSurface,
  },
  pickerSub: {
    ...Typography.bodySmall,
    color: Colors.onSurfaceVariant,
  },
  emptySmall: {
    ...Typography.bodySmall,
    color: Colors.onSurfaceVariant,
    paddingVertical: Spacing.sm,
  },
  slotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  slotChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHigh,
  },
  slotChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  slotChipText: {
    ...Typography.bodySmall,
    color: Colors.onSurface,
    fontSize: 12,
  },
  slotChipTextActive: {
    color: Colors.onPrimary,
    fontFamily: FontFamily.bold,
  },
});

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography, BorderRadius } from '../../theme';
import { Header, FilterChips, PrimaryButton } from '../../components';
import { useAppStore } from '../../store';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = { navigation: NativeStackNavigationProp<any> };
const filters = ['All', 'Pending', 'Approved', 'Completed', 'Cancelled'];
const statusColors: Record<string, string> = { pending: '#d97706', approved: Colors.primary, cancelled: Colors.error, completed: Colors.outline };

// Doctor-specific available slots for rescheduling
const doctorSlots: Record<string, { date: string; time: string }[]> = {
  default: [
    { date: 'October 25, 2026', time: '10:00 AM' },
    { date: 'October 27, 2026', time: '02:00 PM' },
    { date: 'October 30, 2026', time: '11:30 AM' },
  ],
};

export const AppointmentStatusScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState('All');
  const appointments = useAppStore((s) => s.appointments).filter((a) =>
    ['pending', 'approved', 'cancelled'].includes(a.status)
  );
  const rescheduleAppointment = useAppStore((s) => s.rescheduleAppointment);
  const cancelAppointment = useAppStore((s) => s.cancelAppointment);

  const filtered = selected === 'All' ? appointments : appointments.filter((a) => a.status === selected.toLowerCase());

  // Reschedule modal state
  const [rescheduleTarget, setRescheduleTarget] = useState<string | null>(null);
  const [rescheduleDoctor, setRescheduleDoctor] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; time: string } | null>(null);

  // Cancel modal state
  const [cancelTarget, setCancelTarget] = useState<string | null>(null);
  const [cancelDoctor, setCancelDoctor] = useState('');

  // Toast
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const openReschedule = (id: string, doctorName: string) => {
    setRescheduleTarget(id);
    setRescheduleDoctor(doctorName);
    setSelectedSlot(null);
  };

  const confirmReschedule = () => {
    if (!rescheduleTarget || !selectedSlot) return;
    rescheduleAppointment(rescheduleTarget, selectedSlot.date, selectedSlot.time);
    setRescheduleTarget(null);
    showToast('Appointment rescheduled successfully.');
  };

  const openCancel = (id: string, doctorName: string) => {
    setCancelTarget(id);
    setCancelDoctor(doctorName);
  };

  const confirmCancel = () => {
    if (!cancelTarget) return;
    cancelAppointment(cancelTarget);
    setCancelTarget(null);
    showToast('Appointment cancelled. The payment is non-refundable.');
  };

  const slots = doctorSlots.default;

  return (
    <View style={styles.container}>
      <Header title="Appointment Status" showBack onBack={() => navigation.goBack()} onNotification={() => navigation.navigate('Notifications')} />
      <TouchableOpacity style={styles.newBtn} onPress={() => navigation.navigate('FindSpecialist')}>
        <MaterialIcons name="add-circle" size={22} color={Colors.onPrimary} />
        <Text style={styles.newBtnText}>Book New Appointment</Text>
      </TouchableOpacity>
      <FilterChips chips={filters} selected={selected} onSelect={setSelected} />
      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 && (
          <View style={styles.emptyState}>
            <MaterialIcons name="event-busy" size={48} color={Colors.outlineVariant} />
            <Text style={styles.emptyText}>No appointments found</Text>
          </View>
        )}
        {filtered.map((apt) => {
          const color = statusColors[apt.status] || Colors.primary;
          return (
            <View key={apt.id} style={styles.card}>
              <View style={[styles.cardAccent, { backgroundColor: color }]} />
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <View style={styles.avatarPlaceholder}><MaterialIcons name="person" size={24} color={Colors.outlineVariant} /></View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.doctorName}>{apt.doctorName}</Text>
                    <Text style={styles.specialty}>{apt.specialty}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: `${color}15` }]}>
                    <Text style={[styles.statusText, { color }]}>{apt.status.toUpperCase()}</Text>
                  </View>
                </View>
                <View style={styles.dateRow}>
                  <MaterialIcons name="event" size={14} color={Colors.onSurfaceVariant} />
                  <Text style={styles.dateText}>{apt.date}</Text>
                  {apt.time ? (
                    <>
                      <MaterialIcons name="schedule" size={14} color={Colors.onSurfaceVariant} />
                      <Text style={styles.dateText}>{apt.time}</Text>
                    </>
                  ) : (
                    <>
                      <MaterialIcons name="block" size={14} color={Colors.onSurfaceVariant} />
                      <Text style={styles.dateText}>Patient Request</Text>
                    </>
                  )}
                </View>
                <View style={styles.actions}>
                  {apt.status === 'pending' && (
                    <>
                      <TouchableOpacity style={styles.outlinedBtn} onPress={() => openReschedule(apt.id, apt.doctorName)}>
                        <Text style={styles.outlinedBtnText}>Reschedule</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.dangerBtn} onPress={() => openCancel(apt.id, apt.doctorName)}>
                        <Text style={styles.dangerBtnText}>Cancel</Text>
                      </TouchableOpacity>
                    </>
                  )}
                  {apt.status === 'approved' && (
                    <>
                      <TouchableOpacity
                        style={styles.primaryBtn}
                        onPress={() => navigation.navigate('VideoConsultation', { doctorName: apt.doctorName })}
                      >
                        <MaterialIcons name="videocam" size={16} color={Colors.onPrimary} />
                        <Text style={styles.primaryBtnText}>Join Session</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.outlinedBtn} onPress={() => openReschedule(apt.id, apt.doctorName)}>
                        <Text style={styles.outlinedBtnText}>Reschedule</Text>
                      </TouchableOpacity>
                    </>
                  )}
                  {apt.status === 'cancelled' && (
                    <TouchableOpacity style={styles.outlinedBtn} onPress={() => navigation.navigate('FindSpecialist')}>
                      <Text style={styles.outlinedBtnText}>Rebook Appointment</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          );
        })}
        {/* Urgent Banner */}
        <View style={styles.urgentBanner}>
          <Text style={styles.urgentTitle}>Need urgent help?</Text>
          <Text style={styles.urgentSub}>Our Karachi clinics are open 24/7 for walk-ins and emergencies.</Text>
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Reschedule Modal */}
      <Modal visible={!!rescheduleTarget} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Reschedule Appointment</Text>
                <Text style={styles.modalSub}>{rescheduleDoctor}</Text>
              </View>
              <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setRescheduleTarget(null)}>
                <MaterialIcons name="close" size={20} color={Colors.secondary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalInstruction}>Choose from the doctor's available slots.</Text>
            {slots.map((slot) => {
              const isSelected = selectedSlot?.date === slot.date && selectedSlot?.time === slot.time;
              return (
                <TouchableOpacity
                  key={`${slot.date}-${slot.time}`}
                  style={[styles.slotOption, isSelected && styles.slotOptionActive]}
                  onPress={() => setSelectedSlot(slot)}
                >
                  <Text style={[styles.slotDate, isSelected && styles.slotDateActive]}>{slot.date}</Text>
                  <Text style={styles.slotTime}>{slot.time}</Text>
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity
              style={[styles.confirmSlotBtn, !selectedSlot && { opacity: 0.5 }]}
              onPress={confirmReschedule}
              disabled={!selectedSlot}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmSlotText}>Confirm Reschedule</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Cancel Confirmation Modal */}
      <Modal visible={!!cancelTarget} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.cancelHeader}>
              <View style={styles.cancelIcon}>
                <MaterialIcons name="warning" size={28} color={Colors.tertiary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>Cancel Appointment?</Text>
                <Text style={styles.modalSub}>{cancelDoctor}</Text>
              </View>
            </View>
            <Text style={styles.cancelWarning}>
              If you cancel this meeting, the payment you already made for the appointment will not be refunded.
            </Text>
            <View style={styles.cancelBtns}>
              <TouchableOpacity style={styles.keepBtn} onPress={() => setCancelTarget(null)}>
                <Text style={styles.keepBtnText}>Keep Appointment</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelConfirmBtn} onPress={confirmCancel}>
                <Text style={styles.cancelConfirmText}>Cancel Appointment</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Toast */}
      {toast ? (
        <View style={[styles.toastContainer, { bottom: insets.bottom + 20 }]}>
          <View style={styles.toast}>
            <MaterialIcons name="check-circle" size={20} color={Colors.onPrimary} />
            <Text style={styles.toastText}>{toast}</Text>
          </View>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  newBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.primary, marginHorizontal: 16, paddingVertical: 14, borderRadius: BorderRadius.xl, marginBottom: 8 },
  newBtnText: { fontSize: 15, fontFamily: 'Manrope_700Bold', color: Colors.onPrimary },
  list: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 20 },
  emptyState: { alignItems: 'center', paddingVertical: 48, gap: 12 },
  emptyText: { fontSize: 15, fontFamily: 'Manrope_500Medium', color: Colors.onSurfaceVariant },
  card: { flexDirection: 'row', backgroundColor: Colors.surfaceContainerLowest, borderRadius: 16, marginBottom: 14, overflow: 'hidden' },
  cardAccent: { width: 4 },
  cardContent: { flex: 1, padding: 16 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  avatarPlaceholder: { width: 48, height: 48, borderRadius: 12, backgroundColor: Colors.surfaceContainerHigh, alignItems: 'center', justifyContent: 'center' },
  doctorName: { fontSize: 15, fontFamily: 'Manrope_600SemiBold', color: Colors.onSurface },
  specialty: { ...Typography.bodySmall, color: Colors.onSurfaceVariant },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 9, fontFamily: 'Manrope_700Bold', letterSpacing: 0.8 },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  dateText: { ...Typography.bodySmall, color: Colors.onSurfaceVariant },
  actions: { flexDirection: 'row', gap: 8 },
  outlinedBtn: { flex: 1, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: Colors.outlineVariant, alignItems: 'center' },
  outlinedBtnText: { fontSize: 12, fontFamily: 'Manrope_700Bold', color: Colors.primary },
  dangerBtn: { flex: 1, paddingVertical: 10, borderRadius: 20, backgroundColor: '#fef2f2', alignItems: 'center' },
  dangerBtnText: { fontSize: 12, fontFamily: 'Manrope_700Bold', color: Colors.error },
  primaryBtn: { flex: 1, paddingVertical: 10, borderRadius: 20, backgroundColor: Colors.primary, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 },
  primaryBtnText: { fontSize: 12, fontFamily: 'Manrope_700Bold', color: Colors.onPrimary },
  urgentBanner: { backgroundColor: Colors.surfaceContainerLow, borderRadius: 16, padding: 20, marginTop: 8 },
  urgentTitle: { fontSize: 18, fontFamily: 'Manrope_700Bold', color: Colors.error, marginBottom: 4 },
  urgentSub: { ...Typography.bodyMedium, color: Colors.onSurfaceVariant, lineHeight: 20 },

  // Modals
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  modalCard: { backgroundColor: Colors.surfaceContainerLowest, borderRadius: 24, padding: 24, width: '100%', maxWidth: 400 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, borderBottomWidth: 1, borderBottomColor: Colors.surfaceContainerHighest, paddingBottom: 16 },
  modalTitle: { fontSize: 17, fontFamily: 'Manrope_700Bold', color: Colors.onSurface },
  modalSub: { fontSize: 12, fontFamily: 'Manrope_500Medium', color: Colors.secondary, marginTop: 2 },
  modalCloseBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.surfaceContainerHigh, alignItems: 'center', justifyContent: 'center' },
  modalInstruction: { fontSize: 13, fontFamily: 'Manrope_500Medium', color: Colors.onSurfaceVariant, marginBottom: 12 },
  slotOption: { width: '100%', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: Colors.surfaceContainerHighest, backgroundColor: Colors.surfaceContainerLow, marginBottom: 8 },
  slotOptionActive: { borderColor: Colors.primary, backgroundColor: `${Colors.primary}08`, borderWidth: 2 },
  slotDate: { fontSize: 14, fontFamily: 'Manrope_700Bold', color: Colors.onSurface },
  slotDateActive: { color: Colors.primary },
  slotTime: { fontSize: 12, fontFamily: 'Manrope_500Medium', color: Colors.secondary, marginTop: 2 },
  confirmSlotBtn: { backgroundColor: Colors.primary, borderRadius: 16, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  confirmSlotText: { fontSize: 14, fontFamily: 'Manrope_700Bold', color: Colors.onPrimary },

  // Cancel Modal
  cancelHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16, borderBottomWidth: 1, borderBottomColor: Colors.surfaceContainerHighest, paddingBottom: 16 },
  cancelIcon: { width: 48, height: 48, borderRadius: 12, backgroundColor: `${Colors.tertiary}15`, alignItems: 'center', justifyContent: 'center' },
  cancelWarning: { fontSize: 14, fontFamily: 'Manrope_500Medium', color: Colors.onSurfaceVariant, lineHeight: 22, marginBottom: 20 },
  cancelBtns: { flexDirection: 'row', gap: 12 },
  keepBtn: { flex: 1, paddingVertical: 14, borderRadius: 16, backgroundColor: Colors.surfaceContainerLow, alignItems: 'center' },
  keepBtnText: { fontSize: 13, fontFamily: 'Manrope_600SemiBold', color: Colors.onSurface },
  cancelConfirmBtn: { flex: 1, paddingVertical: 14, borderRadius: 16, backgroundColor: Colors.tertiary, alignItems: 'center' },
  cancelConfirmText: { fontSize: 13, fontFamily: 'Manrope_700Bold', color: Colors.onTertiary },

  // Toast
  toastContainer: { position: 'absolute', right: 16, left: 16 },
  toast: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 14, borderRadius: 16 },
  toastText: { fontSize: 13, fontFamily: 'Manrope_600SemiBold', color: Colors.onPrimary, flex: 1 },
});

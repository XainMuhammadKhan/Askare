import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../theme';
import { useAuthStore, useAppStore } from '../../store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = { navigation: NativeStackNavigationProp<any> };

const RESCHEDULE_SLOTS = [
  { date: 'October 20, 2026', time: '09:00 AM' },
  { date: 'October 22, 2026', time: '02:30 PM' },
  { date: 'October 25, 2026', time: '11:00 AM' },
];

// Summary data for clinical archive items (matching web's summaryData)
const summaryData: Record<string, {
  doctor: string; date: string; time: string; duration: string;
  illness: string; recommendations: string;
  medicines: { name: string; dosage: string }[];
  precautions: string[];
}> = {
  vance: {
    doctor: 'Dr. Julian Vance', date: 'Sep 12, 2025', time: '10:30 AM', duration: '24m 15s',
    illness: 'Mild Hypertension with elevated LDL cholesterol levels. Blood pressure readings averaging 138/88 mmHg over the past two weeks.',
    recommendations: 'Continue monitoring blood pressure twice daily. Maintain a low-sodium diet and increase physical activity to at least 30 minutes of moderate exercise daily.',
    medicines: [{ name: 'Lisinopril 10mg', dosage: 'Once daily (Morning)' }, { name: 'Atorvastatin 20mg', dosage: 'Once daily (Before bed)' }, { name: 'Aspirin 75mg', dosage: 'Once daily (After lunch)' }],
    precautions: ['Avoid excessive salt and processed food intake', 'Monitor blood pressure at home twice daily', 'Limit caffeine to 1-2 cups per day', 'Report any dizziness or persistent headaches immediately'],
  },
  patel: {
    doctor: 'Dr. Sarah Patel', date: 'Jul 4, 2025', time: '02:15 PM', duration: '18m 42s',
    illness: 'Routine ophthalmology examination. Mild dry eye syndrome noted with slight astigmatism in left eye.',
    recommendations: 'Use preservative-free artificial tears 3-4 times daily. Consider blue-light filtering glasses for prolonged screen use. Follow the 20-20-20 rule.',
    medicines: [{ name: 'Systane Ultra Eye Drops', dosage: '3-4 times daily (As needed)' }, { name: 'Omega-3 Fish Oil 1000mg', dosage: 'Twice daily (With meals)' }],
    precautions: ['Avoid rubbing your eyes excessively', 'Reduce screen time to 6 hours maximum per day', 'Wear UV-protection sunglasses outdoors', 'Maintain adequate hydration (8+ glasses of water daily)'],
  },
};

export const DashboardScreen: React.FC<Props> = ({ navigation }) => {
  const user = useAuthStore((s) => s.user);
  const doctors = useAppStore((s) => s.doctors);
  const callSummary = useAppStore((s) => s.callSummary);
  const insets = useSafeAreaInsets();

  const [appointmentDate, setAppointmentDate] = useState('Today, Oct 14');
  const [appointmentTime, setAppointmentTime] = useState('02:30 PM');
  const [rescheduleVisible, setRescheduleVisible] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<typeof RESCHEDULE_SLOTS[0] | null>(null);
  const [rescheduleError, setRescheduleError] = useState('');
  const [toast, setToast] = useState('');
  const [summaryModalKey, setSummaryModalKey] = useState<string | null>(null);

  // Check for pending call summary
  useEffect(() => {
    if (callSummary) {
      navigation.navigate('ConsultationSummary');
    }
  }, [callSummary]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  const handleReschedule = () => {
    if (!selectedSlot) {
      setRescheduleError('Please select a time slot.');
      return;
    }
    const dateObj = new Date(selectedSlot.date);
    const monthShort = dateObj.toLocaleString('en-US', { month: 'short' });
    const day = dateObj.getDate();
    setAppointmentDate(`${monthShort} ${day}, ${dateObj.getFullYear()}`);
    setAppointmentTime(selectedSlot.time);
    setRescheduleVisible(false);
    showToast(`Appointment rescheduled to ${selectedSlot.date} at ${selectedSlot.time}`);
  };

  const modalData = summaryModalKey ? summaryData[summaryModalKey] : null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.headerLeft}>
          <MaterialIcons name="description" size={24} color={Colors.primary} />
          <Text style={styles.headerTitle}>Dashboard</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={styles.notifBtn}>
          <MaterialIcons name="notifications-none" size={24} color={Colors.secondary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Greeting */}
        <View style={styles.greeting}>
          <Text style={styles.dateText}>TUESDAY, OCT 24</Text>
          <Text style={styles.greetText}>
            Good morning,{'\n'}
            <Text style={styles.nameText}>{user?.name || 'Sarah'}</Text>
          </Text>
        </View>

        {/* Next Appointment Card */}
        <Text style={styles.sectionTitle}>Next Appointment</Text>
        <TouchableOpacity activeOpacity={0.9}>
          <LinearGradient colors={[Colors.primary, Colors.primaryDim]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.appointmentCard}>
            <View style={styles.appointmentCardInner}>
              <View style={styles.appointmentTop}>
                <View style={styles.appointmentLeft}>
                  <View style={styles.calendarIcon}>
                    <MaterialIcons name="event" size={22} color={Colors.white} />
                  </View>
                  <View>
                    <Text style={styles.appointmentLabel}>CARDIOLOGY</Text>
                    <Text style={styles.appointmentDoctor}>Dr. Aris Thorne</Text>
                  </View>
                </View>
                <View style={styles.nextBadge}>
                  <View style={styles.nextBadgeDot} />
                  <Text style={styles.nextBadgeText}>Next Appointment</Text>
                </View>
              </View>

              <View style={styles.appointmentMeta}>
                <View style={styles.timeRow}>
                  <MaterialIcons name="calendar-today" size={14} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.timeText}>{appointmentDate}</Text>
                </View>
                <View style={styles.timeRow}>
                  <MaterialIcons name="schedule" size={14} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.timeText}>{appointmentTime}</Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.appointmentActions}>
                <TouchableOpacity
                  style={styles.joinCallBtn}
                  onPress={() => navigation.navigate('VideoConsultation', { doctorName: 'Dr. Aris Thorne' })}
                  activeOpacity={0.8}
                >
                  <MaterialIcons name="videocam" size={20} color={Colors.primary} />
                  <Text style={styles.joinCallText}>Join Video Call</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.rescheduleBtn}
                  onPress={() => {
                    setRescheduleVisible(true);
                    setSelectedSlot(null);
                    setRescheduleError('');
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.rescheduleBtnText}>Reschedule</Text>
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Health Status Bento Grid */}
        <View style={styles.bentoGrid}>
          <View style={[styles.bentoCard, { backgroundColor: Colors.surfaceContainerLowest }]}>
            <View style={styles.bentoTop}>
              <View style={[styles.bentoIcon, { backgroundColor: Colors.secondaryContainer }]}>
                <MaterialIcons name="monitor-heart" size={20} color={Colors.onSecondaryContainer} />
              </View>
              <View style={styles.pulseDot} />
            </View>
            <View style={styles.bentoBottom}>
              <Text style={styles.bentoLabel}>ACTIVE DIAGNOSIS</Text>
              <Text style={styles.bentoValue}>Mild Hypertension</Text>
            </View>
          </View>
          <View style={[styles.bentoCard, { backgroundColor: Colors.surfaceContainerLow }]}>
            <View style={[styles.bentoIcon, { backgroundColor: Colors.surfaceContainerHighest }]}>
              <MaterialIcons name="medication" size={20} color={Colors.secondary} />
            </View>
            <View style={styles.bentoBottom}>
              <Text style={styles.bentoLabel}>NEXT DOSAGE</Text>
              <Text style={styles.bentoValue}>Lisinopril 10mg</Text>
              <View style={styles.timeRow}>
                <MaterialIcons name="schedule" size={12} color={Colors.primary} />
                <Text style={{ ...Typography.bodySmall, color: Colors.primary, fontFamily: 'Manrope_500Medium', fontSize: 11 }}>In 2 hours</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Top Doctors */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top Doctors</Text>
          <TouchableOpacity onPress={() => navigation.navigate('FindSpecialist')}><Text style={styles.viewAll}>View All</Text></TouchableOpacity>
        </View>
        {doctors.slice(3, 5).map((doc) => (
          <TouchableOpacity key={doc.id} style={styles.doctorRow} onPress={() => navigation.navigate('DoctorProfile', { doctor: doc })} activeOpacity={0.7}>
            <View style={styles.doctorAvatar}>
              <MaterialIcons name="person" size={24} color={Colors.outlineVariant} />
              <View style={styles.ratingBadge}><Text style={styles.ratingText}>{doc.rating}</Text></View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.doctorName}>{doc.name}</Text>
              <Text style={styles.doctorSpec}>{doc.specialty} • {doc.hospital}</Text>
              <View style={styles.timeRow}>
                <MaterialIcons name="schedule" size={12} color={Colors.tertiary} />
                <Text style={styles.doctorNext}>NEXT: {doc.nextAvailable}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {/* Clinical Archive */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Clinical Archive</Text>
          <TouchableOpacity onPress={() => navigation.navigate('ClinicalArchive')}><Text style={styles.viewAll}>View All</Text></TouchableOpacity>
        </View>
        {[
          { icon: 'history', title: 'Consultation History', sub: 'Past visits & notes' },
          { icon: 'description', title: 'Prescription Archive', sub: 'Active & past meds' },
          { icon: 'timeline', title: 'Health Journey', sub: 'Vitals & milestones' },
        ].map((item, i) => (
          <TouchableOpacity key={i} style={styles.archiveRow} onPress={() => navigation.navigate('ClinicalArchive')} activeOpacity={0.7}>
            <View style={styles.archiveIcon}><MaterialIcons name={item.icon as any} size={22} color={Colors.secondary} /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.archiveTitle}>{item.title}</Text>
              <Text style={styles.archiveSub}>{item.sub}</Text>
            </View>
            <MaterialIcons name="chevron-right" size={22} color={Colors.outlineVariant} />
          </TouchableOpacity>
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Reschedule Modal */}
      <Modal visible={rescheduleVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Reschedule Appointment</Text>
                <Text style={styles.modalSub}>Dr. Aris Thorne</Text>
              </View>
              <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setRescheduleVisible(false)}>
                <MaterialIcons name="close" size={22} color={Colors.secondary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalInstruction}>Choose from the doctor's available slots.</Text>
            {RESCHEDULE_SLOTS.map((slot) => {
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
            {rescheduleError ? (
              <View style={styles.errorRow}>
                <MaterialIcons name="error" size={16} color={Colors.error} />
                <Text style={styles.errorText}>{rescheduleError}</Text>
              </View>
            ) : null}
            <TouchableOpacity style={styles.confirmBtn} onPress={handleReschedule} activeOpacity={0.8}>
              <Text style={styles.confirmBtnText}>Confirm Reschedule</Text>
            </TouchableOpacity>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 8, backgroundColor: Colors.background },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { ...Typography.titleLarge, color: Colors.primary, fontSize: 20 },
  notifBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { paddingHorizontal: 16 },
  greeting: { marginBottom: 20 },
  dateText: { ...Typography.labelMedium, color: Colors.onSurfaceVariant, marginBottom: 4, fontSize: 11 },
  greetText: { fontSize: 28, fontFamily: 'Manrope_600SemiBold', color: Colors.onSurface, lineHeight: 36 },
  nameText: { color: Colors.primary },
  sectionTitle: { ...Typography.titleLarge, color: Colors.onSurface, fontSize: 20, marginBottom: 12 },
  appointmentCard: { borderRadius: 24, padding: 20, marginBottom: 20 },
  appointmentCardInner: { gap: 16 },
  appointmentTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  appointmentLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  calendarIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  appointmentLabel: { ...Typography.labelSmall, color: 'rgba(255,255,255,0.8)', marginBottom: 2 },
  appointmentDoctor: { fontSize: 18, fontFamily: 'Manrope_600SemiBold', color: Colors.white },
  nextBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  nextBadgeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#22c55e' },
  nextBadgeText: { ...Typography.bodySmall, color: Colors.white, fontFamily: 'Manrope_500Medium', fontSize: 10 },
  appointmentMeta: { flexDirection: 'row', gap: 20, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)', paddingTop: 12 },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  timeText: { ...Typography.bodyMedium, color: Colors.white, fontFamily: 'Manrope_500Medium' },
  appointmentActions: { flexDirection: 'row', gap: 12 },
  joinCallBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.surfaceContainerLowest, borderRadius: 16, paddingVertical: 14 },
  joinCallText: { fontSize: 14, fontFamily: 'Manrope_700Bold', color: Colors.primary },
  rescheduleBtn: { backgroundColor: 'rgba(255,255,255,0.2)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', borderRadius: 16, paddingVertical: 14, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center' },
  rescheduleBtnText: { fontSize: 14, fontFamily: 'Manrope_600SemiBold', color: Colors.white },
  bentoGrid: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  bentoCard: { flex: 1, aspectRatio: 1, borderRadius: 16, padding: 16, justifyContent: 'space-between', ...Shadows.subtle },
  bentoTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  bentoIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  pulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.tertiary },
  bentoBottom: {},
  bentoLabel: { ...Typography.labelSmall, color: Colors.onSurfaceVariant, marginBottom: 4, fontSize: 9 },
  bentoValue: { fontSize: 15, fontFamily: 'Manrope_600SemiBold', color: Colors.onSurface, lineHeight: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 },
  viewAll: { ...Typography.bodyMedium, color: Colors.primary, fontFamily: 'Manrope_500Medium' },
  doctorRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.surfaceContainerLowest, borderRadius: 16, padding: 14, marginBottom: 10, ...Shadows.subtle },
  doctorAvatar: { width: 56, height: 56, borderRadius: 16, backgroundColor: Colors.surfaceContainerHigh, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.surfaceContainerHighest },
  ratingBadge: { position: 'absolute', bottom: -4, right: -4, backgroundColor: Colors.primary, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, borderWidth: 2, borderColor: Colors.background },
  ratingText: { fontSize: 9, fontFamily: 'Manrope_700Bold', color: Colors.onPrimary },
  doctorName: { fontSize: 15, fontFamily: 'Manrope_600SemiBold', color: Colors.onSurface },
  doctorSpec: { ...Typography.bodySmall, color: Colors.primary, fontFamily: 'Manrope_500Medium', marginTop: 2 },
  doctorNext: { fontSize: 9, fontFamily: 'Manrope_700Bold', color: Colors.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 1 },
  archiveRow: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: Colors.surfaceContainerLowest, borderRadius: 16, padding: 14, marginBottom: 10 },
  archiveIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.surfaceContainer, alignItems: 'center', justifyContent: 'center' },
  archiveTitle: { fontSize: 15, fontFamily: 'Manrope_500Medium', color: Colors.onSurface },
  archiveSub: { ...Typography.bodySmall, color: Colors.onSurfaceVariant },

  // Reschedule Modal
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
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  errorText: { fontSize: 12, fontFamily: 'Manrope_500Medium', color: Colors.error },
  confirmBtn: { backgroundColor: Colors.primary, borderRadius: 16, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  confirmBtnText: { fontSize: 14, fontFamily: 'Manrope_700Bold', color: Colors.onPrimary },

  // Toast
  toastContainer: { position: 'absolute', right: 16, left: 16 },
  toast: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 14, borderRadius: 16, ...Shadows.card },
  toastText: { fontSize: 13, fontFamily: 'Manrope_600SemiBold', color: Colors.onPrimary, flex: 1 },
});

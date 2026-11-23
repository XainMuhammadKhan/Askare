import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Typography, BorderRadius, Spacing } from '../../theme';
import { Header, PrimaryButton, FilterChips, StateView } from '../../components';
import { publicService, ConsultationType, DoctorDetail, Slot } from '../../api';
import { useApi } from '../../hooks/useApi';
import {
  doctorName,
  formatDate,
  formatMoney,
  formatTime,
  initials,
  isoDay,
  specializationOf,
} from '../../utils/format';

type Props = { navigation: NativeStackNavigationProp<any>; route: any };

export const BookAppointmentScreen: React.FC<Props> = ({ navigation, route }) => {
  const fallbackDoctor = route?.params?.doctor as DoctorDetail | undefined;
  const doctorId = Number(route?.params?.doctorId ?? fallbackDoctor?.id ?? 0);

  const [consultationType, setConsultationType] = useState<ConsultationType>('VIDEO');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const [reason, setReason] = useState<string>('');

  const { data: fetchedDoctor } = useApi(() => publicService.doctor(doctorId), [doctorId]);
  const doctor = fetchedDoctor ?? fallbackDoctor ?? null;

  const {
    data: slots,
    loading: slotsLoading,
    error: slotsError,
    refresh: refreshSlots,
  } = useApi(() => publicService.doctorSlots(doctorId, isoDay(0), isoDay(14)), [doctorId]);

  // Group free slots by formatted day label
  const groupedSlots = useMemo(() => {
    const map = new Map<string, Slot[]>();
    (slots ?? []).forEach((slot) => {
      const dayLabel = formatDate(slot.startAt);
      if (!dayLabel) return;
      const list = map.get(dayLabel) ?? [];
      list.push(slot);
      map.set(dayLabel, list);
    });
    return map;
  }, [slots]);

  const dateChips = useMemo(() => Array.from(groupedSlots.keys()), [groupedSlots]);

  useEffect(() => {
    if (dateChips.length > 0 && (!selectedDate || !groupedSlots.has(selectedDate))) {
      const firstDay = dateChips[0];
      setSelectedDate(firstDay);
      const firstSlot = groupedSlots.get(firstDay)?.[0];
      setSelectedSlotId(firstSlot?.id ?? null);
    }
  }, [dateChips, groupedSlots, selectedDate]);

  const slotsForSelectedDate = useMemo(
    () => (selectedDate ? groupedSlots.get(selectedDate) ?? [] : []),
    [groupedSlots, selectedDate]
  );

  const selectedSlot = useMemo(
    () => slotsForSelectedDate.find((s) => s.id === selectedSlotId) ?? null,
    [slotsForSelectedDate, selectedSlotId]
  );

  const handleSelectDate = (day: string) => {
    setSelectedDate(day);
    const firstSlot = groupedSlots.get(day)?.[0];
    setSelectedSlotId(firstSlot?.id ?? null);
  };

  const handleContinue = () => {
    if (!doctor) {
      Alert.alert('Doctor unavailable', 'Unable to load doctor information.');
      return;
    }
    if (!selectedSlot) {
      Alert.alert('Select a Time Slot', 'Please pick an available date and time slot to continue.');
      return;
    }
    navigation.navigate('PaymentDetails', {
      doctor,
      slot: selectedSlot,
      consultationType,
      reason: reason.trim() || undefined,
    });
  };

  return (
    <View style={styles.container}>
      <Header
        title="Book Appointment"
        showBack
        onBack={() => navigation.goBack()}
        onNotification={() => navigation.navigate('Notifications')}
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Doctor Summary Card */}
        {doctor && (
          <View style={styles.doctorCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials(doctor.name) || 'DR'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.doctorName}>{doctorName(doctor.name)}</Text>
              <Text style={styles.doctorSpec}>
                {specializationOf(doctor)}
                {doctor.hospital?.name ? ` • ${doctor.hospital.name}` : ''}
              </Text>
              <View style={styles.ratingRow}>
                <MaterialIcons name="star" size={14} color="#d97706" />
                <Text style={styles.ratingText}>
                  {doctor.rating?.average ? Number(doctor.rating.average).toFixed(1) : 'New'} (
                  {doctor.rating?.count ?? 0} reviews)
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Consultation Type Selector */}
        <Text style={styles.sectionTitle}>Consultation Mode</Text>
        <View style={styles.typeRow}>
          {(
            [
              { type: 'VIDEO' as ConsultationType, label: 'Video Call', icon: 'videocam', sub: 'Online WebRTC session' },
              { type: 'IN_PERSON' as ConsultationType, label: 'In-Person', icon: 'local-hospital', sub: 'Visit clinic/hospital' },
            ] as const
          ).map((item) => {
            const active = consultationType === item.type;
            return (
              <TouchableOpacity
                key={item.type}
                style={[styles.typeCard, active && styles.typeCardActive]}
                onPress={() => setConsultationType(item.type)}
                activeOpacity={0.8}
              >
                <MaterialIcons
                  name={item.icon as any}
                  size={22}
                  color={active ? Colors.primary : Colors.onSurfaceVariant}
                />
                <Text style={[styles.typeLabel, active && styles.typeLabelActive]}>
                  {item.label}
                </Text>
                <Text style={styles.typeSub}>{item.sub}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Available Dates & Time Slots */}
        <View style={styles.slotsSection}>
          <View style={styles.sectionHeaderRow}>
            <MaterialIcons name="event-available" size={20} color={Colors.primary} />
            <Text style={styles.sectionTitleInline}>Available Slots (Next 14 Days)</Text>
          </View>

          <StateView
            loading={slotsLoading}
            error={slotsError}
            empty={!slotsLoading && dateChips.length === 0}
            emptyText="No free slots available for this doctor in the next 14 days."
            onRetry={refreshSlots}
          >
            <View style={{ marginHorizontal: -Spacing.lg, marginBottom: Spacing.sm }}>
              <FilterChips
                chips={dateChips}
                selected={selectedDate}
                onSelect={handleSelectDate}
              />
            </View>

            <View style={styles.slotsGrid}>
              {slotsForSelectedDate.map((slot) => {
                const isSelected = slot.id === selectedSlotId;
                return (
                  <TouchableOpacity
                    key={slot.id}
                    style={[styles.slot, isSelected && styles.slotActive]}
                    onPress={() => setSelectedSlotId(slot.id)}
                    activeOpacity={0.75}
                  >
                    <MaterialIcons
                      name="schedule"
                      size={15}
                      color={isSelected ? Colors.primary : Colors.onSurfaceVariant}
                    />
                    <Text style={[styles.slotText, isSelected && styles.slotTextActive]}>
                      {formatTime(slot.startAt)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </StateView>
        </View>

        {/* Reason / Symptoms Input */}
        <Text style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>
          Reason for Visit (Optional)
        </Text>
        <TextInput
          style={styles.reasonInput}
          placeholder="Briefly describe your symptoms or reason for consultation..."
          placeholderTextColor={Colors.outlineVariant}
          value={reason}
          onChangeText={setReason}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />

        {/* Fee Summary */}
        <View style={styles.feeRow}>
          <View>
            <Text style={styles.feeLabel}>CONSULTATION FEE</Text>
            <Text style={styles.feeHint}>Authorized on Stripe • Charged on doctor approval</Text>
          </View>
          <Text style={styles.feeValue}>{formatMoney(doctor?.consultationFee)}</Text>
        </View>

        <PrimaryButton
          title="Continue to Payment"
          onPress={handleContinue}
          disabled={!selectedSlot}
          style={{ marginTop: Spacing.lg }}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: Spacing.lg, paddingBottom: 100 },
  doctorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 14,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHighest,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${Colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 18, fontFamily: 'Manrope_700Bold', color: Colors.primary },
  doctorName: { fontSize: 16, fontFamily: 'Manrope_700Bold', color: Colors.onSurface },
  doctorSpec: { ...Typography.bodySmall, color: Colors.onSurfaceVariant, marginTop: 2 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  ratingText: { fontSize: 12, color: Colors.onSurfaceVariant, fontFamily: 'Manrope_500Medium' },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Manrope_700Bold',
    color: Colors.onSurface,
    marginBottom: 10,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  sectionTitleInline: {
    fontSize: 16,
    fontFamily: 'Manrope_700Bold',
    color: Colors.onSurface,
  },
  typeRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  typeCard: {
    flex: 1,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: BorderRadius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHighest,
    gap: 4,
  },
  typeCardActive: {
    borderColor: Colors.primary,
    borderWidth: 2,
    backgroundColor: `${Colors.primary}08`,
  },
  typeLabel: { fontSize: 14, fontFamily: 'Manrope_700Bold', color: Colors.onSurface },
  typeLabelActive: { color: Colors.primary },
  typeSub: { ...Typography.bodySmall, fontSize: 11, color: Colors.onSurfaceVariant },
  slotsSection: { marginTop: 4 },
  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 6 },
  slot: {
    width: '31%',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHighest,
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLowest,
  },
  slotActive: {
    borderColor: Colors.primary,
    borderWidth: 2,
    backgroundColor: `${Colors.primary}10`,
  },
  slotText: { fontSize: 13, fontFamily: 'Manrope_600SemiBold', color: Colors.onSurface },
  slotTextActive: { color: Colors.primary, fontFamily: 'Manrope_700Bold' },
  reasonInput: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHighest,
    padding: 14,
    minHeight: 88,
    fontSize: 14,
    color: Colors.onSurface,
    fontFamily: 'Manrope_400Regular',
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 22,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceContainerHighest,
  },
  feeLabel: {
    fontSize: 10,
    fontFamily: 'Manrope_700Bold',
    color: Colors.onSurfaceVariant,
    letterSpacing: 1.2,
  },
  feeHint: { ...Typography.bodySmall, fontSize: 11, color: Colors.onSurfaceVariant, marginTop: 2 },
  feeValue: { fontSize: 22, fontFamily: 'Manrope_800ExtraBold', color: Colors.primary },
});

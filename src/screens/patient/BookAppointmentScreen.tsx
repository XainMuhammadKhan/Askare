import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography, BorderRadius, Spacing } from '../../theme';
import { Header, PrimaryButton } from '../../components';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = { navigation: NativeStackNavigationProp<any>; route: any };

const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const timeSlots = ['09:00 AM', '10:30 AM', '11:00 AM', '01:30 PM', '04:00 PM', '06:30 PM'];

export const BookAppointmentScreen: React.FC<Props> = ({ navigation, route }) => {
  const doctor = route?.params?.doctor;
  const now = new Date();

  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [selectedDay, setSelectedDay] = useState<number | null>(now.getDate());
  const [selectedTime, setSelectedTime] = useState('11:00 AM');

  const calendarDays = useMemo(() => {
    // Monday = 0 offset
    const firstDayOfWeek = (new Date(currentYear, currentMonth, 1).getDay() + 6) % 7;
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const today = new Date();
    const days: (null | { day: number; isPast: boolean })[] = [];

    for (let i = 0; i < firstDayOfWeek; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const isPast =
        new Date(currentYear, currentMonth, d) <
        new Date(today.getFullYear(), today.getMonth(), today.getDate());
      days.push({ day: d, isPast });
    }
    return days;
  }, [currentMonth, currentYear]);

  const navigateMonth = (dir: number) => {
    let m = currentMonth + dir;
    let y = currentYear;
    if (m > 11) { m = 0; y++; }
    if (m < 0) { m = 11; y--; }
    setCurrentMonth(m);
    setCurrentYear(y);
    setSelectedDay(null);
  };

  const formattedDate = selectedDay
    ? `${monthNames[currentMonth]} ${selectedDay}, ${currentYear}`
    : '';

  return (
    <View style={styles.container}>
      <Header title="Book Appointment" showBack onBack={() => navigation.goBack()} onNotification={() => navigation.navigate('Notifications')} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Doctor Info */}
        <View style={styles.doctorCard}>
          <View style={styles.avatar}><MaterialIcons name="person" size={28} color={Colors.outlineVariant} /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.doctorName}>{doctor?.name || 'Dr. Pamber'}</Text>
            <Text style={styles.doctorSpec}>{doctor?.specialty || 'Senior Clinical Consultant'}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
              <MaterialIcons name="star" size={14} color="#d97706" />
              <Text style={{ fontSize: 12, color: Colors.onSurfaceVariant }}>
                {doctor?.rating || '4.9'} (124 reviews)
              </Text>
            </View>
          </View>
        </View>

        {/* Dynamic Calendar */}
        <View style={styles.calendarCard}>
          <View style={styles.calendarHeader}>
            <Text style={styles.monthTitle}>
              {monthNames[currentMonth]} {currentYear}
            </Text>
            <View style={styles.navBtns}>
              <TouchableOpacity style={styles.navBtn} onPress={() => navigateMonth(-1)}>
                <MaterialIcons name="chevron-left" size={22} color={Colors.onSurface} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.navBtn} onPress={() => navigateMonth(1)}>
                <MaterialIcons name="chevron-right" size={22} color={Colors.onSurface} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.dayLabels}>
            {dayLabels.map((d) => (
              <Text key={d} style={styles.dayLabel}>{d}</Text>
            ))}
          </View>
          <View style={styles.daysGrid}>
            {calendarDays.map((cell, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  styles.dayCell,
                  cell && cell.day === selectedDay && styles.dayCellActive,
                ]}
                disabled={!cell || cell.isPast}
                onPress={() => cell && !cell.isPast && setSelectedDay(cell.day)}
              >
                {cell ? (
                  <Text
                    style={[
                      styles.dayText,
                      cell.day === selectedDay && styles.dayTextActive,
                      cell.isPast && styles.dayTextPast,
                    ]}
                  >
                    {cell.day}
                  </Text>
                ) : null}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Time Slots */}
        <View style={styles.slotsSection}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14 }}>
            <MaterialIcons name="schedule" size={18} color={Colors.primary} />
            <Text style={styles.slotsTitle}>Available Slots</Text>
          </View>
          <View style={styles.slotsGrid}>
            {timeSlots.map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.slot, selectedTime === t && styles.slotActive]}
                onPress={() => setSelectedTime(t)}
              >
                <Text style={[styles.slotText, selectedTime === t && styles.slotTextActive]}>
                  {t}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Fee Display */}
        <View style={styles.feeRow}>
          <Text style={styles.feeLabel}>Total Fee</Text>
          <Text style={styles.feeValue}>{doctor?.fee || 'PKR 5,000'}</Text>
        </View>

        <PrimaryButton
          title="Confirm Appointment"
          onPress={() =>
            navigation.navigate('PaymentDetails', {
              doctor,
              date: formattedDate,
              time: selectedTime,
            })
          }
          style={{ marginTop: 12, opacity: selectedDay ? 1 : 0.5 }}
          disabled={!selectedDay}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: 16, paddingBottom: 100 },
  doctorCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: Colors.surfaceContainerLowest, borderRadius: 16, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: Colors.surfaceContainerHighest },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.surfaceContainerHigh, alignItems: 'center', justifyContent: 'center' },
  doctorName: { fontSize: 16, fontFamily: 'Manrope_600SemiBold', color: Colors.onSurface },
  doctorSpec: { ...Typography.bodySmall, color: Colors.onSurfaceVariant },
  calendarCard: { backgroundColor: Colors.surfaceContainerLowest, borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: Colors.surfaceContainerHighest },
  calendarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  monthTitle: { fontSize: 18, fontFamily: 'Manrope_600SemiBold', color: Colors.onSurface },
  navBtns: { flexDirection: 'row', gap: 4 },
  navBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: Colors.surfaceContainerHighest, alignItems: 'center', justifyContent: 'center' },
  dayLabels: { flexDirection: 'row', marginBottom: 8 },
  dayLabel: { flex: 1, textAlign: 'center', fontSize: 11, fontFamily: 'Manrope_600SemiBold', color: Colors.onSurfaceVariant },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: '14.28%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
  dayCellActive: { backgroundColor: Colors.primary, borderRadius: 20 },
  dayText: { fontSize: 14, fontFamily: 'Manrope_500Medium', color: Colors.onSurface },
  dayTextActive: { color: Colors.onPrimary, fontFamily: 'Manrope_700Bold' },
  dayTextPast: { color: Colors.outlineVariant },
  slotsSection: {},
  slotsTitle: { fontSize: 18, fontFamily: 'Manrope_600SemiBold', color: Colors.onSurface },
  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  slot: { width: '47%', paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: Colors.surfaceContainerHighest, alignItems: 'center', backgroundColor: Colors.surfaceContainerLowest },
  slotActive: { borderColor: Colors.primary, borderWidth: 2, backgroundColor: `${Colors.primary}08` },
  slotText: { fontSize: 14, fontFamily: 'Manrope_500Medium', color: Colors.onSurface },
  slotTextActive: { color: Colors.primary, fontFamily: 'Manrope_700Bold' },
  feeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: Colors.surfaceContainerHighest },
  feeLabel: { fontSize: 10, fontFamily: 'Manrope_700Bold', color: Colors.onSurfaceVariant, letterSpacing: 1.5, textTransform: 'uppercase' },
  feeValue: { fontSize: 22, fontFamily: 'Manrope_700Bold', color: Colors.onSurface },
});

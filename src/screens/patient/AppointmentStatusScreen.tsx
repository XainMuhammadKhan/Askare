import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography, BorderRadius } from '../../theme';
import { Header, FilterChips, PrimaryButton } from '../../components';
import { useAppStore } from '../../store';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = { navigation: NativeStackNavigationProp<any> };
const filters = ['All', 'Pending', 'Approved', 'Completed', 'Cancelled'];
const statusColors: Record<string, string> = { pending: '#d97706', approved: Colors.primary, cancelled: Colors.error, completed: Colors.outline };

export const AppointmentStatusScreen: React.FC<Props> = ({ navigation }) => {
  const [selected, setSelected] = useState('All');
  const appointments = useAppStore(s => s.appointments).filter(a => ['pending','approved','cancelled'].includes(a.status));
  const filtered = selected === 'All' ? appointments : appointments.filter(a => a.status === selected.toLowerCase());

  return (
    <View style={styles.container}>
      <Header title="Appointment Status" showBack onBack={() => navigation.goBack()} onNotification={() => navigation.navigate('Notifications')} />
      <TouchableOpacity style={styles.newBtn} onPress={() => navigation.navigate('FindSpecialist')}>
        <MaterialIcons name="add-circle" size={22} color={Colors.onPrimary} />
        <Text style={styles.newBtnText}>Book New Appointment</Text>
      </TouchableOpacity>
      <FilterChips chips={filters} selected={selected} onSelect={setSelected} />
      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {filtered.map(apt => {
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
                  {apt.time ? <><MaterialIcons name="schedule" size={14} color={Colors.onSurfaceVariant} /><Text style={styles.dateText}>{apt.time}</Text></> : <><MaterialIcons name="block" size={14} color={Colors.onSurfaceVariant} /><Text style={styles.dateText}>Patient Request</Text></>}
                </View>
                <View style={styles.actions}>
                  {apt.status === 'pending' && <><TouchableOpacity style={styles.outlinedBtn}><Text style={styles.outlinedBtnText}>Reschedule</Text></TouchableOpacity><TouchableOpacity style={styles.dangerBtn}><Text style={styles.dangerBtnText}>Cancel Booking</Text></TouchableOpacity></>}
                  {apt.status === 'approved' && <><TouchableOpacity style={styles.outlinedBtn}><Text style={styles.outlinedBtnText}>Message</Text></TouchableOpacity><TouchableOpacity style={styles.primaryBtn}><Text style={styles.primaryBtnText}>Add to Calendar</Text></TouchableOpacity></>}
                  {apt.status === 'cancelled' && <TouchableOpacity style={styles.outlinedBtn}><Text style={styles.outlinedBtnText}>Rebook Appointment</Text></TouchableOpacity>}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  newBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.primary, marginHorizontal: 16, paddingVertical: 14, borderRadius: BorderRadius.xl, marginBottom: 8 },
  newBtnText: { fontSize: 15, fontFamily: 'Manrope_700Bold', color: Colors.onPrimary },
  list: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 20 },
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
  primaryBtn: { flex: 1, paddingVertical: 10, borderRadius: 20, backgroundColor: Colors.primary, alignItems: 'center' },
  primaryBtnText: { fontSize: 12, fontFamily: 'Manrope_700Bold', color: Colors.onPrimary },
  urgentBanner: { backgroundColor: Colors.surfaceContainerLow, borderRadius: 16, padding: 20, marginTop: 8 },
  urgentTitle: { fontSize: 18, fontFamily: 'Manrope_700Bold', color: Colors.error, marginBottom: 4 },
  urgentSub: { ...Typography.bodyMedium, color: Colors.onSurfaceVariant, lineHeight: 20 },
});

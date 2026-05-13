import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography, Shadows } from '../../theme';
import { useAuthStore, useAppStore } from '../../store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = { navigation: NativeStackNavigationProp<any> };

export const DoctorDashboardScreen: React.FC<Props> = ({ navigation }) => {
  const user = useAuthStore(s => s.user);
  const insets = useSafeAreaInsets();
  const stats = [
    { label: 'Appointments', value: '24', icon: 'event', color: Colors.primary },
    { label: 'Pending', value: '8', icon: 'hourglass-empty', color: '#d97706' },
    { label: 'Patients', value: '156', icon: 'people', color: Colors.secondary },
  ];
  const todayAgenda = [
    { time: '09:00 AM', patient: 'Arthur Pendelton', type: 'Follow-up', status: 'confirmed' },
    { time: '10:30 AM', patient: 'Eleanor Vance', type: 'Lab Review', status: 'confirmed' },
    { time: '02:00 PM', patient: 'Marcus Chen', type: 'Consultation', status: 'pending' },
  ];

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarPlaceholder}><MaterialIcons name="person" size={22} color={Colors.outlineVariant} /></View>
          <View><Text style={styles.greeting}>Good morning,</Text><Text style={styles.name}>{user?.name || 'Dr. Khan'}</Text></View>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={styles.notifBtn}><MaterialIcons name="notifications-none" size={24} color={Colors.secondary} /></TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Stats Row */}
        <View style={styles.statsRow}>
          {stats.map((s, i) => (
            <View key={i} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: `${s.color}15` }]}><MaterialIcons name={s.icon as any} size={20} color={s.color} /></View>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Today's Agenda */}
        <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Today's Agenda</Text><TouchableOpacity><Text style={styles.viewAll}>View All</Text></TouchableOpacity></View>
        {todayAgenda.map((a, i) => (
          <TouchableOpacity key={i} style={styles.agendaRow} activeOpacity={0.7}>
            <View style={styles.timeBox}><Text style={styles.timeText}>{a.time}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.patientName}>{a.patient}</Text>
              <Text style={styles.visitType}>{a.type}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: a.status === 'confirmed' ? `${Colors.primary}15` : '#d9770615' }]}>
              <Text style={[styles.statusText, { color: a.status === 'confirmed' ? Colors.primary : '#d97706' }]}>{a.status.toUpperCase()}</Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Recent Patient Records */}
        <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Recent Records</Text><TouchableOpacity onPress={() => navigation.navigate('Records')}><Text style={styles.viewAll}>View All</Text></TouchableOpacity></View>
        <LinearGradient colors={[Colors.surfaceContainerLow, Colors.background]} style={styles.recordsBanner}>
          <View style={styles.recordsIcon}><MaterialIcons name="folder-shared" size={28} color={Colors.primary} /></View>
          <Text style={styles.recordsTitle}>12 Active Records</Text>
          <Text style={styles.recordsSubtitle}>2 critical, 4 active, 6 stable patients</Text>
          <TouchableOpacity style={styles.recordsBtn} onPress={() => navigation.navigate('Records')}><Text style={styles.recordsBtnText}>Open Records</Text><MaterialIcons name="arrow-forward" size={16} color={Colors.primary} /></TouchableOpacity>
        </LinearGradient>
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 12 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarPlaceholder: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.surfaceContainerHigh, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: Colors.primary },
  greeting: { ...Typography.bodyMedium, color: Colors.onSurfaceVariant },
  name: { fontSize: 18, fontFamily: 'Manrope_700Bold', color: Colors.onSurface },
  notifBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { paddingHorizontal: 16 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statCard: { flex: 1, backgroundColor: Colors.surfaceContainerLowest, borderRadius: 16, padding: 14, alignItems: 'center', ...Shadows.subtle },
  statIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  statValue: { fontSize: 24, fontFamily: 'Manrope_800ExtraBold', color: Colors.onSurface },
  statLabel: { ...Typography.bodySmall, color: Colors.onSurfaceVariant, marginTop: 2 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 },
  sectionTitle: { fontSize: 20, fontFamily: 'Manrope_600SemiBold', color: Colors.onSurface },
  viewAll: { fontSize: 13, fontFamily: 'Manrope_500Medium', color: Colors.primary },
  agendaRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.surfaceContainerLowest, borderRadius: 14, padding: 14, marginBottom: 8, ...Shadows.subtle },
  timeBox: { backgroundColor: Colors.surfaceContainerLow, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  timeText: { fontSize: 11, fontFamily: 'Manrope_600SemiBold', color: Colors.onSurfaceVariant },
  patientName: { fontSize: 15, fontFamily: 'Manrope_600SemiBold', color: Colors.onSurface },
  visitType: { ...Typography.bodySmall, color: Colors.onSurfaceVariant },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 9, fontFamily: 'Manrope_700Bold', letterSpacing: 0.5 },
  recordsBanner: { borderRadius: 20, padding: 24, alignItems: 'center', marginTop: 8, marginBottom: 20 },
  recordsIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: `${Colors.primary}12`, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  recordsTitle: { fontSize: 20, fontFamily: 'Manrope_700Bold', color: Colors.onSurface, marginBottom: 4 },
  recordsSubtitle: { ...Typography.bodyMedium, color: Colors.onSurfaceVariant, marginBottom: 16 },
  recordsBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: Colors.primary, borderRadius: 20, paddingHorizontal: 20, paddingVertical: 10 },
  recordsBtnText: { fontSize: 13, fontFamily: 'Manrope_600SemiBold', color: Colors.primary },
});

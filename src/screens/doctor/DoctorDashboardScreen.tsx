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
import { Colors, Typography, Shadows } from '../../theme';
import { useAuthStore } from '../../store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { doctorService, DoctorDashboard, Appointment } from '../../api';
import { useApi } from '../../hooks/useApi';
import { StateView } from '../../components/StateView';
import {
  doctorName,
  formatMoney,
  formatTime,
  formatDate,
  STATUS_LABEL,
  displayStatus,
  initials,
} from '../../utils/format';
import { PendingRequestCard } from './components/PendingRequestCard';

type Props = { navigation: NativeStackNavigationProp<any> };

interface DashboardData {
  dashboard: DoctorDashboard;
  requests: Appointment[];
}

export const DoctorDashboardScreen: React.FC<Props> = ({ navigation }) => {
  const user = useAuthStore((s) => s.user);
  const insets = useSafeAreaInsets();
  const [busyId, setBusyId] = useState<number | null>(null);

  const { data, loading, error, refresh } = useApi<DashboardData>(async () => {
    const [dashboard, requests] = await Promise.all([
      doctorService.dashboard(),
      doctorService.requests(),
    ]);
    return {
      dashboard,
      requests: Array.isArray(requests) ? requests : [],
    };
  }, []);

  const stats = data?.dashboard?.stats;
  const todayList = data?.dashboard?.today ?? [];
  const pendingRequests = data?.requests ?? [];

  const handleAccept = (id: number) => {
    Alert.alert(
      'Accept Appointment',
      'Accepting will confirm this slot and charge the patient. Proceed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: async () => {
            setBusyId(id);
            try {
              await doctorService.accept(id);
              Alert.alert('Accepted', 'Appointment has been confirmed.');
              await refresh();
            } catch (e: any) {
              Alert.alert('Error', e?.message ?? 'Could not accept appointment.');
            } finally {
              setBusyId(null);
            }
          },
        },
      ]
    );
  };

  const handleReject = (id: number, reason: string) => {
    Alert.alert(
      'Reject Appointment',
      'The payment hold will be released and the patient will not be charged.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            setBusyId(id);
            try {
              await doctorService.reject(id, reason);
              Alert.alert('Rejected', 'Appointment request was rejected.');
              await refresh();
            } catch (e: any) {
              Alert.alert('Error', e?.message ?? 'Could not reject appointment.');
            } finally {
              setBusyId(null);
            }
          },
        },
      ]
    );
  };

  const statItems = [
    {
      label: 'Pending',
      value: String(stats?.pendingRequests ?? pendingRequests.length ?? 0),
      icon: 'hourglass-empty',
      color: '#d97706',
    },
    {
      label: 'Today',
      value: String(stats?.todaysConsultations ?? todayList.length ?? 0),
      icon: 'today',
      color: Colors.primary,
    },
    {
      label: 'Upcoming',
      value: String(stats?.upcomingConfirmed ?? 0),
      icon: 'event-available',
      color: '#0284c7',
    },
    {
      label: 'This Month',
      value: formatMoney(stats?.earningsThisMonth ?? 0),
      icon: 'account-balance-wallet',
      color: '#16a34a',
    },
    {
      label: 'Patients',
      value: String(stats?.totalPatients ?? 0),
      icon: 'people',
      color: Colors.secondary,
    },
    {
      label: 'Rating',
      value: stats?.rating ? `${Number(stats.rating).toFixed(1)} ★` : 'New',
      icon: 'star',
      color: '#eab308',
    },
  ];

  const quickActions = [
    { label: 'Schedule', icon: 'schedule', route: 'Schedule', color: Colors.primary },
    { label: 'Calendar', icon: 'calendar-today', route: 'DoctorCalendar', color: '#0284c7' },
    { label: 'Earnings', icon: 'payments', route: 'Earnings', color: '#16a34a' },
    { label: 'Reviews', icon: 'reviews', route: 'DoctorReviews', color: '#d97706' },
    { label: 'Documents', icon: 'verified-user', route: 'DoctorDocuments', color: Colors.secondary },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.headerLeft}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('DoctorInfo')}
        >
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitials}>{initials(user?.name) || 'DR'}</Text>
          </View>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.name}>{doctorName(user?.name) || 'Doctor'}</Text>
          </View>
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Notifications')}
            style={styles.notifBtn}
          >
            <MaterialIcons name="notifications-none" size={24} color={Colors.secondary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('Settings')}
            style={styles.notifBtn}
          >
            <MaterialIcons name="settings" size={22} color={Colors.secondary} />
          </TouchableOpacity>
        </View>
      </View>

      <StateView loading={loading && !data} error={error} onRetry={refresh}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
        >
          {/* Stats 2x3 Grid */}
          <View style={styles.statsGrid}>
            {statItems.map((s, i) => (
              <View key={i} style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: `${s.color}15` }]}>
                  <MaterialIcons name={s.icon as any} size={18} color={s.color} />
                </View>
                <Text style={styles.statValue} numberOfLines={1}>
                  {s.value}
                </Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>

          {/* Quick Actions */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickRow}
          >
            {quickActions.map((qa) => (
              <TouchableOpacity
                key={qa.route}
                style={styles.quickCard}
                activeOpacity={0.75}
                onPress={() => navigation.navigate(qa.route)}
              >
                <View style={[styles.quickIcon, { backgroundColor: `${qa.color}15` }]}>
                  <MaterialIcons name={qa.icon as any} size={22} color={qa.color} />
                </View>
                <Text style={styles.quickLabel}>{qa.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Pending Requests */}
          <View style={styles.sectionHeader}>
            <View style={styles.titleWithBadge}>
              <Text style={styles.sectionTitle}>Pending Requests</Text>
              {pendingRequests.length > 0 && (
                <View style={styles.countBadge}>
                  <Text style={styles.countBadgeText}>{pendingRequests.length}</Text>
                </View>
              )}
            </View>
          </View>
          {pendingRequests.length === 0 ? (
            <View style={styles.emptyCard}>
              <MaterialIcons name="check-circle-outline" size={28} color={Colors.primary} />
              <Text style={styles.emptyCardText}>No pending appointment requests right now.</Text>
            </View>
          ) : (
            pendingRequests.map((req) => (
              <PendingRequestCard
                key={req.id}
                request={req}
                busy={busyId === req.id}
                onAccept={handleAccept}
                onReject={handleReject}
                onOpenDetail={(id) =>
                  navigation.navigate('DoctorAppointment', { appointmentId: id })
                }
              />
            ))
          )}

          {/* Today's Appointments */}
          <View style={[styles.sectionHeader, { marginTop: 12 }]}>
            <Text style={styles.sectionTitle}>Today's Consultations</Text>
            <TouchableOpacity onPress={() => navigation.navigate('DoctorCalendar')}>
              <Text style={styles.viewAll}>Full Calendar</Text>
            </TouchableOpacity>
          </View>
          {todayList.length === 0 ? (
            <View style={styles.emptyCard}>
              <MaterialIcons name="event-busy" size={28} color={Colors.outlineVariant} />
              <Text style={styles.emptyCardText}>No consultations scheduled for today.</Text>
            </View>
          ) : (
            todayList.map((appt) => {
              const dStatus = displayStatus(appt);
              const isConfirmed = appt.status === 'CONFIRMED';
              return (
                <TouchableOpacity
                  key={appt.id}
                  style={styles.agendaRow}
                  activeOpacity={0.7}
                  onPress={() =>
                    navigation.navigate('DoctorAppointment', { appointmentId: appt.id })
                  }
                >
                  <View style={styles.timeBox}>
                    <Text style={styles.timeText}>{formatTime(appt.slot?.startAt)}</Text>
                    <Text style={styles.dateSmall}>{formatDate(appt.slot?.startAt)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.patientName}>
                      {appt.patient?.name || 'Patient'}
                    </Text>
                    <Text style={styles.visitType} numberOfLines={1}>
                      {appt.consultationType === 'VIDEO' ? 'Video Call' : 'In-Person'}
                      {appt.reason ? ` • ${appt.reason}` : ''}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: isConfirmed
                          ? `${Colors.primary}15`
                          : '#d9770615',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: isConfirmed ? Colors.primary : '#d97706' },
                      ]}
                    >
                      {STATUS_LABEL[dStatus]?.toUpperCase() || appt.status}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}

          <View style={{ height: 100 }} />
        </ScrollView>
      </StateView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${Colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  avatarInitials: { fontSize: 16, fontFamily: 'Manrope_700Bold', color: Colors.primary },
  greeting: { ...Typography.bodySmall, color: Colors.onSurfaceVariant },
  name: { fontSize: 18, fontFamily: 'Manrope_700Bold', color: Colors.onSurface },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: { paddingHorizontal: 16, paddingTop: 4 },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    width: '31%',
    flexGrow: 1,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    ...Shadows.subtle,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  statValue: { fontSize: 16, fontFamily: 'Manrope_800ExtraBold', color: Colors.onSurface },
  statLabel: { ...Typography.bodySmall, color: Colors.onSurfaceVariant, marginTop: 2 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleWithBadge: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: 18, fontFamily: 'Manrope_700Bold', color: Colors.onSurface },
  countBadge: {
    backgroundColor: '#d97706',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  countBadgeText: { fontSize: 11, fontFamily: 'Manrope_700Bold', color: Colors.white },
  viewAll: { fontSize: 13, fontFamily: 'Manrope_600SemiBold', color: Colors.primary },
  quickRow: { gap: 10, paddingBottom: 20 },
  quickCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    minWidth: 96,
    ...Shadows.subtle,
  },
  quickIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickLabel: { fontSize: 12, fontFamily: 'Manrope_600SemiBold', color: Colors.onSurface },
  emptyCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    ...Shadows.subtle,
  },
  emptyCardText: { ...Typography.bodyMedium, color: Colors.onSurfaceVariant, textAlign: 'center' },
  agendaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    ...Shadows.subtle,
  },
  timeBox: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center',
  },
  timeText: { fontSize: 12, fontFamily: 'Manrope_700Bold', color: Colors.primary },
  dateSmall: { fontSize: 10, fontFamily: 'Manrope_500Medium', color: Colors.onSurfaceVariant },
  patientName: { fontSize: 15, fontFamily: 'Manrope_600SemiBold', color: Colors.onSurface },
  visitType: { ...Typography.bodySmall, color: Colors.onSurfaceVariant, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 10, fontFamily: 'Manrope_700Bold', letterSpacing: 0.5 },
});

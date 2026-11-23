import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Typography } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import { patientService } from '../../api';
import { useApi } from '../../hooks/useApi';
import { StateView } from '../../components';
import { formatDate } from '../../utils/format';
import { HealthTipCard } from './components/HealthTipCard';
import { NextAppointmentCard } from './components/NextAppointmentCard';
import { PendingRequestsSection } from './components/PendingRequestsSection';
import { ActiveMedicinesSection } from './components/ActiveMedicinesSection';
import { QuickActionsGrid } from './components/QuickActionsGrid';

type Props = { navigation: NativeStackNavigationProp<any> };

export const DashboardScreen: React.FC<Props> = ({ navigation }) => {
  const user = useAuthStore((s) => s.user);
  const insets = useSafeAreaInsets();

  const {
    data: dashboard,
    loading,
    error,
    refresh,
  } = useApi(() => patientService.dashboard(), []);

  const { data: tipData, refresh: refreshTip } = useApi(() => patientService.healthTip(), []);

  const handleRefresh = async () => {
    await Promise.all([refresh(), refreshTip()]);
  };

  const unreadCount = dashboard?.unreadNotifications ?? 0;
  const displayName = dashboard?.patient?.name || user?.name || 'Patient';
  const todayLabel = formatDate(new Date().toISOString()).toUpperCase();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.headerLeft}>
          <MaterialIcons name="health-and-safety" size={24} color={Colors.primary} />
          <Text style={styles.headerTitle}>AskCare</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('Notifications')}
          style={styles.notifBtn}
          activeOpacity={0.7}
        >
          <MaterialIcons name="notifications-none" size={24} color={Colors.secondary} />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={handleRefresh} tintColor={Colors.primary} />}
      >
        {/* Greeting */}
        <View style={styles.greeting}>
          <Text style={styles.dateText}>{todayLabel}</Text>
          <Text style={styles.greetText}>
            Hello,{'\n'}
            <Text style={styles.nameText}>{displayName}</Text>
          </Text>
        </View>

        <StateView loading={loading && !dashboard} error={error} onRetry={handleRefresh}>
          {/* Daily AI Health Tip */}
          <HealthTipCard
            tip={tipData?.tip}
            aiGenerated={tipData?.aiGenerated}
            date={tipData?.date}
          />

          {/* Next Appointment Card */}
          <Text style={styles.sectionTitle}>Next Appointment</Text>
          <NextAppointmentCard
            appointment={dashboard?.nextAppointment ?? null}
            onJoinCall={(appointmentId) =>
              navigation.navigate('VideoConsultation', { appointmentId })
            }
            onViewDetails={(appointmentId) =>
              navigation.navigate('AppointmentStatus', { appointmentId })
            }
            onBookNew={() => navigation.navigate('FindSpecialist')}
          />

          {/* Pending Requests */}
          <PendingRequestsSection
            requests={dashboard?.pendingRequests ?? []}
            onPressItem={(appointmentId) =>
              navigation.navigate('AppointmentStatus', { appointmentId })
            }
          />

          {/* Active Medicines & Latest Prescription */}
          <ActiveMedicinesSection
            activeMedicines={dashboard?.activeMedicines ?? []}
            latestPrescription={dashboard?.latestPrescription ?? null}
            onViewRecords={() => navigation.navigate('ClinicalArchive')}
          />

          {/* Quick Actions */}
          <QuickActionsGrid
            onNavigate={(route) => navigation.navigate(route)}
          />
        </StateView>

        <View style={{ height: 100 }} />
      </ScrollView>
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
    paddingBottom: 8,
    backgroundColor: Colors.background,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { ...Typography.titleLarge, color: Colors.primary, fontSize: 20 },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: Colors.onError,
    fontSize: 9,
    fontFamily: 'Manrope_700Bold',
  },
  scrollContent: { paddingHorizontal: 16, paddingTop: 4 },
  greeting: { marginBottom: 16 },
  dateText: {
    ...Typography.labelMedium,
    color: Colors.onSurfaceVariant,
    marginBottom: 4,
    fontSize: 11,
  },
  greetText: {
    fontSize: 26,
    fontFamily: 'Manrope_600SemiBold',
    color: Colors.onSurface,
    lineHeight: 34,
  },
  nameText: { color: Colors.primary, fontFamily: 'Manrope_700Bold' },
  sectionTitle: {
    ...Typography.titleLarge,
    color: Colors.onSurface,
    fontSize: 18,
    marginBottom: 10,
  },
});

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, BorderRadius, Spacing, Typography } from '../../theme';
import { Header, FilterChips, AppointmentCard, StateView } from '../../components';
import { useAuthStore } from '../../store/authStore';
import { Appointment, doctorService, patientService } from '../../api';
import { useApi } from '../../hooks/useApi';

type Props = { navigation: NativeStackNavigationProp<any> };

type FilterTab = 'All' | 'Upcoming' | 'Awaiting' | 'Completed' | 'Cancelled';
const FILTERS: FilterTab[] = ['All', 'Upcoming', 'Awaiting', 'Completed', 'Cancelled'];

export const AppointmentsScreen: React.FC<Props> = ({ navigation }) => {
  const role = useAuthStore((s) => s.role);
  const isDoctor = role === 'doctor';
  const [selected, setSelected] = useState<FilterTab>('All');

  const {
    data: appointments,
    loading,
    error,
    refresh,
  } = useApi(
    () => (isDoctor ? doctorService.appointments() : patientService.myAppointments()),
    [isDoctor]
  );

  const filtered = useMemo(() => {
    const list: Appointment[] = appointments ?? [];
    if (selected === 'All') return list;
    return list.filter((a) => {
      if (selected === 'Upcoming') return a.status === 'CONFIRMED';
      if (selected === 'Awaiting') return a.status === 'PENDING';
      if (selected === 'Completed') return a.status === 'COMPLETED';
      if (selected === 'Cancelled') return a.status === 'CANCELLED' || a.status === 'NO_SHOW';
      return true;
    });
  }, [appointments, selected]);

  const handlePressCard = (item: Appointment) => {
    if (isDoctor) {
      navigation.navigate('DoctorAppointment', { appointmentId: item.id });
    } else {
      navigation.navigate('AppointmentStatus', { appointmentId: item.id });
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Appointments"
        showNotification
        onNotification={() => navigation.navigate('Notifications')}
      />

      {!isDoctor && (
        <View style={styles.topActionRow}>
          <TouchableOpacity
            style={styles.bookNewBtn}
            onPress={() => navigation.navigate('FindSpecialist')}
            activeOpacity={0.85}
          >
            <MaterialIcons name="add-circle-outline" size={20} color={Colors.onPrimary} />
            <Text style={styles.bookNewBtnText}>Book New Appointment</Text>
          </TouchableOpacity>
        </View>
      )}

      <FilterChips chips={FILTERS} selected={selected} onSelect={setSelected} />

      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor={Colors.primary} />}
      >
        <StateView
          loading={loading && (appointments ?? []).length === 0}
          error={error}
          empty={!loading && filtered.length === 0}
          emptyText={`No ${selected === 'All' ? '' : selected.toLowerCase() + ' '}appointments found.`}
          onRetry={refresh}
        >
          {filtered.map((apt) => (
            <AppointmentCard
              key={apt.id}
              appointment={apt}
              viewerRole={isDoctor ? 'doctor' : 'patient'}
              onPress={() => handlePressCard(apt)}
              onJoinCall={
                apt.status === 'CONFIRMED' && apt.consultationType === 'VIDEO'
                  ? () => navigation.navigate('VideoConsultation', { appointmentId: apt.id })
                  : undefined
              }
            />
          ))}
        </StateView>
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  topActionRow: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xs,
  },
  bookNewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: BorderRadius.xl,
  },
  bookNewBtnText: {
    ...Typography.labelLarge,
    color: Colors.onPrimary,
    fontSize: 14,
  },
  list: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm, paddingBottom: 20 },
});

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Colors, Typography, Spacing } from '../../theme';
import { Header, FilterChips, AppointmentCard } from '../../components';
import { useAppStore } from '../../store';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = { navigation: NativeStackNavigationProp<any> };
const filters = ['All', 'Confirmed', 'New Requests', 'Completed'];

export const AppointmentsScreen: React.FC<Props> = ({ navigation }) => {
  const [selected, setSelected] = useState('All');
  const appointments = useAppStore(s => s.appointments);
  const filtered = selected === 'All' ? appointments.filter(a => ['confirmed','new_request','completed'].includes(a.status)) : appointments.filter(a => {
    if (selected === 'Confirmed') return a.status === 'confirmed';
    if (selected === 'New Requests') return a.status === 'new_request';
    if (selected === 'Completed') return a.status === 'completed';
    return true;
  });

  return (
    <View style={styles.container}>
      <Header title="Appointments" showNotification onNotification={() => navigation.navigate('Notifications')} />
      <FilterChips chips={filters} selected={selected} onSelect={setSelected} />
      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {filtered.map(apt => (
          <AppointmentCard
            key={apt.id}
            doctorName={apt.doctorName}
            specialty={apt.specialty}
            date={apt.date}
            time={apt.time}
            status={apt.status}
            primaryActionLabel={apt.status === 'confirmed' ? 'Join Session' : apt.status === 'new_request' ? 'Accept' : apt.status === 'completed' ? 'View Notes' : undefined}
            secondaryActionLabel={apt.status === 'confirmed' ? 'Reschedule' : apt.status === 'new_request' ? 'Decline' : undefined}
            onPrimaryAction={() => {}}
            onSecondaryAction={() => {}}
          />
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  // increase top padding so appointment cards sit below the chips and don't overlap
  list: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 20 },
});

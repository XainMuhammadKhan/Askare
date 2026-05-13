import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography, BorderRadius, Spacing } from '../../theme';
import { Header, DoctorCard } from '../../components';
import { useAppStore } from '../../store';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = { navigation: NativeStackNavigationProp<any> };

export const FindSpecialistScreen: React.FC<Props> = ({ navigation }) => {
  const [search, setSearch] = useState('');
  const doctors = useAppStore(s => s.doctors);
  const filtered = doctors.filter(d => d.name.toLowerCase().includes(search.toLowerCase()) || d.specialty.toLowerCase().includes(search.toLowerCase()));
  return (
    <View style={styles.container}>
      <Header title="Find a Specialist" showBack onBack={() => navigation.goBack()} onNotification={() => navigation.navigate('Notifications')} />
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <MaterialIcons name="search" size={20} color={Colors.outlineVariant} />
          <TextInput style={styles.searchInput} placeholder="Search by name, specialty, or h..." placeholderTextColor={Colors.outlineVariant} value={search} onChangeText={setSearch} />
        </View>
        <TouchableOpacity style={styles.filterBtn}><MaterialIcons name="tune" size={22} color={Colors.onSurface} /></TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {filtered.map(doc => (
          <DoctorCard key={doc.id} name={doc.name} specialty={doc.specialty} hospital={doc.hospital} experience={doc.experience} fee={doc.fee} rating={doc.rating} onBookAppointment={() => navigation.navigate('BookAppointment', { doctor: doc })} onPress={() => navigation.navigate('DoctorProfile', { doctor: doc })} />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  searchRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginBottom: 12 },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceContainerLow, borderRadius: BorderRadius.md, paddingHorizontal: 14, gap: 8 },
  searchInput: { flex: 1, height: 44, fontSize: 14, color: Colors.onSurface },
  filterBtn: { width: 48, height: 48, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.surfaceContainerHighest, alignItems: 'center', justifyContent: 'center' },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
});

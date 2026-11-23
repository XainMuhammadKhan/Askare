import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Typography, BorderRadius, Spacing } from '../../theme';
import { Header, DoctorCard, FilterChips, StateView } from '../../components';
import { publicService, Doctor } from '../../api';
import { useApi } from '../../hooks/useApi';

type Props = { navigation: NativeStackNavigationProp<any>; route?: any };

export const FindSpecialistScreen: React.FC<Props> = ({ navigation, route }) => {
  const initialSpecId = route?.params?.specializationId ? Number(route.params.specializationId) : 0;
  const [search, setSearch] = useState(route?.params?.search ?? '');
  const [selectedSpecId, setSelectedSpecId] = useState<number>(initialSpecId);

  const { data: specializations } = useApi(() => publicService.specializations(), []);

  const {
    data: doctorsPage,
    loading,
    error,
    refresh,
  } = useApi(
    () =>
      publicService.findDoctors({
        search: search.trim() || undefined,
        specializationId: selectedSpecId > 0 ? selectedSpecId : undefined,
        limit: 50,
      }),
    [search, selectedSpecId]
  );

  const chips = useMemo(() => {
    const base = [{ id: 0, label: 'All Specialists' }];
    if (!specializations) return base;
    return [...base, ...specializations.map((s) => ({ id: s.id, label: s.name }))];
  }, [specializations]);

  const doctors: Doctor[] = doctorsPage?.items ?? [];

  return (
    <View style={styles.container}>
      <Header
        title="Find a Specialist"
        showBack
        onBack={() => navigation.goBack()}
        onNotification={() => navigation.navigate('Notifications')}
      />

      {/* Search Box */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <MaterialIcons name="search" size={20} color={Colors.outlineVariant} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by doctor name, specialty, city..."
            placeholderTextColor={Colors.outlineVariant}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} hitSlop={8}>
              <MaterialIcons name="close" size={18} color={Colors.onSurfaceVariant} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Specialization Filter Chips */}
      <FilterChips chips={chips} selected={selectedSpecId} onSelect={setSelectedSpecId} />

      {/* Doctors List */}
      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor={Colors.primary} />}
      >
        <StateView
          loading={loading && doctors.length === 0}
          error={error}
          empty={!loading && doctors.length === 0}
          emptyText="No specialists matched your filters. Try another search or category."
          onRetry={refresh}
        >
          <Text style={styles.countText}>
            {doctorsPage?.meta?.total ?? doctors.length} specialist
            {(doctorsPage?.meta?.total ?? doctors.length) === 1 ? '' : 's'} available
          </Text>
          {doctors.map((doc) => (
            <DoctorCard
              key={doc.id}
              doctor={doc}
              onPress={() => navigation.navigate('DoctorProfile', { doctorId: doc.id, doctor: doc })}
              onBookAppointment={() =>
                navigation.navigate('BookAppointment', { doctorId: doc.id, doctor: doc })
              }
            />
          ))}
        </StateView>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  searchRow: { flexDirection: 'row', paddingHorizontal: Spacing.lg, gap: 10, marginBottom: 4 },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHighest,
  },
  searchInput: { flex: 1, height: 44, fontSize: 14, color: Colors.onSurface },
  countText: {
    ...Typography.labelSmall,
    color: Colors.onSurfaceVariant,
    marginBottom: Spacing.sm,
    marginTop: Spacing.xs,
  },
  list: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.xs, paddingBottom: 100 },
});

import React, { useState, useEffect } from 'react';
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
import { Colors, Typography, Shadows } from '../../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { doctorService, DoctorPatient } from '../../api';
import { useApi } from '../../hooks/useApi';
import { StateView } from '../../components/StateView';
import { formatDate, initials } from '../../utils/format';

type Props = { navigation: NativeStackNavigationProp<any> };

const calcAge = (dob?: string | null): string => {
  if (!dob) return '';
  const birth = new Date(dob);
  if (isNaN(birth.getTime())) return '';
  const diff = Date.now() - birth.getTime();
  const age = Math.floor(diff / (365.25 * 86400000));
  return age >= 0 ? `${age} yrs` : '';
};

export const PatientRecordsScreen: React.FC<Props> = ({ navigation }) => {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, loading, error, refresh } = useApi<DoctorPatient[]>(
    () => doctorService.patients(debouncedSearch || undefined),
    [debouncedSearch]
  );

  const records = Array.isArray(data) ? data : [];

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarPlaceholder}>
            <MaterialIcons name="folder-shared" size={18} color={Colors.primary} />
          </View>
          <Text style={styles.headerTitle}>Patient Records</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('Notifications')}
          style={styles.notifBtn}
        >
          <MaterialIcons name="notifications-none" size={22} color={Colors.secondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <MaterialIcons name="search" size={20} color={Colors.outlineVariant} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search patients by name..."
            placeholderTextColor={Colors.outlineVariant}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <MaterialIcons name="close" size={18} color={Colors.outlineVariant} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.countRow}>
        <Text style={styles.countLabel}>Consulted Patients</Text>
        <Text style={styles.countValue}>{records.length} TOTAL</Text>
      </View>

      <StateView
        loading={loading && !data}
        error={error}
        empty={records.length === 0}
        emptyText={
          debouncedSearch
            ? `No patients matching "${debouncedSearch}".`
            : 'No patient records yet. Patients appear here once they book with you.'
        }
        onRetry={refresh}
      >
        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
        >
          {records.map((item) => {
            const p = item.patient;
            const age = calcAge(p?.dateOfBirth);
            const genderStr = p?.gender
              ? p.gender.charAt(0).toUpperCase() + p.gender.slice(1)
              : null;
            const demoParts = [genderStr, age || formatDate(p?.dateOfBirth)].filter(Boolean);

            return (
              <TouchableOpacity
                key={p?.id}
                style={styles.recordCard}
                activeOpacity={0.75}
                onPress={() =>
                  navigation.navigate('PatientDetail', { patientId: p.id })
                }
              >
                <View style={styles.cardAccent} />
                <View style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <View style={styles.patientAvatar}>
                      <Text style={styles.avatarInitials}>
                        {initials(p?.name) || 'PT'}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.patientName}>{p?.name || 'Patient'}</Text>
                      <Text style={styles.patientDemo}>
                        {demoParts.length > 0 ? demoParts.join(' • ') : `ID #${p?.id}`}
                      </Text>
                    </View>
                    <View style={styles.visitBadge}>
                      <Text style={styles.visitText}>
                        {item.visits} {item.visits === 1 ? 'VISIT' : 'VISITS'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.infoRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.infoLabel}>LAST CONSULTATION</Text>
                      <View style={styles.dateRow}>
                        <MaterialIcons
                          name="event"
                          size={14}
                          color={Colors.onSurfaceVariant}
                        />
                        <Text style={styles.infoValue}>
                          {item.lastVisit ? formatDate(item.lastVisit) : 'N/A'}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.viewRecordLink}>
                      <Text style={styles.viewRecordText}>View History</Text>
                      <MaterialIcons
                        name="chevron-right"
                        size={18}
                        color={Colors.primary}
                      />
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
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
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${Colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 22, fontFamily: 'Manrope_700Bold', color: Colors.primary },
  notifBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginBottom: 12 },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 12,
    paddingHorizontal: 14,
    gap: 8,
  },
  searchInput: { flex: 1, height: 44, fontSize: 14, color: Colors.onSurface },
  countRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  countLabel: { fontSize: 16, fontFamily: 'Manrope_600SemiBold', color: Colors.onSurface },
  countValue: {
    fontSize: 12,
    fontFamily: 'Manrope_700Bold',
    color: Colors.primary,
    letterSpacing: 1,
  },
  list: { paddingHorizontal: 16, paddingBottom: 20 },
  recordCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    ...Shadows.subtle,
  },
  cardAccent: { width: 4, backgroundColor: Colors.primary },
  cardContent: { flex: 1, padding: 16 },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  patientAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${Colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: { fontSize: 16, fontFamily: 'Manrope_700Bold', color: Colors.primary },
  patientName: { fontSize: 16, fontFamily: 'Manrope_700Bold', color: Colors.onSurface },
  patientDemo: { ...Typography.bodySmall, color: Colors.onSurfaceVariant, marginTop: 2 },
  visitBadge: {
    backgroundColor: `${Colors.primary}15`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  visitText: {
    fontSize: 10,
    fontFamily: 'Manrope_700Bold',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 10,
    padding: 12,
  },
  infoLabel: {
    fontSize: 9,
    fontFamily: 'Manrope_700Bold',
    color: Colors.onSurfaceVariant,
    letterSpacing: 1,
    marginBottom: 4,
  },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  infoValue: { fontSize: 13, fontFamily: 'Manrope_600SemiBold', color: Colors.onSurface },
  viewRecordLink: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  viewRecordText: { fontSize: 12, fontFamily: 'Manrope_700Bold', color: Colors.primary },
});

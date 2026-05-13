import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography, Shadows } from '../../theme';
import { useAppStore } from '../../store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = { navigation: NativeStackNavigationProp<any> };
const statusColors: Record<string, string> = { critical: Colors.error, active: Colors.primary, stable: Colors.outline };

export const PatientRecordsScreen: React.FC<Props> = ({ navigation }) => {
  const [search, setSearch] = useState('');
  const records = useAppStore(s => s.patientRecords);
  const insets = useSafeAreaInsets();
  const filtered = records.filter(r => r.name.toLowerCase().includes(search.toLowerCase()) || r.patientId.toLowerCase().includes(search.toLowerCase()));
  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarPlaceholder}><MaterialIcons name="person" size={18} color={Colors.outlineVariant} /></View>
          <Text style={styles.headerTitle}>Records</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={styles.notifBtn}><MaterialIcons name="notifications-none" size={22} color={Colors.secondary} /><View style={styles.notifDot} /></TouchableOpacity>
      </View>
      <View style={styles.searchRow}>
        <View style={styles.searchBox}><MaterialIcons name="search" size={20} color={Colors.outlineVariant} /><TextInput style={styles.searchInput} placeholder="Search patients by name or ID..." placeholderTextColor={Colors.outlineVariant} value={search} onChangeText={setSearch} /></View>
        <TouchableOpacity style={styles.filterBtn}><MaterialIcons name="tune" size={20} color={Colors.onSurface} /></TouchableOpacity>
      </View>
      <View style={styles.countRow}><Text style={styles.countLabel}>Patient Records</Text><Text style={styles.countValue}>12 ACTIVE</Text></View>
      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {filtered.map(r => {
          const color = statusColors[r.status] || Colors.outline;
          return (
            <TouchableOpacity key={r.id} style={styles.recordCard} activeOpacity={0.7}>
              <View style={[styles.cardAccent, { backgroundColor: color }]} />
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <View style={styles.patientAvatar}>{r.name === 'Sarah Jenkins' ? <Text style={styles.avatarInitials}>SJ</Text> : <MaterialIcons name="person" size={24} color={Colors.outlineVariant} />}</View>
                  <View style={{ flex: 1 }}><Text style={styles.patientName}>{r.name}</Text><Text style={styles.patientId}>ID: {r.patientId}</Text></View>
                  <View style={[styles.statusBadge, { backgroundColor: `${color}15` }]}><View style={[styles.statusDot, { backgroundColor: color }]} /><Text style={[styles.statusText, { color }]}>{r.status.toUpperCase()}</Text></View>
                </View>
                <View style={styles.infoRow}>
                  <View style={{ flex: 1 }}><Text style={styles.infoLabel}>LAST VISIT</Text><View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><MaterialIcons name="event" size={14} color={Colors.onSurfaceVariant} /><Text style={styles.infoValue}>{r.lastVisit}</Text></View></View>
                  <View style={{ flex: 1 }}><Text style={styles.infoLabel}>NEXT ACTION</Text><Text style={styles.infoValue}>{r.nextAction}</Text></View>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
        <TouchableOpacity style={styles.loadMore}><Text style={styles.loadMoreText}>Load More Records</Text></TouchableOpacity>
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 12 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatarPlaceholder: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.surfaceContainerHigh, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: Colors.primary },
  headerTitle: { fontSize: 22, fontFamily: 'Manrope_700Bold', color: Colors.primary },
  notifBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  notifDot: { position: 'absolute', top: 4, right: 4, width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.error },
  searchRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginBottom: 12 },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceContainerLow, borderRadius: 12, paddingHorizontal: 14, gap: 8 },
  searchInput: { flex: 1, height: 44, fontSize: 14, color: Colors.onSurface },
  filterBtn: { width: 48, height: 48, borderRadius: 12, borderWidth: 1, borderColor: Colors.surfaceContainerHighest, alignItems: 'center', justifyContent: 'center' },
  countRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 12 },
  countLabel: { fontSize: 16, fontFamily: 'Manrope_600SemiBold', color: Colors.onSurface },
  countValue: { fontSize: 12, fontFamily: 'Manrope_700Bold', color: Colors.primary, letterSpacing: 1 },
  list: { paddingHorizontal: 16, paddingBottom: 20 },
  recordCard: { flexDirection: 'row', backgroundColor: Colors.surfaceContainerLowest, borderRadius: 16, marginBottom: 12, overflow: 'hidden', ...Shadows.subtle },
  cardAccent: { width: 4 },
  cardContent: { flex: 1, padding: 16 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  patientAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.surfaceContainerHigh, alignItems: 'center', justifyContent: 'center' },
  avatarInitials: { fontSize: 16, fontFamily: 'Manrope_600SemiBold', color: Colors.onSurfaceVariant },
  patientName: { fontSize: 16, fontFamily: 'Manrope_600SemiBold', color: Colors.onSurface },
  patientId: { ...Typography.bodySmall, color: Colors.onSurfaceVariant },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 9, fontFamily: 'Manrope_700Bold', letterSpacing: 0.5 },
  infoRow: { flexDirection: 'row', gap: 16, backgroundColor: Colors.surfaceContainerLow, borderRadius: 10, padding: 12 },
  infoLabel: { fontSize: 9, fontFamily: 'Manrope_700Bold', color: Colors.onSurfaceVariant, letterSpacing: 1, marginBottom: 4 },
  infoValue: { fontSize: 13, fontFamily: 'Manrope_500Medium', color: Colors.onSurface },
  loadMore: { alignItems: 'center', paddingVertical: 14 },
  loadMoreText: { fontSize: 14, fontFamily: 'Manrope_600SemiBold', color: Colors.primary, textDecorationLine: 'underline' },
});

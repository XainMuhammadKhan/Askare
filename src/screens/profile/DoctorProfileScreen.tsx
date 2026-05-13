import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography, Shadows } from '../../theme';
import { Header, FilterChips } from '../../components';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = { navigation: NativeStackNavigationProp<any>; route: any };

export const DoctorProfileScreen: React.FC<Props> = ({ navigation, route }) => {
  const doctor = route?.params?.doctor;
  const [tab, setTab] = useState('About');
  return (
    <View style={styles.container}>
      <Header title="Doctor Profile" showBack onBack={() => navigation.goBack()} onNotification={() => navigation.navigate('Notifications')} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Photo */}
        <View style={styles.photoSection}>
          <View style={styles.avatarLarge}><MaterialIcons name="person" size={56} color={Colors.outlineVariant} /><View style={styles.verifiedBadge}><MaterialIcons name="verified" size={24} color={Colors.primary} /></View></View>
          <Text style={styles.doctorName}>{doctor?.name || 'Dr. Ayesha Khan'}</Text>
          <Text style={styles.specialty}>{doctor?.specialty || 'Psychiatrist'}</Text>
        </View>
        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { icon: 'workspace-premium', label: 'EXPERIENCE', value: doctor?.experience?.replace(' Exp.', '') || '8 Years' },
            { icon: 'star', label: 'RATING', value: String(doctor?.rating || 4.9) },
            { icon: 'payment', label: 'FEE', value: doctor?.fee || 'PKR 5K' },
          ].map((s, i) => (
            <View key={i} style={styles.statBox}>
              <MaterialIcons name={s.icon as any} size={22} color={Colors.primary} />
              <Text style={styles.statLabel}>{s.label}</Text>
              <Text style={styles.statValue}>{s.value}</Text>
            </View>
          ))}
        </View>
        {/* Tabs */}
        <View style={styles.tabs}>
          {['About', 'Reviews', 'Availability'].map(t => (
            <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {/* About Content */}
        {tab === 'About' && (<View>
          <Text style={styles.bioTitle}>Biography</Text>
          <Text style={styles.bioText}>Dr. Ayesha Khan is a board-certified psychiatrist based in Karachi with over 8 years of specialized experience in clinical psychology and behavioral therapy. She specializes in anxiety disorders, depression, and holistic mental wellness.</Text>
          <Text style={styles.bioTitle}>Specialized In</Text>
          <View style={styles.chipRow}>
            {['Cognitive Therapy', 'Stress Management', 'Adolescent Care'].map(c => <View key={c} style={styles.specChip}><Text style={styles.specChipText}>{c}</Text></View>)}
          </View>
          <View style={styles.locationHeader}><Text style={styles.bioTitle}>Clinic Location</Text><TouchableOpacity><Text style={styles.viewMap}>VIEW MAP</Text></TouchableOpacity></View>
          <View style={styles.locationCard}>
            <View style={styles.mapPlaceholder}><MaterialIcons name="map" size={28} color={Colors.outlineVariant} /></View>
            <View><Text style={styles.locationName}>Zenith Medical Complex</Text><Text style={styles.locationAddr}>DHA Phase 6, Karachi, Pakistan</Text></View>
          </View>
        </View>)}
        {tab === 'Reviews' && <View style={styles.placeholderTab}><Text style={styles.placeholderText}>Reviews coming soon...</Text></View>}
        {tab === 'Availability' && <View style={styles.placeholderTab}><Text style={styles.placeholderText}>Availability schedule coming soon...</Text></View>}
      </ScrollView>
      {/* Bottom Fee Bar */}
      <View style={styles.bottomBar}>
        <View><Text style={styles.totalLabel}>TOTAL FEE</Text><Text style={styles.totalFee}>PKR 5,000</Text></View>
        <TouchableOpacity style={styles.bookBtn} onPress={() => navigation.navigate('BookAppointment', { doctor })}><Text style={styles.bookBtnText}>Book Appointment</Text></TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: 16, paddingBottom: 120 },
  photoSection: { alignItems: 'center', paddingVertical: 20 },
  avatarLarge: { width: 120, height: 120, borderRadius: 60, backgroundColor: Colors.surfaceContainerHigh, alignItems: 'center', justifyContent: 'center', marginBottom: 12, borderWidth: 3, borderColor: Colors.surfaceContainerHighest },
  verifiedBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: Colors.background, borderRadius: 14 },
  doctorName: { fontSize: 22, fontFamily: 'Manrope_700Bold', color: Colors.onSurface },
  specialty: { ...Typography.bodyMedium, color: Colors.primary, marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statBox: { flex: 1, backgroundColor: Colors.surfaceContainerLowest, borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: Colors.surfaceContainerHighest },
  statLabel: { fontSize: 9, fontFamily: 'Manrope_700Bold', color: Colors.onSurfaceVariant, letterSpacing: 1, marginTop: 6 },
  statValue: { fontSize: 16, fontFamily: 'Manrope_700Bold', color: Colors.onSurface, marginTop: 2 },
  tabs: { flexDirection: 'row', backgroundColor: Colors.surfaceContainerLow, borderRadius: 14, padding: 4, marginBottom: 20 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12 },
  tabActive: { backgroundColor: Colors.surfaceContainerLowest },
  tabText: { fontSize: 13, fontFamily: 'Manrope_500Medium', color: Colors.onSurfaceVariant },
  tabTextActive: { color: Colors.primary, fontFamily: 'Manrope_600SemiBold' },
  bioTitle: { fontSize: 18, fontFamily: 'Manrope_600SemiBold', color: Colors.onSurface, marginBottom: 8, marginTop: 12 },
  bioText: { ...Typography.bodyLarge, color: Colors.onSurfaceVariant, lineHeight: 24, marginBottom: 16 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  specChip: { borderWidth: 1, borderColor: Colors.outlineVariant, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  specChipText: { fontSize: 12, fontFamily: 'Manrope_500Medium', color: Colors.onSurface },
  locationHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  viewMap: { fontSize: 12, fontFamily: 'Manrope_700Bold', color: Colors.primary, letterSpacing: 1 },
  locationCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: Colors.surfaceContainerLow, borderRadius: 14, padding: 14, marginTop: 10 },
  mapPlaceholder: { width: 56, height: 56, borderRadius: 12, backgroundColor: Colors.surfaceContainerHighest, alignItems: 'center', justifyContent: 'center' },
  locationName: { fontSize: 15, fontFamily: 'Manrope_600SemiBold', color: Colors.onSurface },
  locationAddr: { ...Typography.bodySmall, color: Colors.onSurfaceVariant, marginTop: 2 },
  placeholderTab: { padding: 40, alignItems: 'center' },
  placeholderText: { ...Typography.bodyLarge, color: Colors.onSurfaceVariant },
  bottomBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, backgroundColor: Colors.surfaceContainerLowest, borderTopWidth: 1, borderTopColor: Colors.surfaceContainerHighest },
  totalLabel: { fontSize: 10, fontFamily: 'Manrope_700Bold', color: Colors.onSurfaceVariant, letterSpacing: 1 },
  totalFee: { fontSize: 22, fontFamily: 'Manrope_800ExtraBold', color: Colors.onSurface },
  bookBtn: { backgroundColor: Colors.primary, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 24 },
  bookBtnText: { fontSize: 14, fontFamily: 'Manrope_700Bold', color: Colors.onPrimary },
});

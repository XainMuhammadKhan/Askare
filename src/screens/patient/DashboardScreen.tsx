import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../theme';
import { useAuthStore, useAppStore } from '../../store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = { navigation: NativeStackNavigationProp<any> };

export const DashboardScreen: React.FC<Props> = ({ navigation }) => {
  const user = useAuthStore(s => s.user);
  const doctors = useAppStore(s => s.doctors);
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.headerLeft}>
          <MaterialIcons name="description" size={24} color={Colors.primary} />
          <Text style={styles.headerTitle}>Dashboard</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={styles.notifBtn}>
          <MaterialIcons name="notifications-none" size={24} color={Colors.secondary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Greeting */}
        <View style={styles.greeting}>
          <Text style={styles.dateText}>TUESDAY, OCT 24</Text>
          <Text style={styles.greetText}>Good morning,{'\n'}<Text style={styles.nameText}>{user?.name || 'Sarah'}</Text></Text>
        </View>

        {/* Next Appointment Card */}
        <Text style={styles.sectionTitle}>Next Appointment</Text>
        <TouchableOpacity activeOpacity={0.9}>
          <LinearGradient colors={[Colors.primary, Colors.primaryDim]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.appointmentCard}>
            <View style={styles.appointmentCardInner}>
              <View style={styles.appointmentTop}>
                <View style={styles.appointmentLeft}>
                  <View style={styles.calendarIcon}>
                    <MaterialIcons name="event" size={22} color={Colors.white} />
                  </View>
                  <View>
                    <Text style={styles.appointmentLabel}>CARDIOLOGY</Text>
                    <Text style={styles.appointmentDoctor}>Dr. Aris Thorne</Text>
                  </View>
                </View>
                <View style={styles.tomorrowBadge}>
                  <Text style={styles.tomorrowText}>Tomorrow</Text>
                </View>
              </View>
              <View style={styles.appointmentBottom}>
                <View style={styles.timeRow}>
                  <MaterialIcons name="schedule" size={14} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.timeText}>10:00 AM - 10:45 AM</Text>
                </View>
                <MaterialIcons name="arrow-forward" size={22} color={Colors.white} />
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Health Status Bento Grid */}
        <View style={styles.bentoGrid}>
          <View style={[styles.bentoCard, { backgroundColor: Colors.surfaceContainerLowest }]}>
            <View style={styles.bentoTop}>
              <View style={[styles.bentoIcon, { backgroundColor: Colors.secondaryContainer }]}>
                <MaterialIcons name="monitor-heart" size={20} color={Colors.onSecondaryContainer} />
              </View>
              <View style={styles.pulseDot} />
            </View>
            <View style={styles.bentoBottom}>
              <Text style={styles.bentoLabel}>ACTIVE DIAGNOSIS</Text>
              <Text style={styles.bentoValue}>Mild Hypertension</Text>
            </View>
          </View>
          <View style={[styles.bentoCard, { backgroundColor: Colors.surfaceContainerLow }]}>
            <View style={[styles.bentoIcon, { backgroundColor: Colors.surfaceContainerHighest }]}>
              <MaterialIcons name="medication" size={20} color={Colors.secondary} />
            </View>
            <View style={styles.bentoBottom}>
              <Text style={styles.bentoLabel}>NEXT DOSAGE</Text>
              <Text style={styles.bentoValue}>Lisinopril 10mg</Text>
              <View style={styles.timeRow}>
                <MaterialIcons name="schedule" size={12} color={Colors.primary} />
                <Text style={{ ...Typography.bodySmall, color: Colors.primary, fontFamily: 'Manrope_500Medium', fontSize: 11 }}>In 2 hours</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Top Doctors */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top Doctors</Text>
          <TouchableOpacity onPress={() => navigation.navigate('FindSpecialist')}><Text style={styles.viewAll}>View All</Text></TouchableOpacity>
        </View>
        {doctors.slice(3, 5).map(doc => (
          <TouchableOpacity key={doc.id} style={styles.doctorRow} onPress={() => navigation.navigate('DoctorProfile', { doctor: doc })} activeOpacity={0.7}>
            <View style={styles.doctorAvatar}>
              <MaterialIcons name="person" size={24} color={Colors.outlineVariant} />
              <View style={styles.ratingBadge}><Text style={styles.ratingText}>{doc.rating}</Text></View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.doctorName}>{doc.name}</Text>
              <Text style={styles.doctorSpec}>{doc.specialty} • {doc.hospital}</Text>
              <View style={styles.timeRow}>
                <MaterialIcons name="schedule" size={12} color={Colors.tertiary} />
                <Text style={styles.doctorNext}>NEXT: {doc.nextAvailable}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {/* Clinical Archive */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Clinical Archive</Text>
          <TouchableOpacity onPress={() => navigation.navigate('ClinicalArchive')}><Text style={styles.viewAll}>View All</Text></TouchableOpacity>
        </View>
        {[
          { icon: 'history', title: 'Consultation History', sub: 'Past visits & notes' },
          { icon: 'description', title: 'Prescription Archive', sub: 'Active & past meds' },
          { icon: 'timeline', title: 'Health Journey', sub: 'Vitals & milestones' },
        ].map((item, i) => (
          <TouchableOpacity key={i} style={styles.archiveRow} onPress={() => navigation.navigate('ClinicalArchive')} activeOpacity={0.7}>
            <View style={styles.archiveIcon}><MaterialIcons name={item.icon as any} size={22} color={Colors.secondary} /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.archiveTitle}>{item.title}</Text>
              <Text style={styles.archiveSub}>{item.sub}</Text>
            </View>
            <MaterialIcons name="chevron-right" size={22} color={Colors.outlineVariant} />
          </TouchableOpacity>
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 8, backgroundColor: Colors.background },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { ...Typography.titleLarge, color: Colors.primary, fontSize: 20 },
  notifBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { paddingHorizontal: 16 },
  greeting: { marginBottom: 20 },
  dateText: { ...Typography.labelMedium, color: Colors.onSurfaceVariant, marginBottom: 4, fontSize: 11 },
  greetText: { fontSize: 28, fontFamily: 'Manrope_600SemiBold', color: Colors.onSurface, lineHeight: 36 },
  nameText: { color: Colors.primary },
  sectionTitle: { ...Typography.titleLarge, color: Colors.onSurface, fontSize: 20, marginBottom: 12 },
  appointmentCard: { borderRadius: 24, padding: 20, marginBottom: 20 },
  appointmentCardInner: { gap: 20 },
  appointmentTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  appointmentLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  calendarIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  appointmentLabel: { ...Typography.labelSmall, color: 'rgba(255,255,255,0.8)', marginBottom: 2 },
  appointmentDoctor: { fontSize: 18, fontFamily: 'Manrope_600SemiBold', color: Colors.white },
  tomorrowBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  tomorrowText: { ...Typography.bodySmall, color: Colors.white, fontFamily: 'Manrope_500Medium' },
  appointmentBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)', paddingTop: 16 },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  timeText: { ...Typography.bodyMedium, color: Colors.white, fontFamily: 'Manrope_500Medium' },
  bentoGrid: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  bentoCard: { flex: 1, aspectRatio: 1, borderRadius: 16, padding: 16, justifyContent: 'space-between', ...Shadows.subtle },
  bentoTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  bentoIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  pulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.tertiary },
  bentoBottom: {},
  bentoLabel: { ...Typography.labelSmall, color: Colors.onSurfaceVariant, marginBottom: 4, fontSize: 9 },
  bentoValue: { fontSize: 15, fontFamily: 'Manrope_600SemiBold', color: Colors.onSurface, lineHeight: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 },
  viewAll: { ...Typography.bodyMedium, color: Colors.primary, fontFamily: 'Manrope_500Medium' },
  doctorRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.surfaceContainerLowest, borderRadius: 16, padding: 14, marginBottom: 10, ...Shadows.subtle },
  doctorAvatar: { width: 56, height: 56, borderRadius: 16, backgroundColor: Colors.surfaceContainerHigh, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.surfaceContainerHighest },
  ratingBadge: { position: 'absolute', bottom: -4, right: -4, backgroundColor: Colors.primary, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, borderWidth: 2, borderColor: Colors.background },
  ratingText: { fontSize: 9, fontFamily: 'Manrope_700Bold', color: Colors.onPrimary },
  doctorName: { fontSize: 15, fontFamily: 'Manrope_600SemiBold', color: Colors.onSurface },
  doctorSpec: { ...Typography.bodySmall, color: Colors.primary, fontFamily: 'Manrope_500Medium', marginTop: 2 },
  doctorNext: { fontSize: 9, fontFamily: 'Manrope_700Bold', color: Colors.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 1 },
  archiveRow: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: Colors.surfaceContainerLowest, borderRadius: 16, padding: 14, marginBottom: 10 },
  archiveIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.surfaceContainer, alignItems: 'center', justifyContent: 'center' },
  archiveTitle: { fontSize: 15, fontFamily: 'Manrope_500Medium', color: Colors.onSurface },
  archiveSub: { ...Typography.bodySmall, color: Colors.onSurfaceVariant },
});

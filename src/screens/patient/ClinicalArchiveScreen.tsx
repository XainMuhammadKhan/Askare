import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography, Shadows } from '../../theme';
import { Header } from '../../components';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = { navigation: NativeStackNavigationProp<any> };

export const ClinicalArchiveScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Header title="Clinical Archive" showBack onBack={() => navigation.goBack()} onNotification={() => navigation.navigate('Notifications')} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Recent Consultations */}
        <Text style={styles.sectionTitle}>Recent Consultations</Text>
        {[
          { name: 'Dr. Sarah Jenkins', spec: 'Cardiology Specialist', status: 'COMPLETED', statusColor: Colors.primary, type: 'Routine Checkup', date: 'Oct 12, 2023 • 10:00 AM' },
          { name: 'Dr. Ali Raza', spec: 'General Practice', status: 'PENDING LAB RESULTS', statusColor: '#d97706', type: 'Annual Blood Panel', date: 'Sep 28, 2023 • 08:30 AM' },
        ].map((c, i) => (
          <View key={i} style={styles.consultCard}>
            <View style={styles.consultHeader}>
              <View style={styles.consultIcon}><MaterialIcons name="medical-services" size={22} color={Colors.secondary} /></View>
              <View style={{ flex: 1 }}><Text style={styles.consultName}>{c.name}</Text><Text style={styles.consultSpec}>{c.spec}</Text></View>
              <View style={[styles.badge, { backgroundColor: `${c.statusColor}15` }]}><View style={[styles.badgeDot, { backgroundColor: c.statusColor }]} /><Text style={[styles.badgeText, { color: c.statusColor }]}>{c.status}</Text></View>
            </View>
            <TouchableOpacity style={styles.consultFooter}><View><Text style={styles.consultType}>{c.type}</Text><Text style={styles.consultDate}>{c.date}</Text></View><MaterialIcons name="chevron-right" size={22} color={Colors.primary} /></TouchableOpacity>
          </View>
        ))}

        {/* Active Prescriptions */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Active Prescriptions</Text>
        {[
          { name: 'Lisinopril', dose: '10mg • Take 1 tablet morning', doctor: 'Rx by Dr. Jenkins', freq: 'DAILY', freqColor: Colors.primary, refill: 'Refill in 14 days' },
          { name: 'Amoxicillin', dose: '500mg • Take with food', doctor: 'Rx by Dr. Raza', freq: 'AS NEEDED', freqColor: Colors.tertiary, refill: 'Completes in 3 days' },
        ].map((p, i) => (
          <View key={i} style={styles.prescCard}>
            <View style={styles.prescHeader}>
              <View style={[styles.prescIcon, { backgroundColor: i === 0 ? Colors.secondaryContainer : `${Colors.tertiary}15` }]}><MaterialIcons name={i === 0 ? 'medication' : 'science'} size={18} color={i === 0 ? Colors.secondary : Colors.tertiary} /></View>
              <View style={[styles.badge, { backgroundColor: `${p.freqColor}15` }]}><Text style={[styles.badgeText, { color: p.freqColor }]}>{p.freq}</Text></View>
            </View>
            <Text style={styles.prescName}>{p.name}</Text>
            <Text style={styles.prescDose}>{p.dose}</Text>
            <View style={styles.prescFooter}><Text style={styles.prescDoctor}>{p.doctor}</Text><Text style={[styles.prescRefill, { color: p.freqColor }]}>{p.refill}</Text></View>
          </View>
        ))}

        {/* Health Journey */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Health Journey</Text>
        <View style={styles.journeyCard}>
          <View style={styles.journeyItem}>
            <View style={[styles.journeyDot, { backgroundColor: Colors.primary }]} />
            <View style={styles.journeyLine} />
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={styles.journeyLabel}>CURRENT FOCUS</Text>
              <Text style={styles.journeyTitle}>Hypertension Management</Text>
              <Text style={styles.journeyDesc}>Blood pressure stabilizing within target range. Continued monitoring recommended.</Text>
            </View>
          </View>
          <View style={styles.journeyItem}>
            <View style={[styles.journeyDot, { backgroundColor: Colors.outlineVariant }]} />
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={styles.journeyDate}>AUG 2023</Text>
              <Text style={styles.journeyTitle}>Initial Diagnosis</Text>
              <Text style={styles.journeyDesc}>Started treatment plan and lifestyle adjustments.</Text>
            </View>
          </View>
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: 16, paddingBottom: 20 },
  sectionTitle: { fontSize: 22, fontFamily: 'Manrope_600SemiBold', color: Colors.onSurface, marginBottom: 14 },
  consultCard: { backgroundColor: Colors.surfaceContainerLowest, borderRadius: 16, padding: 16, marginBottom: 12, ...Shadows.subtle },
  consultHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  consultIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.surfaceContainer, alignItems: 'center', justifyContent: 'center' },
  consultName: { fontSize: 15, fontFamily: 'Manrope_600SemiBold', color: Colors.onSurface },
  consultSpec: { ...Typography.bodySmall, color: Colors.onSurfaceVariant },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeDot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontSize: 9, fontFamily: 'Manrope_700Bold', letterSpacing: 0.5 },
  consultFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.surfaceContainerLow, borderRadius: 10, padding: 12 },
  consultType: { fontSize: 14, fontFamily: 'Manrope_500Medium', color: Colors.onSurface },
  consultDate: { ...Typography.bodySmall, color: Colors.onSurfaceVariant },
  prescCard: { backgroundColor: Colors.surfaceContainerLowest, borderRadius: 16, padding: 16, marginBottom: 12, ...Shadows.subtle },
  prescHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  prescIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  prescName: { fontSize: 18, fontFamily: 'Manrope_600SemiBold', color: Colors.onSurface, marginBottom: 2 },
  prescDose: { ...Typography.bodyMedium, color: Colors.onSurfaceVariant, marginBottom: 10 },
  prescFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: Colors.surfaceContainerHighest, paddingTop: 10 },
  prescDoctor: { ...Typography.bodySmall, color: Colors.onSurfaceVariant },
  prescRefill: { fontSize: 12, fontFamily: 'Manrope_600SemiBold' },
  journeyCard: { backgroundColor: Colors.surfaceContainerLow, borderRadius: 16, padding: 20 },
  journeyItem: { flexDirection: 'row', marginBottom: 20 },
  journeyDot: { width: 10, height: 10, borderRadius: 5, marginTop: 6 },
  journeyLine: { position: 'absolute', left: 4, top: 16, width: 2, height: '100%', backgroundColor: Colors.surfaceContainerHighest },
  journeyLabel: { fontSize: 10, fontFamily: 'Manrope_700Bold', color: Colors.primary, letterSpacing: 1, marginBottom: 4 },
  journeyDate: { fontSize: 10, fontFamily: 'Manrope_700Bold', color: Colors.onSurfaceVariant, letterSpacing: 1, marginBottom: 4 },
  journeyTitle: { fontSize: 16, fontFamily: 'Manrope_600SemiBold', color: Colors.onSurface, marginBottom: 4 },
  journeyDesc: { ...Typography.bodySmall, color: Colors.onSurfaceVariant, lineHeight: 18 },
});

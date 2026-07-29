import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography, Shadows } from '../../theme';
import { Header } from '../../components';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = { navigation: NativeStackNavigationProp<any> };

// Summary data matching web app's summaryData
const consultationSummaries: Record<string, {
  doctor: string; date: string; time: string; duration: string;
  illness: string; recommendations: string;
  medicines: { name: string; dosage: string }[];
  precautions: string[];
}> = {
  jenkins: {
    doctor: 'Dr. Sarah Jenkins', date: 'Oct 12, 2023', time: '10:00 AM', duration: '24m 15s',
    illness: 'Mild Hypertension with elevated LDL cholesterol levels. Blood pressure readings averaging 138/88 mmHg over the past two weeks.',
    recommendations: 'Continue monitoring blood pressure twice daily. Maintain a low-sodium diet (less than 2,300mg sodium/day) and increase physical activity to at least 30 minutes of moderate exercise daily.',
    medicines: [
      { name: 'Lisinopril 10mg', dosage: 'Once daily (Morning)' },
      { name: 'Atorvastatin 20mg', dosage: 'Once daily (Before bed)' },
      { name: 'Aspirin 75mg', dosage: 'Once daily (After lunch)' },
    ],
    precautions: [
      'Avoid excessive salt and processed food intake',
      'Monitor blood pressure at home twice daily and log readings',
      'Limit caffeine to 1-2 cups per day',
      'Report any dizziness, persistent headaches, or vision changes immediately',
    ],
  },
  raza: {
    doctor: 'Dr. Ali Raza', date: 'Sep 28, 2023', time: '08:30 AM', duration: '18m 42s',
    illness: 'Annual blood panel review. Mild vitamin D deficiency detected. All other markers within normal range.',
    recommendations: 'High-dose Vitamin D3 supplementation for 8 weeks followed by maintenance dose. Recheck in 3 months.',
    medicines: [
      { name: 'Vitamin D3 50,000 IU', dosage: 'Once weekly for 8 weeks' },
      { name: 'Calcium 500mg + D3', dosage: 'Twice daily (With meals)' },
    ],
    precautions: [
      'Take Vitamin D with a fatty meal for better absorption',
      'Do not exceed recommended supplementation dose',
      'Maintain regular outdoor activity for natural vitamin D',
      'Follow up for blood level recheck in 3 months',
    ],
  },
};

const consultations = [
  { name: 'Dr. Sarah Jenkins', spec: 'Cardiology Specialist', status: 'COMPLETED', statusColor: Colors.primary, type: 'Routine Checkup', date: 'Oct 12, 2023 • 10:00 AM', key: 'jenkins' },
  { name: 'Dr. Ali Raza', spec: 'General Practice', status: 'PENDING LAB RESULTS', statusColor: '#d97706', type: 'Annual Blood Panel', date: 'Sep 28, 2023 • 08:30 AM', key: 'raza' },
];

export const ClinicalArchiveScreen: React.FC<Props> = ({ navigation }) => {
  const [summaryKey, setSummaryKey] = useState<string | null>(null);
  const modalData = summaryKey ? consultationSummaries[summaryKey] : null;

  return (
    <View style={styles.container}>
      <Header title="Clinical Archive" showBack onBack={() => navigation.goBack()} onNotification={() => navigation.navigate('Notifications')} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Recent Consultations */}
        <Text style={styles.sectionTitle}>Recent Consultations</Text>
        {consultations.map((c, i) => (
          <View key={i} style={styles.consultCard}>
            <View style={styles.consultHeader}>
              <View style={styles.consultIcon}><MaterialIcons name="medical-services" size={22} color={Colors.secondary} /></View>
              <View style={{ flex: 1 }}><Text style={styles.consultName}>{c.name}</Text><Text style={styles.consultSpec}>{c.spec}</Text></View>
              <View style={[styles.badge, { backgroundColor: `${c.statusColor}15` }]}><View style={[styles.badgeDot, { backgroundColor: c.statusColor }]} /><Text style={[styles.badgeText, { color: c.statusColor }]}>{c.status}</Text></View>
            </View>
            <TouchableOpacity style={styles.consultFooter} onPress={() => setSummaryKey(c.key)} activeOpacity={0.7}>
              <View>
                <Text style={styles.consultType}>{c.type}</Text>
                <Text style={styles.consultDate}>{c.date}</Text>
              </View>
              <View style={styles.viewSummaryBtn}>
                <Text style={styles.viewSummaryText}>VIEW SUMMARY</Text>
                <MaterialIcons name="chevron-right" size={18} color={Colors.primary} />
              </View>
            </TouchableOpacity>
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

      {/* Summary Modal */}
      <Modal visible={!!modalData} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {modalData && (
                <>
                  {/* Header */}
                  <View style={styles.modalHeader}>
                    <View style={styles.modalHeaderLeft}>
                      <View style={styles.aiIcon}>
                        <MaterialIcons name="smart-toy" size={22} color={Colors.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.modalTitle}>Consultation Summary</Text>
                        <Text style={styles.modalSub}>AI-Generated Report • {modalData.doctor}</Text>
                      </View>
                    </View>
                    <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setSummaryKey(null)}>
                      <MaterialIcons name="close" size={20} color={Colors.onSurfaceVariant} />
                    </TouchableOpacity>
                  </View>

                  {/* Meta */}
                  <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                      <MaterialIcons name="event" size={14} color={Colors.onSurfaceVariant} />
                      <Text style={styles.metaText}>{modalData.date}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <MaterialIcons name="schedule" size={14} color={Colors.onSurfaceVariant} />
                      <Text style={styles.metaText}>{modalData.time}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <MaterialIcons name="timer" size={14} color={Colors.onSurfaceVariant} />
                      <Text style={styles.metaText}>{modalData.duration}</Text>
                    </View>
                  </View>

                  {/* Diagnosis */}
                  <View style={styles.sectionCard}>
                    <View style={styles.sectionCardHeader}>
                      <MaterialIcons name="coronavirus" size={16} color={Colors.tertiary} />
                      <Text style={styles.sectionCardLabel}>DIAGNOSIS / ILLNESS</Text>
                    </View>
                    <Text style={styles.sectionCardBody}>{modalData.illness}</Text>
                  </View>

                  {/* Recommendations */}
                  <View style={styles.sectionCard}>
                    <View style={styles.sectionCardHeader}>
                      <MaterialIcons name="medical-services" size={16} color={Colors.primary} />
                      <Text style={styles.sectionCardLabel}>DOCTOR'S RECOMMENDATIONS</Text>
                    </View>
                    <Text style={styles.sectionCardBody}>{modalData.recommendations}</Text>
                  </View>

                  {/* Medicines */}
                  <View style={styles.sectionCard}>
                    <View style={styles.sectionCardHeader}>
                      <MaterialIcons name="medication" size={16} color={Colors.primary} />
                      <Text style={styles.sectionCardLabel}>PRESCRIBED MEDICINES</Text>
                    </View>
                    {modalData.medicines.map((m, i) => (
                      <View key={i} style={styles.medRow}>
                        <View style={styles.medDot} />
                        <Text style={styles.medName}>{m.name}</Text>
                        <Text style={styles.medDosage}>{m.dosage}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Precautions */}
                  <View style={[styles.sectionCard, styles.precautionCard]}>
                    <View style={styles.sectionCardHeader}>
                      <MaterialIcons name="warning" size={16} color={Colors.tertiary} />
                      <Text style={[styles.sectionCardLabel, { color: Colors.tertiary }]}>PRECAUTIONS</Text>
                    </View>
                    {modalData.precautions.map((p, i) => (
                      <View key={i} style={styles.precautionRow}>
                        <Text style={styles.precautionBullet}>•</Text>
                        <Text style={styles.precautionText}>{p}</Text>
                      </View>
                    ))}
                  </View>

                  <TouchableOpacity style={styles.gotItBtn} onPress={() => setSummaryKey(null)} activeOpacity={0.8}>
                    <Text style={styles.gotItText}>Got it — Close Summary</Text>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  viewSummaryBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  viewSummaryText: { fontSize: 10, fontFamily: 'Manrope_700Bold', color: Colors.primary, letterSpacing: 0.8 },
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

  // Summary Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { backgroundColor: Colors.surfaceContainerLowest, borderRadius: 24, padding: 24, width: '100%', maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  modalHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  aiIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: `${Colors.primary}15`, alignItems: 'center', justifyContent: 'center' },
  modalTitle: { fontSize: 18, fontFamily: 'Manrope_700Bold', color: Colors.onSurface },
  modalSub: { fontSize: 12, fontFamily: 'Manrope_500Medium', color: Colors.secondary, marginTop: 2 },
  modalCloseBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.surfaceContainerHigh, alignItems: 'center', justifyContent: 'center' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16, flexWrap: 'wrap' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, fontFamily: 'Manrope_500Medium', color: Colors.onSurfaceVariant },
  sectionCard: { backgroundColor: Colors.surfaceContainerLow, borderRadius: 14, padding: 16, marginBottom: 10 },
  sectionCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  sectionCardLabel: { fontSize: 9, fontFamily: 'Manrope_700Bold', color: Colors.onSurfaceVariant, letterSpacing: 1 },
  sectionCardBody: { fontSize: 13, fontFamily: 'Manrope_500Medium', color: Colors.onSurface, lineHeight: 20 },
  medRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  medDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary },
  medName: { fontSize: 13, fontFamily: 'Manrope_600SemiBold', color: Colors.onSurface, flex: 1 },
  medDosage: { fontSize: 12, fontFamily: 'Manrope_500Medium', color: Colors.secondary },
  precautionCard: { backgroundColor: `${Colors.tertiary}08`, borderWidth: 1, borderColor: `${Colors.tertiary}15` },
  precautionRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 6 },
  precautionBullet: { fontSize: 14, color: Colors.tertiary },
  precautionText: { fontSize: 13, fontFamily: 'Manrope_500Medium', color: Colors.onSurface, flex: 1, lineHeight: 18 },
  gotItBtn: { backgroundColor: Colors.primary, borderRadius: 16, paddingVertical: 14, alignItems: 'center', marginTop: 10 },
  gotItText: { fontSize: 14, fontFamily: 'Manrope_700Bold', color: Colors.onPrimary },
});

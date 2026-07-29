import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography, Shadows } from '../../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppStore } from '../../store';

type Props = { navigation: NativeStackNavigationProp<any> };

export const ConsultationSummaryScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const callSummary = useAppStore((s) => s.callSummary);
  const clearCallSummary = useAppStore((s) => s.clearCallSummary);

  const handleClose = () => {
    clearCallSummary();
    navigation.navigate('PatientTabs');
  };

  if (!callSummary) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.emptyState}>
          <MaterialIcons name="info-outline" size={48} color={Colors.outlineVariant} />
          <Text style={styles.emptyText}>No summary available</Text>
          <TouchableOpacity style={styles.gotItBtn} onPress={handleClose}>
            <Text style={styles.gotItBtnText}>Go to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.aiIcon}>
              <MaterialIcons name="smart-toy" size={24} color={Colors.primary} />
            </View>
            <View>
              <Text style={styles.headerTitle}>Consultation Summary</Text>
              <Text style={styles.headerSub}>AI-Generated Report • {callSummary.doctor}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
            <MaterialIcons name="close" size={22} color={Colors.onSurfaceVariant} />
          </TouchableOpacity>
        </View>

        {/* Meta Row */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <MaterialIcons name="event" size={16} color={Colors.onSurfaceVariant} />
            <Text style={styles.metaText}>{callSummary.date}</Text>
          </View>
          <View style={styles.metaItem}>
            <MaterialIcons name="schedule" size={16} color={Colors.onSurfaceVariant} />
            <Text style={styles.metaText}>{callSummary.time}</Text>
          </View>
          <View style={styles.metaItem}>
            <MaterialIcons name="timer" size={16} color={Colors.onSurfaceVariant} />
            <Text style={styles.metaText}>{callSummary.duration}</Text>
          </View>
        </View>

        {/* Diagnosis */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="coronavirus" size={18} color={Colors.tertiary} />
            <Text style={styles.sectionLabel}>DIAGNOSIS / ILLNESS</Text>
          </View>
          <Text style={styles.sectionBody}>{callSummary.diagnosis}</Text>
        </View>

        {/* Recommendations */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="medical-services" size={18} color={Colors.primary} />
            <Text style={styles.sectionLabel}>DOCTOR'S RECOMMENDATIONS</Text>
          </View>
          <Text style={styles.sectionBody}>{callSummary.recommendations}</Text>
        </View>

        {/* Medicines */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="medication" size={18} color={Colors.primary} />
            <Text style={styles.sectionLabel}>PRESCRIBED MEDICINES</Text>
          </View>
          {callSummary.medicines.map((med, i) => (
            <View key={i} style={styles.medRow}>
              <View style={styles.medDot} />
              <Text style={styles.medText}>{med}</Text>
            </View>
          ))}
        </View>

        {/* Precautions */}
        <View style={[styles.sectionCard, styles.precautionCard]}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="warning" size={18} color={Colors.tertiary} />
            <Text style={[styles.sectionLabel, { color: Colors.tertiary }]}>PRECAUTIONS</Text>
          </View>
          {callSummary.precautions.map((p, i) => (
            <View key={i} style={styles.precautionRow}>
              <Text style={styles.precautionBullet}>•</Text>
              <Text style={styles.precautionText}>{p}</Text>
            </View>
          ))}
        </View>

        {/* Got it Button */}
        <TouchableOpacity style={styles.gotItBtn} onPress={handleClose} activeOpacity={0.8}>
          <Text style={styles.gotItBtnText}>Got it — Close Summary</Text>
        </TouchableOpacity>

        <View style={{ height: insets.bottom + 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  emptyText: { fontSize: 16, fontFamily: 'Manrope_500Medium', color: Colors.onSurfaceVariant },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  aiIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: `${Colors.primary}15`, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontFamily: 'Manrope_700Bold', color: Colors.onSurface },
  headerSub: { fontSize: 13, fontFamily: 'Manrope_500Medium', color: Colors.onSurfaceVariant, marginTop: 2 },
  closeBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surfaceContainerHigh, alignItems: 'center', justifyContent: 'center' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20, flexWrap: 'wrap' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 13, fontFamily: 'Manrope_500Medium', color: Colors.onSurfaceVariant },
  sectionCard: { backgroundColor: Colors.surfaceContainerLow, borderRadius: 16, padding: 18, marginBottom: 14 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionLabel: { fontSize: 10, fontFamily: 'Manrope_700Bold', color: Colors.onSurfaceVariant, letterSpacing: 1.2 },
  sectionBody: { fontSize: 14, fontFamily: 'Manrope_500Medium', color: Colors.onSurface, lineHeight: 22 },
  medRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  medDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary },
  medText: { fontSize: 14, fontFamily: 'Manrope_500Medium', color: Colors.onSurface, flex: 1 },
  precautionCard: { backgroundColor: `${Colors.tertiary}08`, borderWidth: 1, borderColor: `${Colors.tertiary}20` },
  precautionRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 8 },
  precautionBullet: { fontSize: 16, color: Colors.tertiary, marginTop: -2 },
  precautionText: { fontSize: 14, fontFamily: 'Manrope_500Medium', color: Colors.onSurface, flex: 1, lineHeight: 20 },
  gotItBtn: { backgroundColor: Colors.primary, borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 10 },
  gotItBtnText: { fontSize: 15, fontFamily: 'Manrope_700Bold', color: Colors.onPrimary },
});

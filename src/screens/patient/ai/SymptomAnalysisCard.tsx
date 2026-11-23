import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography, Shadows } from '../../../theme';
import { SymptomAnalysis, Urgency } from '../../../api';

interface Props {
  analysis: SymptomAnalysis;
  onSelectFollowUp: (q: string) => void;
  onFindSpecialist: (specializationId?: number) => void;
}

const URGENCY_THEME: Record<Urgency, { bg: string; fg: string; label: string }> = {
  ROUTINE: { bg: '#dcfce7', fg: '#15803d', label: 'ROUTINE CARE' },
  SOON: { bg: '#fef9c3', fg: '#a16207', label: 'SEE A DOCTOR SOON' },
  URGENT: { bg: '#ffedd5', fg: '#c2410c', label: 'URGENT ATTENTION' },
  EMERGENCY: { bg: '#fee2e2', fg: '#b91c1c', label: 'EMERGENCY' },
};

export const SymptomAnalysisCard: React.FC<Props> = ({
  analysis,
  onSelectFollowUp,
  onFindSpecialist,
}) => {
  const urgency = analysis.urgency || 'ROUTINE';
  const uTheme = URGENCY_THEME[urgency] ?? URGENCY_THEME.ROUTINE;
  const spec = analysis.suggestedSpecialization;

  return (
    <View style={styles.card}>
      {/* Urgency Header */}
      <View style={styles.topRow}>
        <View style={styles.aiTitleRow}>
          <MaterialIcons name="health-and-safety" size={20} color={Colors.primary} />
          <Text style={styles.title}>Clinical Symptom Analysis</Text>
        </View>
        <View style={[styles.urgencyBadge, { backgroundColor: uTheme.bg }]}>
          <Text style={[styles.urgencyText, { color: uTheme.fg }]}>{uTheme.label}</Text>
        </View>
      </View>

      {/* Emergency Message */}
      {analysis.emergencyMessage ? (
        <View style={styles.emergencyBanner}>
          <MaterialIcons name="emergency" size={20} color={Colors.white} />
          <Text style={styles.emergencyText}>{analysis.emergencyMessage}</Text>
        </View>
      ) : null}

      {/* Detected Symptoms Chips */}
      {Array.isArray(analysis.detectedSymptoms) && analysis.detectedSymptoms.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>DETECTED SYMPTOMS</Text>
          <View style={styles.chipWrap}>
            {analysis.detectedSymptoms.map((sym, i) => (
              <View key={i} style={styles.symptomChip}>
                <Text style={styles.symptomChipText}>{sym}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Explanation */}
      <Text style={styles.explanation}>{analysis.explanation}</Text>

      {/* Suggested Specialization */}
      {spec ? (
        <View style={styles.specBox}>
          <View style={{ flex: 1 }}>
            <Text style={styles.specLabel}>RECOMMENDED SPECIALIST</Text>
            <Text style={styles.specName}>{spec.name}</Text>
          </View>
          <TouchableOpacity
            style={styles.findSpecBtn}
            onPress={() => onFindSpecialist(spec.id)}
          >
            <Text style={styles.findSpecBtnText}>Find a {spec.name} Specialist</Text>
            <MaterialIcons name="arrow-forward" size={16} color={Colors.white} />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.findSpecBtn}
          onPress={() => onFindSpecialist(undefined)}
        >
          <Text style={styles.findSpecBtnText}>Find a Specialist</Text>
          <MaterialIcons name="arrow-forward" size={16} color={Colors.white} />
        </TouchableOpacity>
      )}

      {/* Follow-up Questions */}
      {Array.isArray(analysis.followUpQuestions) &&
        analysis.followUpQuestions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>FOLLOW-UP QUESTIONS (TAP TO ADD)</Text>
            <View style={styles.followUpList}>
              {analysis.followUpQuestions.map((q, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.followUpChip}
                  onPress={() => onSelectFollowUp(q)}
                >
                  <MaterialIcons name="help-outline" size={15} color={Colors.primary} />
                  <Text style={styles.followUpText}>{q}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

      {/* Disclaimer */}
      {analysis.disclaimer ? (
        <Text style={styles.disclaimer}>{analysis.disclaimer}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: `${Colors.primary}25`,
    ...Shadows.subtle,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  aiTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: { fontSize: 16, fontFamily: 'Manrope_700Bold', color: Colors.onSurface },
  urgencyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  urgencyText: { fontSize: 10, fontFamily: 'Manrope_800ExtraBold', letterSpacing: 0.6 },
  emergencyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.error,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  emergencyText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Manrope_700Bold',
    color: Colors.white,
    lineHeight: 19,
  },
  section: { marginBottom: 12 },
  sectionLabel: {
    fontSize: 10,
    fontFamily: 'Manrope_700Bold',
    color: Colors.onSurfaceVariant,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  symptomChip: {
    backgroundColor: `${Colors.primary}15`,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  symptomChipText: { fontSize: 12, fontFamily: 'Manrope_600SemiBold', color: Colors.primary },
  explanation: {
    ...Typography.bodyMedium,
    color: Colors.onSurface,
    lineHeight: 22,
    marginBottom: 14,
  },
  specBox: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
    gap: 10,
  },
  specLabel: {
    fontSize: 10,
    fontFamily: 'Manrope_700Bold',
    color: Colors.onSurfaceVariant,
    letterSpacing: 0.8,
  },
  specName: { fontSize: 16, fontFamily: 'Manrope_700Bold', color: Colors.primary, marginTop: 2 },
  findSpecBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  findSpecBtnText: { fontSize: 13, fontFamily: 'Manrope_700Bold', color: Colors.white },
  followUpList: { gap: 8 },
  followUpChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.surfaceContainerLow,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
  },
  followUpText: { flex: 1, fontSize: 13, fontFamily: 'Manrope_500Medium', color: Colors.onSurface },
  disclaimer: {
    ...Typography.bodySmall,
    color: Colors.outlineVariant,
    fontStyle: 'italic',
    marginTop: 6,
  },
});

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography, Shadows } from '../../../theme';
import { aiService, ApiError } from '../../../api';

interface Props {
  appointmentId: number;
}

interface BriefData {
  summary?: string;
  keyPoints?: string[];
  redFlags?: string[];
  aiGenerated?: boolean;
}

export const AiPatientBriefCard: React.FC<Props> = ({ appointmentId }) => {
  const [brief, setBrief] = useState<BriefData | null>(null);
  const [loading, setLoading] = useState(false);
  const [busyMessage, setBusyMessage] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setBusyMessage(null);
    try {
      const res = await aiService.patientBrief(appointmentId);
      setBrief(res);
    } catch (e: any) {
      if (e instanceof ApiError && e.status === 503) {
        setBusyMessage('AI assistant is temporarily busy (free-tier rate limit). Please retry in a minute.');
      } else {
        Alert.alert('AI Brief Error', e?.message ?? 'Could not generate patient brief.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <View style={styles.iconCircle}>
            <MaterialIcons name="auto-awesome" size={18} color={Colors.primary} />
          </View>
          <View>
            <Text style={styles.title}>AI Pre-Visit Patient Brief</Text>
            <Text style={styles.subtitle}>Synthesized from medical profile & records</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.genBtn}
          onPress={handleGenerate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <>
              <MaterialIcons name="bolt" size={16} color={Colors.white} />
              <Text style={styles.genBtnText}>
                {brief ? 'Refresh' : 'Generate AI Patient Brief'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {busyMessage && (
        <View style={styles.busyBanner}>
          <MaterialIcons name="hourglass-top" size={18} color="#d97706" />
          <Text style={styles.busyText}>{busyMessage}</Text>
        </View>
      )}

      {brief && (
        <View style={styles.briefBody}>
          {brief.summary ? (
            <Text style={styles.summaryText}>{brief.summary}</Text>
          ) : null}

          {Array.isArray(brief.redFlags) && brief.redFlags.length > 0 && (
            <View style={styles.redFlagBox}>
              <View style={styles.subHeader}>
                <MaterialIcons name="warning" size={16} color={Colors.error} />
                <Text style={styles.redFlagTitle}>Red Flags & Alerts</Text>
              </View>
              {brief.redFlags.map((flag, i) => (
                <Text key={i} style={styles.redFlagItem}>
                  • {flag}
                </Text>
              ))}
            </View>
          )}

          {Array.isArray(brief.keyPoints) && brief.keyPoints.length > 0 && (
            <View style={styles.keyPointsBox}>
              <Text style={styles.keyPointsTitle}>Key Clinical Points</Text>
              {brief.keyPoints.map((pt, i) => (
                <Text key={i} style={styles.keyPointItem}>
                  • {pt}
                </Text>
              ))}
            </View>
          )}
        </View>
      )}
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${Colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 15, fontFamily: 'Manrope_700Bold', color: Colors.onSurface },
  subtitle: { ...Typography.bodySmall, color: Colors.onSurfaceVariant },
  genBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
  },
  genBtnText: { fontSize: 12, fontFamily: 'Manrope_700Bold', color: Colors.white },
  busyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
  },
  busyText: { flex: 1, fontSize: 12, fontFamily: 'Manrope_600SemiBold', color: '#92400e' },
  briefBody: { marginTop: 14, gap: 12 },
  summaryText: { ...Typography.bodyMedium, color: Colors.onSurface, lineHeight: 21 },
  redFlagBox: {
    backgroundColor: `${Colors.error}10`,
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: Colors.error,
  },
  subHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  redFlagTitle: { fontSize: 13, fontFamily: 'Manrope_700Bold', color: Colors.error },
  redFlagItem: { fontSize: 13, fontFamily: 'Manrope_500Medium', color: Colors.error, marginTop: 3 },
  keyPointsBox: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 12,
    padding: 12,
  },
  keyPointsTitle: {
    fontSize: 13,
    fontFamily: 'Manrope_700Bold',
    color: Colors.primary,
    marginBottom: 6,
  },
  keyPointItem: { ...Typography.bodySmall, color: Colors.onSurface, marginTop: 4, lineHeight: 18 },
});

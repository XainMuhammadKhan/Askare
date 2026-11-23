import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../../theme';
import { Header, StateView } from '../../../components';
import { patientService } from '../../../api';
import { useApi } from '../../../hooks/useApi';
import { isoDay } from '../../../utils/format';

type Props = { navigation: NativeStackNavigationProp<any> };

const getInitialMonth = () => isoDay(0).slice(0, 7);

const shiftMonth = (ym: string, delta: number) => {
  const parts = ym.split('-');
  const year = Number(parts[0]) || new Date().getFullYear();
  const month = Number(parts[1]) || new Date().getMonth() + 1;
  const d = new Date(year, month - 1 + delta, 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
};

const formatMonthLabel = (ym: string) => {
  const [y, m] = ym.split('-').map(Number);
  if (!y || !m) return ym;
  const d = new Date(y, m - 1, 1);
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

export const HealthReportScreen: React.FC<Props> = ({ navigation }) => {
  const [month, setMonth] = useState<string>(getInitialMonth);

  const { data: report, loading, error, refresh } = useApi(
    () => patientService.healthReport(month),
    [month]
  );

  const { data: tipData } = useApi(() => patientService.healthTip(), []);

  const stats: Record<string, any> = report?.stats ?? {};
  const statEntries = Object.entries(stats);
  const highlights: string[] = Array.isArray(report?.highlights) ? report.highlights : [];
  const recommendations: string[] = Array.isArray(report?.recommendations) ? report.recommendations : [];
  const summary: string = report?.summary || 'No health summary available for this month.';

  return (
    <View style={styles.container}>
      <Header
        title="Monthly Health Report"
        showBack
        onBack={() => navigation.goBack()}
        onNotification={() => navigation.navigate('Notifications')}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Month Switcher */}
        <View style={styles.monthBar}>
          <TouchableOpacity
            style={styles.monthBtn}
            onPress={() => setMonth((m) => shiftMonth(m, -1))}
          >
            <MaterialIcons name="chevron-left" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <View style={styles.monthCenter}>
            <MaterialIcons name="calendar-today" size={16} color={Colors.primary} />
            <Text style={styles.monthTitle}>{formatMonthLabel(month)}</Text>
            <Text style={styles.monthCode}>({month})</Text>
          </View>
          <TouchableOpacity
            style={styles.monthBtn}
            onPress={() => setMonth((m) => shiftMonth(m, 1))}
          >
            <MaterialIcons name="chevron-right" size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Daily Tip Card */}
        {tipData?.tip ? (
          <View style={styles.tipCard}>
            <View style={styles.tipHeader}>
              <MaterialIcons name="lightbulb" size={20} color="#d97706" />
              <Text style={styles.tipLabel}>DAILY HEALTH TIP</Text>
              {tipData.aiGenerated && (
                <View style={styles.aiTag}>
                  <Text style={styles.aiTagText}>AI</Text>
                </View>
              )}
            </View>
            <Text style={styles.tipText}>{tipData.tip}</Text>
          </View>
        ) : null}

        <StateView loading={loading} error={error} onRetry={refresh}>
          {/* Stats Grid */}
          {statEntries.length > 0 && (
            <View style={styles.statsGrid}>
              {statEntries.map(([key, val]) => (
                <View key={key} style={styles.statCard}>
                  <Text style={styles.statVal}>{String(val ?? 0)}</Text>
                  <Text style={styles.statKey}>
                    {key.replace(/([A-Z])/g, ' $1').toUpperCase()}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* AI Summary */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="auto-awesome" size={20} color={Colors.primary} />
              <Text style={styles.sectionTitle}>AI Health Summary</Text>
            </View>
            <Text style={styles.bodyText}>{summary}</Text>
          </View>

          {/* Highlights */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="stars" size={20} color={Colors.secondary} />
              <Text style={styles.sectionTitle}>Key Highlights</Text>
            </View>
            {highlights.length === 0 ? (
              <Text style={styles.emptyItemText}>No highlights recorded for {month}.</Text>
            ) : (
              highlights.map((item, idx) => (
                <View key={idx} style={styles.bulletRow}>
                  <View style={[styles.bulletDot, { backgroundColor: Colors.primary }]} />
                  <Text style={styles.bulletText}>{item}</Text>
                </View>
              ))
            )}
          </View>

          {/* Recommendations */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="verified" size={20} color={Colors.tertiary} />
              <Text style={styles.sectionTitle}>Recommendations</Text>
            </View>
            {recommendations.length === 0 ? (
              <Text style={styles.emptyItemText}>No special recommendations for this period.</Text>
            ) : (
              recommendations.map((rec, idx) => (
                <View key={idx} style={styles.bulletRow}>
                  <MaterialIcons name="check-circle-outline" size={18} color={Colors.primary} />
                  <Text style={styles.bulletText}>{rec}</Text>
                </View>
              ))
            )}
          </View>
        </StateView>

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm },
  monthBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
    marginBottom: Spacing.lg,
    ...Shadows.subtle,
  },
  monthBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${Colors.primary}12`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  monthTitle: {
    ...Typography.titleSmall,
    fontSize: 16,
    color: Colors.onSurface,
  },
  monthCode: {
    ...Typography.bodySmall,
    color: Colors.onSurfaceVariant,
  },
  tipCard: {
    backgroundColor: '#fef3c7',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  tipLabel: {
    ...Typography.labelSmall,
    color: '#92400e',
    flex: 1,
  },
  aiTag: {
    backgroundColor: '#d97706',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  aiTagText: {
    ...Typography.labelSmall,
    color: Colors.white,
    fontSize: 9,
  },
  tipText: {
    ...Typography.bodyMedium,
    color: '#78350f',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  statCard: {
    width: '47%',
    flexGrow: 1,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    ...Shadows.subtle,
  },
  statVal: {
    ...Typography.headlineSmall,
    fontFamily: 'Manrope_700Bold',
    color: Colors.primary,
  },
  statKey: {
    ...Typography.labelSmall,
    color: Colors.onSurfaceVariant,
    marginTop: 4,
    textAlign: 'center',
  },
  sectionCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.subtle,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.titleSmall,
    fontSize: 16,
    color: Colors.onSurface,
  },
  bodyText: {
    ...Typography.bodyMedium,
    color: Colors.onSurfaceVariant,
    lineHeight: 22,
  },
  emptyItemText: {
    ...Typography.bodySmall,
    color: Colors.onSurfaceVariant,
    fontStyle: 'italic',
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 8,
  },
  bulletDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginTop: 7,
  },
  bulletText: {
    ...Typography.bodyMedium,
    color: Colors.onSurface,
    flex: 1,
  },
});

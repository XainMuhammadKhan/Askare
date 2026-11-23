import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows, FontFamily } from '../../../theme';
import { hospitalAdminService } from '../../../api';
import { useApi } from '../../../hooks/useApi';
import { StateView } from '../../../components/StateView';
import { formatMoney, doctorName } from '../../../utils/format';
import { useAuthStore } from '../../../store/authStore';
import {
  AdminHeader,
  StatCard,
  SectionHeader,
  StatusBadge,
} from '../components';

export const HospitalDashboardScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const user = useAuthStore((s) => s.user);
  const {
    data: dashboard,
    loading: dashLoading,
    error: dashError,
    refresh: refreshDash,
  } = useApi(() => hospitalAdminService.dashboard(), []);

  const {
    data: insights,
    loading: insightsLoading,
    refresh: refreshInsights,
  } = useApi(() => hospitalAdminService.insights(), []);

  const handleRefresh = async () => {
    await Promise.all([refreshDash(), refreshInsights()]);
  };

  const stats = dashboard?.stats ?? dashboard ?? {};
  const busiestDoctors: any[] = Array.isArray(dashboard?.busiestDoctors) ? dashboard.busiestDoctors : [];
  const monthly: any[] = Array.isArray(dashboard?.monthly) ? dashboard.monthly : [];

  const metrics = insights?.metrics ?? insights?.stats ?? {};
  const observations: any[] = Array.isArray(insights?.observations)
    ? insights.observations
    : Array.isArray(insights?.highlights)
    ? insights.highlights
    : [];
  const suggestions: any[] = Array.isArray(insights?.suggestions)
    ? insights.suggestions
    : Array.isArray(insights?.recommendations)
    ? insights.recommendations
    : [];
  const aiSummary: string | null =
    typeof insights?.summary === 'string'
      ? insights.summary
      : typeof insights?.aiSummary === 'string'
      ? insights.aiSummary
      : null;

  const quickLinks: {
    label: string;
    subtitle: string;
    icon: keyof typeof MaterialIcons.glyphMap;
    color: string;
    onPress: () => void;
  }[] = [
    {
      label: 'Doctors',
      subtitle: 'Approvals & directory',
      icon: 'medical-services',
      color: Colors.primary,
      onPress: () => navigation.navigate('Doctors'),
    },
    {
      label: 'Appointments',
      subtitle: 'Reassign & manage',
      icon: 'event-note',
      color: Colors.secondary,
      onPress: () => navigation.navigate('Appointments'),
    },
    {
      label: 'Departments',
      subtitle: 'Units & assignments',
      icon: 'domain',
      color: '#0284c7',
      onPress: () => navigation.navigate('More', { section: 'departments' }),
    },
    {
      label: 'Revenue',
      subtitle: 'Doctor breakdown',
      icon: 'payments',
      color: '#15803d',
      onPress: () => navigation.navigate('More', { section: 'revenue' }),
    },
    {
      label: 'Patients',
      subtitle: 'Hospital directory',
      icon: 'groups',
      color: Colors.tertiary,
      onPress: () => navigation.navigate('More', { section: 'patients' }),
    },
    {
      label: 'Hospital Profile',
      subtitle: 'Contact & address',
      icon: 'local-hospital',
      color: '#7c3aed',
      onPress: () => navigation.navigate('More', { section: 'profile' }),
    },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AdminHeader
        title={user?.hospital?.name ?? dashboard?.hospital?.name ?? 'Hospital Portal'}
        subtitle={`Signed in as ${user?.name ?? 'Hospital Admin'}`}
        badgeText="HOSPITAL ADMIN"
        onNotificationsPress={() => navigation.navigate('Notifications')}
        onRefresh={handleRefresh}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={dashLoading && !!dashboard}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
          />
        }
      >
        <StateView loading={dashLoading && !dashboard} error={dashError} onRetry={handleRefresh}>
          {/* Pending approvals banner */}
          {Number(stats?.pendingApprovals ?? 0) > 0 ? (
            <TouchableOpacity
              style={styles.alertBanner}
              onPress={() => navigation.navigate('Doctors', { filter: 'PENDING' })}
              activeOpacity={0.85}
            >
              <View style={styles.alertIconWrap}>
                <MaterialIcons name="pending-actions" size={22} color="#b45309" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.alertTitle}>
                  {stats.pendingApprovals} Doctor Approval{stats.pendingApprovals === 1 ? '' : 's'} Waiting
                </Text>
                <Text style={styles.alertSubtitle}>
                  Review credentials and approve or reject waiting doctors.
                </Text>
              </View>
              <MaterialIcons name="arrow-forward-ios" size={16} color="#b45309" />
            </TouchableOpacity>
          ) : null}

          {/* Stats Grid */}
          <SectionHeader title="Hospital Overview" subtitle="Live operational metrics" />
          <View style={styles.statsGrid}>
            <StatCard
              style={styles.gridItem}
              label="Active Doctors"
              value={stats?.activeDoctors ?? 0}
              subtitle={`${stats?.inactiveDoctors ?? 0} inactive`}
              icon="medical-services"
              accentColor={Colors.primary}
              onPress={() => navigation.navigate('Doctors')}
            />
            <StatCard
              style={styles.gridItem}
              label="Pending Approvals"
              value={stats?.pendingApprovals ?? 0}
              subtitle="Doctor queue"
              icon="verified-user"
              accentColor="#b45309"
              onPress={() => navigation.navigate('Doctors')}
            />
            <StatCard
              style={styles.gridItem}
              label="Today's Visits"
              value={stats?.todaysAppointments ?? 0}
              subtitle={`${stats?.appointmentsThisMonth ?? 0} this month`}
              icon="today"
              accentColor={Colors.secondary}
              onPress={() => navigation.navigate('Appointments')}
            />
            <StatCard
              style={styles.gridItem}
              label="Total Patients"
              value={stats?.totalPatients ?? 0}
              subtitle="Seen at hospital"
              icon="people-outline"
              accentColor={Colors.tertiary}
              onPress={() => navigation.navigate('More', { section: 'patients' })}
            />
          </View>

          {/* Monthly Revenue Hero Card */}
          <TouchableOpacity
            style={styles.revenueHero}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('More', { section: 'revenue' })}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.revenueHeroLabel}>REVENUE THIS MONTH</Text>
              <Text style={styles.revenueHeroValue}>
                {formatMoney(stats?.revenueThisMonth ?? 0)}
              </Text>
              <Text style={styles.revenueHeroSub}>
                {stats?.appointmentsThisMonth ?? 0} consultations recorded this month
              </Text>
            </View>
            <View style={styles.revenueHeroIcon}>
              <MaterialIcons name="trending-up" size={28} color={Colors.onPrimary} />
            </View>
          </TouchableOpacity>

          {/* Quick Navigation */}
          <SectionHeader title="Quick Navigation" subtitle="Jump directly to hospital modules" />
          <View style={styles.quickGrid}>
            {quickLinks.map((q) => (
              <TouchableOpacity
                key={q.label}
                style={styles.quickCard}
                onPress={q.onPress}
                activeOpacity={0.78}
              >
                <View style={[styles.quickIcon, { backgroundColor: `${q.color}15` }]}>
                  <MaterialIcons name={q.icon} size={20} color={q.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.quickLabel} numberOfLines={1}>{q.label}</Text>
                  <Text style={styles.quickSub} numberOfLines={1}>{q.subtitle}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* 30-Day Insights & AI Summary */}
          <SectionHeader
            title="30-Day Hospital Insights"
            subtitle={insights?.aiGenerated ? 'AI-assisted clinical & operational analysis' : 'Last 30 days performance analysis'}
          />
          <View style={styles.insightsCard}>
            <View style={styles.insightsHeaderRow}>
              <View style={styles.aiTag}>
                <MaterialIcons name="auto-awesome" size={14} color={Colors.primary} />
                <Text style={styles.aiTagText}>
                  {insights?.aiGenerated ? 'AI INSIGHTS' : '30-DAY ANALYTICS'}
                </Text>
              </View>
              {insightsLoading ? (
                <Text style={styles.insightsMetaText}>Refreshing...</Text>
              ) : null}
            </View>

            {/* 30-day metrics pills */}
            {metrics && Object.keys(metrics).length > 0 ? (
              <View style={styles.metricsRow}>
                {metrics.totalAppointments !== undefined ? (
                  <View style={styles.metricPill}>
                    <Text style={styles.metricPillVal}>{metrics.totalAppointments}</Text>
                    <Text style={styles.metricPillLbl}>Visits (30d)</Text>
                  </View>
                ) : null}
                {metrics.completedAppointments !== undefined || metrics.completed !== undefined ? (
                  <View style={styles.metricPill}>
                    <Text style={styles.metricPillVal}>
                      {metrics.completedAppointments ?? metrics.completed ?? 0}
                    </Text>
                    <Text style={styles.metricPillLbl}>Completed</Text>
                  </View>
                ) : null}
                {metrics.cancelledAppointments !== undefined || metrics.cancelled !== undefined ? (
                  <View style={styles.metricPill}>
                    <Text style={styles.metricPillVal}>
                      {metrics.cancelledAppointments ?? metrics.cancelled ?? 0}
                    </Text>
                    <Text style={styles.metricPillLbl}>Cancelled</Text>
                  </View>
                ) : null}
                {metrics.revenue !== undefined || metrics.totalRevenue !== undefined ? (
                  <View style={styles.metricPill}>
                    <Text style={styles.metricPillVal}>
                      {formatMoney(metrics.revenue ?? metrics.totalRevenue ?? 0)}
                    </Text>
                    <Text style={styles.metricPillLbl}>30d Revenue</Text>
                  </View>
                ) : null}
              </View>
            ) : null}

            {aiSummary ? (
              <Text style={styles.aiSummaryText}>{aiSummary}</Text>
            ) : (
              <Text style={styles.aiSummaryText}>
                Operational metrics for the last 30 days are tracked below.
              </Text>
            )}

            {observations.length > 0 ? (
              <View style={styles.bulletSection}>
                <Text style={styles.bulletHeading}>KEY OBSERVATIONS</Text>
                {observations.map((obs, idx) => {
                  const text = typeof obs === 'string' ? obs : obs?.message ?? obs?.title ?? JSON.stringify(obs);
                  return (
                    <View key={idx} style={styles.bulletRow}>
                      <MaterialIcons name="fiber-manual-record" size={8} color={Colors.primary} style={{ marginTop: 6 }} />
                      <Text style={styles.bulletText}>{text}</Text>
                    </View>
                  );
                })}
              </View>
            ) : null}

            {suggestions.length > 0 ? (
              <View style={styles.bulletSection}>
                <Text style={styles.bulletHeading}>RECOMMENDATIONS</Text>
                {suggestions.map((sug, idx) => {
                  const text = typeof sug === 'string' ? sug : sug?.message ?? sug?.title ?? JSON.stringify(sug);
                  return (
                    <View key={idx} style={styles.bulletRow}>
                      <MaterialIcons name="lightbulb-outline" size={15} color="#b45309" style={{ marginTop: 2 }} />
                      <Text style={styles.bulletText}>{text}</Text>
                    </View>
                  );
                })}
              </View>
            ) : null}
          </View>

          {/* Busiest Doctors */}
          {busiestDoctors.length > 0 ? (
            <>
              <SectionHeader
                title="Busiest Doctors"
                subtitle="Top performing specialists at your hospital"
                actionLabel="All Doctors"
                onActionPress={() => navigation.navigate('Doctors')}
              />
              <View style={styles.listCard}>
                {busiestDoctors.map((doc, idx) => (
                  <View
                    key={doc?.id ?? idx}
                    style={[
                      styles.doctorRow,
                      idx < busiestDoctors.length - 1 && styles.rowBorder,
                    ]}
                  >
                    <View style={styles.rankCircle}>
                      <Text style={styles.rankText}>#{idx + 1}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.doctorNameText}>
                        {doctorName(doc?.name ?? doc?.doctor?.name ?? 'Doctor')}
                      </Text>
                      <Text style={styles.doctorMetaText}>
                        {doc?.specialization ?? doc?.department?.name ?? 'Specialist'} •{' '}
                        {doc?.appointments ?? doc?.appointmentCount ?? doc?.count ?? 0} visits
                      </Text>
                    </View>
                    {doc?.revenue !== undefined ? (
                      <Text style={styles.doctorRevenueText}>{formatMoney(doc.revenue)}</Text>
                    ) : (
                      <StatusBadge status={doc?.status ?? 'ACTIVE'} />
                    )}
                  </View>
                ))}
              </View>
            </>
          ) : null}

          {/* Monthly Trend */}
          {monthly.length > 0 ? (
            <>
              <SectionHeader title="Monthly Trend" subtitle="Appointments & revenue history" />
              <View style={styles.listCard}>
                {monthly.slice(-6).map((m, idx, arr) => (
                  <View
                    key={m?.month ?? idx}
                    style={[styles.monthRow, idx < arr.length - 1 && styles.rowBorder]}
                  >
                    <Text style={styles.monthLabel}>{m?.month ?? `Month ${idx + 1}`}</Text>
                    <Text style={styles.monthCount}>{m?.appointments ?? m?.count ?? 0} visits</Text>
                    <Text style={styles.monthRevenue}>{formatMoney(m?.revenue ?? m?.earnings ?? 0)}</Text>
                  </View>
                ))}
              </View>
            </>
          ) : null}
        </StateView>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing['4xl'],
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: '#fef3c7',
    borderWidth: 1,
    borderColor: '#fde68a',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginTop: Spacing.md,
  },
  alertIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fde68a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertTitle: {
    ...Typography.titleSmall,
    fontFamily: FontFamily.bold,
    color: '#92400e',
  },
  alertSubtitle: {
    ...Typography.bodySmall,
    color: '#b45309',
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: Spacing.sm,
  },
  gridItem: {
    width: '48.5%',
  },
  revenueHero: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginTop: Spacing.md,
    ...Shadows.card,
  },
  revenueHeroLabel: {
    ...Typography.labelSmall,
    color: Colors.primaryContainer,
  },
  revenueHeroValue: {
    ...Typography.headlineSmall,
    fontFamily: FontFamily.extraBold,
    color: Colors.onPrimary,
    marginTop: 4,
  },
  revenueHeroSub: {
    ...Typography.bodySmall,
    color: Colors.onPrimary,
    opacity: 0.85,
    marginTop: 4,
  },
  revenueHeroIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: Spacing.sm,
  },
  quickCard: {
    width: '48.5%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHigh,
  },
  quickIcon: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: {
    ...Typography.titleSmall,
    color: Colors.onSurface,
    fontSize: 13,
  },
  quickSub: {
    ...Typography.bodySmall,
    color: Colors.onSurfaceVariant,
    fontSize: 11,
  },
  insightsCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHigh,
    ...Shadows.subtle,
  },
  insightsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  aiTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: `${Colors.primary}14`,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  aiTagText: {
    ...Typography.labelSmall,
    color: Colors.primary,
  },
  insightsMetaText: {
    ...Typography.bodySmall,
    color: Colors.onSurfaceVariant,
  },
  metricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  metricPill: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minWidth: '30%',
  },
  metricPillVal: {
    ...Typography.titleSmall,
    fontFamily: FontFamily.bold,
    color: Colors.onSurface,
  },
  metricPillLbl: {
    ...Typography.bodySmall,
    color: Colors.onSurfaceVariant,
    fontSize: 11,
  },
  aiSummaryText: {
    ...Typography.bodyMedium,
    color: Colors.onSurface,
    lineHeight: 21,
  },
  bulletSection: {
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceContainerHigh,
    gap: 6,
  },
  bulletHeading: {
    ...Typography.labelSmall,
    color: Colors.onSurfaceVariant,
    marginBottom: 2,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  bulletText: {
    ...Typography.bodySmall,
    color: Colors.onSurface,
    flex: 1,
    lineHeight: 18,
  },
  listCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHigh,
    overflow: 'hidden',
  },
  doctorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.md,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceContainerHigh,
  },
  rankCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${Colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    ...Typography.labelMedium,
    color: Colors.primary,
  },
  doctorNameText: {
    ...Typography.titleSmall,
    color: Colors.onSurface,
  },
  doctorMetaText: {
    ...Typography.bodySmall,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  doctorRevenueText: {
    ...Typography.titleSmall,
    fontFamily: FontFamily.bold,
    color: Colors.primary,
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  monthLabel: {
    ...Typography.bodyMedium,
    fontFamily: FontFamily.semiBold,
    color: Colors.onSurface,
    flex: 1,
  },
  monthCount: {
    ...Typography.bodySmall,
    color: Colors.onSurfaceVariant,
    marginRight: Spacing.md,
  },
  monthRevenue: {
    ...Typography.titleSmall,
    fontFamily: FontFamily.bold,
    color: Colors.primary,
  },
});

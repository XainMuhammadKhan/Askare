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
import { superAdminService } from '../../../api';
import { useApi } from '../../../hooks/useApi';
import { StateView } from '../../../components/StateView';
import { formatMoney } from '../../../utils/format';
import { useAuthStore } from '../../../store/authStore';
import {
  AdminHeader,
  StatCard,
  SectionHeader,
  StatusBadge,
} from '../components';

export const SuperDashboardScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const user = useAuthStore((s) => s.user);

  const {
    data: dashboard,
    loading: dashLoading,
    error: dashError,
    refresh: refreshDash,
  } = useApi(() => superAdminService.dashboard(), []);

  const {
    data: health,
    refresh: refreshHealth,
  } = useApi(() => superAdminService.systemHealth(), []);

  const {
    data: aiUsage,
    refresh: refreshAi,
  } = useApi(() => superAdminService.aiUsage(), []);

  const handleRefresh = async () => {
    await Promise.all([refreshDash(), refreshHealth(), refreshAi()]);
  };

  const stats = dashboard?.stats ?? dashboard ?? {};
  const topSpecs: any[] = Array.isArray(dashboard?.topSpecializations)
    ? dashboard.topSpecializations
    : [];
  const monthly: any[] = Array.isArray(dashboard?.monthly) ? dashboard.monthly : [];

  const hospitalsCount =
    typeof stats?.hospitals === 'object'
      ? stats.hospitals?.total ?? stats.hospitals?.active ?? 0
      : stats?.hospitals ?? stats?.totalHospitals ?? 0;

  const doctorsCount =
    typeof stats?.doctors === 'object'
      ? stats.doctors?.total ?? (Number(stats.doctors?.private ?? 0) + Number(stats.doctors?.hospital ?? 0))
      : stats?.doctors ?? stats?.totalDoctors ?? 0;

  const doctorSub =
    typeof stats?.doctors === 'object'
      ? `${stats.doctors?.private ?? 0} private • ${stats.doctors?.hospital ?? 0} hospital`
      : `${stats?.privateDoctors ?? 0} private • ${stats?.hospitalDoctors ?? 0} hospital`;

  const pendingApprovals =
    stats?.pendingApprovals ??
    stats?.doctors?.pending ??
    stats?.pendingDoctors ??
    0;

  const patientsCount =
    typeof stats?.patients === 'object'
      ? stats.patients?.total ?? stats.patients?.active ?? 0
      : stats?.patients ?? stats?.totalPatients ?? 0;

  const appointmentsCount =
    typeof stats?.appointments === 'object'
      ? stats.appointments?.total ?? 0
      : stats?.appointments ?? stats?.totalAppointments ?? 0;

  const totalRevenue =
    typeof stats?.revenue === 'object'
      ? stats.revenue?.total ?? stats.revenue?.gross ?? 0
      : stats?.revenue ?? stats?.totalRevenue ?? 0;

  const totalCommission =
    typeof stats?.commission === 'object'
      ? stats.commission?.total ?? 0
      : stats?.commission ?? stats?.totalCommission ?? 0;

  // System Health extraction
  const dbStatus = health?.database?.status ?? health?.database ?? (health ? 'OK' : 'CHECKING');
  const redisStatus = health?.redis?.status ?? health?.redis ?? 'OK';
  const aiProvider = health?.ai?.provider ?? health?.aiProvider ?? aiUsage?.provider ?? 'Configured';
  const uptimeSeconds = Number(health?.uptime ?? health?.uptimeSeconds ?? 0);
  const uptimeHours = uptimeSeconds > 0 ? `${(uptimeSeconds / 3600).toFixed(1)}h` : 'Online';

  // AI usage extraction
  const aiTotal =
    aiUsage?.requestsThisMonth ??
    aiUsage?.totalRequests ??
    aiUsage?.total ??
    stats?.aiUsage?.total ??
    0;
  const aiFailures = aiUsage?.failures ?? aiUsage?.failedRequests ?? 0;
  const aiEmergencies = aiUsage?.emergencyFlags ?? aiUsage?.emergencies ?? 0;
  const aiFeatures: any[] = Array.isArray(aiUsage?.byFeature)
    ? aiUsage.byFeature
    : Array.isArray(aiUsage?.features)
    ? aiUsage.features
    : [];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AdminHeader
        title="AskCare Control Center"
        subtitle={`Super Admin • ${user?.name ?? 'Platform Owner'}`}
        badgeText="SUPER ADMIN"
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
          {/* Revenue & Commission Hero */}
          <View style={styles.heroCard}>
            <View style={styles.heroTop}>
              <View>
                <Text style={styles.heroLabel}>PLATFORM GROSS REVENUE</Text>
                <Text style={styles.heroValue}>{formatMoney(totalRevenue)}</Text>
              </View>
              <View style={styles.heroIconWrap}>
                <MaterialIcons name="account-balance" size={26} color={Colors.onPrimary} />
              </View>
            </View>
            <View style={styles.heroDivider} />
            <View style={styles.heroBottom}>
              <View>
                <Text style={styles.heroSubLabel}>Platform Commission Earned</Text>
                <Text style={styles.heroSubValue}>{formatMoney(totalCommission)}</Text>
              </View>
              <TouchableOpacity
                style={styles.heroAction}
                onPress={() => navigation.navigate('More', { section: 'payouts' })}
              >
                <Text style={styles.heroActionText}>Payouts & Refunds</Text>
                <MaterialIcons name="arrow-forward" size={14} color={Colors.onPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Primary Metrics Grid */}
          <SectionHeader title="Platform Metrics" subtitle="Live network-wide statistics" />
          <View style={styles.statsGrid}>
            <StatCard
              style={styles.gridItem}
              label="Hospitals"
              value={hospitalsCount}
              subtitle="Partner clinics"
              icon="local-hospital"
              accentColor={Colors.primary}
              onPress={() => navigation.navigate('Hospitals')}
            />
            <StatCard
              style={styles.gridItem}
              label="Doctors"
              value={doctorsCount}
              subtitle={doctorSub}
              icon="medical-services"
              accentColor={Colors.secondary}
              onPress={() => navigation.navigate('Doctors')}
            />
            <StatCard
              style={styles.gridItem}
              label="Pending Approvals"
              value={pendingApprovals}
              subtitle="Doctor verification"
              icon="verified-user"
              accentColor="#b45309"
              onPress={() => navigation.navigate('Doctors')}
            />
            <StatCard
              style={styles.gridItem}
              label="Patients"
              value={patientsCount}
              subtitle={`${appointmentsCount} total bookings`}
              icon="groups"
              accentColor={Colors.tertiary}
              onPress={() => navigation.navigate('More', { section: 'patients' })}
            />
          </View>

          {/* System Health Panel */}
          <SectionHeader
            title="System Health & Infrastructure"
            subtitle={`Uptime: ${uptimeHours} • Services & integrations`}
          />
          <View style={styles.card}>
            <View style={styles.healthRow}>
              <View style={styles.healthItem}>
                <MaterialIcons name="storage" size={18} color={Colors.primary} />
                <Text style={styles.healthLabel}>Database</Text>
                <StatusBadge status={String(dbStatus)} />
              </View>
              <View style={styles.healthItem}>
                <MaterialIcons name="memory" size={18} color={Colors.secondary} />
                <Text style={styles.healthLabel}>Redis Cache</Text>
                <StatusBadge status={String(redisStatus)} />
              </View>
            </View>
            <View style={[styles.healthRow, { marginTop: Spacing.sm }]}>
              <View style={styles.healthItem}>
                <MaterialIcons name="auto-awesome" size={18} color="#7c3aed" />
                <Text style={styles.healthLabel}>AI Engine</Text>
                <StatusBadge status="ACTIVE" label={String(aiProvider)} />
              </View>
              <View style={styles.healthItem}>
                <MaterialIcons name="credit-card" size={18} color="#15803d" />
                <Text style={styles.healthLabel}>Stripe / Email</Text>
                <StatusBadge
                  status={
                    health?.stripe === false || health?.config?.stripe === false
                      ? 'INACTIVE'
                      : 'ACTIVE'
                  }
                />
              </View>
            </View>
          </View>

          {/* AI Usage Telemetry */}
          <SectionHeader
            title="AI Clinical Assistant Telemetry"
            subtitle="Monthly request volume, emergency flags & latency"
          />
          <View style={styles.card}>
            <View style={styles.aiMetricsRow}>
              <View style={styles.aiMetricBox}>
                <Text style={styles.aiMetricValue}>{aiTotal}</Text>
                <Text style={styles.aiMetricLabel}>Requests (30d)</Text>
              </View>
              <View style={styles.aiMetricBox}>
                <Text style={[styles.aiMetricValue, { color: '#b45309' }]}>
                  {aiEmergencies}
                </Text>
                <Text style={styles.aiMetricLabel}>Emergency Flags</Text>
              </View>
              <View style={styles.aiMetricBox}>
                <Text style={[styles.aiMetricValue, { color: Colors.error }]}>
                  {aiFailures}
                </Text>
                <Text style={styles.aiMetricLabel}>Failures / 503s</Text>
              </View>
            </View>

            {aiFeatures.length > 0 ? (
              <View style={styles.featureList}>
                {aiFeatures.map((f, idx) => (
                  <View key={f?.feature ?? idx} style={styles.featureRow}>
                    <Text style={styles.featureName}>
                      {String(f?.feature ?? f?.name ?? `Feature ${idx + 1}`).replace(/_/g, ' ')}
                    </Text>
                    <Text style={styles.featureMeta}>
                      {f?.count ?? f?.requests ?? 0} reqs
                      {f?.avgLatencyMs ? ` • ${Math.round(f.avgLatencyMs)}ms` : ''}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>

          {/* Top Specializations */}
          {topSpecs.length > 0 ? (
            <>
              <SectionHeader
                title="Top Specializations"
                subtitle="Most demanded clinical specialties"
                actionLabel="Manage"
                onActionPress={() => navigation.navigate('More', { section: 'specializations' })}
              />
              <View style={styles.card}>
                {topSpecs.slice(0, 6).map((sp, idx) => (
                  <View
                    key={sp?.id ?? sp?.name ?? idx}
                    style={[
                      styles.specRow,
                      idx < Math.min(topSpecs.length, 6) - 1 && styles.rowBorder,
                    ]}
                  >
                    <Text style={styles.specName}>{sp?.name ?? 'Specialization'}</Text>
                    <Text style={styles.specCount}>
                      {sp?.doctorCount ?? sp?.doctors ?? sp?.appointments ?? sp?.count ?? 0} doctors
                    </Text>
                  </View>
                ))}
              </View>
            </>
          ) : null}

          {/* 12-Month Trend */}
          {monthly.length > 0 ? (
            <>
              <SectionHeader title="Monthly Platform Growth" subtitle="Consultations & revenue" />
              <View style={styles.card}>
                {monthly.slice(-6).map((m, idx, arr) => (
                  <View
                    key={m?.month ?? idx}
                    style={[styles.specRow, idx < arr.length - 1 && styles.rowBorder]}
                  >
                    <Text style={styles.specName}>{m?.month ?? `Month ${idx + 1}`}</Text>
                    <Text style={styles.featureMeta}>
                      {m?.appointments ?? m?.count ?? 0} visits
                    </Text>
                    <Text style={styles.specCount}>
                      {formatMoney(m?.revenue ?? m?.gross ?? 0)}
                    </Text>
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
  heroCard: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginTop: Spacing.md,
    ...Shadows.card,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroLabel: {
    ...Typography.labelSmall,
    color: Colors.primaryContainer,
  },
  heroValue: {
    ...Typography.headlineSmall,
    fontFamily: FontFamily.extraBold,
    color: Colors.onPrimary,
    marginTop: 4,
  },
  heroIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.18)',
    marginVertical: Spacing.md,
  },
  heroBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroSubLabel: {
    ...Typography.bodySmall,
    color: Colors.primaryContainer,
    fontSize: 11,
  },
  heroSubValue: {
    ...Typography.titleMedium,
    fontFamily: FontFamily.bold,
    color: Colors.onPrimary,
  },
  heroAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
  },
  heroActionText: {
    ...Typography.labelSmall,
    color: Colors.onPrimary,
    textTransform: 'none',
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
  card: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHigh,
    ...Shadows.subtle,
  },
  healthRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  healthItem: {
    flex: 1,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: 6,
  },
  healthLabel: {
    ...Typography.bodySmall,
    fontFamily: FontFamily.semiBold,
    color: Colors.onSurface,
  },
  aiMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  aiMetricBox: {
    flex: 1,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
  },
  aiMetricValue: {
    ...Typography.titleLarge,
    fontFamily: FontFamily.bold,
    color: Colors.primary,
  },
  aiMetricLabel: {
    ...Typography.bodySmall,
    color: Colors.onSurfaceVariant,
    fontSize: 11,
    marginTop: 2,
    textAlign: 'center',
  },
  featureList: {
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceContainerHigh,
    gap: 8,
  },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featureName: {
    ...Typography.bodySmall,
    fontFamily: FontFamily.semiBold,
    color: Colors.onSurface,
    textTransform: 'capitalize',
  },
  featureMeta: {
    ...Typography.bodySmall,
    color: Colors.onSurfaceVariant,
  },
  specRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceContainerHigh,
  },
  specName: {
    ...Typography.bodyMedium,
    fontFamily: FontFamily.semiBold,
    color: Colors.onSurface,
  },
  specCount: {
    ...Typography.bodySmall,
    fontFamily: FontFamily.bold,
    color: Colors.primary,
  },
});

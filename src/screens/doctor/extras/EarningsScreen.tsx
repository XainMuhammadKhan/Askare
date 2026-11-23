import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../../theme';
import { Header, InputField, PrimaryButton, StateView } from '../../../components';
import { doctorService } from '../../../api';
import { useApi } from '../../../hooks/useApi';
import { formatDate, formatMoney } from '../../../utils/format';

type Props = { navigation: NativeStackNavigationProp<any> };

const PAYOUT_METHODS = ['BANK_TRANSFER', 'EASYPAISA', 'JAZZCASH'] as const;

export const EarningsScreen: React.FC<Props> = ({ navigation }) => {
  const {
    data: earningsData,
    loading: earnLoading,
    error: earnError,
    refresh: refreshEarnings,
  } = useApi(() => doctorService.earnings(), []);

  const {
    data: payoutsData,
    loading: payLoading,
    error: payError,
    refresh: refreshPayouts,
  } = useApi(() => doctorService.payouts(), []);

  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<string>('BANK_TRANSFER');
  const [requesting, setRequesting] = useState(false);

  const totals = earningsData?.totals ?? { gross: 0, commission: 0, net: 0, count: 0 };
  const appointments: any[] = Array.isArray(earningsData?.items)
    ? earningsData.items
    : Array.isArray(earningsData?.appointments)
    ? earningsData.appointments
    : [];

  const totalEarned = payoutsData?.totalEarned ?? totals.net ?? 0;
  const paidOut = payoutsData?.paidOut ?? 0;
  const pending = payoutsData?.pending ?? 0;
  const available = payoutsData?.available ?? 0;
  const minimum = payoutsData?.minimum ?? 1000;
  const payoutHistory: any[] = Array.isArray(payoutsData?.history)
    ? payoutsData.history
    : Array.isArray(payoutsData?.items)
    ? payoutsData.items
    : [];

  const handleRequestPayout = async () => {
    const num = Number(amount);
    if (!num || num <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid payout amount.');
      return;
    }
    setRequesting(true);
    try {
      await doctorService.requestPayout(num, method);
      setAmount('');
      Alert.alert('Payout Requested', 'Your payout request has been submitted.');
      await Promise.all([refreshPayouts(), refreshEarnings()]);
    } catch (e: any) {
      Alert.alert('Payout Error', e?.message ?? 'Unable to request payout.');
    } finally {
      setRequesting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Earnings & Payouts"
        showBack
        onBack={() => navigation.goBack()}
        onNotification={() => navigation.navigate('Notifications')}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Earnings Summary */}
        <Text style={styles.sectionLabel}>EARNINGS BREAKDOWN</Text>
        <View style={styles.grid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>GROSS</Text>
            <Text style={styles.statValue}>{formatMoney(totals.gross)}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>COMMISSION</Text>
            <Text style={[styles.statValue, { color: Colors.tertiary }]}>
              {formatMoney(totals.commission)}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>NET EARNED</Text>
            <Text style={[styles.statValue, { color: Colors.primary }]}>
              {formatMoney(totals.net)}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>CONSULTATIONS</Text>
            <Text style={styles.statValue}>{totals.count}</Text>
          </View>
        </View>

        {/* Payout Balance */}
        <Text style={styles.sectionLabel}>PAYOUT BALANCE</Text>
        <View style={styles.payoutBalanceCard}>
          <View style={styles.balanceRow}>
            <View>
              <Text style={styles.statLabel}>AVAILABLE TO WITHDRAW</Text>
              <Text style={styles.availableValue}>{formatMoney(available)}</Text>
            </View>
            <View style={styles.minBadge}>
              <Text style={styles.minBadgeText}>Min: {formatMoney(minimum)}</Text>
            </View>
          </View>
          <View style={styles.subBalances}>
            <View>
              <Text style={styles.subLabel}>Total Earned</Text>
              <Text style={styles.subVal}>{formatMoney(totalEarned)}</Text>
            </View>
            <View>
              <Text style={styles.subLabel}>Paid Out</Text>
              <Text style={styles.subVal}>{formatMoney(paidOut)}</Text>
            </View>
            <View>
              <Text style={styles.subLabel}>Pending</Text>
              <Text style={styles.subVal}>{formatMoney(pending)}</Text>
            </View>
          </View>
        </View>

        {/* Request Payout Form */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Request Payout</Text>
          <InputField
            label="AMOUNT"
            placeholder={`Minimum ${minimum}`}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />
          <Text style={styles.methodLabel}>PAYOUT METHOD</Text>
          <View style={styles.methodsRow}>
            {PAYOUT_METHODS.map((m) => {
              const active = method === m;
              return (
                <TouchableOpacity
                  key={m}
                  style={[styles.methodChip, active && styles.methodChipActive]}
                  onPress={() => setMethod(m)}
                >
                  <Text style={[styles.methodChipText, active && styles.methodChipTextActive]}>
                    {m.replace('_', ' ')}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <PrimaryButton
            title="Submit Payout Request"
            onPress={handleRequestPayout}
            loading={requesting}
          />
        </View>

        {/* Payout History */}
        <Text style={styles.sectionLabel}>PAYOUT HISTORY</Text>
        <StateView
          loading={payLoading}
          error={payError}
          empty={!payLoading && payoutHistory.length === 0}
          emptyText="No payout requests yet."
          onRetry={refreshPayouts}
        >
          {payoutHistory.map((p: any, idx: number) => (
            <View key={p.id ?? idx} style={styles.rowCard}>
              <MaterialIcons name="account-balance-wallet" size={22} color={Colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{formatMoney(p.amount)}</Text>
                <Text style={styles.rowSub}>
                  {p.method || 'Payout'} • {formatDate(p.createdAt)}
                </Text>
              </View>
              <View style={styles.statusChip}>
                <Text style={styles.statusChipText}>{p.status || 'REQUESTED'}</Text>
              </View>
            </View>
          ))}
        </StateView>

        {/* Per-Appointment Earnings */}
        <Text style={[styles.sectionLabel, { marginTop: Spacing.lg }]}>
          APPOINTMENT EARNINGS
        </Text>
        <StateView
          loading={earnLoading}
          error={earnError}
          empty={!earnLoading && appointments.length === 0}
          emptyText="No completed appointment earnings yet."
          onRetry={refreshEarnings}
        >
          {appointments.map((a: any, idx: number) => (
            <View key={a.id ?? idx} style={styles.rowCard}>
              <MaterialIcons name="event-available" size={22} color={Colors.secondary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>
                  {a.patient?.name || a.patientName || `Appointment #${a.id}`}
                </Text>
                <Text style={styles.rowSub}>
                  {formatDate(a.slot?.startAt || a.date || a.createdAt)} • Gross:{' '}
                  {formatMoney(a.gross ?? a.consultationFee)}
                </Text>
              </View>
              <Text style={styles.netAmount}>
                {formatMoney(a.net ?? a.doctorEarning ?? a.consultationFee)}
              </Text>
            </View>
          ))}
        </StateView>

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm },
  sectionLabel: {
    ...Typography.labelMedium,
    color: Colors.onSurfaceVariant,
    marginBottom: Spacing.sm,
  },
  grid: {
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
    ...Shadows.subtle,
  },
  statLabel: {
    ...Typography.labelSmall,
    color: Colors.onSurfaceVariant,
  },
  statValue: {
    ...Typography.titleMedium,
    fontFamily: 'Manrope_700Bold',
    color: Colors.onSurface,
    marginTop: 4,
  },
  payoutBalanceCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.subtle,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  availableValue: {
    ...Typography.headlineSmall,
    fontFamily: 'Manrope_700Bold',
    color: Colors.primary,
    marginTop: 2,
  },
  minBadge: {
    backgroundColor: `${Colors.primary}15`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  minBadgeText: {
    ...Typography.labelSmall,
    color: Colors.primary,
    textTransform: 'none',
  },
  subBalances: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceContainer,
  },
  subLabel: {
    ...Typography.bodySmall,
    color: Colors.onSurfaceVariant,
  },
  subVal: {
    ...Typography.titleSmall,
    color: Colors.onSurface,
    marginTop: 2,
  },
  formCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    ...Shadows.subtle,
  },
  formTitle: {
    ...Typography.titleMedium,
    color: Colors.onSurface,
    marginBottom: Spacing.md,
  },
  methodLabel: {
    ...Typography.labelSmall,
    color: Colors.onSurfaceVariant,
    marginBottom: Spacing.sm,
  },
  methodsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: Spacing.lg,
  },
  methodChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceContainerLow,
  },
  methodChipActive: {
    backgroundColor: Colors.primary,
  },
  methodChipText: {
    ...Typography.labelSmall,
    color: Colors.onSurfaceVariant,
    fontSize: 10,
  },
  methodChipTextActive: {
    color: Colors.onPrimary,
  },
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadows.subtle,
  },
  rowTitle: {
    ...Typography.titleSmall,
    color: Colors.onSurface,
  },
  rowSub: {
    ...Typography.bodySmall,
    color: Colors.onSurfaceVariant,
  },
  statusChip: {
    backgroundColor: Colors.secondaryContainer,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  statusChipText: {
    ...Typography.labelSmall,
    color: Colors.onSecondaryContainer,
    fontSize: 9,
  },
  netAmount: {
    ...Typography.titleSmall,
    fontFamily: 'Manrope_700Bold',
    color: Colors.primary,
  },
});

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../../theme';
import { Header, StateView } from '../../../components';
import { patientService, PaymentStatus } from '../../../api';
import { useApi } from '../../../hooks/useApi';
import { formatDate, formatTime, formatMoney, doctorName, PAYMENT_LABEL } from '../../../utils/format';

type Props = { navigation: NativeStackNavigationProp<any> };

const statusColorMap: Record<PaymentStatus, { bg: string; text: string }> = {
  PAID: { bg: `${Colors.primary}18`, text: Colors.primary },
  AUTHORIZED: { bg: '#d9770618', text: '#d97706' },
  PENDING: { bg: `${Colors.secondary}18`, text: Colors.secondary },
  REFUNDED: { bg: `${Colors.tertiary}18`, text: Colors.tertiary },
  FAILED: { bg: `${Colors.error}18`, text: Colors.error },
  CANCELLED: { bg: `${Colors.outline}18`, text: Colors.outline },
};

export const PaymentHistoryScreen: React.FC<Props> = ({ navigation }) => {
  const { data, loading, error, refresh } = useApi(() => patientService.payments(), []);

  const totals = data?.totals ?? { paid: 0, held: 0, refunded: 0, count: 0 };
  const items = data?.items ?? [];

  const handleOpenReceipt = async (appointmentId: number) => {
    try {
      const url = patientService.receiptUrl(appointmentId);
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Receipt Info', `Receipt #${appointmentId}\nEndpoint: ${url}`);
      }
    } catch (e: any) {
      Alert.alert('Receipt Error', e?.message ?? 'Unable to open receipt');
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Payment History"
        showBack
        onBack={() => navigation.goBack()}
        onNotification={() => navigation.navigate('Notifications')}
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary Cards */}
        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <View style={[styles.summaryIcon, { backgroundColor: `${Colors.primary}15` }]}>
              <MaterialIcons name="check-circle" size={20} color={Colors.primary} />
            </View>
            <Text style={styles.summaryLabel}>PAID</Text>
            <Text style={styles.summaryValue}>{formatMoney(totals.paid)}</Text>
          </View>

          <View style={styles.summaryCard}>
            <View style={[styles.summaryIcon, { backgroundColor: '#d9770615' }]}>
              <MaterialIcons name="schedule" size={20} color="#d97706" />
            </View>
            <Text style={styles.summaryLabel}>ON HOLD</Text>
            <Text style={styles.summaryValue}>{formatMoney(totals.held)}</Text>
          </View>

          <View style={styles.summaryCard}>
            <View style={[styles.summaryIcon, { backgroundColor: `${Colors.tertiary}15` }]}>
              <MaterialIcons name="replay" size={20} color={Colors.tertiary} />
            </View>
            <Text style={styles.summaryLabel}>REFUNDED</Text>
            <Text style={styles.summaryValue}>{formatMoney(totals.refunded)}</Text>
          </View>

          <View style={styles.summaryCard}>
            <View style={[styles.summaryIcon, { backgroundColor: `${Colors.secondary}15` }]}>
              <MaterialIcons name="receipt-long" size={20} color={Colors.secondary} />
            </View>
            <Text style={styles.summaryLabel}>TRANSACTIONS</Text>
            <Text style={styles.summaryValue}>{totals.count}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>TRANSACTIONS</Text>

        <StateView
          loading={loading}
          error={error}
          empty={!loading && items.length === 0}
          emptyText="No payment transactions yet."
          onRetry={refresh}
        >
          {items.map((item: any) => {
            const pStatus: PaymentStatus = item.paymentStatus ?? 'PENDING';
            const badgeStyle = statusColorMap[pStatus] ?? statusColorMap.PENDING;
            const badgeText = PAYMENT_LABEL[pStatus] ?? pStatus;
            const dateStr = item.slot?.startAt || item.paymentAuthorizedAt || item.createdAt;

            return (
              <View key={item.id} style={styles.itemCard}>
                <View style={styles.itemHeader}>
                  <View style={styles.docAvatar}>
                    <MaterialIcons name="person" size={22} color={Colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.docName}>{doctorName(item.doctor?.name || 'Doctor')}</Text>
                    <Text style={styles.dateText}>
                      {formatDate(dateStr)}{dateStr ? ` • ${formatTime(dateStr)}` : ''}
                    </Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: badgeStyle.bg }]}>
                    <Text style={[styles.badgeText, { color: badgeStyle.text }]}>{badgeText}</Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.itemFooter}>
                  <View>
                    <Text style={styles.metaLabel}>CONSULTATION FEE</Text>
                    <Text style={styles.feeValue}>{formatMoney(item.consultationFee)}</Text>
                  </View>
                  <View style={styles.rightMeta}>
                    <Text style={styles.receiptId}>Receipt #{item.id} • {item.consultationType || 'VIDEO'}</Text>
                    <TouchableOpacity
                      style={styles.receiptBtn}
                      onPress={() => handleOpenReceipt(item.id)}
                    >
                      <MaterialIcons name="picture-as-pdf" size={15} color={Colors.primary} />
                      <Text style={styles.receiptBtnText}>Receipt PDF</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}
        </StateView>

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  summaryCard: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadows.subtle,
  },
  summaryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  summaryLabel: {
    ...Typography.labelSmall,
    color: Colors.onSurfaceVariant,
  },
  summaryValue: {
    ...Typography.titleMedium,
    fontFamily: 'Manrope_700Bold',
    color: Colors.onSurface,
    marginTop: 2,
  },
  sectionTitle: {
    ...Typography.labelMedium,
    color: Colors.onSurfaceVariant,
    marginBottom: Spacing.md,
  },
  itemCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.subtle,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  docAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${Colors.primary}12`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docName: {
    ...Typography.titleSmall,
    fontSize: 15,
    color: Colors.onSurface,
  },
  dateText: {
    ...Typography.bodySmall,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  badgeText: {
    ...Typography.labelSmall,
    fontSize: 10,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.surfaceContainer,
    marginVertical: Spacing.md,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  metaLabel: {
    ...Typography.labelSmall,
    color: Colors.onSurfaceVariant,
  },
  feeValue: {
    ...Typography.titleMedium,
    fontFamily: 'Manrope_700Bold',
    color: Colors.primary,
    marginTop: 2,
  },
  rightMeta: {
    alignItems: 'flex-end',
    gap: 6,
  },
  receiptId: {
    ...Typography.bodySmall,
    color: Colors.onSurfaceVariant,
    fontSize: 11,
  },
  receiptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: `${Colors.primary}12`,
  },
  receiptBtnText: {
    ...Typography.labelSmall,
    color: Colors.primary,
    textTransform: 'none',
    letterSpacing: 0.2,
  },
});

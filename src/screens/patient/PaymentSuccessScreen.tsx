import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Typography, BorderRadius, Spacing } from '../../theme';
import { Header, PrimaryButton, SecondaryButton } from '../../components';
import { usePaymentPolling } from '../../features/appointments/usePaymentPolling';
import {
  doctorName,
  formatDate,
  formatMoney,
  formatTime,
  PAYMENT_LABEL,
  specializationOf,
} from '../../utils/format';

type Props = { navigation: NativeStackNavigationProp<any>; route: any };

export const PaymentSuccessScreen: React.FC<Props> = ({ navigation, route }) => {
  const initialAppointmentId: number | undefined = route?.params?.appointmentId;
  const checkoutUrl: string | undefined = route?.params?.checkoutUrl;
  const fallbackDoctor = route?.params?.doctor;
  const fallbackSlot = route?.params?.slot;
  const fallbackType = route?.params?.consultationType ?? 'VIDEO';

  const { appointment, paymentStatus, isPolling, timedOut, error, checkNow } = usePaymentPolling({
    appointmentId: initialAppointmentId,
    intervalMs: 3000,
    maxDurationMs: 30000,
  });

  const resolvedId = appointment?.id ?? initialAppointmentId;
  const docName = doctorName(appointment?.doctor?.name ?? fallbackDoctor?.name) || 'Specialist';
  const docSpec = fallbackDoctor ? specializationOf(fallbackDoctor) : 'Clinical Specialist';
  const startAt = appointment?.slot?.startAt ?? fallbackSlot?.startAt;
  const fee = formatMoney(appointment?.consultationFee ?? fallbackDoctor?.consultationFee);
  const consultType = appointment?.consultationType ?? fallbackType;

  const isAuthorized = paymentStatus === 'AUTHORIZED' || paymentStatus === 'PAID';
  const isFailed = paymentStatus === 'FAILED' || paymentStatus === 'CANCELLED';

  const handleReopenCheckout = async () => {
    if (!checkoutUrl) {
      Alert.alert('Checkout Unavailable', 'No Stripe checkout link is available for this session.');
      return;
    }
    try {
      await Linking.openURL(checkoutUrl);
    } catch {
      Alert.alert('Error', 'Unable to open Stripe checkout URL.');
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Payment Status"
        showBack
        onBack={() => navigation.goBack()}
        onNotification={() => navigation.navigate('Notifications')}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Banner / Hero */}
        <View style={styles.heroSection}>
          {isAuthorized ? (
            <>
              <View style={[styles.iconCircle, { backgroundColor: Colors.primary }]}>
                <MaterialIcons name="verified" size={42} color={Colors.onPrimary} />
              </View>
              <Text style={styles.title}>Payment Authorized — Request Sent to Doctor!</Text>
              <Text style={styles.subtitle}>
                Your card is on an escrow hold. You will only be charged once the doctor accepts
                your appointment request.
              </Text>
            </>
          ) : isFailed ? (
            <>
              <View style={[styles.iconCircle, { backgroundColor: Colors.error }]}>
                <MaterialIcons name="error-outline" size={42} color={Colors.onError} />
              </View>
              <Text style={styles.title}>Payment Not Completed</Text>
              <Text style={styles.subtitle}>
                The Stripe authorization was cancelled or failed. Your card has not been charged.
              </Text>
            </>
          ) : (
            <>
              <View style={[styles.iconCircle, { backgroundColor: '#d97706' }]}>
                {isPolling ? (
                  <ActivityIndicator size="large" color={Colors.white} />
                ) : (
                  <MaterialIcons name="hourglass-top" size={40} color={Colors.white} />
                )}
              </View>
              <Text style={styles.title}>
                {isPolling ? 'Waiting for Stripe Confirmation...' : 'Still Waiting for Payment'}
              </Text>
              <Text style={styles.subtitle}>
                {timedOut
                  ? 'We have not detected a completed Stripe checkout yet. Complete the payment in your browser and tap "Check Now".'
                  : 'Complete your payment authorization in the Stripe checkout tab. This page updates automatically every 3 seconds.'}
              </Text>
            </>
          )}
        </View>

        {error ? (
          <View style={styles.errorBanner}>
            <MaterialIcons name="warning" size={18} color={Colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Pending Controls */}
        {!isAuthorized && (
          <View style={styles.pendingActionsCard}>
            <PrimaryButton
              title="I have completed payment — Check Now"
              onPress={checkNow}
              loading={isPolling}
              icon={<MaterialIcons name="refresh" size={18} color={Colors.onPrimary} />}
            />
            {checkoutUrl ? (
              <TouchableOpacity
                style={styles.reopenBtn}
                onPress={handleReopenCheckout}
                activeOpacity={0.8}
              >
                <MaterialIcons name="open-in-new" size={18} color={Colors.primary} />
                <Text style={styles.reopenBtnText}>Re-open Stripe Checkout</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        )}

        {/* Booking Details Card */}
        <View style={styles.detailsCard}>
          <View style={styles.detailSection}>
            <Text style={styles.detailLabel}>SPECIALIST</Text>
            <View style={styles.doctorRow}>
              <View style={styles.doctorAvatar}>
                <MaterialIcons name="person" size={22} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.doctorName}>{docName}</Text>
                <Text style={styles.doctorSpec}>{docSpec}</Text>
              </View>
            </View>
          </View>

          <View style={styles.detailSection}>
            <Text style={styles.detailLabel}>SCHEDULE</Text>
            <View style={styles.scheduleRow}>
              <MaterialIcons name="calendar-today" size={17} color={Colors.secondary} />
              <Text style={styles.scheduleText}>{formatDate(startAt) || 'Scheduled'}</Text>
              <Text style={styles.scheduleDot}>•</Text>
              <Text style={styles.scheduleText}>{formatTime(startAt)}</Text>
            </View>
          </View>

          <View style={styles.detailSection}>
            <Text style={styles.detailLabel}>CONSULTATION MODE</Text>
            <View style={styles.scheduleRow}>
              <MaterialIcons
                name={consultType === 'VIDEO' ? 'videocam' : 'local-hospital'}
                size={18}
                color={Colors.secondary}
              />
              <Text style={styles.scheduleText}>
                {consultType === 'VIDEO' ? 'Video Consultation' : 'In-Person Visit'}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Appointment ID</Text>
            <Text style={styles.metaValue}>{resolvedId ? `#${resolvedId}` : 'Pending'}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Payment Status</Text>
            <Text
              style={[
                styles.metaValue,
                { color: isAuthorized ? Colors.primary : isFailed ? Colors.error : '#d97706' },
              ]}
            >
              {PAYMENT_LABEL[paymentStatus]} ({paymentStatus})
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Authorized Amount</Text>
            <Text style={styles.amountPaid}>{fee}</Text>
          </View>
        </View>

        {/* Navigation Actions */}
        <View style={styles.navActions}>
          {resolvedId ? (
            <PrimaryButton
              title="View Appointment Status"
              onPress={() =>
                navigation.navigate('AppointmentStatus', { appointmentId: resolvedId })
              }
            />
          ) : null}

          <SecondaryButton
            title="Go to My Appointments"
            onPress={() => navigation.navigate('PatientTabs', { screen: 'Appointments' })}
            style={{ marginTop: Spacing.sm }}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: Spacing.lg, paddingBottom: 100 },
  heroSection: { alignItems: 'center', marginVertical: 20 },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 21,
    fontFamily: 'Manrope_700Bold',
    color: Colors.onSurface,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    ...Typography.bodyMedium,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 21,
    paddingHorizontal: 8,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fef2f2',
    borderRadius: BorderRadius.md,
    padding: 12,
    marginBottom: 14,
  },
  errorText: { ...Typography.bodySmall, color: Colors.error, flex: 1 },
  pendingActionsCard: {
    width: '100%',
    gap: 10,
    marginBottom: 18,
  },
  reopenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}10`,
  },
  reopenBtnText: {
    ...Typography.labelLarge,
    color: Colors.primary,
    fontSize: 14,
  },
  detailsCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 20,
    padding: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHighest,
  },
  detailSection: { marginBottom: 16 },
  detailLabel: {
    fontSize: 10,
    fontFamily: 'Manrope_700Bold',
    color: Colors.primary,
    letterSpacing: 1.3,
    marginBottom: 8,
  },
  doctorRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  doctorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: `${Colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doctorName: { fontSize: 16, fontFamily: 'Manrope_700Bold', color: Colors.onSurface },
  doctorSpec: { fontSize: 13, fontFamily: 'Manrope_500Medium', color: Colors.secondary, marginTop: 2 },
  scheduleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  scheduleText: { fontSize: 14, fontFamily: 'Manrope_600SemiBold', color: Colors.onSurface },
  scheduleDot: { color: Colors.outlineVariant },
  divider: { height: 1, backgroundColor: Colors.surfaceContainerHighest, marginVertical: 14 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  metaLabel: { ...Typography.bodySmall, color: Colors.onSurfaceVariant },
  metaValue: { fontSize: 13, fontFamily: 'Manrope_700Bold', color: Colors.onSurface },
  amountPaid: { fontSize: 17, fontFamily: 'Manrope_800ExtraBold', color: Colors.primary },
  navActions: { width: '100%', marginTop: 20 },
});

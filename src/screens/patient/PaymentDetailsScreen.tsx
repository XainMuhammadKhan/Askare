import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Linking } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Typography, BorderRadius, Spacing } from '../../theme';
import { Header, PrimaryButton } from '../../components';
import { patientService, ApiError, ConsultationType, Doctor, Slot } from '../../api';
import {
  doctorName,
  formatDate,
  formatMoney,
  formatTime,
  initials,
  specializationOf,
} from '../../utils/format';

type Props = { navigation: NativeStackNavigationProp<any>; route: any };

export const PaymentDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const doctor = route?.params?.doctor as Doctor | undefined;
  const slot = route?.params?.slot as Slot | undefined;
  const consultationType: ConsultationType = route?.params?.consultationType ?? 'VIDEO';
  const reason: string | undefined = route?.params?.reason;

  const [submitting, setSubmitting] = useState(false);

  const formattedDate = formatDate(slot?.startAt);
  const formattedTime = formatTime(slot?.startAt);
  const formattedEndTime = formatTime(slot?.endAt);
  const feeLabel = formatMoney(doctor?.consultationFee);
  const isVideo = consultationType === 'VIDEO';

  const handleProceedToCheckout = async () => {
    if (!slot?.id) {
      Alert.alert('Missing Slot', 'Please go back and select a valid time slot.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await patientService.reserve(slot.id, consultationType, reason);
      if (!res?.checkoutUrl) {
        throw new Error('Could not generate Stripe checkout session.');
      }

      try {
        await Linking.openURL(res.checkoutUrl);
      } catch {
        Alert.alert(
          'Open Stripe Checkout',
          'Could not automatically open the browser. You can open the checkout link on the next screen.'
        );
      }

      navigation.navigate('PaymentSuccess', {
        appointmentId: res.appointment?.id,
        checkoutUrl: res.checkoutUrl,
        doctor,
        slot,
        consultationType,
      });
    } catch (err: any) {
      if (err instanceof ApiError) {
        if (err.isConflict || err.isValidation) {
          Alert.alert(
            'Slot Unavailable',
            err.message ||
              'This slot was just reserved or must be at least 35 minutes in the future. Please pick another slot.'
          );
          return;
        }
        Alert.alert('Reservation Failed', err.message);
      } else {
        Alert.alert('Error', err?.message || 'Unable to reserve slot right now.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Confirm & Authorize"
        showBack
        onBack={() => navigation.goBack()}
        onNotification={() => navigation.navigate('Notifications')}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Doctor & Slot Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.doctorRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials(doctor?.name) || 'DR'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.doctorTitle}>{doctorName(doctor?.name)}</Text>
              <Text style={styles.specialtyText}>{specializationOf(doctor)}</Text>
              <Text style={styles.hospitalText}>
                {doctor?.hospital?.name || doctor?.city || 'Private Clinic'}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <MaterialIcons name="event" size={18} color={Colors.primary} />
              <View>
                <Text style={styles.infoLabel}>DATE</Text>
                <Text style={styles.infoValue}>{formattedDate || 'Selected Date'}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <MaterialIcons name="schedule" size={18} color={Colors.primary} />
              <View>
                <Text style={styles.infoLabel}>TIME (PKT)</Text>
                <Text style={styles.infoValue}>
                  {formattedTime}
                  {formattedEndTime ? ` – ${formattedEndTime}` : ''}
                </Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <MaterialIcons
                name={isVideo ? 'videocam' : 'local-hospital'}
                size={18}
                color={Colors.primary}
              />
              <View>
                <Text style={styles.infoLabel}>CONSULTATION TYPE</Text>
                <Text style={styles.infoValue}>
                  {isVideo ? 'Video Consultation' : 'In-Person Visit'}
                </Text>
              </View>
            </View>
          </View>

          {reason ? (
            <>
              <View style={styles.divider} />
              <Text style={styles.infoLabel}>REASON FOR VISIT</Text>
              <Text style={styles.reasonText}>{reason}</Text>
            </>
          ) : null}
        </View>

        {/* Escrow Hold Explanation */}
        <View style={styles.escrowCard}>
          <View style={styles.escrowHeader}>
            <MaterialIcons name="verified-user" size={22} color={Colors.primary} />
            <Text style={styles.escrowTitle}>Escrow Payment Protection</Text>
          </View>
          <Text style={styles.escrowBody}>
            Your card is only authorized on Stripe. You are charged only when the doctor accepts
            your request.
          </Text>
          <View style={styles.escrowBullets}>
            <View style={styles.bulletRow}>
              <MaterialIcons name="check-circle" size={16} color={Colors.primary} />
              <Text style={styles.bulletText}>
                Slot is held exclusively for 35 minutes while you complete checkout.
              </Text>
            </View>
            <View style={styles.bulletRow}>
              <MaterialIcons name="check-circle" size={16} color={Colors.primary} />
              <Text style={styles.bulletText}>
                If the doctor declines or does not respond in time, the hold is automatically
                released and you are never charged.
              </Text>
            </View>
          </View>
        </View>

        {/* Fee Breakdown */}
        <View style={styles.feeCard}>
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>Consultation Fee</Text>
            <Text style={styles.feeValue}>{feeLabel}</Text>
          </View>
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>Platform & Booking Fee</Text>
            <Text style={styles.feeValue}>PKR 0</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.feeRow}>
            <Text style={styles.totalLabel}>Amount to Authorize</Text>
            <Text style={styles.totalValue}>{feeLabel}</Text>
          </View>
        </View>

        <PrimaryButton
          title="Proceed to Secure Stripe Checkout"
          onPress={handleProceedToCheckout}
          loading={submitting}
          icon={<MaterialIcons name="lock" size={18} color={Colors.onPrimary} />}
        />

        <View style={styles.stripeFooter}>
          <MaterialIcons name="security" size={16} color={Colors.onSurfaceVariant} />
          <Text style={styles.stripeFooterText}>
            256-bit SSL encrypted checkout powered by Stripe
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: Spacing.lg, paddingBottom: 100 },
  summaryCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHighest,
  },
  doctorRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: `${Colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 18, fontFamily: 'Manrope_700Bold', color: Colors.primary },
  doctorTitle: { fontSize: 17, fontFamily: 'Manrope_700Bold', color: Colors.onSurface },
  specialtyText: {
    ...Typography.bodySmall,
    color: Colors.primary,
    fontFamily: 'Manrope_600SemiBold',
    marginTop: 2,
  },
  hospitalText: { ...Typography.bodySmall, color: Colors.onSurfaceVariant, marginTop: 2 },
  divider: {
    height: 1,
    backgroundColor: Colors.surfaceContainerHighest,
    marginVertical: Spacing.md,
  },
  infoGrid: { gap: 12 },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  infoLabel: {
    fontSize: 10,
    fontFamily: 'Manrope_700Bold',
    color: Colors.onSurfaceVariant,
    letterSpacing: 0.9,
  },
  infoValue: {
    fontSize: 14,
    fontFamily: 'Manrope_600SemiBold',
    color: Colors.onSurface,
    marginTop: 1,
  },
  reasonText: {
    ...Typography.bodyMedium,
    color: Colors.onSurface,
    marginTop: 4,
  },
  escrowCard: {
    backgroundColor: `${Colors.primary}10`,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: `${Colors.primary}30`,
  },
  escrowHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  escrowTitle: { fontSize: 15, fontFamily: 'Manrope_700Bold', color: Colors.primary },
  escrowBody: {
    ...Typography.bodyMedium,
    color: Colors.onSurface,
    fontFamily: 'Manrope_600SemiBold',
    lineHeight: 21,
    marginBottom: 12,
  },
  escrowBullets: { gap: 8 },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  bulletText: {
    ...Typography.bodySmall,
    color: Colors.onSurfaceVariant,
    flex: 1,
    lineHeight: 18,
  },
  feeCard: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  feeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  feeLabel: { ...Typography.bodyMedium, color: Colors.onSurfaceVariant },
  feeValue: { ...Typography.bodyMedium, color: Colors.onSurface, fontFamily: 'Manrope_600SemiBold' },
  totalLabel: { fontSize: 16, fontFamily: 'Manrope_700Bold', color: Colors.onSurface },
  totalValue: { fontSize: 22, fontFamily: 'Manrope_800ExtraBold', color: Colors.primary },
  stripeFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: Spacing.lg,
  },
  stripeFooterText: {
    ...Typography.bodySmall,
    color: Colors.onSurfaceVariant,
  },
});

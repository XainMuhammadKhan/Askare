import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography, BorderRadius, Spacing, Shadows } from '../theme';
import { Appointment } from '../api';
import {
  DisplayStatus,
  displayStatus,
  doctorName,
  formatDate,
  formatMoney,
  formatTime,
  initials,
  PAYMENT_LABEL,
  specializationOf,
  STATUS_LABEL,
} from '../utils/format';

export interface AppointmentCardProps {
  appointment?: Appointment;
  viewerRole?: 'patient' | 'doctor';
  onPress?: () => void;
  onCancel?: () => void;
  onJoinCall?: () => void;
  // Legacy fallback props
  doctorName?: string;
  specialty?: string;
  date?: string;
  time?: string;
  status?: string;
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
  primaryActionLabel?: string;
  secondaryActionLabel?: string;
}

const DISPLAY_STATUS_STYLE: Record<DisplayStatus, { color: string; dot: boolean }> = {
  upcoming: { color: Colors.primary, dot: true },
  awaiting_doctor: { color: '#d97706', dot: true },
  awaiting_payment: { color: '#b45309', dot: false },
  completed: { color: '#15803d', dot: false },
  cancelled: { color: Colors.error, dot: false },
  no_show: { color: Colors.outline, dot: false },
};

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  viewerRole = 'patient',
  onPress,
  onCancel,
  onJoinCall,
  doctorName: legacyDoctorName,
  specialty: legacySpecialty,
  date: legacyDate,
  time: legacyTime,
  status: legacyStatus,
  onPrimaryAction,
  onSecondaryAction,
  primaryActionLabel,
  secondaryActionLabel,
}) => {
  const dispStatus: DisplayStatus = appointment
    ? displayStatus(appointment)
    : legacyStatus === 'confirmed' || legacyStatus === 'approved'
    ? 'upcoming'
    : legacyStatus === 'completed'
    ? 'completed'
    : legacyStatus === 'cancelled'
    ? 'cancelled'
    : 'awaiting_doctor';

  const statusMeta = DISPLAY_STATUS_STYLE[dispStatus] ?? DISPLAY_STATUS_STYLE.awaiting_doctor;
  const statusLabel = STATUS_LABEL[dispStatus] ?? dispStatus.toUpperCase();

  const counterpartyName = appointment
    ? viewerRole === 'doctor'
      ? appointment.patient?.name || `Patient #${appointment.id}`
      : doctorName(appointment.doctor?.name) || 'Doctor'
    : legacyDoctorName || 'Doctor';

  const subtitle = appointment
    ? viewerRole === 'doctor'
      ? appointment.reason || 'Clinical Consultation'
      :appointment.doctor?.specializations?.length
      ? specializationOf(appointment.doctor)
      : appointment.reason || (appointment.consultationType === 'VIDEO' ? 'Video Consultation' : 'In-Person Visit')
    : legacySpecialty || 'Specialist';

  const formattedDate = appointment ? formatDate(appointment.slot?.startAt) : legacyDate || '';
  const formattedTime = appointment ? formatTime(appointment.slot?.startAt) : legacyTime || '';
  const paymentBadge = appointment?.paymentStatus ? PAYMENT_LABEL[appointment.paymentStatus] : null;
  const feeLabel = appointment?.consultationFee ? formatMoney(appointment.consultationFee) : null;
  const isVideo = appointment ? appointment.consultationType === 'VIDEO' : true;
  const canJoin = appointment && appointment.status === 'CONFIRMED' && isVideo && Boolean(onJoinCall);
  const canCancel =
    appointment &&
    (appointment.status === 'PENDING' || appointment.status === 'CONFIRMED') &&
    Boolean(onCancel);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={onPress ? 0.75 : 1}
      disabled={!onPress}
    >
      <View style={[styles.accent, { backgroundColor: statusMeta.color }]} />

      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{initials(counterpartyName) || 'DR'}</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.counterpartyName} numberOfLines={1}>
              {counterpartyName}
            </Text>
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${statusMeta.color}15` }]}>
            {statusMeta.dot && <View style={[styles.dot, { backgroundColor: statusMeta.color }]} />}
            <Text style={[styles.statusText, { color: statusMeta.color }]}>{statusLabel}</Text>
          </View>
        </View>

        {/* Date, Time & Consultation Type */}
        <View style={styles.details}>
          {formattedDate ? (
            <View style={styles.detailItem}>
              <MaterialIcons name="event" size={15} color={Colors.onSurfaceVariant} />
              <Text style={styles.detailText}>{formattedDate}</Text>
            </View>
          ) : null}
          {formattedTime ? (
            <View style={styles.detailItem}>
              <MaterialIcons name="schedule" size={15} color={Colors.onSurfaceVariant} />
              <Text style={styles.detailText}>{formattedTime}</Text>
            </View>
          ) : null}
          {appointment && (
            <View style={styles.detailItem}>
              <MaterialIcons
                name={isVideo ? 'videocam' : 'place'}
                size={15}
                color={Colors.primary}
              />
              <Text style={[styles.detailText, { color: Colors.primary, fontFamily: 'Manrope_600SemiBold' }]}>
                {isVideo ? 'Video' : 'In-Person'}
              </Text>
            </View>
          )}
        </View>

        {/* Footer badges: Payment status & Fee */}
        {appointment && (
          <View style={styles.metaRow}>
            {paymentBadge ? (
              <View style={styles.paymentBadge}>
                <MaterialIcons name="account-balance-wallet" size={13} color={Colors.secondary} />
                <Text style={styles.paymentBadgeText}>Payment: {paymentBadge}</Text>
              </View>
            ) : null}
            {feeLabel ? <Text style={styles.feeText}>{feeLabel}</Text> : null}
          </View>
        )}

        {/* Actions */}
        {(canJoin || canCancel || onPrimaryAction || onSecondaryAction) && (
          <View style={styles.actions}>
            {canCancel && (
              <TouchableOpacity style={styles.secondaryBtn} onPress={onCancel}>
                <Text style={[styles.secondaryBtnText, { color: Colors.error }]}>Cancel</Text>
              </TouchableOpacity>
            )}
            {canJoin && (
              <TouchableOpacity style={styles.primaryBtn} onPress={onJoinCall}>
                <MaterialIcons name="videocam" size={15} color={Colors.onPrimary} />
                <Text style={styles.primaryBtnText}>Join Video Call</Text>
              </TouchableOpacity>
            )}
            {!appointment && onSecondaryAction && secondaryActionLabel && (
              <TouchableOpacity style={styles.secondaryBtn} onPress={onSecondaryAction}>
                <Text style={styles.secondaryBtnText}>{secondaryActionLabel}</Text>
              </TouchableOpacity>
            )}
            {!appointment && onPrimaryAction && primaryActionLabel && (
              <TouchableOpacity style={styles.primaryBtn} onPress={onPrimaryAction}>
                <Text style={styles.primaryBtnText}>{primaryActionLabel}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHighest,
    ...Shadows.subtle,
  },
  accent: {
    width: 4,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  avatarPlaceholder: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: `${Colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...Typography.labelLarge,
    color: Colors.primary,
    fontSize: 14,
  },
  headerInfo: {
    flex: 1,
  },
  counterpartyName: {
    ...Typography.titleSmall,
    color: Colors.onSurface,
    fontSize: 16,
  },
  subtitle: {
    ...Typography.bodySmall,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    ...Typography.labelSmall,
    fontSize: 9,
  },
  details: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginTop: Spacing.md,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    ...Typography.bodySmall,
    color: Colors.onSurfaceVariant,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  paymentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surfaceContainerLow,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  paymentBadgeText: {
    ...Typography.bodySmall,
    fontSize: 11,
    color: Colors.secondary,
    fontFamily: 'Manrope_600SemiBold',
  },
  feeText: {
    ...Typography.labelLarge,
    color: Colors.onSurface,
    fontSize: 13,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  secondaryBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    ...Typography.labelLarge,
    color: Colors.primary,
    fontSize: 12,
  },
  primaryBtn: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 10,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    ...Typography.labelLarge,
    color: Colors.onPrimary,
    fontSize: 12,
  },
});

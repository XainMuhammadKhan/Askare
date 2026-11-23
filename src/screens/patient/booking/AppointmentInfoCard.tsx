import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography, BorderRadius, Spacing } from '../../../theme';
import { AppointmentDetail } from '../../../api';
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
} from '../../../utils/format';

interface Props {
  appointment: AppointmentDetail;
}

const STATUS_COLORS: Record<DisplayStatus, string> = {
  upcoming: Colors.primary,
  awaiting_doctor: '#d97706',
  awaiting_payment: '#b45309',
  completed: '#15803d',
  cancelled: Colors.error,
  no_show: Colors.outline,
};

export const AppointmentInfoCard: React.FC<Props> = ({ appointment }) => {
  const disp = displayStatus(appointment);
  const statusColor = STATUS_COLORS[disp] ?? Colors.primary;
  const statusLabel = STATUS_LABEL[disp];
  const paymentLabel = PAYMENT_LABEL[appointment.paymentStatus] ?? appointment.paymentStatus;
  const isVideo = appointment.consultationType === 'VIDEO';
  const docTitle = doctorName(appointment.doctor?.name) || 'Assigned Specialist';
  const specialty = appointment.doctor?.specializations?.length
    ? specializationOf(appointment.doctor)
    : 'Clinical Specialist';

  return (
    <View style={styles.card}>
      {/* Status Banner */}
      <View style={[styles.statusBanner, { backgroundColor: `${statusColor}15` }]}>
        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
        <Text style={[styles.statusBannerText, { color: statusColor }]}>
          {statusLabel.toUpperCase()}
        </Text>
        <View style={styles.paymentPill}>
          <Text style={styles.paymentPillText}>Payment: {paymentLabel}</Text>
        </View>
      </View>

      {/* Doctor Header */}
      <View style={styles.doctorRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials(docTitle) || 'DR'}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.doctorName}>{docTitle}</Text>
          <Text style={styles.specialty}>{specialty}</Text>
          {appointment.doctor?.hospital?.name ? (
            <Text style={styles.hospital}>{appointment.doctor.hospital.name}</Text>
          ) : null}
        </View>
      </View>

      <View style={styles.divider} />

      {/* Slot & Mode Info */}
      <View style={styles.grid}>
        <View style={styles.infoRow}>
          <MaterialIcons name="event" size={18} color={Colors.primary} />
          <Text style={styles.infoLabel}>Date:</Text>
          <Text style={styles.infoValue}>{formatDate(appointment.slot?.startAt)}</Text>
        </View>

        <View style={styles.infoRow}>
          <MaterialIcons name="schedule" size={18} color={Colors.primary} />
          <Text style={styles.infoLabel}>Time (PKT):</Text>
          <Text style={styles.infoValue}>
            {formatTime(appointment.slot?.startAt)}
            {appointment.slot?.endAt ? ` – ${formatTime(appointment.slot.endAt)}` : ''}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <MaterialIcons
            name={isVideo ? 'videocam' : 'local-hospital'}
            size={18}
            color={Colors.primary}
          />
          <Text style={styles.infoLabel}>Mode:</Text>
          <Text style={styles.infoValue}>
            {isVideo ? 'Video Consultation' : 'In-Person Visit'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <MaterialIcons name="payments" size={18} color={Colors.primary} />
          <Text style={styles.infoLabel}>Fee:</Text>
          <Text style={[styles.infoValue, { color: Colors.primary, fontFamily: 'Manrope_700Bold' }]}>
            {formatMoney(appointment.consultationFee)}
          </Text>
        </View>
      </View>

      {appointment.reason ? (
        <View style={styles.reasonBox}>
          <Text style={styles.reasonTitle}>REASON FOR VISIT</Text>
          <Text style={styles.reasonText}>{appointment.reason}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHighest,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    gap: 8,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusBannerText: {
    ...Typography.labelSmall,
    flex: 1,
    fontSize: 11,
  },
  paymentPill: {
    backgroundColor: Colors.surfaceContainerLowest,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  paymentPillText: {
    ...Typography.bodySmall,
    fontSize: 11,
    fontFamily: 'Manrope_700Bold',
    color: Colors.secondary,
  },
  doctorRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: `${Colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 16, fontFamily: 'Manrope_700Bold', color: Colors.primary },
  doctorName: { fontSize: 17, fontFamily: 'Manrope_700Bold', color: Colors.onSurface },
  specialty: {
    ...Typography.bodySmall,
    color: Colors.primary,
    fontFamily: 'Manrope_600SemiBold',
    marginTop: 2,
  },
  hospital: { ...Typography.bodySmall, color: Colors.onSurfaceVariant, marginTop: 1 },
  divider: {
    height: 1,
    backgroundColor: Colors.surfaceContainerHighest,
    marginVertical: Spacing.md,
  },
  grid: { gap: 10 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoLabel: {
    ...Typography.bodySmall,
    color: Colors.onSurfaceVariant,
    width: 85,
  },
  infoValue: {
    ...Typography.bodyMedium,
    color: Colors.onSurface,
    fontFamily: 'Manrope_600SemiBold',
    flex: 1,
  },
  reasonBox: {
    marginTop: Spacing.md,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: BorderRadius.md,
    padding: 12,
  },
  reasonTitle: {
    fontSize: 10,
    fontFamily: 'Manrope_700Bold',
    color: Colors.onSurfaceVariant,
    letterSpacing: 1,
    marginBottom: 4,
  },
  reasonText: {
    ...Typography.bodyMedium,
    color: Colors.onSurface,
  },
});

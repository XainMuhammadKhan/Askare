import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography, BorderRadius, Spacing, Shadows } from '../theme';
import { Doctor } from '../api';
import { doctorName, formatMoney, initials, specializationOf } from '../utils/format';

export interface DoctorCardProps {
  doctor?: Doctor;
  // Optional overrides / fallback props
  name?: string;
  specialty?: string;
  hospital?: string;
  experience?: string | number;
  fee?: string | number;
  rating?: number;
  onBookAppointment?: () => void;
  onPress?: () => void;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({
  doctor,
  name,
  specialty,
  hospital,
  experience,
  fee,
  rating,
  onBookAppointment,
  onPress,
}) => {
  const displayName = doctor ? doctorName(doctor.name) : doctorName(name);
  const displaySpecialty = doctor ? specializationOf(doctor) : specialty || 'General';
  const displayHospital = doctor
    ? doctor.hospital?.name || doctor.city || 'Private Clinic'
    : hospital || 'Private Clinic';

  const expValue = doctor?.experience ?? experience;
  const displayExperience =
    expValue !== undefined && expValue !== null && expValue !== ''
      ? typeof expValue === 'number'
        ? `${expValue} yrs experience`
        : String(expValue)
      : 'Experienced Specialist';

  const displayFee = doctor
    ? formatMoney(doctor.consultationFee)
    : typeof fee === 'number'
    ? formatMoney(fee)
    : fee || formatMoney(0);

  const avgRating = doctor?.rating?.average ?? rating ?? 0;
  const ratingCount = doctor?.rating?.count;
  const ratingLabel = avgRating > 0 ? Number(avgRating).toFixed(1) : 'New';
  const avatarText = initials(doctor?.name || name || 'Dr');

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.content}>
        {/* Avatar & Rating */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            {avatarText ? (
              <Text style={styles.avatarInitials}>{avatarText}</Text>
            ) : (
              <MaterialIcons name="person" size={32} color={Colors.outlineVariant} />
            )}
          </View>
          <View style={styles.ratingBadge}>
            <MaterialIcons name="star" size={11} color="#d97706" />
            <Text style={styles.ratingText}>
              {ratingLabel}
              {ratingCount ? ` (${ratingCount})` : ''}
            </Text>
          </View>
        </View>

        {/* Details */}
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {displayName}
          </Text>
          <Text style={styles.specialty} numberOfLines={1}>
            {displaySpecialty}
            {doctor?.qualification ? ` • ${doctor.qualification}` : ''}
          </Text>

          <View style={styles.detailRow}>
            <MaterialIcons name="local-hospital" size={14} color={Colors.onSurfaceVariant} />
            <Text style={styles.detail} numberOfLines={1}>
              {displayHospital}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <MaterialIcons name="work-outline" size={14} color={Colors.onSurfaceVariant} />
            <Text style={styles.detail}>{displayExperience}</Text>
          </View>

          <View style={styles.detailRow}>
            <MaterialIcons name="payments" size={14} color={Colors.primary} />
            <Text style={[styles.detail, styles.feeText]}>{displayFee}</Text>
          </View>

          {onBookAppointment && (
            <TouchableOpacity style={styles.bookBtn} onPress={onBookAppointment} activeOpacity={0.85}>
              <Text style={styles.bookBtnText}>Book Appointment</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
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
    ...Shadows.subtle,
  },
  content: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  avatarContainer: {
    alignItems: 'center',
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: `${Colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: `${Colors.primary}30`,
  },
  avatarInitials: {
    ...Typography.titleLarge,
    color: Colors.primary,
    fontFamily: 'Manrope_700Bold',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.surfaceContainerLowest,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    marginTop: -10,
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHighest,
  },
  ratingText: {
    ...Typography.labelSmall,
    color: Colors.onSurface,
    textTransform: 'none',
    fontSize: 11,
  },
  info: {
    flex: 1,
  },
  name: {
    ...Typography.titleMedium,
    color: Colors.onSurface,
    marginBottom: 2,
  },
  specialty: {
    ...Typography.bodySmall,
    color: Colors.primary,
    fontFamily: 'Manrope_600SemiBold',
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  detail: {
    ...Typography.bodySmall,
    color: Colors.onSurfaceVariant,
    flex: 1,
  },
  feeText: {
    color: Colors.onSurface,
    fontFamily: 'Manrope_700Bold',
  },
  bookBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.xl,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  bookBtnText: {
    ...Typography.labelLarge,
    color: Colors.onPrimary,
    fontSize: 13,
  },
});

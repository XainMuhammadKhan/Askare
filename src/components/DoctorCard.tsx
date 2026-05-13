import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography, BorderRadius, Spacing, Shadows } from '../theme';

interface DoctorCardProps {
  name: string;
  specialty: string;
  hospital: string;
  experience: string;
  fee: string;
  rating: number;
  onBookAppointment?: () => void;
  onPress?: () => void;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({
  name,
  specialty,
  hospital,
  experience,
  fee,
  rating,
  onBookAppointment,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.content}>
        {/* Avatar Placeholder */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <MaterialIcons name="person" size={32} color={Colors.outlineVariant} />
          </View>
          <View style={styles.ratingBadge}>
            <MaterialIcons name="star" size={10} color={Colors.tertiary} />
            <Text style={styles.ratingText}>{rating}</Text>
          </View>
        </View>

        {/* Info */}
        <View style={styles.info}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.specialty}>{specialty}</Text>
          <View style={styles.detailRow}>
            <MaterialIcons name="location-on" size={14} color={Colors.onSurfaceVariant} />
            <Text style={styles.detail}>{hospital}</Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialIcons name="work" size={14} color={Colors.onSurfaceVariant} />
            <Text style={styles.detail}>{experience}</Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialIcons name="payment" size={14} color={Colors.onSurfaceVariant} />
            <Text style={styles.detail}>{fee}</Text>
          </View>

          {onBookAppointment && (
            <TouchableOpacity style={styles.bookBtn} onPress={onBookAppointment}>
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
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHighest,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: Colors.surfaceContainerLowest,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    marginTop: -8,
    borderWidth: 1,
    borderColor: Colors.surfaceContainer,
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
    fontFamily: 'Manrope_500Medium',
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  detail: {
    ...Typography.bodySmall,
    color: Colors.onSurfaceVariant,
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

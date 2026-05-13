import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography, BorderRadius, Spacing, Shadows } from '../theme';

interface AppointmentCardProps {
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  status: 'confirmed' | 'pending' | 'approved' | 'cancelled' | 'completed' | 'new_request';
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
  primaryActionLabel?: string;
  secondaryActionLabel?: string;
}

const statusConfig = {
  confirmed: { label: 'CONFIRMED', color: Colors.primary, dot: true },
  pending: { label: 'PENDING', color: '#d97706', dot: false },
  approved: { label: 'APPROVED', color: Colors.primary, dot: false },
  cancelled: { label: 'CANCELLED', color: Colors.error, dot: false },
  completed: { label: 'COMPLETED', color: Colors.outline, dot: false },
  new_request: { label: 'NEW REQUEST', color: Colors.primary, dot: false },
};

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  doctorName,
  specialty,
  date,
  time,
  status,
  onPrimaryAction,
  onSecondaryAction,
  primaryActionLabel,
  secondaryActionLabel,
}) => {
  const config = statusConfig[status];

  return (
    <View style={styles.card}>
      {/* Left accent line */}
      <View style={[styles.accent, { backgroundColor: config.color }]} />
      
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatarPlaceholder}>
            <MaterialIcons name="person" size={24} color={Colors.outlineVariant} />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.doctorName}>{doctorName}</Text>
            <Text style={styles.specialty}>{specialty}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${config.color}15` }]}>
            {config.dot && <View style={[styles.dot, { backgroundColor: config.color }]} />}
            <Text style={[styles.statusText, { color: config.color }]}>{config.label}</Text>
          </View>
        </View>

        {/* Details */}
        {(date || time) && (
          <View style={styles.details}>
            {date && (
              <View style={styles.detailItem}>
                <MaterialIcons name="event" size={16} color={Colors.onSurfaceVariant} />
                <Text style={styles.detailText}>{date}</Text>
              </View>
            )}
            {time && (
              <View style={styles.detailItem}>
                <MaterialIcons name="schedule" size={16} color={Colors.onSurfaceVariant} />
                <Text style={styles.detailText}>{time}</Text>
              </View>
            )}
          </View>
        )}

        {/* Actions */}
        {(onPrimaryAction || onSecondaryAction) && (
          <View style={styles.actions}>
            {onSecondaryAction && secondaryActionLabel && (
              <TouchableOpacity style={styles.secondaryBtn} onPress={onSecondaryAction}>
                <Text style={styles.secondaryBtnText}>{secondaryActionLabel}</Text>
              </TouchableOpacity>
            )}
            {onPrimaryAction && primaryActionLabel && (
              <TouchableOpacity style={styles.primaryBtn} onPress={onPrimaryAction}>
                <Text style={styles.primaryBtnText}>{primaryActionLabel}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    flexDirection: 'row',
    overflow: 'hidden',
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
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  doctorName: {
    ...Typography.titleSmall,
    color: Colors.onSurface,
    fontSize: 16,
  },
  specialty: {
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
    gap: Spacing.lg,
    marginTop: Spacing.md,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
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
  },
  secondaryBtnText: {
    ...Typography.labelLarge,
    color: Colors.primary,
    fontSize: 12,
  },
  primaryBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  primaryBtnText: {
    ...Typography.labelLarge,
    color: Colors.onPrimary,
    fontSize: 12,
  },
});

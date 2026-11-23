import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography } from '../../../theme';
import { Appointment } from '../../../api';
import { doctorName, specializationOf, formatDate, formatTime } from '../../../utils/format';

interface Props {
  appointment: Appointment | null;
  onJoinCall: (appointmentId: number) => void;
  onViewDetails: (appointmentId: number) => void;
  onBookNew: () => void;
}

export const NextAppointmentCard: React.FC<Props> = ({
  appointment,
  onJoinCall,
  onViewDetails,
  onBookNew,
}) => {
  if (!appointment) {
    return (
      <View style={styles.emptyCard}>
        <View style={styles.emptyIconCircle}>
          <MaterialIcons name="event-available" size={28} color={Colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.emptyTitle}>No Upcoming Appointment</Text>
          <Text style={styles.emptySub}>Book a consultation with a verified specialist.</Text>
        </View>
        <TouchableOpacity style={styles.bookBtn} onPress={onBookNew} activeOpacity={0.8}>
          <Text style={styles.bookBtnText}>Find Doctor</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const docName = doctorName(appointment.doctor?.name);
  const spec = specializationOf(appointment.doctor);
  const hospital = appointment.doctor?.hospital?.name;
  const dateStr = formatDate(appointment.slot?.startAt);
  const timeStr = formatTime(appointment.slot?.startAt);
  const isVideo = appointment.consultationType === 'VIDEO';

  return (
    <TouchableOpacity activeOpacity={0.95} onPress={() => onViewDetails(appointment.id)}>
      <LinearGradient
        colors={[Colors.primary, Colors.primaryDim]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.topRow}>
          <View style={styles.leftRow}>
            <View style={styles.calendarIcon}>
              <MaterialIcons name={isVideo ? 'videocam' : 'event'} size={22} color={Colors.white} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.specLabel}>{spec.toUpperCase()}</Text>
              <Text style={styles.docName}>{docName || 'Specialist'}</Text>
              {hospital ? <Text style={styles.hospitalText}>{hospital}</Text> : null}
            </View>
          </View>
          <View style={styles.badge}>
            <View style={styles.badgeDot} />
            <Text style={styles.badgeText}>{isVideo ? 'Video Call' : 'In-Person'}</Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <MaterialIcons name="calendar-today" size={14} color="rgba(255,255,255,0.85)" />
            <Text style={styles.metaText}>{dateStr || 'Scheduled'}</Text>
          </View>
          <View style={styles.metaItem}>
            <MaterialIcons name="schedule" size={14} color="rgba(255,255,255,0.85)" />
            <Text style={styles.metaText}>{timeStr}</Text>
          </View>
        </View>

        <View style={styles.actions}>
          {isVideo && (
            <TouchableOpacity
              style={styles.joinBtn}
              onPress={() => onJoinCall(appointment.id)}
              activeOpacity={0.85}
            >
              <MaterialIcons name="videocam" size={18} color={Colors.primary} />
              <Text style={styles.joinBtnText}>Join Video Call</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.detailsBtn, !isVideo && { flex: 1 }]}
            onPress={() => onViewDetails(appointment.id)}
            activeOpacity={0.85}
          >
            <Text style={styles.detailsBtnText}>View Details</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    gap: 14,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  calendarIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  specLabel: {
    ...Typography.labelSmall,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 2,
  },
  docName: {
    fontSize: 18,
    fontFamily: 'Manrope_700Bold',
    color: Colors.white,
  },
  hospitalText: {
    ...Typography.bodySmall,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 1,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22c55e',
  },
  badgeText: {
    ...Typography.bodySmall,
    color: Colors.white,
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 10,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    paddingTop: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    ...Typography.bodyMedium,
    color: Colors.white,
    fontFamily: 'Manrope_500Medium',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  joinBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16,
    paddingVertical: 12,
  },
  joinBtnText: {
    fontSize: 13,
    fontFamily: 'Manrope_700Bold',
    color: Colors.primary,
  },
  detailsBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsBtnText: {
    fontSize: 13,
    fontFamily: 'Manrope_600SemiBold',
    color: Colors.white,
  },
  emptyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHighest,
  },
  emptyIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${Colors.primary}12`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 15,
    fontFamily: 'Manrope_700Bold',
    color: Colors.onSurface,
  },
  emptySub: {
    ...Typography.bodySmall,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  bookBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
  },
  bookBtnText: {
    fontSize: 12,
    fontFamily: 'Manrope_700Bold',
    color: Colors.onPrimary,
  },
});

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography, Shadows } from '../../../theme';
import { doctorName, formatDate } from '../../../utils/format';

interface Props {
  consultations: any[];
  onViewAppointment: (appointmentId: number) => void;
}

export const ArchiveConsultationsSection: React.FC<Props> = ({
  consultations,
  onViewAppointment,
}) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Consultations ({consultations.length})</Text>
      {consultations.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No past consultation notes recorded.</Text>
        </View>
      ) : (
        consultations.map((c) => {
          const dateStr = formatDate(c.appointment?.slot?.startAt || c.createdAt);
          return (
            <View key={c.id} style={styles.card}>
              <View style={styles.headerRow}>
                <View style={styles.iconCircle}>
                  <MaterialIcons name="medical-services" size={20} color={Colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.diagnosis}>{c.diagnosis || 'Clinical Consultation'}</Text>
                  <Text style={styles.doctorText}>
                    {doctorName(c.doctor?.name)} • {dateStr}
                  </Text>
                </View>
                {c.appointmentId && (
                  <TouchableOpacity
                    style={styles.detailBtn}
                    onPress={() => onViewAppointment(c.appointmentId)}
                  >
                    <Text style={styles.detailBtnText}>Summary</Text>
                  </TouchableOpacity>
                )}
              </View>

              {c.symptoms ? (
                <Text style={styles.rowText}>
                  <Text style={styles.boldLabel}>Symptoms: </Text>
                  {c.symptoms}
                </Text>
              ) : null}

              {c.notes ? (
                <Text style={styles.rowText}>
                  <Text style={styles.boldLabel}>Notes: </Text>
                  {c.notes}
                </Text>
              ) : null}

              {c.advice ? (
                <Text style={styles.rowText}>
                  <Text style={styles.boldLabel}>Advice: </Text>
                  {c.advice}
                </Text>
              ) : null}

              {c.followUpDate ? (
                <View style={styles.followUpBadge}>
                  <MaterialIcons name="event-repeat" size={14} color={Colors.primary} />
                  <Text style={styles.followUpText}>
                    Follow-up: {formatDate(c.followUpDate)}
                  </Text>
                </View>
              ) : null}
            </View>
          );
        })
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Manrope_700Bold',
    color: Colors.onSurface,
    marginBottom: 12,
  },
  card: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    ...Shadows.subtle,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${Colors.primary}12`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  diagnosis: {
    fontSize: 16,
    fontFamily: 'Manrope_700Bold',
    color: Colors.onSurface,
  },
  doctorText: {
    ...Typography.bodySmall,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  detailBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: Colors.surfaceContainerLow,
  },
  detailBtnText: {
    fontSize: 11,
    fontFamily: 'Manrope_700Bold',
    color: Colors.primary,
  },
  rowText: {
    ...Typography.bodyMedium,
    color: Colors.onSurface,
    marginTop: 4,
    lineHeight: 20,
  },
  boldLabel: {
    fontFamily: 'Manrope_700Bold',
    color: Colors.onSurfaceVariant,
  },
  followUpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceContainerHighest,
  },
  followUpText: {
    fontSize: 12,
    fontFamily: 'Manrope_600SemiBold',
    color: Colors.primary,
  },
  emptyCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 14,
    padding: 16,
  },
  emptyText: {
    ...Typography.bodyMedium,
    color: Colors.onSurfaceVariant,
  },
});

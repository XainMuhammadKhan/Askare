import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography, Shadows } from '../../../theme';
import { Appointment } from '../../../api';
import {
  doctorName,
  specializationOf,
  formatDateTime,
  displayStatus,
  STATUS_LABEL,
  formatMoney,
} from '../../../utils/format';

interface Props {
  requests: Appointment[];
  onPressItem: (appointmentId: number) => void;
}

export const PendingRequestsSection: React.FC<Props> = ({ requests, onPressItem }) => {
  if (!requests || requests.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Pending Requests ({requests.length})</Text>
      {requests.map((req) => {
        const dStatus = displayStatus(req);
        const label = STATUS_LABEL[dStatus];
        const isAwaitingPayment = dStatus === 'awaiting_payment';

        return (
          <TouchableOpacity
            key={req.id}
            style={styles.card}
            onPress={() => onPressItem(req.id)}
            activeOpacity={0.75}
          >
            <View style={styles.iconBox}>
              <MaterialIcons
                name={isAwaitingPayment ? 'payment' : 'hourglass-top'}
                size={20}
                color="#d97706"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.docName}>{doctorName(req.doctor?.name)}</Text>
              <Text style={styles.specText}>
                {specializationOf(req.doctor)} • {formatDateTime(req.slot?.startAt)}
              </Text>
              <Text style={styles.feeText}>{formatMoney(req.consultationFee)}</Text>
            </View>
            <View style={styles.statusPill}>
              <Text style={styles.statusText}>{label}</Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    ...Typography.titleLarge,
    color: Colors.onSurface,
    fontSize: 18,
    marginBottom: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#d97706',
    ...Shadows.subtle,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fef3c7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  docName: {
    fontSize: 15,
    fontFamily: 'Manrope_700Bold',
    color: Colors.onSurface,
  },
  specText: {
    ...Typography.bodySmall,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  feeText: {
    fontSize: 12,
    fontFamily: 'Manrope_600SemiBold',
    color: Colors.primary,
    marginTop: 2,
  },
  statusPill: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontFamily: 'Manrope_700Bold',
    color: '#b45309',
  },
});

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography, Shadows } from '../../../theme';
import { Appointment } from '../../../api';
import { formatDate, formatTime, formatMoney, initials } from '../../../utils/format';

interface Props {
  request: Appointment;
  busy: boolean;
  onAccept: (id: number) => void;
  onReject: (id: number, reason: string) => void;
  onOpenDetail: (id: number) => void;
}

export const PendingRequestCard: React.FC<Props> = ({
  request,
  busy,
  onAccept,
  onReject,
  onOpenDetail,
}) => {
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [reason, setReason] = useState('');

  const patientName = request.patient?.name || 'Patient';
  const slotStart = request.slot?.startAt;
  const slotEnd = request.slot?.endAt;

  const handleConfirmReject = () => {
    onReject(request.id, reason.trim() || 'Doctor is unavailable at this time');
    setShowRejectInput(false);
    setReason('');
  };

  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.topRow}
        activeOpacity={0.7}
        onPress={() => onOpenDetail(request.id)}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials(patientName) || 'PT'}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.nameRow}>
            <Text style={styles.patientName}>{patientName}</Text>
            <View style={styles.typeBadge}>
              <MaterialIcons
                name={request.consultationType === 'VIDEO' ? 'videocam' : 'local-hospital'}
                size={12}
                color={Colors.primary}
              />
              <Text style={styles.typeText}>
                {request.consultationType === 'VIDEO' ? 'Video' : 'In-Person'}
              </Text>
            </View>
          </View>
          <Text style={styles.slotText}>
            {formatDate(slotStart)} • {formatTime(slotStart)}
            {slotEnd ? ` – ${formatTime(slotEnd)}` : ''}
          </Text>
          {request.reason ? (
            <Text style={styles.reasonText} numberOfLines={2}>
              Reason: {request.reason}
            </Text>
          ) : null}
          <Text style={styles.feeText}>
            Fee: {formatMoney(request.consultationFee)} • Payment on hold
          </Text>
        </View>
      </TouchableOpacity>

      {showRejectInput ? (
        <View style={styles.rejectBox}>
          <TextInput
            style={styles.rejectInput}
            placeholder="Reason for rejection (optional)..."
            placeholderTextColor={Colors.outlineVariant}
            value={reason}
            onChangeText={setReason}
          />
          <View style={styles.rejectActions}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setShowRejectInput(false)}
              disabled={busy}
            >
              <Text style={styles.cancelBtnText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmRejectBtn}
              onPress={handleConfirmReject}
              disabled={busy}
            >
              {busy ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <Text style={styles.confirmRejectText}>Confirm Reject</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.rejectBtn}
            onPress={() => setShowRejectInput(true)}
            disabled={busy}
          >
            <MaterialIcons name="close" size={16} color={Colors.error} />
            <Text style={styles.rejectBtnText}>Reject</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.acceptBtn}
            onPress={() => onAccept(request.id)}
            disabled={busy}
          >
            {busy ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <>
                <MaterialIcons name="check" size={16} color={Colors.white} />
                <Text style={styles.acceptBtnText}>Accept Request</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#d97706',
    ...Shadows.subtle,
  },
  topRow: { flexDirection: 'row', gap: 12 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${Colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 15, fontFamily: 'Manrope_700Bold', color: Colors.primary },
  nameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  patientName: { fontSize: 16, fontFamily: 'Manrope_700Bold', color: Colors.onSurface, flex: 1 },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: `${Colors.primary}12`,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  typeText: { fontSize: 11, fontFamily: 'Manrope_600SemiBold', color: Colors.primary },
  slotText: { ...Typography.bodySmall, color: Colors.onSurfaceVariant, marginTop: 4 },
  reasonText: {
    ...Typography.bodySmall,
    color: Colors.onSurface,
    marginTop: 6,
    backgroundColor: Colors.surfaceContainerLow,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  feeText: { fontSize: 12, fontFamily: 'Manrope_600SemiBold', color: Colors.secondary, marginTop: 6 },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  rejectBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${Colors.error}40`,
    backgroundColor: `${Colors.error}08`,
  },
  rejectBtnText: { fontSize: 13, fontFamily: 'Manrope_700Bold', color: Colors.error },
  acceptBtn: {
    flex: 1.4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.primary,
  },
  acceptBtnText: { fontSize: 13, fontFamily: 'Manrope_700Bold', color: Colors.white },
  rejectBox: { marginTop: 12, gap: 8 },
  rejectInput: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: Colors.onSurface,
  },
  rejectActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  cancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: Colors.surfaceContainerHigh,
  },
  cancelBtnText: { fontSize: 12, fontFamily: 'Manrope_600SemiBold', color: Colors.onSurface },
  confirmRejectBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: Colors.error,
    minWidth: 110,
    alignItems: 'center',
  },
  confirmRejectText: { fontSize: 12, fontFamily: 'Manrope_700Bold', color: Colors.white },
});

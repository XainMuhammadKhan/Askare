import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../../theme';
import { Header, StateView } from '../../../components';
import { doctorService } from '../../../api';
import { useApi } from '../../../hooks/useApi';
import { isoDay, formatDate, formatTime } from '../../../utils/format';
import { blockSlot, unblockSlot } from './doctorExtrasApi';

type Props = { navigation: NativeStackNavigationProp<any> };

export const DoctorCalendarScreen: React.FC<Props> = ({ navigation }) => {
  const from = useMemo(() => isoDay(0), []);
  const to = useMemo(() => isoDay(14), []);

  const { data, loading, error, refresh } = useApi(
    () => doctorService.calendar(from, to),
    [from, to]
  );

  const [togglingId, setTogglingId] = useState<number | null>(null);

  const slots: any[] = useMemo(() => {
    if (Array.isArray(data)) return data;
    if (Array.isArray((data as any)?.slots)) return (data as any).slots;
    if (Array.isArray((data as any)?.items)) return (data as any).items;
    return [];
  }, [data]);

  const groupedByDate = useMemo(() => {
    const groups: Record<string, any[]> = {};
    for (const slot of slots) {
      const dayKey = slot.startAt ? formatDate(slot.startAt) : slot.date || 'Upcoming';
      if (!groups[dayKey]) groups[dayKey] = [];
      groups[dayKey].push(slot);
    }
    return Object.entries(groups);
  }, [slots]);

  const handleToggleSlot = async (slot: any, currentlyBlocked: boolean) => {
    setTogglingId(slot.id);
    try {
      if (currentlyBlocked) {
        await unblockSlot(slot.id);
      } else {
        await blockSlot(slot.id);
      }
      await refresh();
    } catch (e: any) {
      if (e?.status === 409) {
        Alert.alert('Slot Conflict (409)', 'This slot is already booked or held by a patient.');
      } else {
        Alert.alert('Slot Action Failed', e?.message ?? 'Could not update slot status.');
      }
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="14-Day Slot Calendar"
        showBack
        onBack={() => navigation.goBack()}
        onNotification={() => navigation.navigate('Notifications')}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.rangeBanner}>
          <MaterialIcons name="date-range" size={20} color={Colors.primary} />
          <Text style={styles.rangeText}>
            Showing slots from {from} to {to}
          </Text>
        </View>

        <StateView
          loading={loading}
          error={error}
          empty={!loading && groupedByDate.length === 0}
          emptyText="No slots generated for the next 14 days."
          onRetry={refresh}
        >
          {groupedByDate.map(([dateLabel, daySlots]) => (
            <View key={dateLabel} style={styles.dateGroup}>
              <Text style={styles.dateHeader}>{dateLabel}</Text>
              {daySlots.map((slot: any) => {
                const appt = slot.appointment;
                const patientName =
                  appt?.patient?.name || slot.patientName || slot.patient?.name || null;
                const isBooked =
                  Boolean(patientName) ||
                  slot.status === 'BOOKED' ||
                  slot.isBooked === true ||
                  (appt && appt.status !== 'CANCELLED');
                const isBlocked =
                  !isBooked &&
                  (slot.status === 'BLOCKED' ||
                    slot.isBlocked === true ||
                    slot.blocked === true);
                const isBusy = togglingId === slot.id;

                return (
                  <View key={slot.id} style={styles.slotCard}>
                    <View style={styles.timeCol}>
                      <Text style={styles.timeText}>{formatTime(slot.startAt)}</Text>
                      {slot.endAt ? (
                        <Text style={styles.timeSub}>{formatTime(slot.endAt)}</Text>
                      ) : null}
                    </View>

                    <View style={{ flex: 1 }}>
                      {isBooked ? (
                        <>
                          <Text style={styles.bookedTitle}>
                            {patientName || 'Booked Appointment'}
                          </Text>
                          <Text style={styles.bookedSub}>
                            {appt?.status || 'BOOKED'} • {appt?.consultationType || 'VIDEO'}
                          </Text>
                        </>
                      ) : isBlocked ? (
                        <Text style={styles.blockedLabel}>Blocked</Text>
                      ) : (
                        <Text style={styles.freeLabel}>Free Slot</Text>
                      )}
                    </View>

                    {isBooked ? (
                      <View style={styles.bookedBadge}>
                        <Text style={styles.bookedBadgeText}>BOOKED</Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={[
                          styles.actionBtn,
                          isBlocked ? styles.unblockBtn : styles.blockBtn,
                        ]}
                        onPress={() => handleToggleSlot(slot, isBlocked)}
                        disabled={isBusy}
                      >
                        {isBusy ? (
                          <ActivityIndicator
                            size="small"
                            color={isBlocked ? Colors.primary : Colors.error}
                          />
                        ) : (
                          <>
                            <MaterialIcons
                              name={isBlocked ? 'lock-open' : 'block'}
                              size={15}
                              color={isBlocked ? Colors.primary : Colors.error}
                            />
                            <Text
                              style={[
                                styles.actionBtnText,
                                { color: isBlocked ? Colors.primary : Colors.error },
                              ]}
                            >
                              {isBlocked ? 'Unblock' : 'Block'}
                            </Text>
                          </>
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
            </View>
          ))}
        </StateView>

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm },
  rangeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    ...Shadows.subtle,
  },
  rangeText: {
    ...Typography.bodySmall,
    color: Colors.onSurfaceVariant,
  },
  dateGroup: {
    marginBottom: Spacing.lg,
  },
  dateHeader: {
    ...Typography.labelMedium,
    color: Colors.primary,
    marginBottom: Spacing.sm,
  },
  slotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadows.subtle,
  },
  timeCol: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
    minWidth: 82,
    alignItems: 'center',
  },
  timeText: {
    ...Typography.labelSmall,
    color: Colors.onSurface,
    textTransform: 'none',
  },
  timeSub: {
    ...Typography.bodySmall,
    fontSize: 10,
    color: Colors.onSurfaceVariant,
  },
  bookedTitle: {
    ...Typography.titleSmall,
    color: Colors.onSurface,
  },
  bookedSub: {
    ...Typography.bodySmall,
    color: Colors.primary,
  },
  blockedLabel: {
    ...Typography.titleSmall,
    color: Colors.error,
  },
  freeLabel: {
    ...Typography.titleSmall,
    color: Colors.secondary,
  },
  bookedBadge: {
    backgroundColor: `${Colors.primary}15`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  bookedBadgeText: {
    ...Typography.labelSmall,
    color: Colors.primary,
    fontSize: 9,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
  },
  blockBtn: {
    backgroundColor: `${Colors.error}12`,
  },
  unblockBtn: {
    backgroundColor: `${Colors.primary}15`,
  },
  actionBtnText: {
    ...Typography.labelSmall,
    textTransform: 'none',
  },
});

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../../theme';
import { Header, InputField, PrimaryButton, StateView } from '../../../components';
import { doctorService } from '../../../api';
import { useApi } from '../../../hooks/useApi';
import { isoDay, formatDate } from '../../../utils/format';
import {
  listExceptions,
  addException,
  deleteException,
  addClinic,
} from './doctorExtrasApi';

type Props = { navigation: NativeStackNavigationProp<any> };

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const ScheduleScreen: React.FC<Props> = ({ navigation }) => {
  const {
    data: availData,
    loading: availLoading,
    error: availError,
    refresh: refreshAvail,
  } = useApi(() => doctorService.availability(), []);

  const {
    data: excData,
    loading: excLoading,
    error: excError,
    refresh: refreshExc,
  } = useApi(() => listExceptions(), []);

  // Weekly rule state
  const [dayOfWeek, setDayOfWeek] = useState<number>(1);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('13:00');
  const [slotDuration, setSlotDuration] = useState('30');
  const [addingRule, setAddingRule] = useState(false);
  const [deletingRuleId, setDeletingRuleId] = useState<number | null>(null);

  // Exception state
  const [excDate, setExcDate] = useState(() => isoDay(1));
  const [excType, setExcType] = useState<'UNAVAILABLE' | 'EXTRA_AVAILABILITY'>('UNAVAILABLE');
  const [excStart, setExcStart] = useState('14:00');
  const [excEnd, setExcEnd] = useState('17:00');
  const [excReason, setExcReason] = useState('');
  const [addingExc, setAddingExc] = useState(false);
  const [deletingExcId, setDeletingExcId] = useState<number | null>(null);

  // Clinic state
  const [clinicName, setClinicName] = useState('');
  const [clinicAddress, setClinicAddress] = useState('');
  const [clinicCity, setClinicCity] = useState('');
  const [clinicLat, setClinicLat] = useState('24.8607');
  const [clinicLng, setClinicLng] = useState('67.0011');
  const [clinicPhone, setClinicPhone] = useState('');
  const [addingClinic, setAddingClinic] = useState(false);

  // Generate slots state
  const [generatingSlots, setGeneratingSlots] = useState(false);

  const rules: any[] = Array.isArray(availData) ? availData : [];
  const exceptions: any[] = Array.isArray(excData) ? excData : [];

  const handleAddRule = async () => {
    if (!startTime.trim() || !endTime.trim()) {
      Alert.alert('Validation', 'Please enter start and end times (HH:MM).');
      return;
    }
    setAddingRule(true);
    try {
      await doctorService.addAvailability({
        dayOfWeek,
        startTime: startTime.trim(),
        endTime: endTime.trim(),
        slotDuration: Number(slotDuration) || 30,
      });
      await refreshAvail();
    } catch (e: any) {
      Alert.alert('Schedule Error', e?.message ?? 'Could not add availability rule.');
    } finally {
      setAddingRule(false);
    }
  };

  const handleDeleteRule = async (id: number) => {
    setDeletingRuleId(id);
    try {
      await doctorService.deleteAvailability(id);
      await refreshAvail();
    } catch (e: any) {
      Alert.alert('Delete Error', e?.message ?? 'Could not delete rule.');
    } finally {
      setDeletingRuleId(null);
    }
  };

  const handleAddException = async () => {
    if (!excDate.trim()) {
      Alert.alert('Validation', 'Please enter a date (YYYY-MM-DD).');
      return;
    }
    setAddingExc(true);
    try {
      await addException({
        date: excDate.trim(),
        type: excType,
        startTime: excType === 'EXTRA_AVAILABILITY' ? excStart.trim() : undefined,
        endTime: excType === 'EXTRA_AVAILABILITY' ? excEnd.trim() : undefined,
        reason: excReason.trim() || undefined,
      });
      setExcReason('');
      await refreshExc();
    } catch (e: any) {
      Alert.alert('Exception Error', e?.message ?? 'Could not add schedule exception.');
    } finally {
      setAddingExc(false);
    }
  };

  const handleDeleteException = async (id: number) => {
    setDeletingExcId(id);
    try {
      await deleteException(id);
      await refreshExc();
    } catch (e: any) {
      Alert.alert('Delete Error', e?.message ?? 'Could not remove exception.');
    } finally {
      setDeletingExcId(null);
    }
  };

  const handleGenerateSlots = async () => {
    setGeneratingSlots(true);
    try {
      const from = isoDay(0);
      const to = isoDay(30);
      await doctorService.generateSlots(from, to);
      Alert.alert('Slots Generated', `Bookable slots generated from ${from} to ${to}.`);
    } catch (e: any) {
      Alert.alert('Generate Failed', e?.message ?? 'Could not generate slots.');
    } finally {
      setGeneratingSlots(false);
    }
  };

  const handleAddClinic = async () => {
    if (!clinicName.trim() || !clinicAddress.trim()) {
      Alert.alert('Validation', 'Please enter clinic name and address.');
      return;
    }
    setAddingClinic(true);
    try {
      await addClinic({
        name: clinicName.trim(),
        address: clinicAddress.trim(),
        city: clinicCity.trim() || undefined,
        latitude: Number(clinicLat) || 24.8607,
        longitude: Number(clinicLng) || 67.0011,
        phone: clinicPhone.trim() || undefined,
      });
      setClinicName('');
      setClinicAddress('');
      setClinicCity('');
      setClinicPhone('');
      Alert.alert('Success', 'Private clinic saved.');
    } catch (e: any) {
      Alert.alert('Clinic Error', e?.message ?? 'Could not add private clinic.');
    } finally {
      setAddingClinic(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Schedule & Availability"
        showBack
        onBack={() => navigation.goBack()}
        onNotification={() => navigation.navigate('Notifications')}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Generate Slots Banner */}
        <View style={styles.generateCard}>
          <View style={styles.generateInfo}>
            <MaterialIcons name="event-repeat" size={24} color={Colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.generateTitle}>Publish Next 30 Days</Text>
              <Text style={styles.generateSub}>
                Create bookable appointment slots from your weekly rules ({isoDay(0)} to {isoDay(30)}).
              </Text>
            </View>
          </View>
          <PrimaryButton
            title="Generate Bookable Slots (Next 30 Days)"
            onPress={handleGenerateSlots}
            loading={generatingSlots}
          />
        </View>

        {/* Weekly Availability Rules */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Weekly Availability Rules</Text>
          <Text style={styles.fieldLabel}>SELECT DAY</Text>
          <View style={styles.daysRow}>
            {DAYS.map((d, idx) => {
              const active = dayOfWeek === idx;
              return (
                <TouchableOpacity
                  key={d}
                  style={[styles.dayChip, active && styles.dayChipActive]}
                  onPress={() => setDayOfWeek(idx)}
                >
                  <Text style={[styles.dayChipText, active && styles.dayChipTextActive]}>{d}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.rowInputs}>
            <InputField
              label="START (HH:MM)"
              value={startTime}
              onChangeText={setStartTime}
              placeholder="09:00"
              style={{ flex: 1 }}
            />
            <InputField
              label="END (HH:MM)"
              value={endTime}
              onChangeText={setEndTime}
              placeholder="13:00"
              style={{ flex: 1 }}
            />
            <InputField
              label="MINS"
              value={slotDuration}
              onChangeText={setSlotDuration}
              keyboardType="numeric"
              placeholder="30"
              style={{ width: 85 }}
            />
          </View>

          <PrimaryButton title="Add Weekly Rule" onPress={handleAddRule} loading={addingRule} />

          <View style={styles.listSection}>
            <StateView
              loading={availLoading}
              error={availError}
              empty={!availLoading && rules.length === 0}
              emptyText="No weekly rules configured yet."
              onRetry={refreshAvail}
            >
              {rules.map((r: any) => (
                <View key={r.id} style={styles.ruleItem}>
                  <View style={styles.ruleBadge}>
                    <Text style={styles.ruleBadgeText}>{DAYS[r.dayOfWeek] ?? `Day ${r.dayOfWeek}`}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.ruleTime}>
                      {r.startTime} – {r.endTime}
                    </Text>
                    <Text style={styles.ruleSub}>{r.slotDuration ?? 30} min slots</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDeleteRule(r.id)}
                    disabled={deletingRuleId === r.id}
                    style={styles.iconAction}
                  >
                    {deletingRuleId === r.id ? (
                      <ActivityIndicator size="small" color={Colors.error} />
                    ) : (
                      <MaterialIcons name="delete-outline" size={20} color={Colors.error} />
                    )}
                  </TouchableOpacity>
                </View>
              ))}
            </StateView>
          </View>
        </View>

        {/* Exceptions / Leaves */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Leaves & Extra Hours</Text>
          <View style={styles.typeToggleRow}>
            {(['UNAVAILABLE', 'EXTRA_AVAILABILITY'] as const).map((t) => {
              const active = excType === t;
              return (
                <TouchableOpacity
                  key={t}
                  style={[styles.typeBtn, active && styles.typeBtnActive]}
                  onPress={() => setExcType(t)}
                >
                  <Text style={[styles.typeBtnText, active && styles.typeBtnTextActive]}>
                    {t === 'UNAVAILABLE' ? 'Day Off / Leave' : 'Extra Availability'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <InputField
            label="DATE (YYYY-MM-DD)"
            value={excDate}
            onChangeText={setExcDate}
            placeholder="2026-12-01"
          />

          {excType === 'EXTRA_AVAILABILITY' && (
            <View style={styles.rowInputs}>
              <InputField
                label="START (HH:MM)"
                value={excStart}
                onChangeText={setExcStart}
                placeholder="14:00"
                style={{ flex: 1 }}
              />
              <InputField
                label="END (HH:MM)"
                value={excEnd}
                onChangeText={setExcEnd}
                placeholder="17:00"
                style={{ flex: 1 }}
              />
            </View>
          )}

          <InputField
            label="REASON (OPTIONAL)"
            value={excReason}
            onChangeText={setExcReason}
            placeholder="Conference, Personal leave..."
          />

          <PrimaryButton title="Save Exception" onPress={handleAddException} loading={addingExc} />

          <View style={styles.listSection}>
            <StateView
              loading={excLoading}
              error={excError}
              empty={!excLoading && exceptions.length === 0}
              emptyText="No schedule exceptions added."
              onRetry={refreshExc}
            >
              {exceptions.map((ex: any) => (
                <View key={ex.id} style={styles.ruleItem}>
                  <View
                    style={[
                      styles.ruleBadge,
                      {
                        backgroundColor:
                          ex.type === 'UNAVAILABLE' ? `${Colors.error}15` : `${Colors.primary}15`,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.ruleBadgeText,
                        { color: ex.type === 'UNAVAILABLE' ? Colors.error : Colors.primary },
                      ]}
                    >
                      {ex.type === 'UNAVAILABLE' ? 'OFF' : 'EXTRA'}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.ruleTime}>
                      {formatDate(ex.date) || ex.date}{' '}
                      {ex.startTime && ex.endTime ? `(${ex.startTime}–${ex.endTime})` : ''}
                    </Text>
                    {ex.reason ? <Text style={styles.ruleSub}>{ex.reason}</Text> : null}
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDeleteException(ex.id)}
                    disabled={deletingExcId === ex.id}
                    style={styles.iconAction}
                  >
                    {deletingExcId === ex.id ? (
                      <ActivityIndicator size="small" color={Colors.error} />
                    ) : (
                      <MaterialIcons name="delete-outline" size={20} color={Colors.error} />
                    )}
                  </TouchableOpacity>
                </View>
              ))}
            </StateView>
          </View>
        </View>

        {/* Private Clinic Setup */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Private Clinic Location</Text>
          <InputField
            label="CLINIC NAME"
            value={clinicName}
            onChangeText={setClinicName}
            placeholder="e.g. Siddiqui Care Clinic"
          />
          <InputField
            label="ADDRESS"
            value={clinicAddress}
            onChangeText={setClinicAddress}
            placeholder="Clifton Block 5"
          />
          <View style={styles.rowInputs}>
            <InputField
              label="CITY"
              value={clinicCity}
              onChangeText={setClinicCity}
              placeholder="Karachi"
              style={{ flex: 1 }}
            />
            <InputField
              label="PHONE"
              value={clinicPhone}
              onChangeText={setClinicPhone}
              placeholder="0300-0000000"
              style={{ flex: 1 }}
            />
          </View>
          <View style={styles.rowInputs}>
            <InputField
              label="LATITUDE"
              value={clinicLat}
              onChangeText={setClinicLat}
              keyboardType="numeric"
              style={{ flex: 1 }}
            />
            <InputField
              label="LONGITUDE"
              value={clinicLng}
              onChangeText={setClinicLng}
              keyboardType="numeric"
              style={{ flex: 1 }}
            />
          </View>
          <PrimaryButton title="Save Private Clinic" onPress={handleAddClinic} loading={addingClinic} />
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm },
  generateCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
    ...Shadows.subtle,
  },
  generateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  generateTitle: {
    ...Typography.titleSmall,
    fontSize: 16,
    color: Colors.onSurface,
  },
  generateSub: {
    ...Typography.bodySmall,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  card: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.subtle,
  },
  cardTitle: {
    ...Typography.titleMedium,
    color: Colors.onSurface,
    marginBottom: Spacing.md,
  },
  fieldLabel: {
    ...Typography.labelSmall,
    color: Colors.onSurfaceVariant,
    marginBottom: Spacing.xs,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  dayChip: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceContainerLow,
  },
  dayChipActive: {
    backgroundColor: Colors.primary,
  },
  dayChipText: {
    ...Typography.labelSmall,
    color: Colors.onSurfaceVariant,
  },
  dayChipTextActive: {
    color: Colors.onPrimary,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  listSection: {
    marginTop: Spacing.lg,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceContainer,
  },
  ruleBadge: {
    backgroundColor: `${Colors.primary}15`,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    minWidth: 54,
    alignItems: 'center',
  },
  ruleBadgeText: {
    ...Typography.labelSmall,
    color: Colors.primary,
  },
  ruleTime: {
    ...Typography.titleSmall,
    color: Colors.onSurface,
  },
  ruleSub: {
    ...Typography.bodySmall,
    color: Colors.onSurfaceVariant,
  },
  iconAction: {
    padding: 6,
  },
  typeToggleRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
  },
  typeBtnActive: {
    backgroundColor: Colors.primary,
  },
  typeBtnText: {
    ...Typography.labelSmall,
    color: Colors.onSurfaceVariant,
  },
  typeBtnTextActive: {
    color: Colors.onPrimary,
  },
});

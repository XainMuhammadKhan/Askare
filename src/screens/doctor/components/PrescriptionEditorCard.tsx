import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography, Shadows } from '../../../theme';
import {
  Prescription,
  PrescriptionItem,
  doctorService,
  aiService,
  ApiError,
} from '../../../api';

interface Props {
  appointmentId: number;
  initialPrescription?: Prescription | null;
  editable: boolean;
  onSaved: () => void;
}

interface SafetyResult {
  safe?: boolean;
  allergyWarnings?: string[];
  aiWarnings?: { medicine?: string; severity?: string; message: string }[];
}

const emptyItem = (): PrescriptionItem => ({
  medicine: '',
  dosage: '',
  frequency: '',
  durationDays: 5,
  instructions: '',
});

export const PrescriptionEditorCard: React.FC<Props> = ({
  appointmentId,
  initialPrescription,
  editable,
  onSaved,
}) => {
  const [items, setItems] = useState<PrescriptionItem[]>(
    initialPrescription?.items?.length ? initialPrescription.items : [emptyItem()]
  );
  const [notes, setNotes] = useState(initialPrescription?.notes ?? '');
  const [labTestsStr, setLabTestsStr] = useState(
    initialPrescription?.labTests?.join(', ') ?? ''
  );
  const [safety, setSafety] = useState<SafetyResult | null>(null);
  const [checking, setChecking] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialPrescription) {
      setItems(
        initialPrescription.items?.length ? initialPrescription.items : [emptyItem()]
      );
      setNotes(initialPrescription.notes ?? '');
      setLabTestsStr(initialPrescription.labTests?.join(', ') ?? '');
    }
  }, [initialPrescription]);

  const updateItem = (idx: number, patch: Partial<PrescriptionItem>) => {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
    setSafety(null);
  };

  const addItem = () => setItems((prev) => [...prev, emptyItem()]);

  const removeItem = (idx: number) => {
    if (items.length <= 1) {
      setItems([emptyItem()]);
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const validItems = items.filter((it) => it.medicine.trim().length > 0);

  const handleSafetyCheck = async () => {
    if (validItems.length === 0) {
      Alert.alert('Add Medicine First', 'Please enter at least one medicine to run the safety check.');
      return;
    }
    setChecking(true);
    try {
      const payload = validItems.map((it) => ({
        medicine: it.medicine.trim(),
        dosage: it.dosage.trim() || 'Standard',
        frequency: it.frequency.trim() || 'OD',
      }));
      const res = await aiService.prescriptionCheck(appointmentId, payload);
      setSafety(res);
    } catch (e: any) {
      if (e instanceof ApiError && e.status === 503) {
        Alert.alert('AI Busy', 'AI safety checker is temporarily busy. Please try again shortly.');
      } else {
        Alert.alert('Safety Check Error', e?.message ?? 'Could not run safety check.');
      }
    } finally {
      setChecking(false);
    }
  };

  const handleSave = async () => {
    if (validItems.length === 0) {
      Alert.alert('Validation Error', 'Please add at least one medicine with dosage and frequency.');
      return;
    }
    for (const it of validItems) {
      if (!it.dosage.trim() || !it.frequency.trim()) {
        Alert.alert('Validation Error', `Please specify dosage and frequency for ${it.medicine}.`);
        return;
      }
    }
    setSaving(true);
    try {
      const cleanedItems: PrescriptionItem[] = validItems.map((it) => ({
        medicine: it.medicine.trim(),
        dosage: it.dosage.trim(),
        frequency: it.frequency.trim(),
        durationDays: Number(it.durationDays) > 0 ? Number(it.durationDays) : undefined,
        instructions: it.instructions?.trim() || undefined,
      }));
      const labTests = labTestsStr
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await doctorService.savePrescription(
        appointmentId,
        cleanedItems,
        notes.trim() || undefined,
        labTests.length > 0 ? labTests : undefined
      );
      Alert.alert('Prescription Saved', 'Digital prescription has been saved and shared with the patient.');
      onSaved();
    } catch (e: any) {
      Alert.alert('Save Failed', e?.message ?? 'Could not save prescription.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <MaterialIcons name="medication" size={20} color={Colors.primary} />
          <Text style={styles.title}>Digital Prescription (Rx)</Text>
        </View>
        {editable && (
          <TouchableOpacity style={styles.addBtn} onPress={addItem}>
            <MaterialIcons name="add" size={16} color={Colors.primary} />
            <Text style={styles.addBtnText}>Add Medicine</Text>
          </TouchableOpacity>
        )}
      </View>

      {items.map((item, idx) => (
        <View key={idx} style={styles.itemBox}>
          <View style={styles.itemTopRow}>
            <Text style={styles.itemIndex}>Medicine #{idx + 1}</Text>
            {editable && (
              <TouchableOpacity onPress={() => removeItem(idx)}>
                <MaterialIcons name="delete-outline" size={18} color={Colors.error} />
              </TouchableOpacity>
            )}
          </View>

          <TextInput
            style={styles.input}
            placeholder="Medicine name (e.g. Paracetamol)"
            placeholderTextColor={Colors.outlineVariant}
            value={item.medicine}
            onChangeText={(v) => updateItem(idx, { medicine: v })}
            editable={editable}
          />

          <View style={styles.row3}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Dosage (500mg)"
              placeholderTextColor={Colors.outlineVariant}
              value={item.dosage}
              onChangeText={(v) => updateItem(idx, { dosage: v })}
              editable={editable}
            />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Freq (TDS / BD)"
              placeholderTextColor={Colors.outlineVariant}
              value={item.frequency}
              onChangeText={(v) => updateItem(idx, { frequency: v })}
              editable={editable}
            />
            <TextInput
              style={[styles.input, { width: 76 }]}
              placeholder="Days"
              placeholderTextColor={Colors.outlineVariant}
              keyboardType="numeric"
              value={item.durationDays ? String(item.durationDays) : ''}
              onChangeText={(v) =>
                updateItem(idx, { durationDays: parseInt(v, 10) || undefined })
              }
              editable={editable}
            />
          </View>

          <TextInput
            style={styles.input}
            placeholder="Instructions (e.g. After meals)"
            placeholderTextColor={Colors.outlineVariant}
            value={item.instructions ?? ''}
            onChangeText={(v) => updateItem(idx, { instructions: v })}
            editable={editable}
          />
        </View>
      ))}

      <View style={styles.field}>
        <Text style={styles.label}>Recommended Lab Tests (comma-separated)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. CBC, HbA1c, Lipid Profile"
          placeholderTextColor={Colors.outlineVariant}
          value={labTestsStr}
          onChangeText={setLabTestsStr}
          editable={editable}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Prescription Notes</Text>
        <TextInput
          style={[styles.input, { minHeight: 54 }]}
          placeholder="General instructions for pharmacist or patient..."
          placeholderTextColor={Colors.outlineVariant}
          value={notes}
          onChangeText={setNotes}
          editable={editable}
          multiline
        />
      </View>

      {/* AI Safety Check Result */}
      {safety && (
        <View
          style={[
            styles.safetyCard,
            safety.safe
              ? { backgroundColor: '#dcfce7', borderColor: '#16a34a' }
              : { backgroundColor: `${Colors.error}12`, borderColor: Colors.error },
          ]}
        >
          <View style={styles.safetyHeader}>
            <MaterialIcons
              name={safety.safe ? 'verified-user' : 'report-problem'}
              size={18}
              color={safety.safe ? '#15803d' : Colors.error}
            />
            <Text
              style={[
                styles.safetyTitle,
                { color: safety.safe ? '#15803d' : Colors.error },
              ]}
            >
              {safety.safe
                ? 'No Allergy or Interaction Warnings Detected'
                : 'Clinical Safety & Allergy Warnings'}
            </Text>
          </View>
          {(safety.allergyWarnings ?? []).map((w, i) => (
            <Text key={`alg-${i}`} style={styles.warningText}>
              • [Allergy] {w}
            </Text>
          ))}
          {(safety.aiWarnings ?? []).map((w, i) => (
            <Text key={`ai-${i}`} style={styles.warningText}>
              • {w.medicine ? `[${w.medicine}] ` : ''}
              {w.severity ? `(${w.severity}) ` : ''}
              {w.message}
            </Text>
          ))}
        </View>
      )}

      {editable && (
        <View style={styles.btnStack}>
          <TouchableOpacity
            style={styles.safetyBtn}
            onPress={handleSafetyCheck}
            disabled={checking}
          >
            {checking ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <>
                <MaterialIcons name="health-and-safety" size={18} color={Colors.primary} />
                <Text style={styles.safetyBtnText}>Run AI Safety & Allergy Check</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <>
                <MaterialIcons name="check-circle" size={18} color={Colors.white} />
                <Text style={styles.saveBtnText}>Save Prescription</Text>
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
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    ...Shadows.subtle,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 16, fontFamily: 'Manrope_700Bold', color: Colors.onSurface },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: `${Colors.primary}15`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  addBtnText: { fontSize: 12, fontFamily: 'Manrope_700Bold', color: Colors.primary },
  itemBox: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    gap: 8,
  },
  itemTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemIndex: { fontSize: 12, fontFamily: 'Manrope_700Bold', color: Colors.primary },
  row3: { flexDirection: 'row', gap: 8 },
  input: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: Colors.onSurface,
  },
  field: { marginBottom: 12 },
  label: {
    fontSize: 12,
    fontFamily: 'Manrope_700Bold',
    color: Colors.onSurfaceVariant,
    marginBottom: 6,
  },
  safetyCard: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  safetyHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  safetyTitle: { fontSize: 13, fontFamily: 'Manrope_700Bold' },
  warningText: {
    ...Typography.bodySmall,
    color: Colors.onSurface,
    marginTop: 4,
    lineHeight: 18,
  },
  btnStack: { gap: 10 },
  safetyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: `${Colors.primary}14`,
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 14,
  },
  safetyBtnText: { fontSize: 13, fontFamily: 'Manrope_700Bold', color: Colors.primary },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 13,
    borderRadius: 14,
  },
  saveBtnText: { fontSize: 14, fontFamily: 'Manrope_700Bold', color: Colors.white },
});

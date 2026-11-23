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
import { Consultation, doctorService, aiService, ApiError } from '../../../api';

interface Props {
  appointmentId: number;
  initialConsultation?: Consultation | null;
  editable: boolean;
  onSaved: () => void;
}

export const ConsultationNotesForm: React.FC<Props> = ({
  appointmentId,
  initialConsultation,
  editable,
  onSaved,
}) => {
  const [symptoms, setSymptoms] = useState(initialConsultation?.symptoms ?? '');
  const [diagnosis, setDiagnosis] = useState(initialConsultation?.diagnosis ?? '');
  const [notes, setNotes] = useState(initialConsultation?.notes ?? '');
  const [advice, setAdvice] = useState(initialConsultation?.advice ?? '');
  const [followUpDate, setFollowUpDate] = useState(
    initialConsultation?.followUpDate
      ? initialConsultation.followUpDate.slice(0, 10)
      : ''
  );
  const [rawNotes, setRawNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [soapLoading, setSoapLoading] = useState(false);

  useEffect(() => {
    if (initialConsultation) {
      setSymptoms(initialConsultation.symptoms ?? '');
      setDiagnosis(initialConsultation.diagnosis ?? '');
      setNotes(initialConsultation.notes ?? '');
      setAdvice(initialConsultation.advice ?? '');
      setFollowUpDate(
        initialConsultation.followUpDate
          ? initialConsultation.followUpDate.slice(0, 10)
          : ''
      );
    }
  }, [initialConsultation]);

  const handleRunSoap = async () => {
    const sourceText = rawNotes.trim() || [symptoms, notes, diagnosis, advice].filter(Boolean).join('. ');
    if (sourceText.length < 5) {
      Alert.alert('More Detail Needed', 'Enter rough clinical notes (at least 5 characters) for the AI SOAP Assistant.');
      return;
    }
    setSoapLoading(true);
    try {
      const res = await aiService.soapNotes(appointmentId, sourceText);
      const soap = res?.soap ?? res;
      if (soap?.symptoms || soap?.subjective) {
        setSymptoms(soap.symptoms ?? soap.subjective ?? symptoms);
      }
      if (soap?.diagnosis || soap?.assessment) {
        setDiagnosis(soap.diagnosis ?? soap.assessment ?? diagnosis);
      }
      if (soap?.notes || soap?.objective) {
        setNotes(soap.notes ?? soap.objective ?? notes);
      }
      if (soap?.advice || soap?.plan) {
        setAdvice(soap.advice ?? soap.plan ?? advice);
      }
      Alert.alert('AI SOAP Applied', 'Your notes have been structured into clinical fields. Review and save when ready.');
    } catch (e: any) {
      if (e instanceof ApiError && e.status === 503) {
        Alert.alert('AI Busy', 'The AI SOAP assistant is temporarily busy. Please try again in a minute.');
      } else {
        Alert.alert('SOAP Assistant Error', e?.message ?? 'Could not structure notes.');
      }
    } finally {
      setSoapLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await doctorService.saveConsultation(appointmentId, {
        symptoms: symptoms.trim() || undefined,
        diagnosis: diagnosis.trim() || undefined,
        notes: notes.trim() || undefined,
        advice: advice.trim() || undefined,
        followUpDate: followUpDate.trim() || undefined,
      });
      Alert.alert('Saved', 'Consultation notes saved successfully.');
      onSaved();
    } catch (e: any) {
      Alert.alert('Save Failed', e?.message ?? 'Could not save consultation notes.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <MaterialIcons name="assignment" size={20} color={Colors.primary} />
        <Text style={styles.title}>Consultation Notes (SOAP)</Text>
      </View>

      {editable && (
        <View style={styles.soapBox}>
          <Text style={styles.soapLabel}>Quick Dictation / Rough Notes for AI SOAP</Text>
          <View style={styles.soapRow}>
            <TextInput
              style={styles.soapInput}
              placeholder="e.g. Pt has 3d fever 101F, sore throat, lungs clear, viral pharyngitis, rest & fluids..."
              placeholderTextColor={Colors.outlineVariant}
              value={rawNotes}
              onChangeText={setRawNotes}
              multiline
            />
            <TouchableOpacity
              style={styles.soapBtn}
              onPress={handleRunSoap}
              disabled={soapLoading}
            >
              {soapLoading ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
                <>
                  <MaterialIcons name="auto-fix-high" size={16} color={Colors.primary} />
                  <Text style={styles.soapBtnText}>AI SOAP Assistant</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.field}>
        <Text style={styles.label}>Symptoms (Subjective)</Text>
        <TextInput
          style={styles.input}
          placeholder="Patient's reported symptoms..."
          placeholderTextColor={Colors.outlineVariant}
          value={symptoms}
          onChangeText={setSymptoms}
          editable={editable}
          multiline
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Clinical Examination & Notes (Objective)</Text>
        <TextInput
          style={[styles.input, { minHeight: 68 }]}
          placeholder="Examination findings, vitals, observations..."
          placeholderTextColor={Colors.outlineVariant}
          value={notes}
          onChangeText={setNotes}
          editable={editable}
          multiline
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Diagnosis (Assessment)</Text>
        <TextInput
          style={styles.input}
          placeholder="Primary and differential diagnosis..."
          placeholderTextColor={Colors.outlineVariant}
          value={diagnosis}
          onChangeText={setDiagnosis}
          editable={editable}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Medical Advice & Plan</Text>
        <TextInput
          style={[styles.input, { minHeight: 60 }]}
          placeholder="Lifestyle advice, precautions, warning signs..."
          placeholderTextColor={Colors.outlineVariant}
          value={advice}
          onChangeText={setAdvice}
          editable={editable}
          multiline
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Follow-up Date (YYYY-MM-DD, optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 2026-12-15"
          placeholderTextColor={Colors.outlineVariant}
          value={followUpDate}
          onChangeText={setFollowUpDate}
          editable={editable}
        />
      </View>

      {editable && (
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <>
              <MaterialIcons name="save" size={18} color={Colors.white} />
              <Text style={styles.saveBtnText}>Save Consultation Notes</Text>
            </>
          )}
        </TouchableOpacity>
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
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  title: { fontSize: 16, fontFamily: 'Manrope_700Bold', color: Colors.onSurface },
  soapBox: {
    backgroundColor: `${Colors.primary}08`,
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: `${Colors.primary}20`,
  },
  soapLabel: {
    fontSize: 11,
    fontFamily: 'Manrope_700Bold',
    color: Colors.primary,
    marginBottom: 6,
  },
  soapRow: { gap: 8 },
  soapInput: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: Colors.onSurface,
    minHeight: 54,
    textAlignVertical: 'top',
  },
  soapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: `${Colors.primary}15`,
    paddingVertical: 9,
    borderRadius: 10,
  },
  soapBtnText: { fontSize: 12, fontFamily: 'Manrope_700Bold', color: Colors.primary },
  field: { marginBottom: 12 },
  label: {
    fontSize: 12,
    fontFamily: 'Manrope_700Bold',
    color: Colors.onSurfaceVariant,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.onSurface,
    textAlignVertical: 'top',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 13,
    borderRadius: 14,
    marginTop: 4,
  },
  saveBtnText: { fontSize: 14, fontFamily: 'Manrope_700Bold', color: Colors.white },
});

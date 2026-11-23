import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  RefreshControl,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Typography } from '../../theme';
import { Header, InputField, PrimaryButton, StateView } from '../../components';
import { useAuthStore } from '../../store/authStore';
import { patientService, authService } from '../../api';
import { useApi } from '../../hooks/useApi';
import { initials } from '../../utils/format';

type Props = { navigation: NativeStackNavigationProp<any> };

const parseCommaList = (raw: string): string[] =>
  raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

const joinCommaList = (arr?: string[] | null): string =>
  Array.isArray(arr) ? arr.join(', ') : '';

export const PatientInfoScreen: React.FC<Props> = ({ navigation }) => {
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);

  // Account fields
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [gender, setGender] = useState(user?.gender || '');
  const [dateOfBirth, setDateOfBirth] = useState(
    user?.dateOfBirth ? user.dateOfBirth.slice(0, 10) : ''
  );
  const [bloodGroup, setBloodGroup] = useState(user?.bloodGroup || '');

  // Health profile fields
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [conditions, setConditions] = useState('');
  const [allergies, setAllergies] = useState('');
  const [currentMedications, setCurrentMedications] = useState('');
  const [pastSurgeries, setPastSurgeries] = useState('');
  const [familyHistory, setFamilyHistory] = useState('');
  const [lifestyleNotes, setLifestyleNotes] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');

  const [savingAccount, setSavingAccount] = useState(false);
  const [savingHealth, setSavingHealth] = useState(false);

  const {
    data: loadedData,
    loading,
    error,
    refresh,
  } = useApi(async () => {
    const [acct, med] = await Promise.all([
      authService.profile().catch(() => null),
      patientService.getMedicalProfile().catch(() => null),
    ]);
    return { acct, med };
  }, []);

  useEffect(() => {
    if (loadedData?.acct) {
      const a = loadedData.acct;
      setName(a.name || '');
      setPhone(a.phone || '');
      setAddress(a.address || '');
      setGender(a.gender || '');
      setDateOfBirth(a.dateOfBirth ? a.dateOfBirth.slice(0, 10) : '');
      setBloodGroup(a.bloodGroup || '');
      updateUser(a);
    }
    if (loadedData?.med) {
      const m = loadedData.med;
      setHeightCm(m.heightCm != null ? String(m.heightCm) : '');
      setWeightKg(m.weightKg != null ? String(m.weightKg) : '');
      setConditions(joinCommaList(m.conditions));
      setAllergies(joinCommaList(m.allergies));
      setCurrentMedications(joinCommaList(m.currentMedications));
      setPastSurgeries(joinCommaList(m.pastSurgeries));
      setFamilyHistory(m.familyHistory || '');
      setLifestyleNotes(m.lifestyleNotes || '');
      setEmergencyContact(m.emergencyContact || '');
    }
  }, [loadedData, updateUser]);

  const handleSaveAccount = async () => {
    if (!name.trim()) {
      Alert.alert('Validation', 'Please enter your full name.');
      return;
    }
    setSavingAccount(true);
    try {
      const updated = await patientService.updateProfile({
        name: name.trim(),
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
        gender: gender.trim() || undefined,
        dateOfBirth: dateOfBirth.trim() || undefined,
        bloodGroup: bloodGroup.trim() || undefined,
      });
      updateUser(updated);
      Alert.alert('Saved', 'Account details updated successfully.');
    } catch (e: any) {
      Alert.alert('Update Failed', e?.message || 'Could not update profile.');
    } finally {
      setSavingAccount(false);
    }
  };

  const handleSaveHealth = async () => {
    setSavingHealth(true);
    try {
      const hNum = heightCm.trim() ? Number(heightCm.trim()) : null;
      const wNum = weightKg.trim() ? Number(weightKg.trim()) : null;
      await patientService.saveMedicalProfile({
        heightCm: Number.isFinite(hNum) ? hNum : null,
        weightKg: Number.isFinite(wNum) ? wNum : null,
        conditions: parseCommaList(conditions),
        allergies: parseCommaList(allergies),
        currentMedications: parseCommaList(currentMedications),
        pastSurgeries: parseCommaList(pastSurgeries),
        familyHistory: familyHistory.trim() || null,
        lifestyleNotes: lifestyleNotes.trim() || null,
        emergencyContact: emergencyContact.trim() || null,
      });
      Alert.alert('Saved', 'Health profile updated successfully.');
    } catch (e: any) {
      Alert.alert('Update Failed', e?.message || 'Could not save health profile.');
    } finally {
      setSavingHealth(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Personal & Health Profile"
        showBack
        onBack={() => navigation.goBack()}
        showNotification={false}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
            tintColor={Colors.primary}
          />
        }
      >
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarInitials}>{initials(name || user?.name || 'P')}</Text>
          </View>
          <Text style={styles.name}>{name || user?.name || 'Patient'}</Text>
          <Text style={styles.subtitle}>{user?.email}</Text>
        </View>

        <StateView loading={loading && !loadedData} error={error} onRetry={refresh}>
          {/* Account Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Information</Text>
            <InputField label="FULL NAME" value={name} onChangeText={setName} />
            <InputField
              label="EMAIL ADDRESS"
              value={user?.email || ''}
              onChangeText={() => {}}
              editable={false}
            />
            <InputField
              label="PHONE NUMBER"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <InputField
                  label="DATE OF BIRTH (YYYY-MM-DD)"
                  placeholder="1990-05-15"
                  value={dateOfBirth}
                  onChangeText={setDateOfBirth}
                />
              </View>
              <View style={{ flex: 1 }}>
                <InputField
                  label="GENDER"
                  placeholder="male / female"
                  value={gender}
                  onChangeText={setGender}
                />
              </View>
            </View>
            <InputField
              label="BLOOD GROUP"
              placeholder="A+, B+, O+, AB+..."
              value={bloodGroup}
              onChangeText={setBloodGroup}
            />
            <InputField
              label="RESIDENTIAL ADDRESS"
              value={address}
              onChangeText={setAddress}
              multiline
              numberOfLines={2}
            />
            <PrimaryButton
              title="Save Account Info"
              onPress={handleSaveAccount}
              loading={savingAccount}
              icon={<MaterialIcons name="check" size={18} color={Colors.onPrimary} />}
            />
          </View>

          {/* Medical / Health Profile */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Clinical Health Profile</Text>
            <Text style={styles.helperText}>
              Separate multiple items with commas (e.g. Diabetes, Hypertension).
            </Text>

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <InputField
                  label="HEIGHT (CM)"
                  placeholder="175"
                  value={heightCm}
                  onChangeText={setHeightCm}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1 }}>
                <InputField
                  label="WEIGHT (KG)"
                  placeholder="70"
                  value={weightKg}
                  onChangeText={setWeightKg}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <InputField
              label="CHRONIC CONDITIONS (COMMA-SEPARATED)"
              placeholder="Type 2 Diabetes, Hypertension"
              value={conditions}
              onChangeText={setConditions}
            />
            <InputField
              label="KNOWN ALLERGIES (COMMA-SEPARATED)"
              placeholder="Penicillin, Peanuts"
              value={allergies}
              onChangeText={setAllergies}
            />
            <InputField
              label="CURRENT MEDICATIONS (COMMA-SEPARATED)"
              placeholder="Metformin 500mg, Amlodipine 5mg"
              value={currentMedications}
              onChangeText={setCurrentMedications}
            />
            <InputField
              label="PAST SURGERIES (COMMA-SEPARATED)"
              placeholder="Appendectomy 2018"
              value={pastSurgeries}
              onChangeText={setPastSurgeries}
            />
            <InputField
              label="FAMILY MEDICAL HISTORY"
              placeholder="Family history of heart disease or diabetes"
              value={familyHistory}
              onChangeText={setFamilyHistory}
              multiline
              numberOfLines={2}
            />
            <InputField
              label="LIFESTYLE NOTES"
              placeholder="Non-smoker, exercises 3x/week"
              value={lifestyleNotes}
              onChangeText={setLifestyleNotes}
              multiline
              numberOfLines={2}
            />
            <InputField
              label="EMERGENCY CONTACT"
              placeholder="Name – 0300-0000000"
              value={emergencyContact}
              onChangeText={setEmergencyContact}
            />

            <PrimaryButton
              title="Save Health Profile"
              onPress={handleSaveHealth}
              loading={savingHealth}
              icon={<MaterialIcons name="favorite" size={18} color={Colors.onPrimary} />}
            />
          </View>
        </StateView>
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: 16, paddingBottom: 40 },
  avatarSection: { alignItems: 'center', paddingVertical: 16 },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: `${Colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  avatarInitials: {
    fontSize: 28,
    fontFamily: 'Manrope_700Bold',
    color: Colors.primary,
  },
  name: {
    fontSize: 20,
    fontFamily: 'Manrope_700Bold',
    color: Colors.onSurface,
    marginBottom: 2,
  },
  subtitle: {
    ...Typography.bodyMedium,
    color: Colors.onSurfaceVariant,
  },
  section: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHighest,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Manrope_700Bold',
    color: Colors.primary,
    marginBottom: 8,
  },
  helperText: {
    ...Typography.bodySmall,
    color: Colors.onSurfaceVariant,
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
});

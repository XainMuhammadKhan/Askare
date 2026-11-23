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
import { doctorService } from '../../api';
import { useApi } from '../../hooks/useApi';
import { useAuthStore } from '../../store/authStore';
import { doctorName, initials, specializationOf } from '../../utils/format';

type Props = { navigation: NativeStackNavigationProp<any> };

export const DoctorInfoScreen: React.FC<Props> = ({ navigation }) => {
  const updateUser = useAuthStore((s) => s.updateUser);
  const { data: profile, loading, error, refresh } = useApi(
    () => doctorService.profile(),
    []
  );

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [bio, setBio] = useState('');
  const [qualification, setQualification] = useState('');
  const [experience, setExperience] = useState('');
  const [consultationFee, setConsultationFee] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setPhone(profile.phone || '');
      setCity(profile.city || '');
      setAddress(profile.address || '');
      setBio(profile.bio || '');
      setQualification(profile.qualification || '');
      setExperience(profile.experience != null ? String(profile.experience) : '');
      setConsultationFee(
        profile.consultationFee != null ? String(profile.consultationFee) : ''
      );
    }
  }, [profile]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Validation', 'Full name is required.');
      return;
    }
    const expNum = experience.trim() ? Number(experience.trim()) : undefined;
    const feeNum = consultationFee.trim() ? Number(consultationFee.trim()) : undefined;

    if (expNum !== undefined && (!Number.isFinite(expNum) || expNum < 0)) {
      Alert.alert('Validation', 'Please enter a valid years of experience number.');
      return;
    }
    if (feeNum !== undefined && (!Number.isFinite(feeNum) || feeNum < 0)) {
      Alert.alert('Validation', 'Please enter a valid consultation fee.');
      return;
    }

    setSaving(true);
    try {
      const updated = await doctorService.updateProfile({
        name: name.trim(),
        phone: phone.trim() || undefined,
        city: city.trim() || undefined,
        address: address.trim() || undefined,
        bio: bio.trim() || undefined,
        qualification: qualification.trim() || undefined,
        experience: expNum,
        consultationFee: feeNum,
      });
      updateUser({ name: updated?.name || name.trim(), phone: updated?.phone || phone.trim() });
      Alert.alert('Saved', 'Doctor profile updated successfully.');
    } catch (e: any) {
      Alert.alert('Update Failed', e?.message || 'Could not update doctor profile.');
    } finally {
      setSaving(false);
    }
  };

  const specName = specializationOf(profile);
  const hospitalName = profile?.hospital?.name;
  const status = profile?.status || 'ACTIVE';

  return (
    <View style={styles.container}>
      <Header
        title="Doctor Profile"
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
        <StateView loading={loading && !profile} error={error} onRetry={refresh}>
          <View style={styles.avatarSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials(name || 'Dr')}</Text>
            </View>
            <Text style={styles.name}>{doctorName(name)}</Text>
            <Text style={styles.subtitle}>
              {specName} {hospitalName ? `• ${hospitalName}` : ''}
            </Text>
            <View style={styles.statusPill}>
              <Text style={styles.statusText}>STATUS: {status}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Details</Text>
            <InputField label="FULL NAME" value={name} onChangeText={setName} />
            <InputField
              label="EMAIL ADDRESS"
              value={profile?.email || ''}
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
                  label="CITY"
                  placeholder="Karachi"
                  value={city}
                  onChangeText={setCity}
                />
              </View>
              <View style={{ flex: 1 }}>
                <InputField
                  label="LICENSE NUMBER"
                  value={profile?.licenseNumber || '—'}
                  onChangeText={() => {}}
                  editable={false}
                />
              </View>
            </View>
            <InputField
              label="CLINIC / ADDRESS"
              placeholder="Clinic or hospital address"
              value={address}
              onChangeText={setAddress}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Clinical Credentials & Fee</Text>
            <InputField
              label="QUALIFICATION"
              placeholder="MBBS, FCPS"
              value={qualification}
              onChangeText={setQualification}
            />
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <InputField
                  label="EXPERIENCE (YEARS)"
                  placeholder="10"
                  value={experience}
                  onChangeText={setExperience}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1 }}>
                <InputField
                  label="CONSULTATION FEE (PKR)"
                  placeholder="1500"
                  value={consultationFee}
                  onChangeText={setConsultationFee}
                  keyboardType="numeric"
                />
              </View>
            </View>
            <InputField
              label="PROFESSIONAL BIO"
              placeholder="Describe your clinical focus and experience"
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={4}
            />
          </View>

          <PrimaryButton
            title="Save Changes"
            onPress={handleSave}
            loading={saving}
            icon={<MaterialIcons name="check" size={20} color={Colors.onPrimary} />}
          />
        </StateView>
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: 16, paddingBottom: 40 },
  avatarSection: { alignItems: 'center', paddingVertical: 18 },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: `${Colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  avatarText: {
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
    marginBottom: 8,
  },
  statusPill: {
    backgroundColor: `${Colors.primary}15`,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontFamily: 'Manrope_700Bold',
    color: Colors.primary,
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
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
});

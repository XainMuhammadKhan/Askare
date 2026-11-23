import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';
import { PrimaryButton, InputField, RoleToggle } from '../../components';
import { authService, Specialization, UserRole } from '../../api';
import { useApi } from '../../hooks/useApi';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export const SignUpScreen: React.FC<Props> = ({ navigation }) => {
  const [role, setRole] = useState<UserRole>('patient');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [experience, setExperience] = useState('');
  const [consultationFee, setConsultationFee] = useState('');
  const [selectedSpecs, setSelectedSpecs] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  const { data: specs } = useApi<Specialization[]>(() => authService.specializations(), []);

  const toggleSpec = (id: number) => {
    setSelectedSpecs((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  };

  const handleSignUp = async () => {
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanName || !cleanEmail || !password) {
      Alert.alert('Missing fields', 'Please enter your full name, email address, and password.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak password', 'Password must be at least 6 characters long.');
      return;
    }
    if (role === 'doctor' && selectedSpecs.length === 0) {
      Alert.alert('Specialization required', 'Please select at least one specialization.');
      return;
    }

    setLoading(true);
    try {
      const userType = role === 'doctor' ? 'doctor' : 'patient';
      const payload: any = {
        userType,
        name: cleanName,
        email: cleanEmail,
        password,
        phone: phone.trim() || undefined,
      };
      if (userType === 'doctor') {
        payload.specializationIds = selectedSpecs;
        if (licenseNumber.trim()) payload.licenseNumber = licenseNumber.trim();
        if (experience.trim()) payload.experience = Number(experience) || undefined;
        if (consultationFee.trim()) payload.consultationFee = Number(consultationFee) || undefined;
      }

      await authService.register(payload);
      Alert.alert('Verification code sent', `We sent a 6-digit OTP to ${cleanEmail}.`);
      navigation.navigate('VerifyOtp', { email: cleanEmail, userType });
    } catch (e: any) {
      Alert.alert('Sign up failed', e?.message ?? 'Could not create your account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.bgAccent1} />
      <View style={styles.bgAccent2} />

      <View style={styles.header}>
        <Image
          source={require('../../../assets/Images/logo.png')}
          style={styles.headerImage}
          resizeMode="contain"
        />
        <View style={styles.brandUnderline} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.heading}>Begin your wellness{'\n'}journey</Text>
        <Text style={styles.subtitle}>
          Join a premium community dedicated to refined healthcare standards.
        </Text>

        <Text style={styles.roleLabel}>SELECT YOUR ROLE TO CONTINUE</Text>
        <RoleToggle value={role} onChange={setRole} />

        <InputField
          label="FULL NAME"
          placeholder={role === 'doctor' ? 'Dr. Ayesha Siddiqui' : 'Ahmed Raza'}
          value={name}
          onChangeText={setName}
        />
        <InputField
          label="EMAIL"
          placeholder="name@clinical.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <InputField
          label="PHONE (OPTIONAL)"
          placeholder="03001234567"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
        <InputField
          label="PASSWORD"
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {role === 'doctor' && (
          <View style={styles.doctorSection}>
            <InputField
              label="PMDC / LICENSE NUMBER"
              placeholder="PMDC-10000"
              value={licenseNumber}
              onChangeText={setLicenseNumber}
            />
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <InputField
                  label="EXPERIENCE (YRS)"
                  placeholder="10"
                  value={experience}
                  onChangeText={setExperience}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1 }}>
                <InputField
                  label="FEE (PKR)"
                  placeholder="2000"
                  value={consultationFee}
                  onChangeText={setConsultationFee}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <Text style={styles.specTitle}>SPECIALIZATIONS</Text>
            <View style={styles.specChips}>
              {(specs ?? []).map((sp) => {
                const active = selectedSpecs.includes(sp.id);
                return (
                  <TouchableOpacity
                    key={sp.id}
                    style={[styles.specChip, active && styles.specChipActive]}
                    onPress={() => toggleSpec(sp.id)}
                  >
                    <Text style={[styles.specChipText, active && styles.specChipTextActive]}>
                      {sp.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        <PrimaryButton
          title="Create Profile"
          onPress={handleSignUp}
          loading={loading}
          style={{ marginTop: Spacing.sm }}
        />

        <View style={styles.bottomLink}>
          <Text style={[styles.bottomText, styles.bottomTextSpacing]}>Already have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.bottomLinkText}>Log in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  bgAccent1: {
    position: 'absolute',
    top: '-10%',
    right: '-10%',
    width: 500,
    height: 500,
    borderRadius: 250,
    backgroundColor: `${Colors.primaryContainer}10`,
  },
  bgAccent2: {
    position: 'absolute',
    bottom: '-5%',
    left: '-10%',
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: `${Colors.tertiaryContainer}10`,
  },
  header: { alignItems: 'center', paddingTop: 50, paddingBottom: 8 },
  brandUnderline: {
    width: 40,
    height: 2,
    backgroundColor: `${Colors.primary}40`,
    borderRadius: 1,
    marginTop: 4,
  },
  headerImage: { width: 96, height: 96, marginBottom: 4, resizeMode: 'contain' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 32, paddingTop: 12, paddingBottom: 40 },
  heading: {
    fontSize: 26,
    fontFamily: 'Manrope_600SemiBold',
    color: Colors.onSurface,
    textAlign: 'center',
    marginBottom: Spacing.xs,
    lineHeight: 34,
  },
  subtitle: {
    ...Typography.bodyMedium,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  roleLabel: {
    ...Typography.labelSmall,
    color: Colors.outline,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  doctorSection: { marginTop: Spacing.xs, marginBottom: Spacing.md },
  row: { flexDirection: 'row', gap: Spacing.md },
  specTitle: {
    ...Typography.labelSmall,
    color: Colors.onSurfaceVariant,
    marginBottom: Spacing.sm,
    letterSpacing: 1,
  },
  specChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: Spacing.md },
  specChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHighest,
  },
  specChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  specChipText: { ...Typography.labelMedium, color: Colors.onSurfaceVariant, textTransform: 'none' },
  specChipTextActive: { color: Colors.onPrimary },
  bottomLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing['2xl'],
  },
  bottomText: { ...Typography.bodyMedium, color: Colors.onSurfaceVariant },
  bottomTextSpacing: { marginRight: 6 },
  bottomLinkText: {
    ...Typography.labelLarge,
    color: Colors.primary,
    fontSize: 13,
    textTransform: 'none',
  },
});

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Colors, Typography, Spacing } from '../../theme';
import { PrimaryButton, InputField } from '../../components';
import { authService, UserRole } from '../../api';
import { useAuthStore } from '../../store';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<any, 'VerifyOtp'>;

export const VerifyOtpScreen: React.FC<Props> = ({ navigation, route }) => {
  const email: string = route.params?.email ?? '';
  const userType: UserRole = route.params?.userType ?? 'patient';

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const setSession = useAuthStore((s) => s.setSession);

  const handleVerify = async () => {
    const cleanOtp = otp.trim();
    if (cleanOtp.length < 4) {
      Alert.alert('Invalid code', 'Please enter the verification code sent to your email.');
      return;
    }
    setLoading(true);
    try {
      const res = await authService.verifyOtp(email, userType, cleanOtp);
      if (userType === 'doctor') {
        Alert.alert(
          'Email Verified',
          'Your doctor profile has been verified and awaits hospital or administrator approval before you can sign in.',
          [{ text: 'Back to Login', onPress: () => navigation.navigate('Login') }]
        );
        return;
      }
      if (res?.token?.accessToken && res?.user) {
        setSession({ ...res.user, role: userType }, res.token.accessToken);
      } else {
        Alert.alert('Verified', 'Your account is verified. Please sign in.');
        navigation.navigate('Login');
      }
    } catch (e: any) {
      Alert.alert('Verification failed', e?.message ?? 'Invalid or expired code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await authService.resendOtp(email, userType);
      Alert.alert('Code sent', `A new verification code was sent to ${email}.`);
    } catch (e: any) {
      Alert.alert('Could not resend', e?.message ?? 'Please wait a moment before trying again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.brand}>AskCare</Text>
        <View style={styles.brandUnderline} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Verify Your Email</Text>
        <Text style={styles.subtitle}>
          Enter the 6-digit verification code sent to{'\n'}
          <Text style={styles.emailHighlight}>{email}</Text>
        </Text>

        <InputField
          label="VERIFICATION CODE (OTP)"
          placeholder="123456"
          value={otp}
          onChangeText={setOtp}
          keyboardType="numeric"
        />

        <PrimaryButton
          title="Verify Account"
          onPress={handleVerify}
          loading={loading}
          style={{ marginTop: Spacing.md }}
        />

        <TouchableOpacity style={styles.resendBtn} onPress={handleResend} disabled={resending}>
          <Text style={styles.resendText}>
            {resending ? 'Sending new code...' : "Didn't receive a code? Resend OTP"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.backText}>BACK TO LOGIN</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { alignItems: 'center', paddingTop: 60, paddingBottom: 8 },
  brand: { fontSize: 24, fontFamily: 'Manrope_700Bold', color: Colors.primary },
  brandUnderline: {
    width: 40,
    height: 2,
    backgroundColor: `${Colors.primary}40`,
    borderRadius: 1,
    marginTop: 4,
  },
  scrollContent: { paddingHorizontal: 32, paddingTop: 40, paddingBottom: 40 },
  heading: {
    ...Typography.headlineLarge,
    color: Colors.onSurface,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    ...Typography.bodyLarge,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  emailHighlight: { fontFamily: 'Manrope_700Bold', color: Colors.primary },
  resendBtn: { alignItems: 'center', marginTop: 20 },
  resendText: { ...Typography.labelLarge, color: Colors.primary, textTransform: 'none' },
  backBtn: { alignItems: 'center', marginTop: 24 },
  backText: { ...Typography.labelMedium, color: Colors.onSurfaceVariant },
});

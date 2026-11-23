import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Typography } from '../../theme';
import { Header, InputField, PrimaryButton, SecondaryButton } from '../../components';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../api';

type Props = { navigation: NativeStackNavigationProp<any> };

export const UpdatePasswordScreen: React.FC<Props> = ({ navigation }) => {
  const user = useAuthStore((s) => s.user);
  const role = useAuthStore((s) => s.role);

  const [email, setEmail] = useState(user?.email || '');
  const [otp, setOtp] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [resetting, setResetting] = useState(false);

  const effectiveRole = role || user?.role || 'patient';
  const has8 = newPw.length >= 8;
  const hasUpperNum = /[A-Z]/.test(newPw) && /[0-9]/.test(newPw);

  const handleSendOtp = async () => {
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      Alert.alert('Validation', 'Email address is required.');
      return;
    }
    setSendingOtp(true);
    try {
      await authService.forgotPassword(cleanEmail, effectiveRole);
      setOtpSent(true);
      Alert.alert(
        'OTP Sent',
        `A 6-digit verification code has been sent to ${cleanEmail}.`
      );
    } catch (e: any) {
      Alert.alert('Failed to Send OTP', e?.message || 'Could not send verification code.');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleResetPassword = async () => {
    const cleanEmail = email.trim();
    const cleanOtp = otp.trim();
    if (!cleanEmail) {
      Alert.alert('Validation', 'Email address is required.');
      return;
    }
    if (!cleanOtp || cleanOtp.length < 4) {
      Alert.alert('Validation', 'Please enter the verification OTP sent to your email.');
      return;
    }
    if (!has8) {
      Alert.alert('Validation', 'New password must be at least 8 characters long.');
      return;
    }
    if (newPw !== confirmPw) {
      Alert.alert('Validation', 'Passwords do not match.');
      return;
    }

    setResetting(true);
    try {
      await authService.resetPassword(cleanEmail, effectiveRole, cleanOtp, newPw);
      Alert.alert('Password Updated', 'Your password has been updated successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert('Reset Failed', e?.message || 'Could not update password.');
    } finally {
      setResetting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Update Password"
        showBack
        onBack={() => navigation.goBack()}
        showNotification={false}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>Account Security</Text>
        <Text style={styles.subtitle}>
          Verify your identity with a one-time verification code sent to your registered email address to set a new password.
        </Text>

        <InputField
          label="REGISTERED EMAIL"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          editable={!user?.email}
        />

        <SecondaryButton
          title={
            sendingOtp
              ? 'Sending OTP...'
              : otpSent
              ? 'Resend Verification OTP to my Email'
              : 'Send Verification OTP to my Email'
          }
          onPress={handleSendOtp}
          variant="tonal"
          icon={<MaterialIcons name="mark-email-read" size={18} color={Colors.primary} />}
          style={styles.otpBtn}
        />

        <InputField
          label="VERIFICATION OTP"
          placeholder="Enter 6-digit code"
          value={otp}
          onChangeText={setOtp}
          keyboardType="numeric"
        />

        <InputField
          label="NEW PASSWORD"
          placeholder="••••••••"
          value={newPw}
          onChangeText={setNewPw}
          secureTextEntry
        />

        <InputField
          label="CONFIRM NEW PASSWORD"
          placeholder="••••••••"
          value={confirmPw}
          onChangeText={setConfirmPw}
          secureTextEntry
        />

        <View style={styles.rules}>
          <View style={styles.ruleRow}>
            <MaterialIcons
              name={has8 ? 'check-circle' : 'radio-button-unchecked'}
              size={18}
              color={has8 ? Colors.primary : Colors.outlineVariant}
            />
            <Text style={[styles.ruleText, has8 && styles.ruleTextOk]}>
              At least 8 characters
            </Text>
          </View>
          <View style={styles.ruleRow}>
            <MaterialIcons
              name={hasUpperNum ? 'check-circle' : 'radio-button-unchecked'}
              size={18}
              color={hasUpperNum ? Colors.primary : Colors.outlineVariant}
            />
            <Text style={[styles.ruleText, hasUpperNum && styles.ruleTextOk]}>
              One uppercase letter & number recommended
            </Text>
          </View>
        </View>

        <PrimaryButton
          title="Update Password"
          onPress={handleResetPassword}
          loading={resetting}
          style={{ marginTop: 24 }}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40 },
  heading: {
    fontSize: 26,
    fontFamily: 'Manrope_700Bold',
    color: Colors.onSurface,
    marginBottom: 8,
  },
  subtitle: {
    ...Typography.bodyMedium,
    color: Colors.onSurfaceVariant,
    lineHeight: 22,
    marginBottom: 20,
  },
  otpBtn: {
    marginBottom: 20,
  },
  rules: { gap: 10 },
  ruleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ruleText: { ...Typography.bodyMedium, color: Colors.onSurfaceVariant },
  ruleTextOk: { color: Colors.primary, fontFamily: 'Manrope_600SemiBold' },
});

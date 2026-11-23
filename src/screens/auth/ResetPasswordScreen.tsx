import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Colors, Typography } from '../../theme';
import { PrimaryButton, InputField } from '../../components';
import { authService, UserRole } from '../../api';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<any, 'ResetPassword'>;

export const ResetPasswordScreen: React.FC<Props> = ({ navigation, route }) => {
  const [email, setEmail] = useState<string>(route.params?.email ?? '');
  const userType: UserRole = route.params?.userType ?? 'patient';
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!email.trim() || !otp.trim() || !newPassword) {
      Alert.alert('Missing fields', 'Please fill in your email, OTP code, and new password.');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Weak password', 'New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Password mismatch', 'New password and confirmation do not match.');
      return;
    }
    setLoading(true);
    try {
      await authService.resetPassword(email.trim().toLowerCase(), userType, otp.trim(), newPassword);
      Alert.alert('Password Updated', 'Your password has been reset. You can now sign in.', [
        { text: 'Sign In', onPress: () => navigation.navigate('Login') },
      ]);
    } catch (e: any) {
      Alert.alert('Reset failed', e?.message ?? 'Invalid OTP or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.brand}>AskCare</Text>
        <View style={styles.brandUnderline} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Reset Password</Text>
        <Text style={styles.subtitle}>
          Enter the 6-digit OTP sent to your email and choose a new password.
        </Text>

        <InputField
          label="EMAIL ADDRESS"
          placeholder="name@clinical.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <InputField
          label="6-DIGIT OTP CODE"
          placeholder="123456"
          value={otp}
          onChangeText={setOtp}
          keyboardType="numeric"
        />
        <InputField
          label="NEW PASSWORD"
          placeholder="••••••••"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
        />
        <InputField
          label="CONFIRM NEW PASSWORD"
          placeholder="••••••••"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <PrimaryButton title="Reset Password" onPress={handleReset} loading={loading} style={{ marginTop: 16 }} />

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
  brandUnderline: { width: 40, height: 2, backgroundColor: `${Colors.primary}40`, borderRadius: 1, marginTop: 4 },
  scrollContent: { paddingHorizontal: 32, paddingTop: 32, paddingBottom: 40 },
  heading: { ...Typography.headlineLarge, color: Colors.onSurface, textAlign: 'center', marginBottom: 12 },
  subtitle: { ...Typography.bodyLarge, color: Colors.onSurfaceVariant, textAlign: 'center', marginBottom: 28, lineHeight: 24 },
  backBtn: { alignItems: 'center', marginTop: 24 },
  backText: { ...Typography.labelMedium, color: Colors.onSurfaceVariant },
});

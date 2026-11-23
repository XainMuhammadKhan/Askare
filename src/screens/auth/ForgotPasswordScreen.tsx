import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Colors, Typography } from '../../theme';
import { PrimaryButton, InputField, RoleToggle } from '../../components';
import { MaterialIcons } from '@expo/vector-icons';
import { authService, UserRole } from '../../api';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = { navigation: NativeStackNavigationProp<any> };

export const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const [role, setRole] = useState<UserRole>('patient');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      Alert.alert('Email required', 'Please enter your registered email address.');
      return;
    }
    setLoading(true);
    try {
      await authService.forgotPassword(cleanEmail, role);
      Alert.alert('Reset code sent', `We sent a 6-digit reset OTP to ${cleanEmail}.`);
      navigation.navigate('ResetPassword', { email: cleanEmail, userType: role });
    } catch (e: any) {
      Alert.alert('Request failed', e?.message ?? 'Could not send reset code.');
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
        <Text style={styles.heading}>Reset Access</Text>
        <Text style={styles.subtitle}>
          Select your role and enter your registered email to receive a password reset OTP.
        </Text>

        <RoleToggle value={role} onChange={setRole} includeAdmin />

        <InputField
          label="REGISTERED EMAIL"
          placeholder="name@clinical.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        <PrimaryButton
          title="Send Reset Code"
          onPress={handleSendOtp}
          loading={loading}
          icon={<MaterialIcons name="arrow-forward" size={20} color={Colors.onPrimary} />}
          style={{ marginTop: 16 }}
        />

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
  scrollContent: { paddingHorizontal: 32, paddingTop: 40, paddingBottom: 40 },
  heading: { ...Typography.headlineLarge, color: Colors.onSurface, textAlign: 'center', marginBottom: 12 },
  subtitle: { ...Typography.bodyLarge, color: Colors.onSurfaceVariant, textAlign: 'center', marginBottom: 24, lineHeight: 24 },
  backBtn: { alignItems: 'center', marginTop: 24 },
  backText: { ...Typography.labelMedium, color: Colors.onSurfaceVariant },
});

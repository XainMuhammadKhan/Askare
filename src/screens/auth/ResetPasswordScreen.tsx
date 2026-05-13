import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Colors, Typography } from '../../theme';
import { PrimaryButton, InputField } from '../../components';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = { navigation: NativeStackNavigationProp<any> };

export const ResetPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.brand}>Askare</Text>
        <View style={styles.brandUnderline} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>Reset Password</Text>
        <Text style={styles.subtitle}>Choose a secure password to keep your clinical records and health profile safe.</Text>
        <InputField label="NEW PASSWORD" placeholder="••••••••" value={newPassword} onChangeText={setNewPassword} secureTextEntry />
        <InputField label="CONFIRM NEW PASSWORD" placeholder="••••••••" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />
        <PrimaryButton title="Reset Password" onPress={() => navigation.navigate('Login')} style={{ marginTop: 16 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { alignItems: 'center', paddingTop: 60, paddingBottom: 8 },
  brand: { fontSize: 24, fontFamily: 'Manrope_700Bold', color: Colors.primary },
  brandUnderline: { width: 40, height: 2, backgroundColor: `${Colors.primary}40`, borderRadius: 1, marginTop: 4 },
  scrollContent: { paddingHorizontal: 32, paddingTop: 60, paddingBottom: 40 },
  heading: { ...Typography.headlineLarge, color: Colors.onSurface, textAlign: 'center', marginBottom: 12 },
  subtitle: { ...Typography.bodyLarge, color: Colors.onSurfaceVariant, textAlign: 'center', marginBottom: 32, lineHeight: 24 },
});

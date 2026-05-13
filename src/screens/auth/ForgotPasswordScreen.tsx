import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';
import { PrimaryButton, InputField } from '../../components';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = { navigation: NativeStackNavigationProp<any> };

export const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.brand}>Askare</Text>
        <View style={styles.brandUnderline} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>Reset Access</Text>
        <Text style={styles.subtitle}>Secure your account by verifying your clinical credentials below.</Text>
        <InputField label="PROFESSIONAL EMAIL" placeholder="dr.smith@clinicalzen.com" value={email} onChangeText={setEmail} keyboardType="email-address" />
        <View style={styles.codeLabelRow}>
          <Text style={styles.codeLabel}>6-DIGIT VERIFICATION CODE</Text>
          <TouchableOpacity><Text style={styles.resend}>Resend Code</Text></TouchableOpacity>
        </View>
        <View style={styles.codeRow}>
          {[0,1,2,3,4,5].map(i => <View key={i} style={styles.codeBox} />)}
        </View>
        <Text style={styles.codeHint}>The code was sent to your encrypted mailbox. It expires in 04:59.</Text>
        <PrimaryButton title="Verify & Continue" onPress={() => navigation.navigate('ResetPassword')} icon={<MaterialIcons name="arrow-forward" size={20} color={Colors.onPrimary} />} style={{ marginTop: 24 }} />
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
  subtitle: { ...Typography.bodyLarge, color: Colors.onSurfaceVariant, textAlign: 'center', marginBottom: 32, lineHeight: 24 },
  codeLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingHorizontal: 4 },
  codeLabel: { ...Typography.labelSmall, color: Colors.onSurfaceVariant, letterSpacing: 1.5 },
  resend: { ...Typography.labelSmall, color: Colors.primary, textTransform: 'none', fontStyle: 'italic' },
  codeRow: { flexDirection: 'row', gap: 8 },
  codeBox: { flex: 1, height: 56, backgroundColor: Colors.surfaceContainerLow, borderRadius: BorderRadius.md },
  codeHint: { ...Typography.bodySmall, color: Colors.outlineVariant, textAlign: 'center', marginTop: 12, fontStyle: 'italic' },
  backBtn: { alignItems: 'center', marginTop: 24 },
  backText: { ...Typography.labelMedium, color: Colors.onSurfaceVariant },
});

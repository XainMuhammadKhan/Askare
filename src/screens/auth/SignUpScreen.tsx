import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';
import { PrimaryButton, InputField } from '../../components';
import { useAuthStore, UserRole } from '../../store';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export const SignUpScreen: React.FC<Props> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('patient');
  const signup = useAuthStore((s) => s.signup);

  const handleSignUp = () => {
    signup(name, email, password, role);
  };

  return (
    <View style={styles.container}>
      {/* Background Decoration */}
      <View style={styles.bgAccent1} />
      <View style={styles.bgAccent2} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.brand}>Askare</Text>
        <View style={styles.brandUnderline} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero */}
        <Text style={styles.heading}>Begin your wellness{'\n'}journey</Text>
        <Text style={styles.subtitle}>
          Join a premium community dedicated to refined healthcare standards.
        </Text>

        {/* Role Selector */}
        <Text style={styles.roleLabel}>SELECT YOUR ROLE TO CONTINUE</Text>
        <View style={styles.roleToggle}>
          <TouchableOpacity
            style={[styles.roleBtn, role === 'patient' && styles.roleBtnActive]}
            onPress={() => setRole('patient')}
          >
            <Text style={[styles.roleBtnText, role === 'patient' && styles.roleBtnTextActive]}>
              Patient
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.roleBtn, role === 'doctor' && styles.roleBtnActive]}
            onPress={() => setRole('doctor')}
          >
            <Text style={[styles.roleBtnText, role === 'doctor' && styles.roleBtnTextActive]}>
              Doctor
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <InputField
          label="FULL NAME"
          placeholder="Dr. John Doe"
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
          label="PASSWORD"
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <PrimaryButton
          title="Create Profile"
          onPress={handleSignUp}
          style={{ marginTop: Spacing.sm }}
        />

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>CONTINUE WITH</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Social */}
        <View style={styles.socialRow}>
          <TouchableOpacity style={styles.socialBtn}>
            <MaterialIcons name="language" size={16} color={Colors.google} />
            <Text style={styles.socialText}>Google</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialBtn}>
            <MaterialIcons name="facebook" size={16} color={Colors.facebook} />
            <Text style={styles.socialText}>Facebook</Text>
          </TouchableOpacity>
        </View>

        {/* Login Link */}
        <View style={styles.bottomLink}>
          <Text style={styles.bottomText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.bottomLinkText}>Log in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
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
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 8,
  },
  brand: {
    fontSize: 24,
    fontFamily: 'Manrope_700Bold',
    color: Colors.primary,
  },
  brandUnderline: {
    width: 40,
    height: 2,
    backgroundColor: `${Colors.primary}40`,
    borderRadius: 1,
    marginTop: 4,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 32,
    paddingTop: 20,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 28,
    fontFamily: 'Manrope_500Medium',
    color: Colors.onSurface,
    textAlign: 'center',
    marginBottom: Spacing.sm,
    lineHeight: 36,
  },
  subtitle: {
    ...Typography.bodyMedium,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: Spacing['2xl'],
    opacity: 0.8,
  },
  roleLabel: {
    ...Typography.labelSmall,
    color: Colors.outline,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  roleToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: BorderRadius.xl,
    padding: 4,
    marginBottom: Spacing['2xl'],
  },
  roleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
  },
  roleBtnActive: {
    backgroundColor: Colors.surfaceContainerLowest,
    shadowColor: 'rgba(0,0,0,0.08)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  roleBtnText: {
    ...Typography.labelLarge,
    color: Colors.onSurfaceVariant,
    fontSize: 14,
    textTransform: 'none',
  },
  roleBtnTextActive: {
    color: Colors.primary,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginVertical: Spacing['2xl'],
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.surfaceContainerHighest,
  },
  dividerText: {
    ...Typography.labelSmall,
    color: Colors.outline,
    fontSize: 9,
  },
  socialRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing['2xl'],
  },
  socialBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.surfaceContainer,
  },
  socialText: {
    ...Typography.labelLarge,
    color: Colors.onSurface,
    fontSize: 12,
    textTransform: 'none',
  },
  bottomLink: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  bottomText: {
    ...Typography.bodySmall,
    color: Colors.onSurfaceVariant,
  },
  bottomLinkText: {
    ...Typography.labelLarge,
    color: Colors.primary,
    fontSize: 12,
    textTransform: 'none',
  },
});

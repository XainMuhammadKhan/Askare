import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';
import { PrimaryButton, InputField } from '../../components';
import { useAuthStore } from '../../store';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  // prefilled for quick testing
  const [email, setEmail] = useState('xain@gmail.com');
  const [password, setPassword] = useState('xaink123');
  const login = useAuthStore((s) => s.login);

  const handleLogin = () => {
    // Hardcoded test credential checks
    if (email === 'xain@gmail.com' && password === 'xaink123') {
      login(email, password, 'patient');
      return;
    }

    if (email === 'doc@gmail.com' && password === 'doc123') {
      login(email, password, 'doctor');
      return;
    }

    Alert.alert('Sign in failed', 'Use test credentials: xain@gmail.com / xaink123 (patient) or doc@gmail.com / doc123 (doctor)');
  };

  return (
    <View style={styles.container}>
      {/* Background Decoration */}
      <View style={styles.bgAccent1} />
      <View style={styles.bgAccent2} />

      {/* Header */}
      <View style={styles.header}>
        <Image
          source={require('../../../assets/Images/appbar.png')}
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
        {/* Heading */}
        <Text style={styles.heading}>Welcome back</Text>

        {/* Form */}
        <InputField
          label="EMAIL ADDRESS"
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
          rightLabel="FORGOT?"
          onRightLabelPress={() => navigation.navigate('ForgotPassword')}
        />

        <PrimaryButton
          title="Sign In"
          onPress={handleLogin}
          style={{ marginTop: Spacing.sm, borderRadius: BorderRadius.xl }}
        />

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Social Logins */}
        <View style={styles.socialRow}>
          <TouchableOpacity style={styles.socialBtn}>
            <MaterialIcons name="language" size={20} color={Colors.google} />
            <Text style={styles.socialText}>Google</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialBtn}>
            <MaterialIcons name="facebook" size={20} color={Colors.facebook} />
            <Text style={styles.socialText}>Facebook</Text>
          </TouchableOpacity>
        </View>

        {/* Sign Up Link */}
        <View style={styles.bottomLink}>
            <Text style={[styles.bottomText, styles.bottomTextSpacing]}>New to Askare?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <Text style={styles.bottomLinkText}>Create account</Text>
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
    letterSpacing: -0.3,
  },
  brandUnderline: {
    width: 40,
    height: 2,
    backgroundColor: `${Colors.primary}40`,
    borderRadius: 1,
    marginTop: 4,
  },
  headerImage: {
    width: '52.5%',
    height: 90,
    marginBottom: 8,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 32,
    paddingTop: 40,
    paddingBottom: 40,
  },
  heading: {
    ...Typography.headlineMedium,
    color: Colors.onSurface,
    textAlign: 'center',
    marginBottom: Spacing['3xl'],
    fontSize: 26,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    marginVertical: Spacing['3xl'],
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.surfaceContainerHighest,
  },
  dividerText: {
    ...Typography.labelSmall,
    color: Colors.outlineVariant,
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
    gap: Spacing.sm,
    paddingVertical: 14,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: `${Colors.surfaceVariant}30`,
  },
  socialText: {
    ...Typography.labelLarge,
    color: Colors.onSurface,
    fontSize: 13,
    textTransform: 'none',
  },
  bottomLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomText: {
    ...Typography.bodyMedium,
    color: Colors.onSurfaceVariant,
  },
  bottomTextSpacing: {
    marginRight: 6,
  },
  bottomLinkText: {
    ...Typography.labelLarge,
    color: Colors.primary,
    textTransform: 'none',
  },
});

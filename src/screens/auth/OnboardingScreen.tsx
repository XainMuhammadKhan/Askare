import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';
import { PrimaryButton } from '../../components';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export const OnboardingScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* Background accents */}
      <View style={styles.bgAccent1} />
      <View style={styles.bgAccent2} />

      {/* Top Icon */}
      <View style={styles.topIcon}>
        <MaterialIcons name="medical-services" size={32} color={Colors.primary} />
      </View>

      {/* Central branding */}
      <View style={styles.center}>
        {/* Placeholder logo area - replace with your logo */}
        <View style={styles.logoPlaceholder}>
          <MaterialIcons name="local-hospital" size={48} color={Colors.primary} />
        </View>
        <Text style={styles.brandName}>Askare</Text>
        <View style={styles.divider} />
        <Text style={styles.tagline}>
          Intelligent diagnosis,{"\n"}human-centered care.
        </Text>
        <Text style={styles.description}>
          Advanced AI diagnosis and verified specialists, all in a secure platform.
        </Text>
      </View>

      {/* Action section */}
      <View style={styles.actions}>
        <PrimaryButton
          title="Get Started"
          onPress={() => navigation.navigate('SignUp')}
          style={styles.ctaButton}
        />
        <View style={styles.signInRow}>
          <Text style={styles.signInText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.signInLink}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 32,
    paddingVertical: 40,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bgAccent1: {
    position: 'absolute',
    top: '-10%',
    right: '-10%',
    width: '40%',
    height: '40%',
    borderRadius: 9999,
    backgroundColor: `${Colors.primary}08`,
  },
  bgAccent2: {
    position: 'absolute',
    bottom: '-5%',
    left: '-5%',
    width: '30%',
    height: '30%',
    borderRadius: 9999,
    backgroundColor: `${Colors.tertiary}08`,
  },
  topIcon: {
    marginTop: 20,
  },
  center: {
    alignItems: 'center',
    maxWidth: 320,
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${Colors.primary}10`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  brandName: {
    fontSize: 40,
    fontFamily: 'Manrope_800ExtraBold',
    color: Colors.primary,
    letterSpacing: -0.5,
    marginBottom: Spacing.lg,
  },
  divider: {
    width: 96,
    height: 4,
    backgroundColor: `${Colors.primary}15`,
    borderRadius: 2,
    marginBottom: Spacing['2xl'],
  },
  tagline: {
    ...Typography.headlineSmall,
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    lineHeight: 32,
  },
  description: {
    ...Typography.bodyLarge,
    color: Colors.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  actions: {
    width: '100%',
    gap: Spacing.lg,
  },
  ctaButton: {
    borderRadius: BorderRadius.full,
  },
  signInRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInText: {
    ...Typography.bodyLarge,
    color: Colors.secondary,
  },
  signInLink: {
    ...Typography.labelLarge,
    color: Colors.primary,
  },
});

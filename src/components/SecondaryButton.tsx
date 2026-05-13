import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Colors, Typography, BorderRadius } from '../theme';

interface SecondaryButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  variant?: 'tonal' | 'outlined' | 'text' | 'danger';
  icon?: React.ReactNode;
}

export const SecondaryButton: React.FC<SecondaryButtonProps> = ({
  title,
  onPress,
  style,
  textStyle,
  variant = 'tonal',
  icon,
}) => {
  const buttonStyles = {
    tonal: styles.tonal,
    outlined: styles.outlined,
    text: styles.textVariant,
    danger: styles.danger,
  };

  const textStyles = {
    tonal: styles.tonalText,
    outlined: styles.outlinedText,
    text: styles.textOnlyText,
    danger: styles.dangerText,
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.base, buttonStyles[variant], style]}
    >
      {icon}
      <Text style={[textStyles[variant], textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  tonal: {
    backgroundColor: Colors.surfaceContainerHigh,
  },
  outlined: {
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    backgroundColor: Colors.surfaceContainerLowest,
  },
  textVariant: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  tonalText: {
    ...Typography.labelLarge,
    color: Colors.primary,
  },
  outlinedText: {
    ...Typography.labelLarge,
    color: Colors.primary,
  },
  textOnlyText: {
    ...Typography.labelLarge,
    color: Colors.primary,
  },
  dangerText: {
    ...Typography.labelLarge,
    color: Colors.error,
  },
});

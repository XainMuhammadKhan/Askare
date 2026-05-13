import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  showNotification?: boolean;
  onBack?: () => void;
  onNotification?: () => void;
  leftIcon?: string;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBack = false,
  showNotification = true,
  onBack,
  onNotification,
  leftIcon,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <View style={styles.left}>
        {showBack && (
          <TouchableOpacity onPress={onBack} style={styles.iconBtn}>
            <MaterialIcons name="arrow-back" size={24} color={Colors.onSurface} />
          </TouchableOpacity>
        )}
        {leftIcon && !showBack && (
          <MaterialIcons name={leftIcon as any} size={24} color={Colors.primary} style={{ marginRight: 8 }} />
        )}
        <Text style={styles.title}>{title}</Text>
      </View>
      {showNotification && (
        <TouchableOpacity onPress={onNotification} style={styles.iconBtn}>
          <MaterialIcons name="notifications-none" size={24} color={Colors.secondary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.background,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  title: {
    ...Typography.titleLarge,
    color: Colors.primary,
    fontSize: 20,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

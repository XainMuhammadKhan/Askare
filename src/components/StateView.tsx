import React from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '../theme';

interface Props {
  loading?: boolean;
  error?: string | null;
  empty?: boolean;
  emptyText?: string;
  onRetry?: () => void;
  children?: React.ReactNode;
}

/**
 * Renders a spinner, an error with retry, an empty message, or the children.
 * Keeps loading/error/empty handling out of every screen.
 */
export const StateView: React.FC<Props> = ({ loading, error, empty, emptyText = 'Nothing here yet.', onRetry, children }) => {
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <MaterialIcons name="error-outline" size={36} color={Colors.error} />
        <Text style={styles.text}>{error}</Text>
        {onRetry && (
          <TouchableOpacity onPress={onRetry} style={styles.retry}>
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (empty) {
    return (
      <View style={styles.center}>
        <MaterialIcons name="inbox" size={36} color={Colors.outlineVariant} />
        <Text style={styles.text}>{emptyText}</Text>
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center', padding: Spacing['3xl'], gap: Spacing.md },
  text: { ...Typography.bodyMedium, color: Colors.onSurfaceVariant, textAlign: 'center' },
  retry: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.sm, borderRadius: 999, backgroundColor: `${Colors.primary}15` },
  retryText: { ...Typography.labelLarge, color: Colors.primary, textTransform: 'none' },
});

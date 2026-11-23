import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Modal,
  ViewStyle,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows, FontFamily } from '../../../theme';

// ---------- Top Screen Header ----------
interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  badgeText?: string;
  onNotificationsPress?: () => void;
  rightAction?: {
    icon: keyof typeof MaterialIcons.glyphMap;
    label?: string;
    onPress: () => void;
  };
  onRefresh?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  title,
  subtitle,
  badgeText,
  onNotificationsPress,
  rightAction,
  onRefresh,
}) => (
  <View style={styles.headerContainer}>
    <View style={styles.headerLeft}>
      {badgeText ? (
        <View style={styles.rolePill}>
          <MaterialIcons name="verified-user" size={12} color={Colors.primary} />
          <Text style={styles.rolePillText}>{badgeText}</Text>
        </View>
      ) : null}
      <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
      {subtitle ? <Text style={styles.headerSubtitle} numberOfLines={1}>{subtitle}</Text> : null}
    </View>
    <View style={styles.headerActions}>
      {onRefresh ? (
        <TouchableOpacity style={styles.iconCircleBtn} onPress={onRefresh} activeOpacity={0.75}>
          <MaterialIcons name="refresh" size={20} color={Colors.onSurface} />
        </TouchableOpacity>
      ) : null}
      {onNotificationsPress ? (
        <TouchableOpacity style={styles.iconCircleBtn} onPress={onNotificationsPress} activeOpacity={0.75}>
          <MaterialIcons name="notifications-none" size={20} color={Colors.onSurface} />
        </TouchableOpacity>
      ) : null}
      {rightAction ? (
        <TouchableOpacity
          style={rightAction.label ? styles.primaryPillBtn : styles.iconCircleBtnPrimary}
          onPress={rightAction.onPress}
          activeOpacity={0.8}
        >
          <MaterialIcons name={rightAction.icon} size={18} color={Colors.onPrimary} />
          {rightAction.label ? <Text style={styles.primaryPillBtnText}>{rightAction.label}</Text> : null}
        </TouchableOpacity>
      ) : null}
    </View>
  </View>
);

// ---------- Stat Card ----------
interface StatCardProps {
  label: string;
  value: string | number;
  icon: keyof typeof MaterialIcons.glyphMap;
  accentColor?: string;
  subtitle?: string;
  onPress?: () => void;
  style?: ViewStyle;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  accentColor = Colors.primary,
  subtitle,
  onPress,
  style,
}) => {
  const Container: any = onPress ? TouchableOpacity : View;
  return (
    <Container
      style={[styles.statCard, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.statCardTop}>
        <View style={[styles.statIconWrap, { backgroundColor: `${accentColor}16` }]}>
          <MaterialIcons name={icon} size={20} color={accentColor} />
        </View>
        {onPress ? (
          <MaterialIcons name="chevron-right" size={18} color={Colors.outlineVariant} />
        ) : null}
      </View>
      <Text style={styles.statValue} numberOfLines={1}>{value ?? 0}</Text>
      <Text style={styles.statLabel} numberOfLines={1}>{label}</Text>
      {subtitle ? <Text style={styles.statSubtitle} numberOfLines={1}>{subtitle}</Text> : null}
    </Container>
  );
};

// ---------- Status Badge ----------
export type BadgeTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export const getStatusTone = (status?: string | null): BadgeTone => {
  const s = (status ?? '').toUpperCase();
  if (['ACTIVE', 'CONFIRMED', 'COMPLETED', 'PAID', 'OK', 'HEALTHY', 'UP', 'CONNECTED', 'VISIBLE'].includes(s)) {
    return 'success';
  }
  if (['PENDING', 'AUTHORIZED', 'REQUESTED', 'INACTIVE', 'AWAITING'].includes(s)) {
    return 'warning';
  }
  if (['SUSPENDED', 'CANCELLED', 'REJECTED', 'FAILED', 'NO_SHOW', 'DOWN', 'ERROR', 'HIDDEN', 'BLOCKED'].includes(s)) {
    return 'danger';
  }
  if (['REFUNDED', 'VIDEO', 'IN_PERSON', 'HOSPITAL_ADMIN', 'SUPER_ADMIN'].includes(s)) {
    return 'info';
  }
  return 'neutral';
};

const TONE_COLORS: Record<BadgeTone, { bg: string; fg: string }> = {
  success: { bg: '#dcfce7', fg: '#15803d' },
  warning: { bg: '#fef3c7', fg: '#b45309' },
  danger: { bg: '#fee2e2', fg: Colors.error },
  info: { bg: `${Colors.primary}18`, fg: Colors.primary },
  neutral: { bg: Colors.surfaceContainerHigh, fg: Colors.onSurfaceVariant },
};

interface StatusBadgeProps {
  status?: string | null;
  label?: string;
  tone?: BadgeTone;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, tone }) => {
  const resolvedTone = tone ?? getStatusTone(status);
  const palette = TONE_COLORS[resolvedTone];
  const display = label ?? (status ? String(status).replace(/_/g, ' ') : 'UNKNOWN');
  return (
    <View style={[styles.badge, { backgroundColor: palette.bg }]}>
      <View style={[styles.badgeDot, { backgroundColor: palette.fg }]} />
      <Text style={[styles.badgeText, { color: palette.fg }]}>{display}</Text>
    </View>
  );
};

// ---------- Search Bar ----------
interface AdminSearchBarProps {
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
}

export const AdminSearchBar: React.FC<AdminSearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search...',
  onSubmit,
}) => (
  <View style={styles.searchBar}>
    <MaterialIcons name="search" size={20} color={Colors.onSurfaceVariant} />
    <TextInput
      style={styles.searchInput}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={Colors.outlineVariant}
      returnKeyType="search"
      onSubmitEditing={onSubmit}
    />
    {value.length > 0 ? (
      <TouchableOpacity onPress={() => onChangeText('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <MaterialIcons name="close" size={18} color={Colors.onSurfaceVariant} />
      </TouchableOpacity>
    ) : null}
  </View>
);

// ---------- Filter Chips ----------
export interface FilterChipOption<T extends string = string> {
  key: T;
  label: string;
  count?: number;
}

interface FilterChipsProps<T extends string = string> {
  options: FilterChipOption<T>[];
  selected: T;
  onSelect: (key: T) => void;
}

export function FilterChips<T extends string = string>({
  options,
  selected,
  onSelect,
}: FilterChipsProps<T>) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chipsScroll}
    >
      {options.map((opt) => {
        const active = opt.key === selected;
        return (
          <TouchableOpacity
            key={opt.key}
            style={[styles.chip, active && styles.chipActive]}
            onPress={() => onSelect(opt.key)}
            activeOpacity={0.75}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>
              {opt.label}
              {opt.count !== undefined ? ` (${opt.count})` : ''}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

// ---------- Section Header ----------
interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  actionIcon?: keyof typeof MaterialIcons.glyphMap;
  onActionPress?: () => void;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  actionLabel,
  actionIcon,
  onActionPress,
}) => (
  <View style={styles.sectionHeader}>
    <View style={{ flex: 1 }}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
    </View>
    {onActionPress && (actionLabel || actionIcon) ? (
      <TouchableOpacity style={styles.sectionActionBtn} onPress={onActionPress} activeOpacity={0.75}>
        {actionIcon ? <MaterialIcons name={actionIcon} size={16} color={Colors.primary} /> : null}
        {actionLabel ? <Text style={styles.sectionActionText}>{actionLabel}</Text> : null}
      </TouchableOpacity>
    ) : null}
  </View>
);

// ---------- Action Button ----------
export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'outline';

interface ActionButtonProps {
  label: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  small?: boolean;
  style?: ViewStyle;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  label,
  icon,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  small = false,
  style,
}) => {
  const variantStyles: Record<ButtonVariant, { bg: string; fg: string; border?: string }> = {
    primary: { bg: Colors.primary, fg: Colors.onPrimary },
    secondary: { bg: `${Colors.primary}15`, fg: Colors.primary },
    success: { bg: '#15803d', fg: Colors.white },
    danger: { bg: `${Colors.error}16`, fg: Colors.error },
    outline: { bg: Colors.surfaceContainerLowest, fg: Colors.onSurface, border: Colors.outlineVariant },
  };
  const v = variantStyles[variant];

  return (
    <TouchableOpacity
      style={[
        styles.actionBtn,
        small && styles.actionBtnSmall,
        { backgroundColor: v.bg },
        v.border ? { borderWidth: 1, borderColor: v.border } : null,
        (disabled || loading) && { opacity: 0.55 },
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.78}
    >
      {loading ? (
        <ActivityIndicator size="small" color={v.fg} />
      ) : (
        <>
          {icon ? <MaterialIcons name={icon} size={small ? 15 : 18} color={v.fg} /> : null}
          <Text style={[small ? styles.actionBtnTextSmall : styles.actionBtnText, { color: v.fg }]}>
            {label}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

// ---------- Labeled Form Input ----------
interface FormFieldProps {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  secureTextEntry?: boolean;
  multiline?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  secureTextEntry,
  multiline,
  autoCapitalize = 'sentences',
}) => (
  <View style={styles.fieldGroup}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <TextInput
      style={[styles.fieldInput, multiline && { minHeight: 76, textAlignVertical: 'top' }]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={Colors.outlineVariant}
      keyboardType={keyboardType}
      secureTextEntry={secureTextEntry}
      multiline={multiline}
      autoCapitalize={autoCapitalize}
    />
  </View>
);

// ---------- Bottom Sheet / Modal Wrapper ----------
interface AdminModalProps {
  visible: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  visible,
  title,
  subtitle,
  onClose,
  children,
}) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <View style={styles.modalBackdrop}>
      <View style={styles.modalCard}>
        <View style={styles.modalHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.modalTitle}>{title}</Text>
            {subtitle ? <Text style={styles.modalSubtitle}>{subtitle}</Text> : null}
          </View>
          <TouchableOpacity onPress={onClose} style={styles.iconCircleBtn}>
            <MaterialIcons name="close" size={20} color={Colors.onSurface} />
          </TouchableOpacity>
        </View>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: Spacing.xl }}
        >
          {children}
        </ScrollView>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.surfaceContainerLowest,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceContainerHigh,
  },
  headerLeft: {
    flex: 1,
    paddingRight: Spacing.sm,
  },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    backgroundColor: `${Colors.primary}14`,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    marginBottom: 4,
  },
  rolePillText: {
    ...Typography.labelSmall,
    color: Colors.primary,
    fontSize: 10,
  },
  headerTitle: {
    ...Typography.titleLarge,
    color: Colors.onSurface,
  },
  headerSubtitle: {
    ...Typography.bodySmall,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleBtnPrimary: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  primaryPillBtnText: {
    ...Typography.labelLarge,
    color: Colors.onPrimary,
    fontSize: 13,
  },
  statCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHigh,
    ...Shadows.subtle,
  },
  statCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    ...Typography.titleLarge,
    fontFamily: FontFamily.bold,
    color: Colors.onSurface,
  },
  statLabel: {
    ...Typography.bodySmall,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  statSubtitle: {
    ...Typography.labelSmall,
    color: Colors.primary,
    marginTop: 4,
    textTransform: 'none',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeText: {
    fontFamily: FontFamily.bold,
    fontSize: 11,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    height: 44,
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHigh,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...Typography.bodyMedium,
    color: Colors.onSurface,
    paddingVertical: 0,
  },
  chipsScroll: {
    paddingVertical: Spacing.xs,
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHigh,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    ...Typography.bodySmall,
    fontFamily: FontFamily.semiBold,
    color: Colors.onSurfaceVariant,
  },
  chipTextActive: {
    color: Colors.onPrimary,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  sectionTitle: {
    ...Typography.titleMedium,
    color: Colors.onSurface,
  },
  sectionSubtitle: {
    ...Typography.bodySmall,
    color: Colors.onSurfaceVariant,
    marginTop: 1,
  },
  sectionActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    backgroundColor: `${Colors.primary}14`,
  },
  sectionActionText: {
    ...Typography.bodySmall,
    fontFamily: FontFamily.bold,
    color: Colors.primary,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 11,
    borderRadius: BorderRadius.md,
  },
  actionBtnSmall: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: BorderRadius.sm,
  },
  actionBtnText: {
    ...Typography.labelLarge,
  },
  actionBtnTextSmall: {
    fontFamily: FontFamily.bold,
    fontSize: 12,
  },
  fieldGroup: {
    marginBottom: Spacing.md,
  },
  fieldLabel: {
    ...Typography.bodySmall,
    fontFamily: FontFamily.semiBold,
    color: Colors.onSurfaceVariant,
    marginBottom: 5,
  },
  fieldInput: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHigh,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    ...Typography.bodyMedium,
    color: Colors.onSurface,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(11, 15, 16, 0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing['2xl'],
    maxHeight: '88%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceContainerHigh,
  },
  modalTitle: {
    ...Typography.titleMedium,
    color: Colors.onSurface,
  },
  modalSubtitle: {
    ...Typography.bodySmall,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
});

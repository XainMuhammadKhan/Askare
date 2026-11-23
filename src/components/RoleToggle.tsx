import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../theme';
import { UserRole } from '../api';

interface Props {
  value: UserRole;
  onChange: (role: UserRole) => void;
  /** Show the "Admin" option (login screen only — admins can't self-register). */
  includeAdmin?: boolean;
}

const ROLES: { key: UserRole; label: string }[] = [
  { key: 'patient', label: 'Patient' },
  { key: 'doctor', label: 'Doctor' },
  { key: 'admin', label: 'Admin' },
];

/** Patient / Doctor (/ Admin) segmented switch used on auth screens. */
export const RoleToggle: React.FC<Props> = ({ value, onChange, includeAdmin = false }) => (
  <View style={styles.toggle}>
    {ROLES.filter((r) => includeAdmin || r.key !== 'admin').map(({ key, label }) => (
      <TouchableOpacity key={key} style={[styles.btn, value === key && styles.btnActive]} onPress={() => onChange(key)}>
        <Text style={[styles.text, value === key && styles.textActive]}>{label}</Text>
      </TouchableOpacity>
    ))}
  </View>
);

const styles = StyleSheet.create({
  toggle: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: BorderRadius.xl,
    padding: 4,
    marginBottom: Spacing['2xl'],
  },
  btn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: BorderRadius.lg },
  btnActive: {
    backgroundColor: Colors.surfaceContainerLowest,
    shadowColor: 'rgba(0,0,0,0.08)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  text: { ...Typography.labelLarge, color: Colors.onSurfaceVariant, fontSize: 14, textTransform: 'none' },
  textActive: { color: Colors.primary },
});

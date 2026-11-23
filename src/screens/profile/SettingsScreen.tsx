import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Typography, Shadows, ThemeMode } from '../../theme';
import { Header } from '../../components';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';

type Props = { navigation: NativeStackNavigationProp<any> };

const THEME_OPTIONS: { key: ThemeMode; label: string; icon: keyof typeof MaterialIcons.glyphMap }[] = [
  { key: 'light', label: 'Light', icon: 'light-mode' },
  { key: 'dark', label: 'Dark', icon: 'dark-mode' },
  { key: 'system', label: 'System', icon: 'settings-brightness' },
];

export const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const role = useAuthStore((s) => s.role);
  const user = useAuthStore((s) => s.user);
  const { mode: themeMode, setMode: setThemeMode, colors, isDark } = useThemeStore();
  const [pushEnabled, setPushEnabled] = useState(true);

  const isDoctor = role === 'doctor' || user?.role === 'doctor';
  const profileRoute = isDoctor ? 'DoctorInfo' : 'PatientInfo';

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: () => useAuthStore.getState().logout(),
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Settings"
        showBack
        onBack={() => navigation.goBack()}
        showNotification={false}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Appearance / Theme Mode */}
        <Text style={[styles.sectionLabel, { color: colors.primary }]}>Appearance</Text>
        <View style={[styles.card, { backgroundColor: colors.surfaceContainerLowest, padding: 18 }]}>
          <View style={styles.themeHeader}>
            <View style={[styles.rowIcon, { backgroundColor: colors.surfaceContainerLow }]}>
              <MaterialIcons
                name={isDark ? 'dark-mode' : 'light-mode'}
                size={20}
                color={colors.primary}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowTitle, { color: colors.onSurface }]}>Theme Mode</Text>
              <Text style={[styles.rowSub, { color: colors.onSurfaceVariant }]}>
                Choose Light, Dark, or follow your device system setting
              </Text>
            </View>
          </View>

          <View style={[styles.themeSelector, { backgroundColor: colors.surfaceContainerLow }]}>
            {THEME_OPTIONS.map((opt) => {
              const active = themeMode === opt.key;
              return (
                <TouchableOpacity
                  key={opt.key}
                  style={[
                    styles.themeOption,
                    active && {
                      backgroundColor: colors.primary,
                      ...Shadows.subtle,
                    },
                  ]}
                  onPress={() => setThemeMode(opt.key)}
                  activeOpacity={0.85}
                >
                  <MaterialIcons
                    name={opt.icon}
                    size={18}
                    color={active ? colors.onPrimary : colors.onSurfaceVariant}
                  />
                  <Text
                    style={[
                      styles.themeOptionText,
                      { color: active ? colors.onPrimary : colors.onSurfaceVariant },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Account */}
        <Text style={[styles.sectionLabel, { color: colors.primary }]}>Account</Text>
        <View style={[styles.card, { backgroundColor: colors.surfaceContainerLowest }]}>
          <TouchableOpacity
            style={styles.row}
            onPress={() => navigation.navigate(profileRoute)}
          >
            <View style={[styles.rowIcon, { backgroundColor: colors.surfaceContainerLow }]}>
              <MaterialIcons name="person-outline" size={20} color={colors.secondary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowTitle, { color: colors.onSurface }]}>Edit Profile</Text>
              <Text style={[styles.rowSub, { color: colors.onSurfaceVariant }]}>
                Update your personal & clinical details
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={22} color={colors.outlineVariant} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.row, styles.rowBorder, { borderTopColor: colors.surfaceContainerLow }]}
            onPress={() => navigation.navigate('UpdatePassword')}
          >
            <View style={[styles.rowIcon, { backgroundColor: colors.surfaceContainerLow }]}>
              <MaterialIcons name="lock-outline" size={20} color={colors.secondary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowTitle, { color: colors.onSurface }]}>Update Password</Text>
              <Text style={[styles.rowSub, { color: colors.onSurfaceVariant }]}>
                Reset password via email OTP
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={22} color={colors.outlineVariant} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.row, styles.rowBorder, { borderTopColor: colors.surfaceContainerLow }]}
            onPress={() => navigation.navigate('Notifications')}
          >
            <View style={[styles.rowIcon, { backgroundColor: colors.surfaceContainerLow }]}>
              <MaterialIcons name="notifications-none" size={20} color={colors.secondary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowTitle, { color: colors.onSurface }]}>Notification Center</Text>
              <Text style={[styles.rowSub, { color: colors.onSurfaceVariant }]}>
                View and manage your alerts
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={22} color={colors.outlineVariant} />
          </TouchableOpacity>
        </View>

        {/* Preferences */}
        <Text style={[styles.sectionLabel, { color: colors.primary }]}>Preferences</Text>
        <View style={[styles.card, { backgroundColor: colors.surfaceContainerLowest }]}>
          <View style={styles.row}>
            <View style={[styles.rowIcon, { backgroundColor: colors.surfaceContainerLow }]}>
              <MaterialIcons
                name="notifications-active"
                size={20}
                color={colors.secondary}
              />
            </View>
            <Text style={[styles.rowTitle, { flex: 1, color: colors.onSurface }]}>
              Push Notifications
            </Text>
            <Switch
              value={pushEnabled}
              onValueChange={setPushEnabled}
              trackColor={{
                false: colors.surfaceContainerHighest,
                true: colors.primary,
              }}
              thumbColor={colors.white}
            />
          </View>
          <View style={[styles.row, styles.rowBorder, { borderTopColor: colors.surfaceContainerLow }]}>
            <View style={[styles.rowIcon, { backgroundColor: colors.surfaceContainerLow }]}>
              <MaterialIcons name="language" size={20} color={colors.secondary} />
            </View>
            <Text style={[styles.rowTitle, { flex: 1, color: colors.onSurface }]}>App Language</Text>
            <Text style={[styles.langValue, { color: colors.primary }]}>English</Text>
          </View>
        </View>

        {/* Session */}
        <Text style={[styles.sectionLabel, { color: colors.error }]}>Session</Text>
        <TouchableOpacity
          style={[
            styles.dangerCard,
            isDark && {
              backgroundColor: colors.errorContainer,
              borderColor: colors.error,
            },
          ]}
          onPress={handleLogout}
        >
          <View
            style={[
              styles.dangerIcon,
              isDark && { backgroundColor: `${colors.error}30` },
            ]}
          >
            <MaterialIcons name="logout" size={20} color={colors.error} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.dangerTitle, { color: colors.error }]}>Sign Out</Text>
            <Text style={[styles.dangerSub, { color: colors.onSurfaceVariant }]}>
              Log out of your current session
            </Text>
          </View>
          <MaterialIcons name="chevron-right" size={22} color={colors.outlineVariant} />
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 16, paddingBottom: 40 },
  sectionLabel: {
    fontSize: 16,
    fontFamily: 'Manrope_700Bold',
    marginBottom: 12,
    marginTop: 20,
    paddingHorizontal: 4,
  },
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    ...Shadows.subtle,
  },
  themeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  themeSelector: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 4,
    gap: 6,
  },
  themeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: 10,
  },
  themeOptionText: {
    fontSize: 13,
    fontFamily: 'Manrope_700Bold',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  rowBorder: {
    borderTopWidth: 1,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: {
    fontSize: 15,
    fontFamily: 'Manrope_600SemiBold',
  },
  rowSub: {
    ...Typography.bodySmall,
    marginTop: 2,
  },
  langValue: {
    fontSize: 13,
    fontFamily: 'Manrope_600SemiBold',
  },
  dangerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#fef2f2',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  dangerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerTitle: {
    fontSize: 15,
    fontFamily: 'Manrope_700Bold',
  },
  dangerSub: {
    ...Typography.bodySmall,
    marginTop: 2,
  },
});

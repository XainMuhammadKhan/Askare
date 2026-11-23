import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Typography, Shadows } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import { doctorService } from '../../api';
import { useApi } from '../../hooks/useApi';
import { initials } from '../../utils/format';

type Props = { navigation: NativeStackNavigationProp<any> };

interface MenuItem {
  icon: string;
  label: string;
  screen: string;
  badge?: string;
  badgeColor?: string;
}

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const user = useAuthStore((s) => s.user);
  const role = useAuthStore((s) => s.role);
  const insets = useSafeAreaInsets();

  const isDoctor = role === 'doctor' || user?.role === 'doctor';

  const { data: docProfile } = useApi(
    async () => (isDoctor ? doctorService.profile() : null),
    [isDoctor]
  );

  const approvalStatus: string | undefined = docProfile?.status || user?.status;
  const statusBadgeColor =
    approvalStatus === 'ACTIVE'
      ? '#16a34a'
      : approvalStatus === 'PENDING'
      ? '#d97706'
      : Colors.error;

  const patientMenu: MenuItem[] = [
    { icon: 'person-outline', label: 'Personal & Health Profile', screen: 'PatientInfo' },
    { icon: 'folder-shared', label: 'Medical Records', screen: 'ClinicalArchive' },
    { icon: 'description', label: 'My Documents', screen: 'MyDocuments' },
    { icon: 'receipt-long', label: 'Payment History', screen: 'PaymentHistory' },
    { icon: 'insights', label: 'Monthly Health Report', screen: 'HealthReport' },
    { icon: 'notifications-none', label: 'Notifications', screen: 'Notifications' },
    { icon: 'lock-outline', label: 'Update Password', screen: 'UpdatePassword' },
    { icon: 'settings', label: 'Settings', screen: 'Settings' },
    { icon: 'help-outline', label: 'Help & Support', screen: 'HelpSupport' },
    { icon: 'privacy-tip', label: 'Privacy Policy', screen: 'PrivacyPolicy' },
    { icon: 'gavel', label: 'Terms of Use', screen: 'TermsOfUse' },
  ];

  const doctorMenu: MenuItem[] = [
    {
      icon: 'medical-information',
      label: 'Doctor Profile',
      screen: 'DoctorInfo',
      badge: approvalStatus,
      badgeColor: statusBadgeColor,
    },
    { icon: 'schedule', label: 'Weekly Schedule & Slots', screen: 'Schedule' },
    { icon: 'date-range', label: 'Calendar & Slot Blocking', screen: 'DoctorCalendar' },
    { icon: 'account-balance-wallet', label: 'Earnings & Payouts', screen: 'Earnings' },
    { icon: 'star-outline', label: 'Patient Reviews', screen: 'DoctorReviews' },
    { icon: 'verified-user', label: 'Verification Documents', screen: 'DoctorDocuments' },
    { icon: 'notifications-none', label: 'Notifications', screen: 'Notifications' },
    { icon: 'lock-outline', label: 'Update Password', screen: 'UpdatePassword' },
    { icon: 'settings', label: 'Settings', screen: 'Settings' },
    { icon: 'help-outline', label: 'Help & Support', screen: 'HelpSupport' },
    { icon: 'privacy-tip', label: 'Privacy Policy', screen: 'PrivacyPolicy' },
    { icon: 'gavel', label: 'Terms of Use', screen: 'TermsOfUse' },
  ];

  const menuItems = isDoctor ? doctorMenu : patientMenu;

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out of AskCare?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await useAuthStore.getState().logout();
          } catch (e: any) {
            Alert.alert('Error', e?.message || 'Failed to log out cleanly.');
          }
        },
      },
    ]);
  };

  const displayName = docProfile?.name || user?.name || 'AskCare User';
  const displayEmail = docProfile?.email || user?.email || '';
  const displayRole = (role || user?.role || 'patient').toUpperCase();

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarText}>{initials(displayName)}</Text>
          </View>
          <Text style={styles.userName}>{displayName}</Text>
          <Text style={styles.userEmail}>{displayEmail}</Text>

          <View style={styles.badgesRow}>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{displayRole}</Text>
            </View>
            {isDoctor && approvalStatus && (
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: `${statusBadgeColor}18` },
                ]}
              >
                <View style={[styles.statusDot, { backgroundColor: statusBadgeColor }]} />
                <Text style={[styles.statusText, { color: statusBadgeColor }]}>
                  {approvalStatus}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Menu */}
        <View style={styles.menu}>
          {menuItems.map((item, i) => (
            <TouchableOpacity
              key={item.screen + i}
              style={[styles.menuItem, i > 0 && styles.menuItemBorder]}
              onPress={() => navigation.navigate(item.screen)}
              activeOpacity={0.7}
            >
              <View style={styles.menuIcon}>
                <MaterialIcons name={item.icon as any} size={22} color={Colors.secondary} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              {item.badge && (
                <View
                  style={[
                    styles.inlineBadge,
                    { backgroundColor: `${item.badgeColor || Colors.primary}18` },
                  ]}
                >
                  <Text
                    style={[
                      styles.inlineBadgeText,
                      { color: item.badgeColor || Colors.primary },
                    ]}
                  >
                    {item.badge}
                  </Text>
                </View>
              )}
              <MaterialIcons name="chevron-right" size={22} color={Colors.outlineVariant} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <MaterialIcons name="logout" size={20} color={Colors.error} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 20, paddingBottom: 8 },
  headerTitle: { fontSize: 22, fontFamily: 'Manrope_700Bold', color: Colors.primary },
  scrollContent: { paddingHorizontal: 16 },
  profileCard: { alignItems: 'center', paddingVertical: 24 },
  avatarLarge: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: `${Colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  avatarText: {
    fontSize: 30,
    fontFamily: 'Manrope_700Bold',
    color: Colors.primary,
  },
  userName: {
    fontSize: 22,
    fontFamily: 'Manrope_700Bold',
    color: Colors.onSurface,
    marginBottom: 4,
  },
  userEmail: {
    ...Typography.bodyMedium,
    color: Colors.onSurfaceVariant,
    marginBottom: 10,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roleBadge: {
    backgroundColor: Colors.surfaceContainerLow,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 20,
  },
  roleText: {
    ...Typography.labelSmall,
    color: Colors.primary,
    fontSize: 10,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    ...Typography.labelSmall,
    fontSize: 10,
  },
  menu: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    ...Shadows.subtle,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  menuItemBorder: {
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceContainerLow,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Manrope_600SemiBold',
    color: Colors.onSurface,
  },
  inlineBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  inlineBadgeText: {
    fontSize: 9,
    fontFamily: 'Manrope_700Bold',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: `${Colors.error}30`,
    borderRadius: 16,
    backgroundColor: '#fef2f2',
  },
  logoutText: {
    fontSize: 15,
    fontFamily: 'Manrope_700Bold',
    color: Colors.error,
  },
});

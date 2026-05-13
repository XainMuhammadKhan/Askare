import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography, Shadows } from '../../theme';
import { useAuthStore } from '../../store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = { navigation: NativeStackNavigationProp<any> };

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const user = useAuthStore(s => s.user);
  const role = useAuthStore(s => s.role);
  const logout = useAuthStore(s => s.logout);
  const insets = useSafeAreaInsets();

  const menuItems = [
    { icon: 'person-outline', label: 'Personal Information', screen: role === 'doctor' ? 'DoctorInfo' : 'PatientInfo' },
    { icon: 'settings', label: 'Settings', screen: 'Settings' },
    { icon: 'help-outline', label: 'Help & Support', screen: 'HelpSupport' },
    { icon: 'privacy-tip', label: 'Privacy Policy', screen: 'PrivacyPolicy' },
    { icon: 'description', label: 'Terms of Use', screen: 'TermsOfUse' },
  ];

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarLarge}><MaterialIcons name="person" size={48} color={Colors.outlineVariant} /></View>
          <Text style={styles.userName}>{user?.name || 'Sarah Jenkins'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'sarah.j@example.com'}</Text>
          <View style={styles.idBadge}><Text style={styles.idText}>ID: {user?.id || 'AC-98234-L'}</Text></View>
        </View>

        {/* Menu */}
        <View style={styles.menu}>
          {menuItems.map((item, i) => (
            <TouchableOpacity key={i} style={styles.menuItem} onPress={() => navigation.navigate(item.screen)} activeOpacity={0.7}>
              <View style={styles.menuIcon}><MaterialIcons name={item.icon as any} size={22} color={Colors.secondary} /></View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <MaterialIcons name="chevron-right" size={22} color={Colors.outlineVariant} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
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
  profileCard: { alignItems: 'center', paddingVertical: 28 },
  avatarLarge: { width: 96, height: 96, borderRadius: 48, backgroundColor: Colors.surfaceContainerHigh, alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 3, borderColor: Colors.primary },
  userName: { fontSize: 22, fontFamily: 'Manrope_700Bold', color: Colors.onSurface, marginBottom: 4 },
  userEmail: { ...Typography.bodyMedium, color: Colors.onSurfaceVariant, marginBottom: 8 },
  idBadge: { backgroundColor: Colors.surfaceContainerLow, paddingHorizontal: 14, paddingVertical: 4, borderRadius: 20 },
  idText: { ...Typography.labelSmall, color: Colors.onSurfaceVariant, fontSize: 11 },
  menu: { backgroundColor: Colors.surfaceContainerLowest, borderRadius: 20, overflow: 'hidden', marginBottom: 20, ...Shadows.subtle },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 20, paddingVertical: 18 },
  menuIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surfaceContainerLow, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, fontSize: 15, fontFamily: 'Manrope_500Medium', color: Colors.onSurface },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderWidth: 1, borderColor: `${Colors.error}30`, borderRadius: 16, backgroundColor: '#fef2f2' },
  logoutText: { fontSize: 15, fontFamily: 'Manrope_600SemiBold', color: Colors.error },
});

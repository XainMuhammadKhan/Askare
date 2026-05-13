import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography, Shadows } from '../../theme';
import { Header } from '../../components';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = { navigation: NativeStackNavigationProp<any> };

export const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const [pushEnabled, setPushEnabled] = useState(true);
  return (
    <View style={styles.container}>
      <Header title="Settings" showBack onBack={() => navigation.goBack()} showNotification={false} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Account */}
        <Text style={styles.sectionLabel}>Account</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('UpdatePassword')}>
            <View style={styles.rowIcon}><MaterialIcons name="lock" size={20} color={Colors.secondary} /></View>
            <View style={{ flex: 1 }}><Text style={styles.rowTitle}>Change Password</Text><Text style={styles.rowSub}>Update your security credentials</Text></View>
            <MaterialIcons name="chevron-right" size={22} color={Colors.outlineVariant} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('EmailSubscription')}>
            <View style={styles.rowIcon}><MaterialIcons name="email" size={20} color={Colors.secondary} /></View>
            <View style={{ flex: 1 }}><Text style={styles.rowTitle}>Email Subscription</Text><Text style={styles.rowSub}>Manage newsletter and updates</Text></View>
            <MaterialIcons name="chevron-right" size={22} color={Colors.outlineVariant} />
          </TouchableOpacity>
        </View>
        {/* Preferences */}
        <Text style={styles.sectionLabel}>Preferences</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowIcon}><MaterialIcons name="notifications-active" size={20} color={Colors.secondary} /></View>
            <Text style={[styles.rowTitle, { flex: 1 }]}>Push Notifications</Text>
            <Switch value={pushEnabled} onValueChange={setPushEnabled} trackColor={{ false: Colors.surfaceContainerHighest, true: Colors.primary }} thumbColor={Colors.white} />
          </View>
          <TouchableOpacity style={styles.row}>
            <View style={styles.rowIcon}><MaterialIcons name="language" size={20} color={Colors.secondary} /></View>
            <Text style={[styles.rowTitle, { flex: 1 }]}>App Language</Text>
            <Text style={styles.langValue}>English</Text>
            <MaterialIcons name="chevron-right" size={22} color={Colors.outlineVariant} />
          </TouchableOpacity>
        </View>
        {/* Danger Zone */}
        <Text style={[styles.sectionLabel, { color: Colors.tertiary }]}>Danger Zone</Text>
        <TouchableOpacity style={styles.dangerCard}>
          <View style={styles.dangerIcon}><MaterialIcons name="cancel" size={20} color={Colors.error} /></View>
          <View style={{ flex: 1 }}><Text style={styles.dangerTitle}>Delete Account</Text><Text style={styles.dangerSub}>Permanently remove your account and data</Text></View>
          <MaterialIcons name="chevron-right" size={22} color={Colors.outlineVariant} />
        </TouchableOpacity>
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: 16, paddingBottom: 40 },
  sectionLabel: { fontSize: 16, fontFamily: 'Manrope_600SemiBold', color: Colors.primary, marginBottom: 12, marginTop: 20, paddingHorizontal: 4 },
  card: { backgroundColor: Colors.surfaceContainerLowest, borderRadius: 20, overflow: 'hidden', ...Shadows.subtle },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 20, paddingVertical: 18 },
  rowIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surfaceContainerLow, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { fontSize: 15, fontFamily: 'Manrope_500Medium', color: Colors.onSurface },
  rowSub: { ...Typography.bodySmall, color: Colors.onSurfaceVariant, marginTop: 2 },
  langValue: { fontSize: 13, fontFamily: 'Manrope_500Medium', color: Colors.primary, marginRight: 4 },
  dangerCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#fef2f2', borderRadius: 20, paddingHorizontal: 20, paddingVertical: 18, borderWidth: 1, borderColor: '#fecaca' },
  dangerIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fee2e2', alignItems: 'center', justifyContent: 'center' },
  dangerTitle: { fontSize: 15, fontFamily: 'Manrope_500Medium', color: Colors.error },
  dangerSub: { ...Typography.bodySmall, color: Colors.onSurfaceVariant, marginTop: 2 },
});

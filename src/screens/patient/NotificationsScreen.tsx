import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography, Shadows } from '../../theme';
import { Header } from '../../components';
import { useAppStore } from '../../store';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = { navigation: NativeStackNavigationProp<any> };
const iconMap: Record<string, string> = { appointment: 'event-available', payment: 'receipt', message: 'chat-bubble', reminder: 'schedule' };
const iconBgMap: Record<string, string> = { appointment: Colors.secondaryContainer, payment: `${Colors.secondary}20`, message: `${Colors.tertiary}20`, reminder: `${Colors.secondary}15` };

export const NotificationsScreen: React.FC<Props> = ({ navigation }) => {
  const { notifications, markAllNotificationsRead } = useAppStore();
  return (
    <View style={styles.container}>
      <Header title="Notifications" showBack onBack={() => navigation.goBack()} onNotification={() => {}} />
      <View style={styles.topRow}>
        <Text style={styles.topLabel}>RECENT UPDATES</Text>
        <TouchableOpacity onPress={markAllNotificationsRead}><Text style={styles.markAll}>Mark all as read</Text></TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {notifications.map(n => (
          <View key={n.id} style={[styles.card, !n.read && styles.cardUnread]}>
            <View style={[styles.iconCircle, { backgroundColor: iconBgMap[n.type] || Colors.surfaceContainer }]}>
              <MaterialIcons name={(iconMap[n.type] || 'notifications') as any} size={20} color={Colors.secondary} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{n.title}</Text>
                <Text style={styles.cardTime}>{n.time}</Text>
              </View>
              <Text style={styles.cardMsg}>{n.message}</Text>
              {n.priority && <View style={styles.priorityBadge}><View style={styles.priorityDot} /><Text style={styles.priorityText}>PRIORITY</Text></View>}
              {n.type === 'message' && <TouchableOpacity style={styles.viewBtn}><Text style={styles.viewBtnText}>View Message</Text></TouchableOpacity>}
            </View>
          </View>
        ))}
        {/* Support Banner */}
        <View style={styles.supportBanner}>
          <Text style={styles.supportTitle}>Need assistance?</Text>
          <Text style={styles.supportSub}>Our support team is available 24/7 to help with your medical records or portal access.</Text>
          <TouchableOpacity style={styles.supportBtn}><Text style={styles.supportBtnText}>Contact Support</Text></TouchableOpacity>
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 8 },
  topLabel: { ...Typography.labelMedium, color: Colors.onSurfaceVariant, fontSize: 11 },
  markAll: { fontSize: 13, fontFamily: 'Manrope_600SemiBold', color: Colors.primary },
  list: { paddingHorizontal: 16, paddingBottom: 20 },
  card: { flexDirection: 'row', gap: 14, backgroundColor: Colors.surfaceContainerLowest, borderRadius: 16, padding: 16, marginBottom: 12, ...Shadows.subtle },
  cardUnread: { borderLeftWidth: 3, borderLeftColor: Colors.primary },
  iconCircle: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardTitle: { fontSize: 15, fontFamily: 'Manrope_700Bold', color: Colors.onSurface, flex: 1 },
  cardTime: { fontSize: 10, fontFamily: 'Manrope_700Bold', color: Colors.onSurfaceVariant, letterSpacing: 0.5 },
  cardMsg: { ...Typography.bodyMedium, color: Colors.onSurfaceVariant, marginTop: 4, lineHeight: 20 },
  priorityBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  priorityDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary },
  priorityText: { fontSize: 10, fontFamily: 'Manrope_700Bold', color: Colors.primary, letterSpacing: 1 },
  viewBtn: { borderWidth: 1, borderColor: Colors.outlineVariant, borderRadius: 20, paddingVertical: 6, paddingHorizontal: 14, alignSelf: 'flex-start', marginTop: 10 },
  viewBtnText: { fontSize: 12, fontFamily: 'Manrope_600SemiBold', color: Colors.primary },
  supportBanner: { backgroundColor: Colors.surfaceContainerLow, borderRadius: 20, padding: 24, marginTop: 12 },
  supportTitle: { fontSize: 18, fontFamily: 'Manrope_700Bold', color: Colors.onSurface, marginBottom: 4 },
  supportSub: { ...Typography.bodyMedium, color: Colors.onSurfaceVariant, lineHeight: 20, marginBottom: 16 },
  supportBtn: { borderWidth: 1, borderColor: Colors.onSurface, borderRadius: 20, paddingVertical: 10, paddingHorizontal: 20, alignSelf: 'flex-start' },
  supportBtnText: { fontSize: 13, fontFamily: 'Manrope_600SemiBold', color: Colors.onSurface },
});

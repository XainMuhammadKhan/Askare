import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Typography, Shadows } from '../../theme';
import { Header, StateView } from '../../components';
import { notificationService, AppNotification } from '../../api';
import { useApi } from '../../hooks/useApi';
import { timeAgo } from '../../utils/format';

type Props = { navigation: NativeStackNavigationProp<any> };

const iconMap: Record<string, string> = {
  APPOINTMENT: 'event-available',
  PAYMENT: 'receipt',
  PRESCRIPTION: 'medication',
  CALL: 'videocam',
  APPROVAL: 'verified',
  REVIEW: 'star',
  ACCOUNT: 'person',
};

const iconBgMap: Record<string, string> = {
  APPOINTMENT: Colors.secondaryContainer,
  PAYMENT: `${Colors.secondary}20`,
  PRESCRIPTION: `${Colors.primary}15`,
  CALL: `${Colors.tertiary}20`,
  APPROVAL: `${Colors.primary}20`,
  REVIEW: '#fef3c7',
  ACCOUNT: Colors.surfaceContainerHigh,
};

export const NotificationsScreen: React.FC<Props> = ({ navigation }) => {
  const { data, loading, error, refresh, setData } = useApi(
    () => notificationService.list(false),
    []
  );
  const [markingAll, setMarkingAll] = useState(false);

  const items: AppNotification[] = data?.items ?? [];
  const unreadCount = data?.unread ?? items.filter((n) => !n.readAt).length;

  const handleMarkAllRead = async () => {
    if (markingAll || unreadCount === 0) return;
    setMarkingAll(true);
    try {
      await notificationService.markAllRead();
      const nowIso = new Date().toISOString();
      setData((prev) =>
        prev
          ? {
              unread: 0,
              items: prev.items.map((n) => ({ ...n, readAt: n.readAt || nowIso })),
            }
          : prev
      );
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to mark notifications as read.');
    } finally {
      setMarkingAll(false);
    }
  };

  const handleTapItem = async (item: AppNotification) => {
    if (!item.readAt) {
      try {
        await notificationService.markRead(item.id);
        const nowIso = new Date().toISOString();
        setData((prev) =>
          prev
            ? {
                unread: Math.max(0, (prev.unread ?? 1) - 1),
                items: prev.items.map((n) =>
                  n.id === item.id ? { ...n, readAt: nowIso } : n
                ),
              }
            : prev
        );
      } catch (e: any) {
        Alert.alert('Error', e?.message || 'Could not mark notification as read.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Notifications"
        showBack
        onBack={() => navigation.goBack()}
        showNotification={false}
      />

      <View style={styles.topRow}>
        <Text style={styles.topLabel}>
          RECENT UPDATES {unreadCount > 0 ? `(${unreadCount} UNREAD)` : ''}
        </Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={handleMarkAllRead} disabled={markingAll}>
            <Text style={styles.markAll}>
              {markingAll ? 'Marking...' : 'Mark all as read'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
            tintColor={Colors.primary}
          />
        }
      >
        <StateView
          loading={loading && !data}
          error={error}
          empty={items.length === 0}
          emptyText="You have no notifications yet."
          onRetry={refresh}
        >
          {items.map((n) => {
            const isUnread = !n.readAt;
            return (
              <TouchableOpacity
                key={n.id}
                style={[styles.card, isUnread && styles.cardUnread]}
                onPress={() => handleTapItem(n)}
                activeOpacity={0.75}
              >
                <View
                  style={[
                    styles.iconCircle,
                    { backgroundColor: iconBgMap[n.type] || Colors.surfaceContainer },
                  ]}
                >
                  <MaterialIcons
                    name={(iconMap[n.type] || 'notifications') as any}
                    size={20}
                    color={Colors.primary}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>{n.title}</Text>
                    <Text style={styles.cardTime}>{timeAgo(n.createdAt)}</Text>
                  </View>
                  <Text style={styles.cardMsg}>{n.body}</Text>
                  {isUnread && (
                    <View style={styles.unreadBadge}>
                      <View style={styles.unreadDot} />
                      <Text style={styles.unreadText}>NEW</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </StateView>
        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  topLabel: {
    ...Typography.labelMedium,
    color: Colors.onSurfaceVariant,
    fontSize: 11,
  },
  markAll: {
    fontSize: 13,
    fontFamily: 'Manrope_600SemiBold',
    color: Colors.primary,
  },
  list: { paddingHorizontal: 16, paddingBottom: 20 },
  card: {
    flexDirection: 'row',
    gap: 14,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    ...Shadows.subtle,
  },
  cardUnread: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontFamily: 'Manrope_700Bold',
    color: Colors.onSurface,
    flex: 1,
  },
  cardTime: {
    fontSize: 11,
    fontFamily: 'Manrope_600SemiBold',
    color: Colors.onSurfaceVariant,
  },
  cardMsg: {
    ...Typography.bodyMedium,
    color: Colors.onSurfaceVariant,
    marginTop: 4,
    lineHeight: 20,
  },
  unreadBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  unreadText: {
    fontSize: 10,
    fontFamily: 'Manrope_700Bold',
    color: Colors.primary,
    letterSpacing: 1,
  },
});

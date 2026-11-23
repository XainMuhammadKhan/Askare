import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../../theme';
import { Header, StateView } from '../../../components';
import { doctorService, Review } from '../../../api';
import { useApi } from '../../../hooks/useApi';
import { formatDate, initials } from '../../../utils/format';

type Props = { navigation: NativeStackNavigationProp<any> };

export const DoctorReviewsScreen: React.FC<Props> = ({ navigation }) => {
  const { data, loading, error, refresh } = useApi(() => doctorService.reviews(), []);

  const reviews: Review[] = useMemo(() => {
    if (Array.isArray(data)) return data;
    if (Array.isArray((data as any)?.reviews)) return (data as any).reviews;
    if (Array.isArray((data as any)?.items)) return (data as any).items;
    return [];
  }, [data]);

  const avgRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + Number(r.rating ?? 0), 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews]);

  return (
    <View style={styles.container}>
      <Header
        title="Patient Reviews"
        showBack
        onBack={() => navigation.goBack()}
        onNotification={() => navigation.navigate('Notifications')}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Rating Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.scoreCircle}>
            <Text style={styles.scoreVal}>{avgRating}</Text>
            <MaterialIcons name="star" size={18} color="#f59e0b" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.summaryTitle}>Overall Patient Rating</Text>
            <Text style={styles.summarySub}>Based on {reviews.length} verified consultations</Text>
          </View>
        </View>

        <StateView
          loading={loading}
          error={error}
          empty={!loading && reviews.length === 0}
          emptyText="No patient reviews yet."
          onRetry={refresh}
        >
          {reviews.map((rev) => {
            const patientName = rev.patient?.name || 'Verified Patient';
            const stars = Math.max(1, Math.min(5, Math.round(Number(rev.rating ?? 5))));

            return (
              <View key={rev.id} style={styles.reviewCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{initials(patientName) || 'P'}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.patientName}>{patientName}</Text>
                    <Text style={styles.dateText}>{formatDate(rev.createdAt)}</Text>
                  </View>
                  <View style={styles.starsRow}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <MaterialIcons
                        key={s}
                        name={s <= stars ? 'star' : 'star-border'}
                        size={16}
                        color="#f59e0b"
                      />
                    ))}
                  </View>
                </View>

                {rev.comment ? (
                  <Text style={styles.commentText}>{rev.comment}</Text>
                ) : (
                  <Text style={styles.noCommentText}>Rated {stars} stars without comment.</Text>
                )}
              </View>
            );
          })}
        </StateView>

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.subtle,
  },
  scoreCircle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fef3c7',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
  },
  scoreVal: {
    ...Typography.headlineSmall,
    fontFamily: 'Manrope_700Bold',
    color: '#92400e',
  },
  summaryTitle: {
    ...Typography.titleSmall,
    fontSize: 16,
    color: Colors.onSurface,
  },
  summarySub: {
    ...Typography.bodySmall,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  reviewCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.subtle,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${Colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...Typography.labelLarge,
    color: Colors.primary,
  },
  patientName: {
    ...Typography.titleSmall,
    color: Colors.onSurface,
  },
  dateText: {
    ...Typography.bodySmall,
    color: Colors.onSurfaceVariant,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentText: {
    ...Typography.bodyMedium,
    color: Colors.onSurface,
    marginTop: Spacing.md,
    lineHeight: 20,
  },
  noCommentText: {
    ...Typography.bodySmall,
    color: Colors.onSurfaceVariant,
    fontStyle: 'italic',
    marginTop: Spacing.sm,
  },
});

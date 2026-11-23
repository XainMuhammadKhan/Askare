import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Typography, BorderRadius, Spacing } from '../../theme';
import { Header, StateView } from '../../components';
import { publicService, DoctorDetail, Review } from '../../api';
import { useApi } from '../../hooks/useApi';
import { doctorName, formatDate, formatMoney, initials, specializationOf } from '../../utils/format';

type Props = { navigation: NativeStackNavigationProp<any>; route: any };

export const DoctorProfileScreen: React.FC<Props> = ({ navigation, route }) => {
  const fallbackDoctor = route?.params?.doctor as DoctorDetail | undefined;
  const doctorId = Number(route?.params?.doctorId ?? fallbackDoctor?.id ?? 0);
  const [tab, setTab] = useState<'About' | 'Reviews'>('About');

  const {
    data: fetchedDoctor,
    loading,
    error,
    refresh,
  } = useApi(() => publicService.doctor(doctorId), [doctorId]);

  const doctor = fetchedDoctor ?? fallbackDoctor ?? null;
  const reviews: Review[] = doctor?.reviews ?? [];
  const avgRating = doctor?.rating?.average ? Number(doctor.rating.average).toFixed(1) : 'New';
  const reviewCount = doctor?.rating?.count ?? reviews.length;

  return (
    <View style={styles.container}>
      <Header
        title="Doctor Profile"
        showBack
        onBack={() => navigation.goBack()}
        onNotification={() => navigation.navigate('Notifications')}
      />

      <StateView
        loading={loading && !doctor}
        error={!doctor ? error : null}
        empty={!loading && !doctor}
        emptyText="Doctor profile could not be found."
        onRetry={refresh}
      >
        {doctor && (
          <>
            <ScrollView
              contentContainerStyle={styles.content}
              showsVerticalScrollIndicator={false}
              refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor={Colors.primary} />}
            >
              {/* Avatar & Identity */}
              <View style={styles.photoSection}>
                <View style={styles.avatarLarge}>
                  <Text style={styles.avatarInitials}>{initials(doctor.name) || 'DR'}</Text>
                  <View style={styles.verifiedBadge}>
                    <MaterialIcons name="verified" size={24} color={Colors.primary} />
                  </View>
                </View>
                <Text style={styles.doctorName}>{doctorName(doctor.name)}</Text>
                <Text style={styles.specialty}>{specializationOf(doctor)}</Text>
                {doctor.qualification ? (
                  <Text style={styles.qualification}>{doctor.qualification}</Text>
                ) : null}
              </View>

              {/* Key Stats */}
              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <MaterialIcons name="workspace-premium" size={22} color={Colors.primary} />
                  <Text style={styles.statLabel}>EXPERIENCE</Text>
                  <Text style={styles.statValue}>
                    {doctor.experience != null ? `${doctor.experience} Years` : 'Certified'}
                  </Text>
                </View>
                <View style={styles.statBox}>
                  <MaterialIcons name="star" size={22} color="#d97706" />
                  <Text style={styles.statLabel}>RATING ({reviewCount})</Text>
                  <Text style={styles.statValue}>{avgRating}</Text>
                </View>
                <View style={styles.statBox}>
                  <MaterialIcons name="payments" size={22} color={Colors.primary} />
                  <Text style={styles.statLabel}>FEE</Text>
                  <Text style={styles.statValue}>{formatMoney(doctor.consultationFee)}</Text>
                </View>
              </View>

              {/* Tabs */}
              <View style={styles.tabs}>
                {(['About', 'Reviews'] as const).map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.tab, tab === t && styles.tabActive]}
                    onPress={() => setTab(t)}
                  >
                    <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                      {t === 'Reviews' ? `Reviews (${reviewCount})` : t}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {tab === 'About' ? (
                <View>
                  <Text style={styles.bioTitle}>Biography</Text>
                  <Text style={styles.bioText}>
                    {doctor.bio ||
                      `${doctorName(doctor.name)} is an experienced ${specializationOf(
                        doctor
                      )} specialist dedicated to evidence-based clinical care and patient wellness.`}
                  </Text>

                  {doctor.specializations?.length > 0 && (
                    <>
                      <Text style={styles.bioTitle}>Specializations</Text>
                      <View style={styles.chipRow}>
                        {doctor.specializations.map((spec: any, idx: number) => {
                          const label = spec?.name ?? spec?.specialization?.name ?? 'General';
                          return (
                            <View key={spec?.id ?? idx} style={styles.specChip}>
                              <Text style={styles.specChipText}>{label}</Text>
                            </View>
                          );
                        })}
                      </View>
                    </>
                  )}

                  <Text style={styles.bioTitle}>Hospital & Location</Text>
                  <View style={styles.locationCard}>
                    <View style={styles.mapPlaceholder}>
                      <MaterialIcons name="local-hospital" size={26} color={Colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.locationName}>
                        {doctor.hospital?.name || 'Private Clinical Practice'}
                      </Text>
                      <Text style={styles.locationAddr}>
                        {doctor.hospital?.city || doctor.city || 'Pakistan'}
                      </Text>
                    </View>
                  </View>
                </View>
              ) : (
                <View style={styles.reviewsSection}>
                  {reviews.length === 0 ? (
                    <View style={styles.emptyReviews}>
                      <MaterialIcons name="rate-review" size={36} color={Colors.outlineVariant} />
                      <Text style={styles.emptyReviewsText}>No patient reviews yet.</Text>
                    </View>
                  ) : (
                    reviews.map((rev) => (
                      <View key={rev.id} style={styles.reviewCard}>
                        <View style={styles.reviewHeader}>
                          <View style={styles.reviewerAvatar}>
                            <Text style={styles.reviewerInitials}>
                              {initials(rev.patient?.name || 'Patient')}
                            </Text>
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.reviewerName}>
                              {rev.patient?.name || 'Verified Patient'}
                            </Text>
                            <Text style={styles.reviewDate}>{formatDate(rev.createdAt)}</Text>
                          </View>
                          <View style={styles.starsRow}>
                            {[1, 2, 3, 4, 5].map((s) => (
                              <MaterialIcons
                                key={s}
                                name={s <= rev.rating ? 'star' : 'star-border'}
                                size={15}
                                color="#d97706"
                              />
                            ))}
                          </View>
                        </View>
                        {rev.comment ? <Text style={styles.reviewComment}>{rev.comment}</Text> : null}
                      </View>
                    ))
                  )}
                </View>
              )}
            </ScrollView>

            {/* Bottom Fee Bar */}
            <View style={styles.bottomBar}>
              <View>
                <Text style={styles.totalLabel}>CONSULTATION FEE</Text>
                <Text style={styles.totalFee}>{formatMoney(doctor.consultationFee)}</Text>
              </View>
              <TouchableOpacity
                style={styles.bookBtn}
                onPress={() =>
                  navigation.navigate('BookAppointment', { doctorId: doctor.id, doctor })
                }
                activeOpacity={0.85}
              >
                <Text style={styles.bookBtnText}>Book Appointment</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </StateView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: Spacing.lg, paddingBottom: 120 },
  photoSection: { alignItems: 'center', paddingVertical: 20 },
  avatarLarge: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: `${Colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 3,
    borderColor: `${Colors.primary}30`,
  },
  avatarInitials: {
    fontSize: 34,
    fontFamily: 'Manrope_700Bold',
    color: Colors.primary,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.background,
    borderRadius: 14,
  },
  doctorName: { fontSize: 22, fontFamily: 'Manrope_700Bold', color: Colors.onSurface },
  specialty: { ...Typography.bodyMedium, color: Colors.primary, fontFamily: 'Manrope_600SemiBold', marginTop: 2 },
  qualification: { ...Typography.bodySmall, color: Colors.onSurfaceVariant, marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statBox: {
    flex: 1,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHighest,
  },
  statLabel: {
    fontSize: 9,
    fontFamily: 'Manrope_700Bold',
    color: Colors.onSurfaceVariant,
    letterSpacing: 0.8,
    marginTop: 6,
  },
  statValue: {
    fontSize: 15,
    fontFamily: 'Manrope_700Bold',
    color: Colors.onSurface,
    marginTop: 2,
    textAlign: 'center',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12 },
  tabActive: { backgroundColor: Colors.surfaceContainerLowest },
  tabText: { fontSize: 13, fontFamily: 'Manrope_500Medium', color: Colors.onSurfaceVariant },
  tabTextActive: { color: Colors.primary, fontFamily: 'Manrope_700Bold' },
  bioTitle: {
    fontSize: 17,
    fontFamily: 'Manrope_700Bold',
    color: Colors.onSurface,
    marginBottom: 8,
    marginTop: 12,
  },
  bioText: {
    ...Typography.bodyMedium,
    color: Colors.onSurfaceVariant,
    lineHeight: 22,
    marginBottom: 12,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  specChip: {
    backgroundColor: `${Colors.primary}12`,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  specChipText: { fontSize: 12, fontFamily: 'Manrope_600SemiBold', color: Colors.primary },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 14,
    padding: 14,
    marginTop: 4,
  },
  mapPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: `${Colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationName: { fontSize: 15, fontFamily: 'Manrope_600SemiBold', color: Colors.onSurface },
  locationAddr: { ...Typography.bodySmall, color: Colors.onSurfaceVariant, marginTop: 2 },
  reviewsSection: { gap: 12 },
  emptyReviews: { alignItems: 'center', paddingVertical: 36, gap: 8 },
  emptyReviewsText: { ...Typography.bodyMedium, color: Colors.onSurfaceVariant },
  reviewCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHighest,
  },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  reviewerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewerInitials: { fontSize: 13, fontFamily: 'Manrope_700Bold', color: Colors.onSurface },
  reviewerName: { fontSize: 14, fontFamily: 'Manrope_600SemiBold', color: Colors.onSurface },
  reviewDate: { ...Typography.bodySmall, color: Colors.onSurfaceVariant, fontSize: 11 },
  starsRow: { flexDirection: 'row', gap: 1 },
  reviewComment: {
    ...Typography.bodyMedium,
    color: Colors.onSurfaceVariant,
    marginTop: 10,
    lineHeight: 20,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: Colors.surfaceContainerLowest,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceContainerHighest,
  },
  totalLabel: {
    fontSize: 10,
    fontFamily: 'Manrope_700Bold',
    color: Colors.onSurfaceVariant,
    letterSpacing: 1,
  },
  totalFee: { fontSize: 20, fontFamily: 'Manrope_800ExtraBold', color: Colors.onSurface },
  bookBtn: { backgroundColor: Colors.primary, paddingHorizontal: 26, paddingVertical: 14, borderRadius: 24 },
  bookBtnText: { fontSize: 14, fontFamily: 'Manrope_700Bold', color: Colors.onPrimary },
});

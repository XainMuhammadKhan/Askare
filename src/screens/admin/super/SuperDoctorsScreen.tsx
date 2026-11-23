import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows, FontFamily } from '../../../theme';
import { superAdminService } from '../../../api';
import { useApi } from '../../../hooks/useApi';
import { StateView } from '../../../components/StateView';
import { formatMoney, doctorName, specializationOf } from '../../../utils/format';
import {
  AdminHeader,
  AdminSearchBar,
  FilterChips,
  FilterChipOption,
  StatusBadge,
  ActionButton,
  AdminModal,
  FormField,
} from '../components';

type SuperDocStatus = 'ALL' | 'PENDING' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

const STATUS_FILTERS: FilterChipOption<SuperDocStatus>[] = [
  { key: 'ALL', label: 'All' },
  { key: 'PENDING', label: 'Pending Approval' },
  { key: 'ACTIVE', label: 'Active' },
  { key: 'INACTIVE', label: 'Inactive' },
  { key: 'SUSPENDED', label: 'Suspended' },
];

export const SuperDoctorsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [statusFilter, setStatusFilter] = useState<SuperDocStatus>('ALL');
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState<number | null>(null);

  // Reject Modal
  const [rejectTarget, setRejectTarget] = useState<any | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejecting, setRejecting] = useState(false);

  const queryParams = useMemo(() => {
    const q: Record<string, string | undefined> = {};
    if (statusFilter !== 'ALL') q.status = statusFilter;
    if (search.trim()) q.search = search.trim();
    return q;
  }, [statusFilter, search]);

  const {
    data: docPage,
    loading,
    error,
    refresh,
  } = useApi(() => superAdminService.doctors(queryParams), [statusFilter, search]);

  const doctors: any[] = useMemo(() => {
    if (Array.isArray(docPage?.items)) return docPage.items;
    if (Array.isArray(docPage)) return docPage as any[];
    if (Array.isArray((docPage as any)?.doctors)) return (docPage as any).doctors;
    return [];
  }, [docPage]);

  const handleApprove = async (doc: any) => {
    setBusyId(doc.id);
    try {
      await superAdminService.approveDoctor(doc.id);
      Alert.alert('Doctor Approved', `${doctorName(doc.name)} is now active.`);
      await refresh();
    } catch (e: any) {
      Alert.alert('Approval Failed', e?.message ?? 'Could not approve doctor.');
    } finally {
      setBusyId(null);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectTarget) return;
    setRejecting(true);
    try {
      await superAdminService.rejectDoctor(
        rejectTarget.id,
        rejectReason.trim() || undefined
      );
      setRejectTarget(null);
      setRejectReason('');
      Alert.alert('Rejected', 'Doctor registration has been rejected.');
      await refresh();
    } catch (e: any) {
      Alert.alert('Reject Failed', e?.message ?? 'Could not reject doctor.');
    } finally {
      setRejecting(false);
    }
  };

  const handleSetStatus = async (doc: any, nextStatus: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED') => {
    setBusyId(doc.id);
    try {
      await superAdminService.setDoctorStatus(doc.id, nextStatus);
      await refresh();
    } catch (e: any) {
      Alert.alert('Status Update Failed', e?.message ?? 'Could not update doctor status.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AdminHeader
        title="Platform Doctors"
        subtitle={`${doctors.length} doctor${doctors.length === 1 ? '' : 's'} shown`}
        badgeText="SUPER ADMIN"
        onNotificationsPress={() => navigation.navigate('Notifications')}
        onRefresh={refresh}
      />

      <View style={styles.topControls}>
        <AdminSearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search all private & hospital doctors..."
        />
        <FilterChips
          options={STATUS_FILTERS}
          selected={statusFilter}
          onSelect={setStatusFilter}
        />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading && doctors.length > 0} onRefresh={refresh} tintColor={Colors.primary} />
        }
      >
        <StateView
          loading={loading && doctors.length === 0}
          error={error}
          empty={doctors.length === 0}
          emptyText="No doctors match the selected criteria."
          onRetry={refresh}
        >
          {doctors.map((doc) => {
            const status = String(doc?.status ?? 'INACTIVE').toUpperCase();
            const isBusy = busyId === doc.id;
            const isPending = status === 'PENDING' || status === 'INACTIVE';

            return (
              <View key={doc.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={styles.avatar}>
                    <MaterialIcons name="medical-services" size={20} color={Colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.docName}>{doctorName(doc.name)}</Text>
                    <Text style={styles.docSpec}>
                      {specializationOf(doc)}
                      {doc?.hospital?.name ? ` • ${doc.hospital.name}` : ' • Private Practice'}
                    </Text>
                    {doc.email ? <Text style={styles.docEmail}>{doc.email}</Text> : null}
                  </View>
                  <StatusBadge status={status} />
                </View>

                <View style={styles.metaRow}>
                  <Text style={styles.metaText}>
                    Fee: {formatMoney(doc.consultationFee ?? 0)}
                  </Text>
                  {doc.licenseNumber ? (
                    <Text style={styles.metaText}>License: {doc.licenseNumber}</Text>
                  ) : null}
                  {doc.experience ? (
                    <Text style={styles.metaText}>{doc.experience} yrs exp</Text>
                  ) : null}
                </View>

                <View style={styles.actionsRow}>
                  {isPending ? (
                    <>
                      <ActionButton
                        small
                        variant="success"
                        icon="check"
                        label="Approve"
                        loading={isBusy}
                        onPress={() => handleApprove(doc)}
                      />
                      <ActionButton
                        small
                        variant="danger"
                        icon="close"
                        label="Reject"
                        disabled={isBusy}
                        onPress={() => {
                          setRejectTarget(doc);
                          setRejectReason('');
                        }}
                      />
                    </>
                  ) : null}

                  {status === 'ACTIVE' ? (
                    <ActionButton
                      small
                      variant="danger"
                      icon="block"
                      label="Suspend"
                      loading={isBusy}
                      onPress={() => handleSetStatus(doc, 'SUSPENDED')}
                    />
                  ) : null}

                  {status === 'SUSPENDED' ? (
                    <ActionButton
                      small
                      variant="primary"
                      icon="check-circle"
                      label="Activate"
                      loading={isBusy}
                      onPress={() => handleSetStatus(doc, 'ACTIVE')}
                    />
                  ) : null}
                </View>
              </View>
            );
          })}
        </StateView>
      </ScrollView>

      {/* Reject Doctor Modal */}
      <AdminModal
        visible={!!rejectTarget}
        title="Reject Doctor Account"
        subtitle={rejectTarget ? doctorName(rejectTarget.name) : ''}
        onClose={() => setRejectTarget(null)}
      >
        <FormField
          label="Rejection Reason (optional)"
          value={rejectReason}
          onChangeText={setRejectReason}
          placeholder="e.g. Unverified license credentials"
          multiline
        />
        <ActionButton
          label="Reject Doctor"
          variant="danger"
          icon="cancel"
          loading={rejecting}
          onPress={handleConfirmReject}
        />
      </AdminModal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topControls: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xs,
    gap: Spacing.sm,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing['4xl'],
    gap: Spacing.md,
  },
  card: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHigh,
    ...Shadows.subtle,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: `${Colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docName: {
    ...Typography.titleSmall,
    fontFamily: FontFamily.bold,
    color: Colors.onSurface,
  },
  docSpec: {
    ...Typography.bodySmall,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  docEmail: {
    ...Typography.bodySmall,
    color: Colors.outline,
    fontSize: 11,
    marginTop: 1,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceContainerHigh,
  },
  metaText: {
    ...Typography.bodySmall,
    color: Colors.onSurface,
    fontSize: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
});

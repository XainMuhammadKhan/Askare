import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows, FontFamily } from '../../../theme';
import { superAdminService } from '../../../api';
import { useApi } from '../../../hooks/useApi';
import { StateView } from '../../../components/StateView';
import {
  formatMoney,
  formatDateTime,
  doctorName,
  timeAgo,
} from '../../../utils/format';
import { useAuthStore } from '../../../store/authStore';
import {
  AdminHeader,
  AdminSearchBar,
  FilterChips,
  FilterChipOption,
  SectionHeader,
  StatusBadge,
  ActionButton,
  AdminModal,
  FormField,
} from '../components';

type SuperSection =
  | 'patients'
  | 'appointments'
  | 'payouts'
  | 'settings'
  | 'specializations'
  | 'reviews'
  | 'auditLogs';

const SECTION_TABS: FilterChipOption<SuperSection>[] = [
  { key: 'patients', label: 'Patients' },
  { key: 'appointments', label: 'Paid Appts & Refunds' },
  { key: 'payouts', label: 'Payout Requests' },
  { key: 'settings', label: 'Settings & Commission' },
  { key: 'specializations', label: 'Specializations' },
  { key: 'reviews', label: 'Reviews Moderation' },
  { key: 'auditLogs', label: 'Audit Logs' },
];

export const SuperMoreScreen: React.FC<{ navigation: any; route?: any }> = ({
  navigation,
  route,
}) => {
  const initialSection: SuperSection = route?.params?.section ?? 'patients';
  const [section, setSection] = useState<SuperSection>(initialSection);

  useEffect(() => {
    if (route?.params?.section) {
      setSection(route.params.section);
    }
  }, [route?.params?.section]);

  // ---------- 1. Patients ----------
  const [patientSearch, setPatientSearch] = useState('');
  const [busyPatientId, setBusyPatientId] = useState<number | null>(null);
  const {
    data: patientsPage,
    loading: patientsLoading,
    error: patientsError,
    refresh: refreshPatients,
  } = useApi(
    () =>
      superAdminService.patients(
        patientSearch.trim() ? { search: patientSearch.trim() } : {}
      ),
    [patientSearch]
  );

  const patients: any[] = useMemo(() => {
    if (Array.isArray(patientsPage?.items)) return patientsPage.items;
    if (Array.isArray(patientsPage)) return patientsPage as any[];
    return [];
  }, [patientsPage]);

  const handleTogglePatientStatus = async (p: any, nextStatus: 'ACTIVE' | 'SUSPENDED') => {
    setBusyPatientId(p.id);
    try {
      await superAdminService.setPatientStatus(p.id, nextStatus);
      await refreshPatients();
    } catch (e: any) {
      Alert.alert('Status Change Failed', e?.message ?? 'Could not update patient status.');
    } finally {
      setBusyPatientId(null);
    }
  };

  // ---------- 2. Paid Appointments & Manual Refund ----------
  const {
    data: apptsPage,
    loading: apptsLoading,
    error: apptsError,
    refresh: refreshAppts,
  } = useApi(() => superAdminService.appointments(), []);

  const [refundTarget, setRefundTarget] = useState<any | null>(null);
  const [refundReason, setRefundReason] = useState('');
  const [refunding, setRefunding] = useState(false);

  const appointments: any[] = useMemo(() => {
    if (Array.isArray(apptsPage?.items)) return apptsPage.items;
    if (Array.isArray(apptsPage)) return apptsPage as any[];
    return [];
  }, [apptsPage]);

  const handleConfirmRefund = async () => {
    if (!refundTarget) return;
    setRefunding(true);
    try {
      await superAdminService.refund(
        refundTarget.id,
        refundReason.trim() || undefined
      );
      setRefundTarget(null);
      setRefundReason('');
      Alert.alert('Refund Issued', 'Full manual refund processed for this appointment.');
      await refreshAppts();
    } catch (e: any) {
      Alert.alert('Refund Failed', e?.message ?? 'Could not refund appointment.');
    } finally {
      setRefunding(false);
    }
  };

  // ---------- 3. Payout Requests ----------
  const {
    data: payoutsPage,
    loading: payoutsLoading,
    error: payoutsError,
    refresh: refreshPayouts,
  } = useApi(() => superAdminService.payouts(), []);

  const [busyPayoutId, setBusyPayoutId] = useState<number | null>(null);

  const payouts: any[] = useMemo(() => {
    if (Array.isArray(payoutsPage?.items)) return payoutsPage.items;
    if (Array.isArray(payoutsPage)) return payoutsPage as any[];
    return [];
  }, [payoutsPage]);

  const handleProcessPayout = async (p: any, status: 'PAID' | 'REJECTED') => {
    setBusyPayoutId(p.id);
    try {
      await superAdminService.processPayout(
        p.id,
        status,
        status === 'PAID' ? 'Processed by Super Admin' : 'Rejected by Super Admin'
      );
      Alert.alert('Payout Updated', `Payout request marked as ${status}.`);
      await refreshPayouts();
    } catch (e: any) {
      Alert.alert('Payout Action Failed', e?.message ?? 'Could not process payout.');
    } finally {
      setBusyPayoutId(null);
    }
  };

  // ---------- 4. Platform Settings & Commission % ----------
  const {
    data: settingsData,
    loading: settingsLoading,
    error: settingsError,
    refresh: refreshSettings,
  } = useApi(() => superAdminService.settings(), []);

  const [commissionVal, setCommissionVal] = useState('10');
  const [payoutMinVal, setPayoutMinVal] = useState('5000');
  const [supportEmailVal, setSupportEmailVal] = useState('');
  const [savingCommission, setSavingCommission] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    if (settingsData) {
      if (settingsData.commissionPercent !== undefined) {
        setCommissionVal(String(settingsData.commissionPercent));
      }
      if (settingsData.payoutMinimum !== undefined) {
        setPayoutMinVal(String(settingsData.payoutMinimum));
      }
      if (settingsData.supportEmail !== undefined) {
        setSupportEmailVal(String(settingsData.supportEmail ?? ''));
      }
    }
  }, [settingsData]);

  const handleSaveCommission = async () => {
    const pct = Number(commissionVal);
    if (isNaN(pct) || pct < 0 || pct > 100) {
      Alert.alert('Invalid Commission', 'Commission must be a percentage between 0 and 100.');
      return;
    }
    setSavingCommission(true);
    try {
      await superAdminService.setCommission(pct);
      Alert.alert('Commission Updated', `Platform commission is now set to ${pct}%.`);
      await refreshSettings();
    } catch (e: any) {
      Alert.alert('Update Failed', e?.message ?? 'Could not update commission.');
    } finally {
      setSavingCommission(false);
    }
  };

  const handleSavePlatformSettings = async () => {
    const pct = Number(commissionVal);
    const min = Number(payoutMinVal);
    setSavingSettings(true);
    try {
      await superAdminService.updateSettings({
        commissionPercent: !isNaN(pct) ? pct : undefined,
        payoutMinimum: !isNaN(min) ? min : undefined,
        supportEmail: supportEmailVal.trim() || undefined,
      });
      Alert.alert('Settings Saved', 'Platform settings updated.');
      await refreshSettings();
    } catch (e: any) {
      Alert.alert('Update Failed', e?.message ?? 'Could not update platform settings.');
    } finally {
      setSavingSettings(false);
    }
  };

  // ---------- 5. Specializations CRUD ----------
  const {
    data: specsRaw,
    loading: specsLoading,
    error: specsError,
    refresh: refreshSpecs,
  } = useApi(() => superAdminService.specializations(), []);

  const [newSpecName, setNewSpecName] = useState('');
  const [addingSpec, setAddingSpec] = useState(false);
  const [renameSpecTarget, setRenameSpecTarget] = useState<any | null>(null);
  const [renameSpecValue, setRenameSpecValue] = useState('');
  const [renamingSpec, setRenamingSpec] = useState(false);

  const specializations: any[] = useMemo(() => {
    if (Array.isArray(specsRaw)) return specsRaw;
    if (Array.isArray((specsRaw as any)?.items)) return (specsRaw as any).items;
    return [];
  }, [specsRaw]);

  const handleAddSpecialization = async () => {
    if (!newSpecName.trim()) {
      Alert.alert('Name Required', 'Enter a specialization name.');
      return;
    }
    setAddingSpec(true);
    try {
      await superAdminService.addSpecialization(newSpecName.trim());
      setNewSpecName('');
      await refreshSpecs();
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Could not add specialization.');
    } finally {
      setAddingSpec(false);
    }
  };

  const handleRenameSpecialization = async () => {
    if (!renameSpecTarget || !renameSpecValue.trim()) return;
    setRenamingSpec(true);
    try {
      await superAdminService.renameSpecialization(
        renameSpecTarget.id,
        renameSpecValue.trim()
      );
      setRenameSpecTarget(null);
      setRenameSpecValue('');
      await refreshSpecs();
    } catch (e: any) {
      Alert.alert('Rename Failed', e?.message ?? 'Could not rename specialization.');
    } finally {
      setRenamingSpec(false);
    }
  };

  const handleDeleteSpecialization = (sp: any) => {
    Alert.alert(
      'Delete Specialization',
      `Delete "${sp.name}"? (Only specializations with 0 doctors can be removed.)`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await superAdminService.deleteSpecialization(sp.id);
              await refreshSpecs();
            } catch (e: any) {
              Alert.alert('Cannot Delete', e?.message ?? 'Specialization is still in use.');
            }
          },
        },
      ]
    );
  };

  // ---------- 6. Reviews Moderation ----------
  const {
    data: reviewsPage,
    loading: reviewsLoading,
    error: reviewsError,
    refresh: refreshReviews,
  } = useApi(() => superAdminService.reviews(1), []);

  const [busyReviewId, setBusyReviewId] = useState<number | null>(null);

  const reviews: any[] = useMemo(() => {
    if (Array.isArray(reviewsPage?.items)) return reviewsPage.items;
    if (Array.isArray(reviewsPage)) return reviewsPage as any[];
    return [];
  }, [reviewsPage]);

  const handleToggleReview = async (r: any) => {
    setBusyReviewId(r.id);
    try {
      await superAdminService.setReviewVisibility(r.id, !r.isHidden);
      await refreshReviews();
    } catch (e: any) {
      Alert.alert('Moderation Failed', e?.message ?? 'Could not toggle review visibility.');
    } finally {
      setBusyReviewId(null);
    }
  };

  // ---------- 7. Audit Logs ----------
  const {
    data: logsPage,
    loading: logsLoading,
    error: logsError,
    refresh: refreshLogs,
  } = useApi(() => superAdminService.auditLogs(1), []);

  const auditLogs: any[] = useMemo(() => {
    if (Array.isArray(logsPage?.items)) return logsPage.items;
    if (Array.isArray(logsPage)) return logsPage as any[];
    return [];
  }, [logsPage]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AdminHeader
        title="Platform Operations"
        subtitle="Patients, payouts, commission, content & audit logs"
        badgeText="SUPER ADMIN"
        onNotificationsPress={() => navigation.navigate('Notifications')}
      />

      {/* Utility Strip: Notifications + Sign Out */}
      <View style={styles.utilityBar}>
        <TouchableOpacity
          style={styles.utilityBtn}
          onPress={() => navigation.navigate('Notifications')}
        >
          <MaterialIcons name="notifications-none" size={18} color={Colors.primary} />
          <Text style={styles.utilityBtnText}>Notifications</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.utilityBtn, styles.utilityBtnDanger]}
          onPress={() => useAuthStore.getState().logout()}
        >
          <MaterialIcons name="logout" size={18} color={Colors.error} />
          <Text style={[styles.utilityBtnText, { color: Colors.error }]}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabsWrap}>
        <FilterChips options={SECTION_TABS} selected={section} onSelect={setSection} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* 1. PATIENTS */}
        {section === 'patients' ? (
          <View>
            <AdminSearchBar
              value={patientSearch}
              onChangeText={setPatientSearch}
              placeholder="Search patients by name or email..."
            />
            <View style={{ height: Spacing.md }} />
            <StateView
              loading={patientsLoading && patients.length === 0}
              error={patientsError}
              empty={patients.length === 0}
              emptyText="No patients found."
              onRetry={refreshPatients}
            >
              {patients.map((p) => {
                const status = String(p?.status ?? 'ACTIVE').toUpperCase();
                const isBusy = busyPatientId === p.id;
                return (
                  <View key={p.id} style={styles.card}>
                    <View style={styles.rowBetween}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.itemTitle}>{p.name ?? 'Patient'}</Text>
                        {p.email ? <Text style={styles.itemSub}>{p.email}</Text> : null}
                        {p.phone ? <Text style={styles.itemSub}>{p.phone}</Text> : null}
                      </View>
                      <StatusBadge status={status} />
                    </View>
                    <View style={styles.actionsRow}>
                      {status === 'ACTIVE' ? (
                        <ActionButton
                          small
                          variant="danger"
                          icon="block"
                          label="Block Patient"
                          loading={isBusy}
                          onPress={() => handleTogglePatientStatus(p, 'SUSPENDED')}
                        />
                      ) : (
                        <ActionButton
                          small
                          variant="primary"
                          icon="check-circle"
                          label="Unblock Patient"
                          loading={isBusy}
                          onPress={() => handleTogglePatientStatus(p, 'ACTIVE')}
                        />
                      )}
                    </View>
                  </View>
                );
              })}
            </StateView>
          </View>
        ) : null}

        {/* 2. PAID APPOINTMENTS & MANUAL REFUND */}
        {section === 'appointments' ? (
          <StateView
            loading={apptsLoading && appointments.length === 0}
            error={apptsError}
            empty={appointments.length === 0}
            emptyText="No paid appointments found."
            onRetry={refreshAppts}
          >
            {appointments.map((a) => {
              const payStatus = String(a?.paymentStatus ?? 'PAID').toUpperCase();
              const canRefund = payStatus === 'PAID' || payStatus === 'AUTHORIZED';
              return (
                <View key={a.id} style={styles.card}>
                  <View style={styles.rowBetween}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemMeta}>Appointment #{a.id}</Text>
                      <Text style={styles.itemTitle}>
                        {a?.patient?.name ?? 'Patient'} → {doctorName(a?.doctor?.name ?? 'Doctor')}
                      </Text>
                      <Text style={styles.itemSub}>
                        {formatDateTime(a?.slot?.startAt ?? a?.createdAt)} •{' '}
                        {formatMoney(a?.consultationFee ?? 0)}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 4 }}>
                      <StatusBadge status={a?.status} />
                      <StatusBadge status={payStatus} label={`Pay: ${payStatus}`} />
                    </View>
                  </View>
                  {canRefund ? (
                    <View style={styles.actionsRow}>
                      <ActionButton
                        small
                        variant="danger"
                        icon="currency-exchange"
                        label="Issue Full Refund"
                        onPress={() => {
                          setRefundTarget(a);
                          setRefundReason('');
                        }}
                      />
                    </View>
                  ) : null}
                </View>
              );
            })}
          </StateView>
        ) : null}

        {/* 3. PAYOUT REQUESTS */}
        {section === 'payouts' ? (
          <StateView
            loading={payoutsLoading && payouts.length === 0}
            error={payoutsError}
            empty={payouts.length === 0}
            emptyText="No payout requests found."
            onRetry={refreshPayouts}
          >
            {payouts.map((p) => {
              const status = String(p?.status ?? 'REQUESTED').toUpperCase();
              const isRequested = status === 'REQUESTED' || status === 'PENDING';
              const isBusy = busyPayoutId === p.id;
              return (
                <View key={p.id} style={styles.card}>
                  <View style={styles.rowBetween}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemTitle}>
                        {doctorName(p?.doctor?.name ?? p?.doctorName ?? `Doctor #${p?.doctorId ?? ''}`)}
                      </Text>
                      <Text style={styles.payoutAmount}>{formatMoney(p?.amount ?? 0)}</Text>
                      <Text style={styles.itemSub}>
                        Method: {p?.method ?? 'Bank Transfer'} • {formatDateTime(p?.createdAt)}
                      </Text>
                    </View>
                    <StatusBadge status={status} />
                  </View>
                  {isRequested ? (
                    <View style={styles.actionsRow}>
                      <ActionButton
                        small
                        variant="success"
                        icon="check"
                        label="Mark Paid"
                        loading={isBusy}
                        onPress={() => handleProcessPayout(p, 'PAID')}
                      />
                      <ActionButton
                        small
                        variant="danger"
                        icon="close"
                        label="Reject"
                        disabled={isBusy}
                        onPress={() => handleProcessPayout(p, 'REJECTED')}
                      />
                    </View>
                  ) : null}
                </View>
              );
            })}
          </StateView>
        ) : null}

        {/* 4. SETTINGS & COMMISSION */}
        {section === 'settings' ? (
          <StateView
            loading={settingsLoading && !settingsData}
            error={settingsError}
            onRetry={refreshSettings}
          >
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Platform Commission (%)</Text>
              <Text style={styles.helperText}>
                Applies to newly accepted doctor appointments across the platform.
              </Text>
              <FormField
                label="Commission Percentage (0 - 100)"
                value={commissionVal}
                onChangeText={setCommissionVal}
                keyboardType="numeric"
                placeholder="10"
              />
              <ActionButton
                label="Update Commission %"
                icon="percent"
                loading={savingCommission}
                onPress={handleSaveCommission}
              />
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>General Platform Settings</Text>
              <FormField
                label="Minimum Doctor Payout (PKR)"
                value={payoutMinVal}
                onChangeText={setPayoutMinVal}
                keyboardType="numeric"
                placeholder="5000"
              />
              <FormField
                label="Support Email"
                value={supportEmailVal}
                onChangeText={setSupportEmailVal}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="support@askcare.com"
              />
              {settingsData?.aiProvider ? (
                <Text style={styles.helperText}>
                  Active AI Provider: {settingsData.aiProvider}
                </Text>
              ) : null}
              <ActionButton
                label="Save Platform Settings"
                icon="save"
                loading={savingSettings}
                onPress={handleSavePlatformSettings}
              />
            </View>
          </StateView>
        ) : null}

        {/* 5. SPECIALIZATIONS CRUD */}
        {section === 'specializations' ? (
          <View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Add Medical Specialization</Text>
              <FormField
                label="Specialization Name"
                value={newSpecName}
                onChangeText={setNewSpecName}
                placeholder="e.g. Pediatric Neurology"
              />
              <ActionButton
                label="Add Specialization"
                icon="add"
                loading={addingSpec}
                onPress={handleAddSpecialization}
              />
            </View>

            <SectionHeader
              title={`Specializations (${specializations.length})`}
              subtitle="Used by doctor directory and AI symptom checker"
            />
            <StateView
              loading={specsLoading && specializations.length === 0}
              error={specsError}
              empty={specializations.length === 0}
              emptyText="No specializations found."
              onRetry={refreshSpecs}
            >
              {specializations.map((sp) => {
                const count = sp?.doctorCount ?? sp?.doctorsCount ?? sp?._count?.doctors ?? 0;
                return (
                  <View key={sp.id} style={styles.card}>
                    <View style={styles.rowBetween}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.itemTitle}>{sp.name}</Text>
                        <Text style={styles.itemMeta}>
                          {count} doctor{count === 1 ? '' : 's'}
                        </Text>
                      </View>
                      <View style={styles.rowActions}>
                        <ActionButton
                          small
                          variant="secondary"
                          icon="edit"
                          label="Rename"
                          onPress={() => {
                            setRenameSpecTarget(sp);
                            setRenameSpecValue(sp.name ?? '');
                          }}
                        />
                        <ActionButton
                          small
                          variant="danger"
                          icon="delete-outline"
                          label="Delete"
                          onPress={() => handleDeleteSpecialization(sp)}
                        />
                      </View>
                    </View>
                  </View>
                );
              })}
            </StateView>
          </View>
        ) : null}

        {/* 6. REVIEWS MODERATION */}
        {section === 'reviews' ? (
          <StateView
            loading={reviewsLoading && reviews.length === 0}
            error={reviewsError}
            empty={reviews.length === 0}
            emptyText="No patient reviews submitted yet."
            onRetry={refreshReviews}
          >
            {reviews.map((r) => {
              const hidden = Boolean(r?.isHidden);
              const isBusy = busyReviewId === r.id;
              return (
                <View key={r.id} style={styles.card}>
                  <View style={styles.rowBetween}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemTitle}>
                        {'★'.repeat(Math.max(1, Math.min(5, Number(r?.rating ?? 5))))} ({r?.rating}/5)
                      </Text>
                      <Text style={styles.itemSub}>
                        By {r?.patient?.name ?? 'Patient'} for{' '}
                        {doctorName(r?.doctor?.name ?? 'Doctor')}
                      </Text>
                    </View>
                    <StatusBadge
                      status={hidden ? 'HIDDEN' : 'VISIBLE'}
                      tone={hidden ? 'danger' : 'success'}
                    />
                  </View>
                  {r?.comment ? (
                    <Text style={styles.reviewComment}>"{r.comment}"</Text>
                  ) : null}
                  <View style={styles.actionsRow}>
                    <ActionButton
                      small
                      variant={hidden ? 'primary' : 'danger'}
                      icon={hidden ? 'visibility' : 'visibility-off'}
                      label={hidden ? 'Show Review' : 'Hide Review'}
                      loading={isBusy}
                      onPress={() => handleToggleReview(r)}
                    />
                  </View>
                </View>
              );
            })}
          </StateView>
        ) : null}

        {/* 7. AUDIT LOGS */}
        {section === 'auditLogs' ? (
          <StateView
            loading={logsLoading && auditLogs.length === 0}
            error={logsError}
            empty={auditLogs.length === 0}
            emptyText="No audit log entries recorded yet."
            onRetry={refreshLogs}
          >
            {auditLogs.map((log, idx) => (
              <View key={log?.id ?? idx} style={styles.card}>
                <View style={styles.rowBetween}>
                  <Text style={styles.itemTitle}>
                    {String(log?.action ?? log?.event ?? 'ADMIN_ACTION').replace(/_/g, ' ')}
                  </Text>
                  {log?.createdAt ? (
                    <Text style={styles.itemMeta}>{timeAgo(log.createdAt)}</Text>
                  ) : null}
                </View>
                <Text style={styles.itemSub}>
                  Actor: {log?.actorName ?? log?.admin?.name ?? log?.actorEmail ?? log?.actorRole ?? 'Admin'}
                  {log?.targetType ? ` • Target: ${log.targetType} #${log?.targetId ?? ''}` : ''}
                </Text>
                {log?.details || log?.metadata ? (
                  <Text style={styles.logDetails} numberOfLines={3}>
                    {typeof log.details === 'string'
                      ? log.details
                      : JSON.stringify(log.details ?? log.metadata)}
                  </Text>
                ) : null}
              </View>
            ))}
          </StateView>
        ) : null}
      </ScrollView>

      {/* Manual Refund Modal */}
      <AdminModal
        visible={!!refundTarget}
        title="Issue Manual Full Refund"
        subtitle={
          refundTarget
            ? `Appointment #${refundTarget.id} • ${formatMoney(refundTarget.consultationFee ?? 0)}`
            : ''
        }
        onClose={() => setRefundTarget(null)}
      >
        <FormField
          label="Dispute / Refund Reason"
          value={refundReason}
          onChangeText={setRefundReason}
          placeholder="e.g. Patient dispute resolved — doctor did not join call"
          multiline
        />
        <ActionButton
          label="Confirm Full Refund"
          variant="danger"
          icon="currency-exchange"
          loading={refunding}
          onPress={handleConfirmRefund}
        />
      </AdminModal>

      {/* Rename Specialization Modal */}
      <AdminModal
        visible={!!renameSpecTarget}
        title="Rename Specialization"
        subtitle={renameSpecTarget?.name ?? ''}
        onClose={() => setRenameSpecTarget(null)}
      >
        <FormField
          label="New Name"
          value={renameSpecValue}
          onChangeText={setRenameSpecValue}
          placeholder="Specialization name"
        />
        <ActionButton
          label="Save Name"
          icon="check"
          loading={renamingSpec}
          onPress={handleRenameSpecialization}
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
  utilityBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    gap: Spacing.sm,
  },
  utilityBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHigh,
  },
  utilityBtnDanger: {
    backgroundColor: `${Colors.error}10`,
    borderColor: `${Colors.error}30`,
  },
  utilityBtnText: {
    ...Typography.labelLarge,
    color: Colors.primary,
    fontSize: 13,
  },
  tabsWrap: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing['4xl'],
  },
  card: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHigh,
    marginBottom: Spacing.md,
    ...Shadows.subtle,
  },
  cardTitle: {
    ...Typography.titleMedium,
    color: Colors.onSurface,
    marginBottom: Spacing.xs,
  },
  helperText: {
    ...Typography.bodySmall,
    color: Colors.onSurfaceVariant,
    marginBottom: Spacing.md,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  rowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  itemTitle: {
    ...Typography.titleSmall,
    fontFamily: FontFamily.bold,
    color: Colors.onSurface,
  },
  itemSub: {
    ...Typography.bodySmall,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  itemMeta: {
    ...Typography.labelSmall,
    color: Colors.primary,
  },
  payoutAmount: {
    ...Typography.titleMedium,
    fontFamily: FontFamily.extraBold,
    color: Colors.primary,
    marginTop: 2,
  },
  reviewComment: {
    ...Typography.bodyMedium,
    color: Colors.onSurface,
    fontStyle: 'italic',
    marginTop: Spacing.sm,
  },
  logDetails: {
    ...Typography.bodySmall,
    color: Colors.onSurfaceVariant,
    backgroundColor: Colors.surfaceContainerLow,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.sm,
    fontSize: 11,
  },
});

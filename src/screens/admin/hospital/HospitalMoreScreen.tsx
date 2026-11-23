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
import { hospitalAdminService } from '../../../api';
import { useApi } from '../../../hooks/useApi';
import { StateView } from '../../../components/StateView';
import { formatMoney, formatDate, doctorName } from '../../../utils/format';
import { useAuthStore } from '../../../store/authStore';
import {
  AdminHeader,
  AdminSearchBar,
  FilterChips,
  FilterChipOption,
  SectionHeader,
  ActionButton,
  AdminModal,
  FormField,
  StatCard,
} from '../components';

type MoreSection = 'departments' | 'revenue' | 'patients' | 'profile';

const SECTION_TABS: FilterChipOption<MoreSection>[] = [
  { key: 'departments', label: 'Departments' },
  { key: 'revenue', label: 'Revenue' },
  { key: 'patients', label: 'Patients' },
  { key: 'profile', label: 'Hospital Profile' },
];

export const HospitalMoreScreen: React.FC<{ navigation: any; route?: any }> = ({
  navigation,
  route,
}) => {
  const initialSection: MoreSection = route?.params?.section ?? 'departments';
  const [section, setSection] = useState<MoreSection>(initialSection);

  useEffect(() => {
    if (route?.params?.section) {
      setSection(route.params.section);
    }
  }, [route?.params?.section]);

  // ---------- Departments ----------
  const {
    data: deptsRaw,
    loading: deptsLoading,
    error: deptsError,
    refresh: refreshDepts,
  } = useApi(() => hospitalAdminService.departments(), []);

  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptDesc, setNewDeptDesc] = useState('');
  const [creatingDept, setCreatingDept] = useState(false);
  const [renameTarget, setRenameTarget] = useState<any | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [renamingDept, setRenamingDept] = useState(false);

  const departments: any[] = useMemo(() => {
    if (Array.isArray(deptsRaw)) return deptsRaw;
    if (Array.isArray((deptsRaw as any)?.items)) return (deptsRaw as any).items;
    return [];
  }, [deptsRaw]);

  const handleCreateDepartment = async () => {
    if (!newDeptName.trim()) {
      Alert.alert('Department Name Required', 'Please enter a department name.');
      return;
    }
    setCreatingDept(true);
    try {
      await hospitalAdminService.createDepartment(
        newDeptName.trim(),
        newDeptDesc.trim() || undefined
      );
      setNewDeptName('');
      setNewDeptDesc('');
      await refreshDepts();
    } catch (e: any) {
      Alert.alert('Could Not Create Department', e?.message ?? 'Error creating department.');
    } finally {
      setCreatingDept(false);
    }
  };

  const handleRenameDepartment = async () => {
    if (!renameTarget || !renameValue.trim()) return;
    setRenamingDept(true);
    try {
      await hospitalAdminService.renameDepartment(renameTarget.id, renameValue.trim());
      setRenameTarget(null);
      setRenameValue('');
      await refreshDepts();
    } catch (e: any) {
      Alert.alert('Rename Failed', e?.message ?? 'Could not rename department.');
    } finally {
      setRenamingDept(false);
    }
  };

  const handleDeleteDepartment = (dept: any) => {
    Alert.alert(
      'Delete Department',
      `Are you sure you want to delete "${dept.name}"? (Note: departments with assigned doctors cannot be deleted until reassigned.)`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await hospitalAdminService.deleteDepartment(dept.id);
              await refreshDepts();
            } catch (e: any) {
              Alert.alert('Delete Failed', e?.message ?? 'Could not delete department.');
            }
          },
        },
      ]
    );
  };

  // ---------- Revenue ----------
  const {
    data: revenueData,
    loading: revLoading,
    error: revError,
    refresh: refreshRevenue,
  } = useApi(() => hospitalAdminService.revenue(), []);

  const revTotals = revenueData?.totals ?? revenueData ?? {};
  const doctorRevenues: any[] = useMemo(() => {
    if (Array.isArray(revenueData?.doctors)) return revenueData.doctors;
    if (Array.isArray(revenueData?.byDoctor)) return revenueData.byDoctor;
    if (Array.isArray(revenueData?.items)) return revenueData.items;
    return [];
  }, [revenueData]);

  // ---------- Patients ----------
  const [patientSearch, setPatientSearch] = useState('');
  const {
    data: patientsRaw,
    loading: patientsLoading,
    error: patientsError,
    refresh: refreshPatients,
  } = useApi(
    () => hospitalAdminService.patients(patientSearch.trim() || undefined),
    [patientSearch]
  );

  const patients: any[] = useMemo(() => {
    if (Array.isArray(patientsRaw)) return patientsRaw;
    if (Array.isArray((patientsRaw as any)?.items)) return (patientsRaw as any).items;
    if (Array.isArray((patientsRaw as any)?.patients)) return (patientsRaw as any).patients;
    return [];
  }, [patientsRaw]);

  // ---------- Hospital Profile ----------
  const {
    data: profileData,
    loading: profileLoading,
    error: profileError,
    refresh: refreshProfile,
  } = useApi(() => hospitalAdminService.profile(), []);

  const [profName, setProfName] = useState('');
  const [profAddress, setProfAddress] = useState('');
  const [profCity, setProfCity] = useState('');
  const [profPhone, setProfPhone] = useState('');
  const [profEmail, setProfEmail] = useState('');
  const [profDesc, setProfDesc] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (profileData) {
      const p = profileData?.hospital ?? profileData;
      setProfName(p?.name ?? '');
      setProfAddress(p?.address ?? '');
      setProfCity(p?.city ?? '');
      setProfPhone(p?.phone ?? '');
      setProfEmail(p?.email ?? '');
      setProfDesc(p?.description ?? '');
    }
  }, [profileData]);

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      await hospitalAdminService.updateProfile({
        name: profName.trim() || undefined,
        address: profAddress.trim() || undefined,
        city: profCity.trim() || undefined,
        phone: profPhone.trim() || undefined,
        email: profEmail.trim() || undefined,
        description: profDesc.trim() || undefined,
      });
      Alert.alert('Profile Saved', 'Hospital profile has been updated.');
      await refreshProfile();
    } catch (e: any) {
      Alert.alert('Update Failed', e?.message ?? 'Could not save hospital profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AdminHeader
        title="Hospital Management"
        subtitle="Departments, revenue, patients & settings"
        badgeText="HOSPITAL ADMIN"
        onNotificationsPress={() => navigation.navigate('Notifications')}
      />

      {/* Quick Utility Strip: Notifications + Sign Out */}
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
        {/* 1. DEPARTMENTS */}
        {section === 'departments' ? (
          <View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Create Department</Text>
              <FormField
                label="Department Name *"
                value={newDeptName}
                onChangeText={setNewDeptName}
                placeholder="e.g. Cardiology"
              />
              <FormField
                label="Description (optional)"
                value={newDeptDesc}
                onChangeText={setNewDeptDesc}
                placeholder="Heart and vascular care unit"
              />
              <ActionButton
                label="Add Department"
                icon="add-business"
                loading={creatingDept}
                onPress={handleCreateDepartment}
              />
            </View>

            <SectionHeader
              title={`Departments (${departments.length})`}
              subtitle="Rename or remove hospital departments"
            />
            <StateView
              loading={deptsLoading && departments.length === 0}
              error={deptsError}
              empty={departments.length === 0}
              emptyText="No departments created yet."
              onRetry={refreshDepts}
            >
              {departments.map((dept) => {
                const docCount = Array.isArray(dept?.doctors)
                  ? dept.doctors.length
                  : dept?.doctorCount ?? dept?._count?.doctors ?? 0;
                return (
                  <View key={dept.id} style={styles.card}>
                    <View style={styles.rowBetween}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.itemTitle}>{dept.name}</Text>
                        {dept.description ? (
                          <Text style={styles.itemSub}>{dept.description}</Text>
                        ) : null}
                        <Text style={styles.itemMeta}>
                          {docCount} doctor{docCount === 1 ? '' : 's'} assigned
                        </Text>
                      </View>
                      <View style={styles.rowActions}>
                        <ActionButton
                          small
                          variant="secondary"
                          icon="edit"
                          label="Rename"
                          onPress={() => {
                            setRenameTarget(dept);
                            setRenameValue(dept.name ?? '');
                          }}
                        />
                        <ActionButton
                          small
                          variant="danger"
                          icon="delete-outline"
                          label="Delete"
                          onPress={() => handleDeleteDepartment(dept)}
                        />
                      </View>
                    </View>
                  </View>
                );
              })}
            </StateView>
          </View>
        ) : null}

        {/* 2. REVENUE */}
        {section === 'revenue' ? (
          <StateView
            loading={revLoading && !revenueData}
            error={revError}
            onRetry={refreshRevenue}
          >
            <View style={styles.statsGrid}>
              <StatCard
                style={styles.gridHalf}
                label="Gross Revenue"
                value={formatMoney(revTotals?.gross ?? revTotals?.totalGross ?? 0)}
                icon="account-balance-wallet"
                accentColor={Colors.primary}
              />
              <StatCard
                style={styles.gridHalf}
                label="Platform Commission"
                value={formatMoney(revTotals?.commission ?? revTotals?.totalCommission ?? 0)}
                icon="percent"
                accentColor="#b45309"
              />
              <StatCard
                style={styles.gridHalf}
                label="Net Hospital Earnings"
                value={formatMoney(revTotals?.net ?? revTotals?.totalNet ?? 0)}
                icon="payments"
                accentColor="#15803d"
              />
              <StatCard
                style={styles.gridHalf}
                label="Paid Consultations"
                value={revTotals?.count ?? revTotals?.appointments ?? doctorRevenues.length}
                icon="receipt-long"
                accentColor={Colors.secondary}
              />
            </View>

            <SectionHeader
              title="Revenue by Doctor"
              subtitle="Gross, commission & net earnings per specialist"
            />
            {doctorRevenues.length === 0 ? (
              <View style={styles.card}>
                <Text style={styles.itemSub}>No revenue records per doctor yet.</Text>
              </View>
            ) : (
              doctorRevenues.map((item, idx) => (
                <View key={item?.doctorId ?? item?.id ?? idx} style={styles.card}>
                  <Text style={styles.itemTitle}>
                    {doctorName(item?.doctorName ?? item?.name ?? item?.doctor?.name ?? 'Doctor')}
                  </Text>
                  <Text style={styles.itemMeta}>
                    {item?.count ?? item?.appointments ?? 0} paid consultations
                  </Text>
                  <View style={styles.revRow}>
                    <View style={styles.revCol}>
                      <Text style={styles.revLbl}>Gross</Text>
                      <Text style={styles.revVal}>{formatMoney(item?.gross ?? 0)}</Text>
                    </View>
                    <View style={styles.revCol}>
                      <Text style={styles.revLbl}>Commission</Text>
                      <Text style={styles.revVal}>{formatMoney(item?.commission ?? 0)}</Text>
                    </View>
                    <View style={styles.revCol}>
                      <Text style={styles.revLbl}>Net</Text>
                      <Text style={[styles.revVal, { color: Colors.primary }]}>
                        {formatMoney(item?.net ?? 0)}
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </StateView>
        ) : null}

        {/* 3. PATIENTS */}
        {section === 'patients' ? (
          <View>
            <AdminSearchBar
              value={patientSearch}
              onChangeText={setPatientSearch}
              placeholder="Search hospital patients by name or email..."
            />
            <View style={{ height: Spacing.md }} />
            <StateView
              loading={patientsLoading && patients.length === 0}
              error={patientsError}
              empty={patients.length === 0}
              emptyText="No patients found for this hospital."
              onRetry={refreshPatients}
            >
              {patients.map((item, idx) => {
                const p = item?.patient ?? item;
                return (
                  <View key={p?.id ?? idx} style={styles.card}>
                    <View style={styles.rowBetween}>
                      <View style={styles.patientAvatar}>
                        <MaterialIcons name="person-outline" size={20} color={Colors.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.itemTitle}>{p?.name ?? 'Patient'}</Text>
                        {p?.email ? <Text style={styles.itemSub}>{p.email}</Text> : null}
                        {p?.phone ? <Text style={styles.itemSub}>{p.phone}</Text> : null}
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        {item?.visits !== undefined ? (
                          <Text style={styles.visitBadge}>{item.visits} visits</Text>
                        ) : null}
                        {item?.lastVisit ? (
                          <Text style={styles.itemMeta}>{formatDate(item.lastVisit)}</Text>
                        ) : null}
                      </View>
                    </View>
                  </View>
                );
              })}
            </StateView>
          </View>
        ) : null}

        {/* 4. HOSPITAL PROFILE */}
        {section === 'profile' ? (
          <StateView
            loading={profileLoading && !profileData}
            error={profileError}
            onRetry={refreshProfile}
          >
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Edit Hospital Profile</Text>
              <FormField
                label="Hospital Name"
                value={profName}
                onChangeText={setProfName}
                placeholder="AskCare Medical Center"
              />
              <FormField
                label="Street Address"
                value={profAddress}
                onChangeText={setProfAddress}
                placeholder="Main Boulevard, Gulberg"
              />
              <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
                <View style={{ flex: 1 }}>
                  <FormField
                    label="City"
                    value={profCity}
                    onChangeText={setProfCity}
                    placeholder="Lahore"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <FormField
                    label="Phone"
                    value={profPhone}
                    onChangeText={setProfPhone}
                    placeholder="+9242111222333"
                    keyboardType="phone-pad"
                  />
                </View>
              </View>
              <FormField
                label="Contact Email"
                value={profEmail}
                onChangeText={setProfEmail}
                placeholder="info@hospital.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <FormField
                label="Description"
                value={profDesc}
                onChangeText={setProfDesc}
                placeholder="Brief overview of hospital specialties and facilities"
                multiline
              />
              <ActionButton
                label="Save Changes"
                icon="save"
                loading={savingProfile}
                onPress={handleSaveProfile}
              />
            </View>
          </StateView>
        ) : null}
      </ScrollView>

      {/* Rename Department Modal */}
      <AdminModal
        visible={!!renameTarget}
        title="Rename Department"
        subtitle={renameTarget?.name ?? ''}
        onClose={() => setRenameTarget(null)}
      >
        <FormField
          label="New Department Name"
          value={renameValue}
          onChangeText={setRenameValue}
          placeholder="Department name"
        />
        <ActionButton
          label="Save Name"
          icon="check"
          loading={renamingDept}
          onPress={handleRenameDepartment}
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
    marginBottom: Spacing.md,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  rowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
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
    ...Typography.bodySmall,
    color: Colors.primary,
    fontSize: 11,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  gridHalf: {
    width: '48.5%',
  },
  revRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceContainerHigh,
  },
  revCol: {
    flex: 1,
  },
  revLbl: {
    ...Typography.bodySmall,
    color: Colors.onSurfaceVariant,
    fontSize: 11,
  },
  revVal: {
    ...Typography.titleSmall,
    fontFamily: FontFamily.bold,
    color: Colors.onSurface,
    marginTop: 2,
  },
  patientAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${Colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  visitBadge: {
    ...Typography.labelSmall,
    color: Colors.primary,
  },
});

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows, FontFamily } from '../../../theme';
import { hospitalAdminService, publicService } from '../../../api';
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

type DoctorStatusFilter = 'ALL' | 'PENDING' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

const STATUS_FILTERS: FilterChipOption<DoctorStatusFilter>[] = [
  { key: 'ALL', label: 'All' },
  { key: 'PENDING', label: 'Pending Approval' },
  { key: 'ACTIVE', label: 'Active' },
  { key: 'INACTIVE', label: 'Inactive' },
  { key: 'SUSPENDED', label: 'Suspended' },
];

export const HospitalDoctorsScreen: React.FC<{ navigation: any; route?: any }> = ({ navigation }) => {
  const [statusFilter, setStatusFilter] = useState<DoctorStatusFilter>('ALL');
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState<number | null>(null);

  // Create Doctor Modal state
  const [createVisible, setCreateVisible] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formLicense, setFormLicense] = useState('');
  const [formQualification, setFormQualification] = useState('');
  const [formExperience, setFormExperience] = useState('');
  const [formFee, setFormFee] = useState('2500');
  const [selectedSpecIds, setSelectedSpecIds] = useState<number[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState<number | null>(null);

  // Set Fee Modal state
  const [feeDoctor, setFeeDoctor] = useState<any | null>(null);
  const [newFee, setNewFee] = useState('');
  const [savingFee, setSavingFee] = useState(false);

  // Reject Modal state
  const [rejectDoctorTarget, setRejectDoctorTarget] = useState<any | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejecting, setRejecting] = useState(false);

  // Assign Department Modal state
  const [deptDoctor, setDeptDoctor] = useState<any | null>(null);
  const [assigningDept, setAssigningDept] = useState(false);

  const queryParams = useMemo(() => {
    const q: Record<string, string | undefined> = {};
    if (statusFilter !== 'ALL') q.status = statusFilter;
    if (search.trim()) q.search = search.trim();
    return q;
  }, [statusFilter, search]);

  const {
    data: rawDoctors,
    loading,
    error,
    refresh,
  } = useApi(() => hospitalAdminService.doctors(queryParams), [statusFilter, search]);

  const { data: departmentsData } = useApi(() => hospitalAdminService.departments(), []);
  const { data: specializationsData } = useApi(() => publicService.specializations(), []);

  const doctors: any[] = useMemo(() => {
    if (Array.isArray(rawDoctors)) return rawDoctors;
    if (Array.isArray((rawDoctors as any)?.items)) return (rawDoctors as any).items;
    if (Array.isArray((rawDoctors as any)?.doctors)) return (rawDoctors as any).doctors;
    return [];
  }, [rawDoctors]);

  const departments: any[] = useMemo(() => {
    if (Array.isArray(departmentsData)) return departmentsData;
    if (Array.isArray((departmentsData as any)?.items)) return (departmentsData as any).items;
    return [];
  }, [departmentsData]);

  const specializations: any[] = useMemo(() => {
    if (Array.isArray(specializationsData)) return specializationsData;
    return [];
  }, [specializationsData]);

  const handleApprove = async (doc: any) => {
    setBusyId(doc.id);
    try {
      await hospitalAdminService.approveDoctor(doc.id);
      Alert.alert('Approved', `${doctorName(doc.name)} is now active and bookable.`);
      await refresh();
    } catch (e: any) {
      Alert.alert('Approval Failed', e?.message ?? 'Could not approve doctor.');
    } finally {
      setBusyId(null);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectDoctorTarget) return;
    setRejecting(true);
    try {
      await hospitalAdminService.rejectDoctor(
        rejectDoctorTarget.id,
        rejectReason.trim() || undefined
      );
      setRejectDoctorTarget(null);
      setRejectReason('');
      Alert.alert('Rejected', 'The doctor registration has been rejected.');
      await refresh();
    } catch (e: any) {
      Alert.alert('Reject Failed', e?.message ?? 'Could not reject doctor.');
    } finally {
      setRejecting(false);
    }
  };

  const handleToggleStatus = async (doc: any, nextStatus: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED') => {
    setBusyId(doc.id);
    try {
      await hospitalAdminService.setDoctorStatus(doc.id, nextStatus);
      await refresh();
    } catch (e: any) {
      Alert.alert('Status Update Failed', e?.message ?? 'Could not update doctor status.');
    } finally {
      setBusyId(null);
    }
  };

  const handleSaveFee = async () => {
    if (!feeDoctor) return;
    const parsed = Number(newFee);
    if (isNaN(parsed) || parsed < 0) {
      Alert.alert('Invalid Fee', 'Please enter a valid consultation fee in PKR.');
      return;
    }
    setSavingFee(true);
    try {
      await hospitalAdminService.setDoctorFee(feeDoctor.id, parsed);
      setFeeDoctor(null);
      await refresh();
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Could not update consultation fee.');
    } finally {
      setSavingFee(false);
    }
  };

  const handleAssignDepartment = async (departmentId: number | null) => {
    if (!deptDoctor) return;
    setAssigningDept(true);
    try {
      await hospitalAdminService.assignDepartment(deptDoctor.id, departmentId);
      setDeptDoctor(null);
      await refresh();
    } catch (e: any) {
      Alert.alert('Assignment Failed', e?.message ?? 'Could not assign department.');
    } finally {
      setAssigningDept(false);
    }
  };

  const handleCreateDoctor = async () => {
    if (!formName.trim() || !formEmail.trim()) {
      Alert.alert('Missing Fields', 'Doctor name and email are required.');
      return;
    }
    setCreating(true);
    try {
      const payload: Record<string, unknown> = {
        name: formName.trim(),
        email: formEmail.trim().toLowerCase(),
      };
      if (formPhone.trim()) payload.phone = formPhone.trim();
      if (formLicense.trim()) payload.licenseNumber = formLicense.trim();
      if (formQualification.trim()) payload.qualification = formQualification.trim();
      if (formExperience.trim() && !isNaN(Number(formExperience))) {
        payload.experience = Number(formExperience);
      }
      if (formFee.trim() && !isNaN(Number(formFee))) {
        payload.consultationFee = Number(formFee);
      }
      if (selectedSpecIds.length > 0) {
        payload.specializationIds = selectedSpecIds;
      }
      if (selectedDeptId !== null) {
        payload.departmentId = selectedDeptId;
      }

      await hospitalAdminService.createDoctor(payload);
      setCreateVisible(false);
      setFormName('');
      setFormEmail('');
      setFormPhone('');
      setFormLicense('');
      setFormQualification('');
      setFormExperience('');
      setFormFee('2500');
      setSelectedSpecIds([]);
      setSelectedDeptId(null);
      Alert.alert(
        'Doctor Created',
        'Account created and temporary login password has been emailed to the doctor.'
      );
      await refresh();
    } catch (e: any) {
      Alert.alert('Could Not Create Doctor', e?.message ?? 'Please check the form inputs.');
    } finally {
      setCreating(false);
    }
  };

  const toggleSpecId = (id: number) => {
    setSelectedSpecIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AdminHeader
        title="Hospital Doctors"
        subtitle={`${doctors.length} specialist${doctors.length === 1 ? '' : 's'} shown`}
        badgeText="HOSPITAL ADMIN"
        onNotificationsPress={() => navigation.navigate('Notifications')}
        rightAction={{
          icon: 'person-add',
          label: 'New Doctor',
          onPress: () => setCreateVisible(true),
        }}
      />

      <View style={styles.topControls}>
        <AdminSearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search doctor by name or email..."
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
          emptyText="No doctors match the current filter."
          onRetry={refresh}
        >
          {doctors.map((doc) => {
            const isBusy = busyId === doc.id;
            const status = String(doc?.status ?? 'INACTIVE').toUpperCase();
            const isPending = status === 'INACTIVE' && !doc?.approvedAt && statusFilter === 'PENDING' || status === 'PENDING' || status === 'INACTIVE';
            const deptName = doc?.department?.name ?? (typeof doc?.department === 'string' ? doc.department : null);

            return (
              <View key={doc.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.avatar}>
                    <MaterialIcons name="person" size={22} color={Colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.docName}>{doctorName(doc.name)}</Text>
                    <Text style={styles.docSub}>
                      {specializationOf(doc)}
                      {doc.qualification ? ` • ${doc.qualification}` : ''}
                    </Text>
                    {doc.email ? <Text style={styles.docEmail}>{doc.email}</Text> : null}
                  </View>
                  <StatusBadge status={status} />
                </View>

                <View style={styles.metaStrip}>
                  <View style={styles.metaChip}>
                    <MaterialIcons name="payments" size={14} color={Colors.primary} />
                    <Text style={styles.metaChipText}>
                      Fee: {formatMoney(doc.consultationFee ?? 0)}
                    </Text>
                  </View>
                  <View style={styles.metaChip}>
                    <MaterialIcons name="domain" size={14} color={Colors.secondary} />
                    <Text style={styles.metaChipText}>
                      {deptName ? deptName : 'No Department'}
                    </Text>
                  </View>
                  {doc.licenseNumber ? (
                    <View style={styles.metaChip}>
                      <MaterialIcons name="badge" size={14} color={Colors.onSurfaceVariant} />
                      <Text style={styles.metaChipText}>Lic: {doc.licenseNumber}</Text>
                    </View>
                  ) : null}
                </View>

                {/* Actions Row */}
                <View style={styles.actionsWrap}>
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
                          setRejectDoctorTarget(doc);
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
                      onPress={() => handleToggleStatus(doc, 'SUSPENDED')}
                    />
                  ) : null}

                  {status === 'SUSPENDED' ? (
                    <ActionButton
                      small
                      variant="primary"
                      icon="check-circle"
                      label="Activate"
                      loading={isBusy}
                      onPress={() => handleToggleStatus(doc, 'ACTIVE')}
                    />
                  ) : null}

                  <ActionButton
                    small
                    variant="secondary"
                    icon="edit"
                    label="Set Fee"
                    onPress={() => {
                      setFeeDoctor(doc);
                      setNewFee(String(doc.consultationFee ?? '2500'));
                    }}
                  />

                  <ActionButton
                    small
                    variant="outline"
                    icon="domain"
                    label="Department"
                    onPress={() => setDeptDoctor(doc)}
                  />
                </View>
              </View>
            );
          })}
        </StateView>
      </ScrollView>

      {/* Set Fee Modal */}
      <AdminModal
        visible={!!feeDoctor}
        title="Set Consultation Fee"
        subtitle={feeDoctor ? doctorName(feeDoctor.name) : ''}
        onClose={() => setFeeDoctor(null)}
      >
        <FormField
          label="Consultation Fee (PKR)"
          value={newFee}
          onChangeText={setNewFee}
          keyboardType="numeric"
          placeholder="e.g. 2500"
        />
        <ActionButton
          label="Update Fee"
          icon="save"
          loading={savingFee}
          onPress={handleSaveFee}
        />
      </AdminModal>

      {/* Reject Doctor Modal */}
      <AdminModal
        visible={!!rejectDoctorTarget}
        title="Reject Doctor Registration"
        subtitle={rejectDoctorTarget ? doctorName(rejectDoctorTarget.name) : ''}
        onClose={() => setRejectDoctorTarget(null)}
      >
        <FormField
          label="Reason for rejection (optional)"
          value={rejectReason}
          onChangeText={setRejectReason}
          placeholder="e.g. License number could not be verified"
          multiline
        />
        <ActionButton
          label="Confirm Reject"
          variant="danger"
          icon="cancel"
          loading={rejecting}
          onPress={handleConfirmReject}
        />
      </AdminModal>

      {/* Assign Department Modal */}
      <AdminModal
        visible={!!deptDoctor}
        title="Assign Department"
        subtitle={deptDoctor ? doctorName(deptDoctor.name) : ''}
        onClose={() => setDeptDoctor(null)}
      >
        {departments.length === 0 ? (
          <Text style={styles.helperText}>
            No departments created yet. Create departments in the More tab first.
          </Text>
        ) : (
          <View style={{ gap: Spacing.sm, marginBottom: Spacing.md }}>
            {departments.map((dept) => {
              const active = deptDoctor?.department?.id === dept.id || deptDoctor?.departmentId === dept.id;
              return (
                <TouchableOpacity
                  key={dept.id}
                  style={[styles.deptOption, active && styles.deptOptionActive]}
                  disabled={assigningDept}
                  onPress={() => handleAssignDepartment(dept.id)}
                >
                  <MaterialIcons
                    name={active ? 'radio-button-checked' : 'radio-button-unchecked'}
                    size={20}
                    color={active ? Colors.primary : Colors.onSurfaceVariant}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.deptOptionTitle}>{dept.name}</Text>
                    {dept.description ? (
                      <Text style={styles.deptOptionSub}>{dept.description}</Text>
                    ) : null}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
        <ActionButton
          label="Remove from Department"
          variant="outline"
          icon="clear"
          loading={assigningDept}
          onPress={() => handleAssignDepartment(null)}
        />
      </AdminModal>

      {/* Create Doctor Modal */}
      <AdminModal
        visible={createVisible}
        title="Create Hospital Doctor"
        subtitle="Creates an active doctor account & emails temporary password"
        onClose={() => setCreateVisible(false)}
      >
        <FormField
          label="Full Name *"
          value={formName}
          onChangeText={setFormName}
          placeholder="Dr. Sara Khan"
          autoCapitalize="words"
        />
        <FormField
          label="Email Address *"
          value={formEmail}
          onChangeText={setFormEmail}
          placeholder="sara.khan@hospital.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <FormField
          label="Phone Number"
          value={formPhone}
          onChangeText={setFormPhone}
          placeholder="+923001234567"
          keyboardType="phone-pad"
        />
        <View style={styles.rowFields}>
          <View style={{ flex: 1 }}>
            <FormField
              label="PMC License #"
              value={formLicense}
              onChangeText={setFormLicense}
              placeholder="PMC-12345"
              autoCapitalize="characters"
            />
          </View>
          <View style={{ flex: 1 }}>
            <FormField
              label="Experience (Years)"
              value={formExperience}
              onChangeText={setFormExperience}
              placeholder="8"
              keyboardType="numeric"
            />
          </View>
        </View>
        <View style={styles.rowFields}>
          <View style={{ flex: 1 }}>
            <FormField
              label="Qualification"
              value={formQualification}
              onChangeText={setFormQualification}
              placeholder="MBBS, FCPS"
            />
          </View>
          <View style={{ flex: 1 }}>
            <FormField
              label="Fee (PKR)"
              value={formFee}
              onChangeText={setFormFee}
              placeholder="2500"
              keyboardType="numeric"
            />
          </View>
        </View>

        {specializations.length > 0 ? (
          <View style={{ marginBottom: Spacing.md }}>
            <Text style={styles.pickerLabel}>Specializations</Text>
            <View style={styles.pillCloud}>
              {specializations.map((sp) => {
                const selected = selectedSpecIds.includes(sp.id);
                return (
                  <TouchableOpacity
                    key={sp.id}
                    style={[styles.selectPill, selected && styles.selectPillActive]}
                    onPress={() => toggleSpecId(sp.id)}
                  >
                    <Text style={[styles.selectPillText, selected && styles.selectPillTextActive]}>
                      {sp.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ) : null}

        {departments.length > 0 ? (
          <View style={{ marginBottom: Spacing.md }}>
            <Text style={styles.pickerLabel}>Department (optional)</Text>
            <View style={styles.pillCloud}>
              {departments.map((d) => {
                const selected = selectedDeptId === d.id;
                return (
                  <TouchableOpacity
                    key={d.id}
                    style={[styles.selectPill, selected && styles.selectPillActive]}
                    onPress={() => setSelectedDeptId(selected ? null : d.id)}
                  >
                    <Text style={[styles.selectPillText, selected && styles.selectPillTextActive]}>
                      {d.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ) : null}

        <ActionButton
          label="Create Doctor Account"
          icon="person-add"
          loading={creating}
          onPress={handleCreateDoctor}
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
    backgroundColor: Colors.background,
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${Colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docName: {
    ...Typography.titleSmall,
    fontFamily: FontFamily.bold,
    color: Colors.onSurface,
  },
  docSub: {
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
  metaStrip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceContainerHigh,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surfaceContainerLow,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  metaChipText: {
    ...Typography.bodySmall,
    color: Colors.onSurface,
    fontSize: 11,
  },
  actionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  helperText: {
    ...Typography.bodyMedium,
    color: Colors.onSurfaceVariant,
    marginBottom: Spacing.md,
  },
  deptOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHigh,
    backgroundColor: Colors.surfaceContainerLow,
  },
  deptOptionActive: {
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}10`,
  },
  deptOptionTitle: {
    ...Typography.titleSmall,
    color: Colors.onSurface,
  },
  deptOptionSub: {
    ...Typography.bodySmall,
    color: Colors.onSurfaceVariant,
  },
  rowFields: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  pickerLabel: {
    ...Typography.bodySmall,
    fontFamily: FontFamily.semiBold,
    color: Colors.onSurfaceVariant,
    marginBottom: 6,
  },
  pillCloud: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  selectPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHigh,
  },
  selectPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  selectPillText: {
    ...Typography.bodySmall,
    color: Colors.onSurfaceVariant,
  },
  selectPillTextActive: {
    color: Colors.onPrimary,
    fontFamily: FontFamily.bold,
  },
});

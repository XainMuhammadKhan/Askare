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
import { formatMoney } from '../../../utils/format';
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

type HospitalStatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

const STATUS_FILTERS: FilterChipOption<HospitalStatusFilter>[] = [
  { key: 'ALL', label: 'All' },
  { key: 'ACTIVE', label: 'Active' },
  { key: 'INACTIVE', label: 'Inactive' },
  { key: 'SUSPENDED', label: 'Suspended' },
];

export const SuperHospitalsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [statusFilter, setStatusFilter] = useState<HospitalStatusFilter>('ALL');
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState<number | null>(null);

  // Create Hospital + Admin Modal
  const [createVisible, setCreateVisible] = useState(false);
  const [creating, setCreating] = useState(false);
  const [hospName, setHospName] = useState('');
  const [hospAddress, setHospAddress] = useState('');
  const [hospCity, setHospCity] = useState('Lahore');
  const [hospPhone, setHospPhone] = useState('');
  const [hospLat, setHospLat] = useState('31.5204');
  const [hospLng, setHospLng] = useState('74.3587');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPhone, setAdminPhone] = useState('');

  const queryParams = useMemo(() => {
    const q: Record<string, string | undefined> = {};
    if (statusFilter !== 'ALL') q.status = statusFilter;
    if (search.trim()) q.search = search.trim();
    return q;
  }, [statusFilter, search]);

  const {
    data: hospPage,
    loading,
    error,
    refresh,
  } = useApi(() => superAdminService.hospitals(queryParams), [statusFilter, search]);

  const hospitals: any[] = useMemo(() => {
    if (Array.isArray(hospPage?.items)) return hospPage.items;
    if (Array.isArray(hospPage)) return hospPage as any[];
    if (Array.isArray((hospPage as any)?.hospitals)) return (hospPage as any).hospitals;
    return [];
  }, [hospPage]);

  const handleToggleStatus = async (h: any, nextStatus: 'ACTIVE' | 'SUSPENDED') => {
    setBusyId(h.id);
    try {
      await superAdminService.setHospitalStatus(h.id, nextStatus);
      await refresh();
    } catch (e: any) {
      Alert.alert('Status Change Failed', e?.message ?? 'Could not change hospital status.');
    } finally {
      setBusyId(null);
    }
  };

  const handleResetAdminPassword = (h: any) => {
    Alert.alert(
      'Reset Hospital Admin Password',
      `Send a new temporary password to the admin of "${h.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Reset Email',
          onPress: async () => {
            setBusyId(h.id);
            try {
              await superAdminService.resetHospitalAdminPassword(h.id);
              Alert.alert(
                'Password Reset Sent',
                'A new temporary password has been emailed to the hospital administrator.'
              );
            } catch (e: any) {
              Alert.alert('Reset Failed', e?.message ?? 'Could not reset admin password.');
            } finally {
              setBusyId(null);
            }
          },
        },
      ]
    );
  };

  const handleCreateHospitalAndAdmin = async () => {
    if (!hospName.trim() || !hospAddress.trim() || !adminName.trim() || !adminEmail.trim()) {
      Alert.alert(
        'Missing Required Fields',
        'Please enter hospital name, address, admin name, and admin email.'
      );
      return;
    }
    const lat = Number(hospLat);
    const lng = Number(hospLng);
    if (isNaN(lat) || isNaN(lng)) {
      Alert.alert('Invalid Coordinates', 'Please provide numeric latitude and longitude.');
      return;
    }

    setCreating(true);
    try {
      const hospitalPayload: Record<string, unknown> = {
        name: hospName.trim(),
        address: hospAddress.trim(),
        city: hospCity.trim() || undefined,
        phone: hospPhone.trim() || undefined,
        latitude: lat,
        longitude: lng,
      };
      const adminPayload: Record<string, unknown> = {
        name: adminName.trim(),
        email: adminEmail.trim().toLowerCase(),
        phone: adminPhone.trim() || undefined,
      };
      await superAdminService.createHospital(hospitalPayload, adminPayload);
      setCreateVisible(false);
      setHospName('');
      setHospAddress('');
      setHospPhone('');
      setAdminName('');
      setAdminEmail('');
      setAdminPhone('');
      Alert.alert(
        'Hospital & Admin Created',
        'Hospital created and login credentials have been emailed to the hospital admin.'
      );
      await refresh();
    } catch (e: any) {
      Alert.alert('Creation Failed', e?.message ?? 'Could not create hospital and admin.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AdminHeader
        title="Partner Hospitals"
        subtitle={`${hospitals.length} hospital${hospitals.length === 1 ? '' : 's'} registered`}
        badgeText="SUPER ADMIN"
        onNotificationsPress={() => navigation.navigate('Notifications')}
        rightAction={{
          icon: 'add-business',
          label: 'New Hospital',
          onPress: () => setCreateVisible(true),
        }}
      />

      <View style={styles.topControls}>
        <AdminSearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search hospitals by name or city..."
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
          <RefreshControl refreshing={loading && hospitals.length > 0} onRefresh={refresh} tintColor={Colors.primary} />
        }
      >
        <StateView
          loading={loading && hospitals.length === 0}
          error={error}
          empty={hospitals.length === 0}
          emptyText="No hospitals found."
          onRetry={refresh}
        >
          {hospitals.map((h) => {
            const status = String(h?.status ?? 'ACTIVE').toUpperCase();
            const isBusy = busyId === h.id;
            const docCount = h?.doctorCount ?? h?.doctorsCount ?? h?._count?.doctors ?? 0;
            const apptCount = h?.appointmentCount ?? h?.appointmentsCount ?? h?._count?.appointments ?? 0;

            return (
              <View key={h.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={styles.iconWrap}>
                    <MaterialIcons name="local-hospital" size={22} color={Colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.hospName}>{h.name}</Text>
                    <Text style={styles.hospAddr}>
                      {[h.address, h.city].filter(Boolean).join(', ') || 'No address listed'}
                    </Text>
                    {h.phone ? <Text style={styles.hospMeta}>{h.phone}</Text> : null}
                  </View>
                  <StatusBadge status={status} />
                </View>

                <View style={styles.metricsStrip}>
                  <View style={styles.metricChip}>
                    <MaterialIcons name="medical-services" size={14} color={Colors.primary} />
                    <Text style={styles.metricText}>{docCount} Doctors</Text>
                  </View>
                  <View style={styles.metricChip}>
                    <MaterialIcons name="event" size={14} color={Colors.secondary} />
                    <Text style={styles.metricText}>{apptCount} Visits</Text>
                  </View>
                  {h.revenue !== undefined ? (
                    <View style={styles.metricChip}>
                      <MaterialIcons name="payments" size={14} color="#15803d" />
                      <Text style={styles.metricText}>{formatMoney(h.revenue)}</Text>
                    </View>
                  ) : null}
                </View>

                <View style={styles.actionsRow}>
                  {status === 'ACTIVE' ? (
                    <ActionButton
                      small
                      variant="danger"
                      icon="block"
                      label="Suspend Hospital"
                      loading={isBusy}
                      onPress={() => handleToggleStatus(h, 'SUSPENDED')}
                    />
                  ) : (
                    <ActionButton
                      small
                      variant="primary"
                      icon="check-circle"
                      label="Activate Hospital"
                      loading={isBusy}
                      onPress={() => handleToggleStatus(h, 'ACTIVE')}
                    />
                  )}
                  <ActionButton
                    small
                    variant="secondary"
                    icon="lock-reset"
                    label="Reset Admin Password"
                    disabled={isBusy}
                    onPress={() => handleResetAdminPassword(h)}
                  />
                </View>
              </View>
            );
          })}
        </StateView>
      </ScrollView>

      {/* Create Hospital + Admin Modal */}
      <AdminModal
        visible={createVisible}
        title="Create Hospital & Admin"
        subtitle="Provisions a new hospital and emails its administrator login"
        onClose={() => setCreateVisible(false)}
      >
        <Text style={styles.groupHeading}>HOSPITAL DETAILS</Text>
        <FormField
          label="Hospital Name *"
          value={hospName}
          onChangeText={setHospName}
          placeholder="Shaukat Khanum / AskCare Medical"
        />
        <FormField
          label="Street Address *"
          value={hospAddress}
          onChangeText={setHospAddress}
          placeholder="7-A Block R-3, Johar Town"
        />
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <FormField
              label="City"
              value={hospCity}
              onChangeText={setHospCity}
              placeholder="Lahore"
            />
          </View>
          <View style={{ flex: 1 }}>
            <FormField
              label="Hospital Phone"
              value={hospPhone}
              onChangeText={setHospPhone}
              placeholder="+924235905000"
              keyboardType="phone-pad"
            />
          </View>
        </View>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <FormField
              label="Latitude *"
              value={hospLat}
              onChangeText={setHospLat}
              placeholder="31.5204"
              keyboardType="numeric"
            />
          </View>
          <View style={{ flex: 1 }}>
            <FormField
              label="Longitude *"
              value={hospLng}
              onChangeText={setHospLng}
              placeholder="74.3587"
              keyboardType="numeric"
            />
          </View>
        </View>

        <Text style={[styles.groupHeading, { marginTop: Spacing.sm }]}>
          HOSPITAL ADMINISTRATOR
        </Text>
        <FormField
          label="Admin Full Name *"
          value={adminName}
          onChangeText={setAdminName}
          placeholder="Zain Ul Abideen"
        />
        <FormField
          label="Admin Email *"
          value={adminEmail}
          onChangeText={setAdminEmail}
          placeholder="admin@hospital.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <FormField
          label="Admin Phone"
          value={adminPhone}
          onChangeText={setAdminPhone}
          placeholder="+923001112233"
          keyboardType="phone-pad"
        />

        <ActionButton
          label="Create Hospital & Admin"
          icon="check"
          loading={creating}
          onPress={handleCreateHospitalAndAdmin}
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
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: `${Colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hospName: {
    ...Typography.titleSmall,
    fontFamily: FontFamily.bold,
    color: Colors.onSurface,
  },
  hospAddr: {
    ...Typography.bodySmall,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  hospMeta: {
    ...Typography.bodySmall,
    color: Colors.outline,
    fontSize: 11,
    marginTop: 2,
  },
  metricsStrip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceContainerHigh,
  },
  metricChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.surfaceContainerLow,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  metricText: {
    ...Typography.bodySmall,
    color: Colors.onSurface,
    fontSize: 11,
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  groupHeading: {
    ...Typography.labelSmall,
    color: Colors.primary,
    marginBottom: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
});

import React from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../../theme';
import { Header, StateView } from '../../components';
import { patientService, PatientDocument } from '../../api';
import { useApi } from '../../hooks/useApi';
import { ArchiveProfileCard } from './components/ArchiveProfileCard';
import { ArchiveConsultationsSection } from './components/ArchiveConsultationsSection';
import { ArchivePrescriptionsSection } from './components/ArchivePrescriptionsSection';
import { ArchiveDocumentsSection } from './components/ArchiveDocumentsSection';
import { ArchiveTimelineSection } from './components/ArchiveTimelineSection';

type Props = { navigation: NativeStackNavigationProp<any> };

export const ClinicalArchiveScreen: React.FC<Props> = ({ navigation }) => {
  const { data, loading, error, refresh, setData } = useApi(
    () => patientService.medicalRecords(),
    []
  );

  const handleDocumentUpdated = (updatedDoc: PatientDocument) => {
    setData((prev) =>
      prev
        ? {
            ...prev,
            documents: (prev.documents ?? []).map((d) =>
              d.id === updatedDoc.id ? updatedDoc : d
            ),
          }
        : prev
    );
  };

  const handleDocumentDeleted = (docId: number) => {
    setData((prev) =>
      prev
        ? {
            ...prev,
            documents: (prev.documents ?? []).filter((d) => d.id !== docId),
          }
        : prev
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title="Medical Records"
        showBack
        onBack={() => navigation.goBack()}
        onNotification={() => navigation.navigate('Notifications')}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
            tintColor={Colors.primary}
          />
        }
      >
        <StateView loading={loading && !data} error={error} onRetry={refresh}>
          <ArchiveProfileCard
            profile={data?.profile ?? null}
            patientInfo={(data as any)?.patient ?? null}
            onEdit={() => navigation.navigate('PatientInfo')}
          />

          <ArchiveDocumentsSection
            documents={data?.documents ?? []}
            onManageDocuments={() => navigation.navigate('MyDocuments')}
            onDocumentUpdated={handleDocumentUpdated}
            onDocumentDeleted={handleDocumentDeleted}
          />

          <ArchiveConsultationsSection
            consultations={data?.consultations ?? []}
            onViewAppointment={(appointmentId) =>
              navigation.navigate('ConsultationSummary', { appointmentId })
            }
          />

          <ArchivePrescriptionsSection prescriptions={data?.prescriptions ?? []} />

          <ArchiveTimelineSection timeline={data?.timeline ?? []} />
        </StateView>
        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: 16, paddingBottom: 20, paddingTop: 4 },
});

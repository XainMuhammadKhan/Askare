import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../../theme';
import { Header, InputField, PrimaryButton, StateView } from '../../../components';
import { patientService, PatientDocument } from '../../../api';
import { useApi } from '../../../hooks/useApi';
import { formatDate } from '../../../utils/format';

type Props = { navigation: NativeStackNavigationProp<any> };

const DOC_TYPES = ['LAB_REPORT', 'IMAGING', 'PRESCRIPTION', 'DISCHARGE_SUMMARY', 'OTHER'] as const;
type DocType = (typeof DOC_TYPES)[number];

export const MyDocumentsScreen: React.FC<Props> = ({ navigation }) => {
  const { data, loading, error, refresh, setData } = useApi(() => patientService.documents(), []);

  const [title, setTitle] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [type, setType] = useState<DocType>('LAB_REPORT');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [explainingId, setExplainingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const documents: PatientDocument[] = Array.isArray(data) ? data : [];

  const handleAddDocument = async () => {
    if (!title.trim() || !fileUrl.trim()) {
      Alert.alert('Missing Fields', 'Please enter both a report title and a file URL.');
      return;
    }
    setSubmitting(true);
    try {
      await patientService.addDocument({
        title: title.trim(),
        fileUrl: fileUrl.trim(),
        type,
        notes: notes.trim() || undefined,
      });
      setTitle('');
      setFileUrl('');
      setNotes('');
      await refresh();
    } catch (e: any) {
      Alert.alert('Error Adding Report', e?.message ?? 'Could not upload document.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleExplain = async (docId: number) => {
    setExplainingId(docId);
    try {
      const updated = await patientService.explainDocument(docId);
      setData((prev) =>
        Array.isArray(prev)
          ? prev.map((d) => (d.id === docId ? { ...d, ...updated } : d))
          : prev
      );
    } catch (e: any) {
      Alert.alert('AI Explanation Error', e?.message ?? 'AI assistant is busy. Please try again shortly.');
    } finally {
      setExplainingId(null);
    }
  };

  const handleDelete = async (docId: number) => {
    setDeletingId(docId);
    try {
      await patientService.deleteDocument(docId);
      setData((prev) => (Array.isArray(prev) ? prev.filter((d) => d.id !== docId) : prev));
    } catch (e: any) {
      Alert.alert('Delete Failed', e?.message ?? 'Could not delete document.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="My Medical Documents"
        showBack
        onBack={() => navigation.goBack()}
        onNotification={() => navigation.navigate('Notifications')}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Upload Form Card */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Add Medical Report</Text>
          <Text style={styles.chipSectionLabel}>DOCUMENT TYPE</Text>
          <View style={styles.chipsRow}>
            {DOC_TYPES.map((t) => {
              const active = type === t;
              return (
                <TouchableOpacity
                  key={t}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setType(t)}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {t.replace(/_/g, ' ')}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <InputField
            label="REPORT TITLE"
            placeholder="e.g. HbA1c Blood Test"
            value={title}
            onChangeText={setTitle}
          />
          <InputField
            label="FILE URL (IMAGE OR PDF)"
            placeholder="https://..."
            value={fileUrl}
            onChangeText={setFileUrl}
          />
          <InputField
            label="NOTES (OPTIONAL)"
            placeholder="Additional observations or context..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={2}
          />

          <PrimaryButton
            title="Upload Report"
            onPress={handleAddDocument}
            loading={submitting}
          />
        </View>

        <Text style={styles.listHeader}>UPLOADED DOCUMENTS ({documents.length})</Text>

        <StateView
          loading={loading}
          error={error}
          empty={!loading && documents.length === 0}
          emptyText="No medical documents uploaded yet."
          onRetry={refresh}
        >
          {documents.map((doc) => {
            const isExplaining = explainingId === doc.id;
            const isDeleting = deletingId === doc.id;

            return (
              <View key={doc.id} style={styles.docCard}>
                <View style={styles.docHeader}>
                  <View style={styles.docIcon}>
                    <MaterialIcons name="description" size={22} color={Colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.docTitle}>{doc.title}</Text>
                    <Text style={styles.docDate}>
                      {formatDate(doc.recordedAt || doc.createdAt)}
                    </Text>
                  </View>
                  <View style={styles.typeBadge}>
                    <Text style={styles.typeBadgeText}>
                      {(doc.type || 'OTHER').replace(/_/g, ' ')}
                    </Text>
                  </View>
                </View>

                {doc.notes ? <Text style={styles.notesText}>{doc.notes}</Text> : null}

                {doc.aiSummary ? (
                  <View style={styles.aiBox}>
                    <View style={styles.aiBoxHeader}>
                      <MaterialIcons name="auto-awesome" size={16} color={Colors.primary} />
                      <Text style={styles.aiBoxTitle}>AI Plain-Language Summary</Text>
                    </View>
                    <Text style={styles.aiBoxText}>{doc.aiSummary}</Text>
                  </View>
                ) : null}

                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={styles.explainBtn}
                    onPress={() => handleExplain(doc.id)}
                    disabled={isExplaining}
                  >
                    {isExplaining ? (
                      <ActivityIndicator size="small" color={Colors.primary} />
                    ) : (
                      <>
                        <MaterialIcons name="auto-awesome" size={16} color={Colors.primary} />
                        <Text style={styles.explainBtnText}>Explain with AI</Text>
                      </>
                    )}
                  </TouchableOpacity>

                  {doc.fileUrl ? (
                    <TouchableOpacity
                      style={styles.linkBtn}
                      onPress={() => Linking.openURL(doc.fileUrl).catch(() => {})}
                    >
                      <MaterialIcons name="open-in-new" size={16} color={Colors.secondary} />
                      <Text style={styles.linkBtnText}>Open</Text>
                    </TouchableOpacity>
                  ) : null}

                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDelete(doc.id)}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <ActivityIndicator size="small" color={Colors.error} />
                    ) : (
                      <>
                        <MaterialIcons name="delete-outline" size={16} color={Colors.error} />
                        <Text style={styles.deleteBtnText}>Delete</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
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
  formCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    ...Shadows.subtle,
  },
  formTitle: {
    ...Typography.titleMedium,
    color: Colors.onSurface,
    marginBottom: Spacing.md,
  },
  chipSectionLabel: {
    ...Typography.labelSmall,
    color: Colors.onSurfaceVariant,
    marginBottom: Spacing.sm,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: Spacing.lg,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceContainerLow,
  },
  chipActive: {
    backgroundColor: Colors.primary,
  },
  chipText: {
    ...Typography.labelSmall,
    color: Colors.onSurfaceVariant,
    fontSize: 10,
  },
  chipTextActive: {
    color: Colors.onPrimary,
  },
  listHeader: {
    ...Typography.labelMedium,
    color: Colors.onSurfaceVariant,
    marginBottom: Spacing.md,
  },
  docCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.subtle,
  },
  docHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  docIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: `${Colors.primary}12`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docTitle: {
    ...Typography.titleSmall,
    fontSize: 15,
    color: Colors.onSurface,
  },
  docDate: {
    ...Typography.bodySmall,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  typeBadge: {
    backgroundColor: Colors.secondaryContainer,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  typeBadgeText: {
    ...Typography.labelSmall,
    color: Colors.onSecondaryContainer,
    fontSize: 9,
  },
  notesText: {
    ...Typography.bodyMedium,
    color: Colors.onSurfaceVariant,
    marginTop: Spacing.sm,
  },
  aiBox: {
    backgroundColor: `${Colors.primary}0D`,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  aiBoxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  aiBoxTitle: {
    ...Typography.labelSmall,
    color: Colors.primary,
  },
  aiBoxText: {
    ...Typography.bodySmall,
    color: Colors.onSurface,
    lineHeight: 19,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceContainer,
  },
  explainBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: `${Colors.primary}15`,
  },
  explainBtnText: {
    ...Typography.labelSmall,
    color: Colors.primary,
    textTransform: 'none',
  },
  linkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceContainerLow,
  },
  linkBtnText: {
    ...Typography.labelSmall,
    color: Colors.secondary,
    textTransform: 'none',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 'auto',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: `${Colors.error}12`,
  },
  deleteBtnText: {
    ...Typography.labelSmall,
    color: Colors.error,
    textTransform: 'none',
  },
});

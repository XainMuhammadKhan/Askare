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
import { useApi } from '../../../hooks/useApi';
import { formatDate } from '../../../utils/format';
import { listDocuments, addDocument, deleteDocument } from './doctorExtrasApi';

type Props = { navigation: NativeStackNavigationProp<any> };

const CRED_TYPES = ['LICENSE', 'DEGREE', 'CERTIFICATE', 'OTHER'] as const;
type CredType = (typeof CRED_TYPES)[number];

export const DoctorDocumentsScreen: React.FC<Props> = ({ navigation }) => {
  const { data, loading, error, refresh, setData } = useApi(() => listDocuments(), []);

  const [title, setTitle] = useState('');
  const [type, setType] = useState<CredType>('LICENSE');
  const [fileUrl, setFileUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const docs: any[] = Array.isArray(data) ? data : [];

  const handleAdd = async () => {
    if (!title.trim() || !fileUrl.trim()) {
      Alert.alert('Missing Info', 'Please provide both document title and file URL.');
      return;
    }
    setSubmitting(true);
    try {
      await addDocument({
        title: title.trim(),
        type,
        fileUrl: fileUrl.trim(),
      });
      setTitle('');
      setFileUrl('');
      await refresh();
    } catch (e: any) {
      Alert.alert('Upload Failed', e?.message ?? 'Could not save credential document.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await deleteDocument(id);
      setData((prev) => (Array.isArray(prev) ? prev.filter((d) => d.id !== id) : prev));
    } catch (e: any) {
      Alert.alert('Delete Failed', e?.message ?? 'Could not remove document.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Credentials & Documents"
        showBack
        onBack={() => navigation.goBack()}
        onNotification={() => navigation.navigate('Notifications')}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Add Credential Document</Text>
          <Text style={styles.chipLabel}>CREDENTIAL TYPE</Text>
          <View style={styles.chipsRow}>
            {CRED_TYPES.map((t) => {
              const active = type === t;
              return (
                <TouchableOpacity
                  key={t}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setType(t)}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{t}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <InputField
            label="DOCUMENT TITLE"
            placeholder="e.g. PMDC Medical License"
            value={title}
            onChangeText={setTitle}
          />
          <InputField
            label="FILE URL"
            placeholder="https://..."
            value={fileUrl}
            onChangeText={setFileUrl}
          />

          <PrimaryButton title="Save Credential" onPress={handleAdd} loading={submitting} />
        </View>

        <Text style={styles.listHeader}>UPLOADED CREDENTIALS ({docs.length})</Text>

        <StateView
          loading={loading}
          error={error}
          empty={!loading && docs.length === 0}
          emptyText="No credential documents uploaded yet."
          onRetry={refresh}
        >
          {docs.map((doc: any) => {
            const isDeleting = deletingId === doc.id;
            return (
              <View key={doc.id} style={styles.docCard}>
                <View style={styles.docIcon}>
                  <MaterialIcons name="verified-user" size={22} color={Colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.docTitle}>{doc.title}</Text>
                  <Text style={styles.docMeta}>
                    {doc.type || 'OTHER'} • {formatDate(doc.createdAt)}
                  </Text>
                </View>
                {doc.fileUrl ? (
                  <TouchableOpacity
                    style={styles.iconBtn}
                    onPress={() => Linking.openURL(doc.fileUrl).catch(() => {})}
                  >
                    <MaterialIcons name="open-in-new" size={20} color={Colors.secondary} />
                  </TouchableOpacity>
                ) : null}
                <TouchableOpacity
                  style={styles.iconBtn}
                  onPress={() => handleDelete(doc.id)}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <ActivityIndicator size="small" color={Colors.error} />
                  ) : (
                    <MaterialIcons name="delete-outline" size={20} color={Colors.error} />
                  )}
                </TouchableOpacity>
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
  chipLabel: {
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
    paddingHorizontal: 14,
    paddingVertical: 7,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
    ...Shadows.subtle,
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
    color: Colors.onSurface,
  },
  docMeta: {
    ...Typography.bodySmall,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  iconBtn: {
    padding: 6,
  },
});

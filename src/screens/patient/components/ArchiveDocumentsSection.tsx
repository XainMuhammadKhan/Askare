import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography, Shadows } from '../../../theme';
import { PatientDocument, patientService } from '../../../api';
import { formatDate } from '../../../utils/format';

interface Props {
  documents: PatientDocument[];
  onManageDocuments: () => void;
  onDocumentUpdated: (doc: PatientDocument) => void;
  onDocumentDeleted: (id: number) => void;
}

export const ArchiveDocumentsSection: React.FC<Props> = ({
  documents,
  onManageDocuments,
  onDocumentUpdated,
  onDocumentDeleted,
}) => {
  const [explainingId, setExplainingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleExplain = async (doc: PatientDocument) => {
    if (explainingId !== null) return;
    setExplainingId(doc.id);
    try {
      const updated = await patientService.explainDocument(doc.id);
      onDocumentUpdated(updated);
    } catch (e: any) {
      Alert.alert('AI Explain Failed', e?.message || 'Could not analyze this document.');
    } finally {
      setExplainingId(null);
    }
  };

  const handleDelete = (doc: PatientDocument) => {
    Alert.alert(
      'Delete Document',
      `Are you sure you want to delete "${doc.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeletingId(doc.id);
            try {
              await patientService.deleteDocument(doc.id);
              onDocumentDeleted(doc.id);
            } catch (e: any) {
              Alert.alert('Delete Failed', e?.message || 'Could not delete document.');
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  };

  const handleOpenFile = async (url?: string) => {
    if (!url) return;
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('Error', 'Could not open document file URL.');
    }
  };

  return (
    <View style={styles.section}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Medical Documents ({documents.length})</Text>
        <TouchableOpacity style={styles.manageBtn} onPress={onManageDocuments}>
          <MaterialIcons name="folder-open" size={16} color={Colors.onPrimary} />
          <Text style={styles.manageBtnText}>My Documents</Text>
        </TouchableOpacity>
      </View>

      {documents.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No uploaded lab reports or documents yet.</Text>
        </View>
      ) : (
        documents.map((doc) => {
          const isExplaining = explainingId === doc.id;
          const isDeleting = deletingId === doc.id;

          return (
            <View key={doc.id} style={styles.card}>
              <View style={styles.docTop}>
                <View style={styles.iconCircle}>
                  <MaterialIcons name="description" size={20} color={Colors.tertiary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.docTitle}>{doc.title}</Text>
                  <Text style={styles.docMeta}>
                    {doc.type || 'DOCUMENT'} • {formatDate(doc.recordedAt || doc.createdAt)}
                  </Text>
                </View>
                {doc.fileUrl ? (
                  <TouchableOpacity
                    onPress={() => handleOpenFile(doc.fileUrl)}
                    style={styles.iconBtn}
                  >
                    <MaterialIcons name="open-in-new" size={18} color={Colors.primary} />
                  </TouchableOpacity>
                ) : null}
              </View>

              {doc.notes ? <Text style={styles.notes}>{doc.notes}</Text> : null}

              {doc.aiSummary ? (
                <View style={styles.aiBox}>
                  <View style={styles.aiHeader}>
                    <MaterialIcons name="auto-awesome" size={14} color={Colors.primary} />
                    <Text style={styles.aiLabel}>AI EXPLANATION</Text>
                  </View>
                  <Text style={styles.aiText}>{doc.aiSummary}</Text>
                </View>
              ) : null}

              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={styles.explainBtn}
                  onPress={() => handleExplain(doc)}
                  disabled={isExplaining || isDeleting}
                >
                  {isExplaining ? (
                    <ActivityIndicator size="small" color={Colors.primary} />
                  ) : (
                    <>
                      <MaterialIcons name="auto-awesome" size={16} color={Colors.primary} />
                      <Text style={styles.explainText}>
                        {doc.aiSummary ? 'Re-Explain with AI' : 'AI Explain'}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDelete(doc)}
                  disabled={isDeleting || isExplaining}
                >
                  {isDeleting ? (
                    <ActivityIndicator size="small" color={Colors.error} />
                  ) : (
                    <>
                      <MaterialIcons name="delete-outline" size={16} color={Colors.error} />
                      <Text style={styles.deleteText}>Delete</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          );
        })
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  section: { marginBottom: 20 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Manrope_700Bold',
    color: Colors.onSurface,
  },
  manageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
  },
  manageBtnText: {
    fontSize: 12,
    fontFamily: 'Manrope_700Bold',
    color: Colors.onPrimary,
  },
  card: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    ...Shadows.subtle,
  },
  docTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${Colors.tertiary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docTitle: {
    fontSize: 15,
    fontFamily: 'Manrope_700Bold',
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
  notes: {
    ...Typography.bodyMedium,
    color: Colors.onSurfaceVariant,
    marginTop: 8,
  },
  aiBox: {
    backgroundColor: `${Colors.primary}08`,
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: `${Colors.primary}20`,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  aiLabel: {
    ...Typography.labelSmall,
    color: Colors.primary,
    fontSize: 9,
  },
  aiText: {
    ...Typography.bodySmall,
    color: Colors.onSurface,
    lineHeight: 18,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceContainerLow,
  },
  explainBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: `${Colors.primary}12`,
  },
  explainText: {
    fontSize: 12,
    fontFamily: 'Manrope_700Bold',
    color: Colors.primary,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: '#fef2f2',
  },
  deleteText: {
    fontSize: 12,
    fontFamily: 'Manrope_700Bold',
    color: Colors.error,
  },
  emptyCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 14,
    padding: 16,
  },
  emptyText: {
    ...Typography.bodyMedium,
    color: Colors.onSurfaceVariant,
  },
});

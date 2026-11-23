import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography, Shadows } from '../../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import {
  aiService,
  SymptomAnalysis,
  ChatConversation,
  ApiError,
} from '../../api';
import { useApi } from '../../hooks/useApi';
import { timeAgo } from '../../utils/format';
import { SymptomAnalysisCard } from './ai/SymptomAnalysisCard';

type Props = { navigation: NativeStackNavigationProp<any> };

const QUICK_SYMPTOMS = [
  'Fever and body ache for 2 days',
  'Persistent headache and dizziness',
  'Stomach pain and acid reflux after meals',
  'Dry cough and sore throat',
];

export const AIAssistantScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [symptomsInput, setSymptomsInput] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<SymptomAnalysis | null>(null);
  const [busyError, setBusyError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const {
    data: conversations,
    loading: loadingConvs,
    refresh: refreshConvs,
  } = useApi<ChatConversation[]>(() => aiService.conversations(), []);

  const convList = Array.isArray(conversations) ? conversations : [];

  const handleAnalyze = async (customText?: string) => {
    const text = (customText ?? symptomsInput).trim();
    if (text.length < 3 || text.length > 2000) {
      Alert.alert(
        'Check Input',
        'Please describe your symptoms in 3 to 2,000 characters.'
      );
      return;
    }
    setAnalyzing(true);
    setBusyError(null);
    try {
      const res = await aiService.analyzeSymptoms(text);
      setAnalysis(res);
    } catch (e: any) {
      if (e instanceof ApiError && e.status === 503) {
        setBusyError(
          'The AI symptom checker is temporarily busy. Please try again in a minute.'
        );
      } else {
        Alert.alert('Symptom Check Failed', e?.message ?? 'Could not analyze symptoms.');
      }
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDeleteConversation = (id: number, title?: string | null) => {
    Alert.alert(
      'Delete Chat',
      `Delete "${title || 'Health Consultation'}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeletingId(id);
            try {
              await aiService.deleteConversation(id);
              await refreshConvs();
            } catch (e: any) {
              Alert.alert('Error', e?.message ?? 'Could not delete conversation.');
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.headerLeft}>
          <MaterialIcons name="auto-awesome" size={22} color={Colors.primary} />
          <Text style={styles.headerTitle}>AI Health Assistant</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
          <MaterialIcons name="notifications-none" size={22} color={Colors.secondary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loadingConvs} onRefresh={refreshConvs} />
        }
      >
        {/* Personal Health Chat Hero Banner */}
        <LinearGradient
          colors={[Colors.primary, Colors.primaryDim]}
          style={styles.banner}
        >
          <View style={styles.bannerIcon}>
            <MaterialIcons name="chat" size={24} color={Colors.white} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>Personal Health Chat (RAG)</Text>
            <Text style={styles.bannerSub}>
              Ask about your lab reports, prescriptions & history.
            </Text>
          </View>
          <TouchableOpacity
            style={styles.bannerBtn}
            onPress={() => navigation.navigate('ClinicalChat')}
          >
            <Text style={styles.bannerBtnText}>Start Chat</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Symptom Checker Card */}
        <View style={styles.checkerCard}>
          <View style={styles.checkerHeader}>
            <MaterialIcons name="medical-services" size={20} color={Colors.primary} />
            <Text style={styles.checkerTitle}>AI Symptom Checker</Text>
          </View>
          <Text style={styles.checkerSub}>
            Describe how you feel and our AI will assess urgency and match you with the right specialist.
          </Text>

          <TextInput
            style={styles.symptomInput}
            placeholder="Describe your symptoms (e.g., headache and fever for 3 days)..."
            placeholderTextColor={Colors.outlineVariant}
            value={symptomsInput}
            onChangeText={setSymptomsInput}
            multiline
            maxLength={2000}
          />

          <View style={styles.quickWrap}>
            {QUICK_SYMPTOMS.map((q, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.quickChip}
                onPress={() => {
                  setSymptomsInput(q);
                  handleAnalyze(q);
                }}
              >
                <Text style={styles.quickChipText}>{q}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[
              styles.analyzeBtn,
              analyzing && { opacity: 0.7 },
            ]}
            onPress={() => handleAnalyze()}
            disabled={analyzing}
          >
            {analyzing ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <>
                <MaterialIcons name="search" size={18} color={Colors.white} />
                <Text style={styles.analyzeBtnText}>Analyze Symptoms</Text>
              </>
            )}
          </TouchableOpacity>

          {busyError && (
            <View style={styles.busyBanner}>
              <MaterialIcons name="hourglass-top" size={18} color="#d97706" />
              <Text style={styles.busyText}>{busyError}</Text>
            </View>
          )}
        </View>

        {/* Analysis Result */}
        {analysis && (
          <SymptomAnalysisCard
            analysis={analysis}
            onSelectFollowUp={(q) => {
              const combined = `${symptomsInput.trim()} — ${q}`.trim();
              setSymptomsInput(combined);
              handleAnalyze(combined);
            }}
            onFindSpecialist={(specializationId) =>
              navigation.navigate(
                'FindSpecialist',
                specializationId ? { specializationId } : undefined
              )
            }
          />
        )}

        {/* Past AI Chat Conversations */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your AI Health Chats</Text>
          <TouchableOpacity
            style={styles.newChatLink}
            onPress={() => navigation.navigate('ClinicalChat')}
          >
            <MaterialIcons name="add" size={16} color={Colors.primary} />
            <Text style={styles.newChatText}>New Chat</Text>
          </TouchableOpacity>
        </View>

        {convList.length === 0 ? (
          <View style={styles.emptyConvCard}>
            <MaterialIcons name="forum" size={28} color={Colors.outlineVariant} />
            <Text style={styles.emptyConvText}>
              No past conversations yet. Start a Personal Health Chat to ask questions about your prescriptions or reports.
            </Text>
          </View>
        ) : (
          convList.map((conv) => {
            const lastMsg = conv.messages?.[conv.messages.length - 1];
            return (
              <TouchableOpacity
                key={conv.id}
                style={styles.convCard}
                activeOpacity={0.75}
                onPress={() =>
                  navigation.navigate('ClinicalChat', { conversationId: conv.id })
                }
              >
                <View style={styles.convIcon}>
                  <MaterialIcons name="chat-bubble-outline" size={18} color={Colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.convTopRow}>
                    <Text style={styles.convTitle} numberOfLines={1}>
                      {conv.title || `Consultation #${conv.id}`}
                    </Text>
                    {conv.updatedAt && (
                      <Text style={styles.convTime}>{timeAgo(conv.updatedAt)}</Text>
                    )}
                  </View>
                  {lastMsg?.content ? (
                    <Text style={styles.convPreview} numberOfLines={2}>
                      {lastMsg.content}
                    </Text>
                  ) : (
                    <Text style={styles.convPreview}>Tap to continue conversation</Text>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDeleteConversation(conv.id, conv.title)}
                  disabled={deletingId === conv.id}
                >
                  {deletingId === conv.id ? (
                    <ActivityIndicator size="small" color={Colors.error} />
                  ) : (
                    <MaterialIcons name="delete-outline" size={20} color={Colors.outlineVariant} />
                  )}
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { ...Typography.titleLarge, color: Colors.primary, fontSize: 20 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 24 },
  banner: {
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  bannerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTitle: { fontSize: 15, fontFamily: 'Manrope_700Bold', color: Colors.white },
  bannerSub: { ...Typography.bodySmall, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  bannerBtn: {
    backgroundColor: Colors.white,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
  },
  bannerBtnText: { fontSize: 12, fontFamily: 'Manrope_700Bold', color: Colors.primary },
  checkerCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    ...Shadows.subtle,
  },
  checkerHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  checkerTitle: { fontSize: 17, fontFamily: 'Manrope_700Bold', color: Colors.onSurface },
  checkerSub: {
    ...Typography.bodySmall,
    color: Colors.onSurfaceVariant,
    marginBottom: 12,
    lineHeight: 18,
  },
  symptomInput: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: Colors.onSurface,
    minHeight: 84,
    textAlignVertical: 'top',
  },
  quickWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
    marginBottom: 14,
  },
  quickChip: {
    backgroundColor: Colors.surfaceContainerLow,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  quickChipText: {
    fontSize: 11,
    fontFamily: 'Manrope_600SemiBold',
    color: Colors.onSurfaceVariant,
  },
  analyzeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 13,
    borderRadius: 14,
  },
  analyzeBtnText: { fontSize: 14, fontFamily: 'Manrope_700Bold', color: Colors.white },
  busyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
  },
  busyText: { flex: 1, fontSize: 12, fontFamily: 'Manrope_600SemiBold', color: '#92400e' },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 4,
  },
  sectionTitle: { fontSize: 17, fontFamily: 'Manrope_700Bold', color: Colors.onSurface },
  newChatLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: `${Colors.primary}15`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  newChatText: { fontSize: 12, fontFamily: 'Manrope_700Bold', color: Colors.primary },
  emptyConvCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 8,
    ...Shadows.subtle,
  },
  emptyConvText: {
    ...Typography.bodySmall,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 18,
  },
  convCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    ...Shadows.subtle,
  },
  convIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${Colors.primary}12`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  convTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  convTitle: {
    fontSize: 14,
    fontFamily: 'Manrope_700Bold',
    color: Colors.onSurface,
    flex: 1,
  },
  convTime: { fontSize: 11, fontFamily: 'Manrope_500Medium', color: Colors.outlineVariant },
  convPreview: {
    ...Typography.bodySmall,
    color: Colors.onSurfaceVariant,
    marginTop: 3,
    lineHeight: 17,
  },
  deleteBtn: { padding: 6 },
});

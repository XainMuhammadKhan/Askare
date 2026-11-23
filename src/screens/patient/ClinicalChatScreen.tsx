import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography } from '../../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { aiService, ApiError } from '../../api';
import { formatTime } from '../../utils/format';

type Props = { navigation: NativeStackNavigationProp<any>; route?: any };

interface DisplayMsg {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt?: string;
}

export const ClinicalChatScreen: React.FC<Props> = ({ navigation, route }) => {
  const paramConvId = route?.params?.conversationId
    ? Number(route.params.conversationId)
    : null;
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);

  const [conversationId, setConversationId] = useState<number | null>(paramConvId);
  const [title, setTitle] = useState<string>('Personal Health Assistant');
  const [messages, setMessages] = useState<DisplayMsg[]>([]);
  const [loadingInit, setLoadingInit] = useState(true);
  const [sending, setSending] = useState(false);
  const [input, setInput] = useState('');
  const [followUps, setFollowUps] = useState<string[]>([
    'Explain my last prescription',
    'Summarize my recent lab reports',
    'What medicines am I currently taking?',
  ]);
  const [suggestBooking, setSuggestBooking] = useState(false);
  const [busyBanner, setBusyBanner] = useState<string | null>(null);
  const [lastFailedText, setLastFailedText] = useState<string | null>(null);

  const normalizeMessages = (raw?: any[]): DisplayMsg[] => {
    if (!Array.isArray(raw)) return [];
    return raw.map((m, idx) => ({
      id: String(m.id ?? `msg-${idx}`),
      role: String(m.role ?? '').toLowerCase() === 'user' ? 'user' : 'assistant',
      content: m.content ?? '',
      createdAt: m.createdAt,
    }));
  };

  const initConversation = useCallback(async () => {
    setLoadingInit(true);
    try {
      if (paramConvId) {
        const conv = await aiService.conversation(paramConvId);
        setConversationId(conv.id);
        if (conv.title) setTitle(conv.title);
        setMessages(normalizeMessages(conv.messages));
      } else {
        const created = await aiService.createConversation('Health Consultation');
        setConversationId(created.id);
        if (created.title) setTitle(created.title);
        setMessages(normalizeMessages(created.messages));
      }
    } catch (e: any) {
      Alert.alert('Chat Load Error', e?.message ?? 'Could not initialize AI conversation.');
    } finally {
      setLoadingInit(false);
    }
  }, [paramConvId]);

  useEffect(() => {
    initConversation();
  }, [initConversation]);

  const handleSend = async (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    if (!text || sending) return;

    let activeConvId = conversationId;
    if (!activeConvId) {
      try {
        const created = await aiService.createConversation('Health Consultation');
        activeConvId = created.id;
        setConversationId(created.id);
      } catch (e: any) {
        Alert.alert('Error', e?.message ?? 'Could not start conversation.');
        return;
      }
    }

    const userMsg: DisplayMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!overrideText) setInput('');
    setSending(true);
    setBusyBanner(null);
    setLastFailedText(null);

    try {
      const reply = await aiService.sendMessage(activeConvId, text);
      const aiMsg: DisplayMsg = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content:
          reply?.answer ||
          (reply as any)?.content ||
          'I have reviewed your records. Let me know if you have additional questions.',
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMsg]);

      if (Array.isArray(reply?.followUpQuestions) && reply.followUpQuestions.length > 0) {
        setFollowUps(reply.followUpQuestions);
      }
      if (reply?.suggestBooking) {
        setSuggestBooking(true);
      }
    } catch (e: any) {
      if (e instanceof ApiError && e.status === 503) {
        setBusyBanner(
          'AI assistant is temporarily busy due to high demand. Tap retry in a moment.'
        );
        setLastFailedText(text);
      } else {
        Alert.alert('Message Failed', e?.message ?? 'Could not send message.');
      }
    } finally {
      setSending(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 150);
    }
  };

  const handleStartFresh = async () => {
    setLoadingInit(true);
    setSuggestBooking(false);
    setBusyBanner(null);
    try {
      const created = await aiService.createConversation('Health Consultation');
      setConversationId(created.id);
      setTitle(created.title || 'Health Consultation');
      setMessages([]);
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Could not create new chat.');
    } finally {
      setLoadingInit(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.onSurface} />
        </TouchableOpacity>
        <View style={styles.headerAvatar}>
          <MaterialIcons name="auto-awesome" size={20} color={Colors.primary} />
          <View style={styles.onlineDot} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerName} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.headerStatus}>RAG CLINICAL ASSISTANT • ONLINE</Text>
        </View>
        <TouchableOpacity onPress={handleStartFresh} style={styles.newBtn}>
          <MaterialIcons name="add-comment" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* 503 Busy Retry Banner */}
      {busyBanner && (
        <View style={styles.busyBanner}>
          <MaterialIcons name="hourglass-top" size={18} color="#92400e" />
          <Text style={styles.busyText}>{busyBanner}</Text>
          {lastFailedText && (
            <TouchableOpacity
              style={styles.retryPill}
              onPress={() => handleSend(lastFailedText)}
            >
              <Text style={styles.retryPillText}>Retry</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {loadingInit ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading your health context...</Text>
        </View>
      ) : (
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          {/* Welcome Intro Bubble */}
          {messages.length === 0 && (
            <View style={styles.welcomeCard}>
              <MaterialIcons name="health-and-safety" size={28} color={Colors.primary} />
              <Text style={styles.welcomeTitle}>Personal Health Assistant</Text>
              <Text style={styles.welcomeSub}>
                I can answer questions personalized from your AskCare medical profile, past prescriptions, and uploaded lab reports.
              </Text>
            </View>
          )}

          {messages.map((m) =>
            m.role === 'user' ? (
              <View key={m.id} style={styles.userRow}>
                <View style={styles.userBubble}>
                  <Text style={styles.userText}>{m.content}</Text>
                </View>
                {m.createdAt ? (
                  <Text style={styles.timestamp}>{formatTime(m.createdAt)}</Text>
                ) : null}
              </View>
            ) : (
              <View key={m.id} style={styles.aiRow}>
                <View style={styles.aiBubble}>
                  <View style={styles.aiAccent} />
                  <Text style={styles.aiText}>{m.content}</Text>
                </View>
                {m.createdAt ? (
                  <Text style={styles.timestampLeft}>
                    AI ASSISTANT • {formatTime(m.createdAt)}
                  </Text>
                ) : null}
              </View>
            )
          )}

          {sending && (
            <View style={styles.typing}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={styles.typingText}>Reviewing your health records...</Text>
            </View>
          )}

          {/* Suggest Booking Action Card */}
          {suggestBooking && (
            <View style={styles.bookCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.bookTitle}>Doctor Consultation Recommended</Text>
                <Text style={styles.bookSub}>
                  Based on our conversation, speaking with a verified doctor is recommended.
                </Text>
              </View>
              <TouchableOpacity
                style={styles.bookBtn}
                onPress={() => navigation.navigate('FindSpecialist')}
              >
                <MaterialIcons name="event-available" size={16} color={Colors.white} />
                <Text style={styles.bookBtnText}>Book a Doctor</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Quick-Reply Follow-Up Chips */}
          {followUps.length > 0 && !sending && (
            <View style={styles.chipSection}>
              <Text style={styles.chipHeader}>SUGGESTED QUESTIONS</Text>
              <View style={styles.chipWrap}>
                {followUps.map((q, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.chip}
                    onPress={() => handleSend(q)}
                  >
                    <Text style={styles.chipText}>{q}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      )}

      {/* Input */}
      <View style={[styles.inputRow, { paddingBottom: insets.bottom + 8 }]}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Ask about your health, medicines, or reports..."
            placeholderTextColor={Colors.outlineVariant}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={() => handleSend()}
            returnKeyType="send"
          />
        </View>
        <TouchableOpacity
          style={[styles.sendBtn, (!input.trim() || sending) && { opacity: 0.5 }]}
          onPress={() => handleSend()}
          disabled={!input.trim() || sending}
        >
          <MaterialIcons name="send" size={20} color={Colors.onPrimary} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceContainerHighest,
  },
  backBtn: { padding: 4 },
  headerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: `${Colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#22c55e',
    borderWidth: 2,
    borderColor: Colors.background,
  },
  headerName: { fontSize: 16, fontFamily: 'Manrope_700Bold', color: Colors.onSurface },
  headerStatus: {
    fontSize: 10,
    fontFamily: 'Manrope_700Bold',
    color: '#22c55e',
    letterSpacing: 0.8,
  },
  newBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: `${Colors.primary}12`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  busyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fef3c7',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  busyText: { flex: 1, fontSize: 12, fontFamily: 'Manrope_600SemiBold', color: '#92400e' },
  retryPill: {
    backgroundColor: '#d97706',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  retryPillText: { fontSize: 11, fontFamily: 'Manrope_700Bold', color: Colors.white },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  loadingText: { ...Typography.bodyMedium, color: Colors.onSurfaceVariant },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 24, paddingTop: 12 },
  welcomeCard: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 18,
    padding: 18,
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  welcomeTitle: { fontSize: 16, fontFamily: 'Manrope_700Bold', color: Colors.onSurface },
  welcomeSub: {
    ...Typography.bodySmall,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 19,
  },
  userRow: { alignItems: 'flex-end', marginBottom: 14 },
  userBubble: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    borderBottomRightRadius: 4,
    padding: 14,
    maxWidth: '82%',
  },
  userText: {
    fontSize: 14,
    fontFamily: 'Manrope_400Regular',
    color: Colors.white,
    lineHeight: 21,
  },
  timestamp: { fontSize: 10, color: Colors.onSurfaceVariant, marginTop: 4 },
  aiRow: { alignItems: 'flex-start', marginBottom: 14 },
  aiBubble: {
    flexDirection: 'row',
    maxWidth: '88%',
    backgroundColor: Colors.surfaceContainerLowest,
    padding: 14,
    borderRadius: 18,
    borderTopLeftRadius: 4,
  },
  aiAccent: {
    width: 3,
    backgroundColor: Colors.primary,
    borderRadius: 2,
    marginRight: 10,
  },
  aiText: {
    fontSize: 14,
    fontFamily: 'Manrope_400Regular',
    color: Colors.onSurface,
    lineHeight: 22,
    flex: 1,
  },
  timestampLeft: { fontSize: 10, color: Colors.onSurfaceVariant, marginTop: 4 },
  typing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.surfaceContainerLow,
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    marginBottom: 12,
  },
  typingText: { fontSize: 12, fontFamily: 'Manrope_600SemiBold', color: Colors.primary },
  bookCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: `${Colors.primary}12`,
    borderRadius: 16,
    padding: 14,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: `${Colors.primary}30`,
  },
  bookTitle: { fontSize: 14, fontFamily: 'Manrope_700Bold', color: Colors.onSurface },
  bookSub: { ...Typography.bodySmall, color: Colors.onSurfaceVariant, marginTop: 2 },
  bookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  bookBtnText: { fontSize: 12, fontFamily: 'Manrope_700Bold', color: Colors.white },
  chipSection: { marginTop: 8 },
  chipHeader: {
    fontSize: 10,
    fontFamily: 'Manrope_700Bold',
    color: Colors.onSurfaceVariant,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    backgroundColor: `${Colors.primary}12`,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 18,
  },
  chipText: { fontSize: 12, fontFamily: 'Manrope_600SemiBold', color: Colors.primary },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 8,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceContainerHighest,
    backgroundColor: Colors.background,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 24,
    paddingHorizontal: 16,
  },
  input: { flex: 1, height: 44, fontSize: 14, color: Colors.onSurface },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

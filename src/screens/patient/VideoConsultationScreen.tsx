import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, TextInput,
  FlatList, Animated, Easing, KeyboardAvoidingView, Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppStore } from '../../store';

type Props = { navigation: NativeStackNavigationProp<any>; route: any };

const CHAT_REPLIES = [
  "I can see the results clearly now. Let's discuss the next steps.",
  "Could you describe that symptom in more detail?",
  "Understood. I'll prescribe the adjusted dosage after this call.",
  "Good to know. Let's discuss this further.",
  "I'd recommend we schedule a follow-up in two weeks.",
];

type ChatMessage = { type: 'system' | 'sent' | 'received'; text: string; time?: string };

const INITIAL_MESSAGES: ChatMessage[] = [
  { type: 'system', text: 'Consultation started' },
  { type: 'received', text: "Hello! I can see you've joined. How are you feeling today?", time: '14:30' },
  { type: 'sent', text: "Hi Doctor! I'm doing better since the last checkup. Just wanted to follow up on the medication.", time: '14:31' },
  { type: 'received', text: "That's great to hear! Let me pull up your records while we chat.", time: '14:31' },
];

export const VideoConsultationScreen: React.FC<Props> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const doctorName = route?.params?.doctorName || 'Dr. Aris Thorne';

  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [endModalVisible, setEndModalVisible] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [chatInput, setChatInput] = useState('');
  const [unread, setUnread] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const ripple1 = useRef(new Animated.Value(0.7)).current;
  const ripple2 = useRef(new Animated.Value(0.7)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;
  const avatarPulse = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);

  const setCallSummary = useAppStore((s) => s.setCallSummary);

  // Connection simulation
  useEffect(() => {
    Animated.timing(fadeIn, { toValue: 1, duration: 600, useNativeDriver: true }).start();

    // Ripple animations during connection
    const loop1 = Animated.loop(
      Animated.sequence([
        Animated.timing(ripple1, { toValue: 1.4, duration: 2000, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.timing(ripple1, { toValue: 0.7, duration: 0, useNativeDriver: true }),
      ])
    );
    const loop2 = Animated.loop(
      Animated.sequence([
        Animated.delay(600),
        Animated.timing(ripple2, { toValue: 1.4, duration: 2000, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.timing(ripple2, { toValue: 0.7, duration: 0, useNativeDriver: true }),
      ])
    );
    loop1.start();
    loop2.start();

    const connectTimer = setTimeout(() => {
      setIsConnected(true);
      loop1.stop();
      loop2.stop();
      // Start avatar pulse
      Animated.loop(
        Animated.sequence([
          Animated.timing(avatarPulse, { toValue: 1, duration: 1500, useNativeDriver: true }),
          Animated.timing(avatarPulse, { toValue: 0, duration: 1500, useNativeDriver: true }),
        ])
      ).start();
      // Start elapsed timer
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    }, 3000);

    return () => {
      clearTimeout(connectTimer);
      loop1.stop();
      loop2.stop();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const sendChat = useCallback(() => {
    if (!chatInput.trim()) return;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [...prev, { type: 'sent', text: chatInput.trim(), time }]);
    setChatInput('');

    // Auto-reply after delay
    setTimeout(() => {
      const reply = CHAT_REPLIES[Math.floor(Math.random() * CHAT_REPLIES.length)];
      const rt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages((prev) => [...prev, { type: 'received', text: reply, time: rt }]);
      if (!isChatOpen) setUnread((u) => u + 1);
    }, 2000 + Math.random() * 2000);
  }, [chatInput, isChatOpen]);

  const endCall = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setEndModalVisible(false);

    const summary = {
      patient: 'Sarah Chen',
      doctor: doctorName,
      diagnosis:
        'Mild upper respiratory tract infection with post-nasal drip. Vital signs within normal limits. No signs of bacterial infection at this time.',
      recommendations:
        'Continue current hydration regimen. Use saline nasal spray 3-4 times daily. Rest for 48-72 hours and avoid strenuous activity. Follow up in 5-7 days if symptoms persist or worsen.',
      medicines: [
        'Cetirizine 10mg — Once daily (Evening)',
        'Paracetamol 500mg — As needed for fever (Max 4/day)',
        'Saline Nasal Spray — 3-4 times daily',
      ],
      precautions: [
        'Monitor temperature twice daily',
        'Stay well hydrated (8+ glasses of water)',
        'Avoid cold and dusty environments',
        'Contact clinic immediately if fever exceeds 102°F',
      ],
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      duration: `${Math.floor(elapsed / 60)}m ${elapsed % 60}s`,
    };

    setCallSummary(summary);
    navigation.replace('ConsultationSummary');
  };

  const pulseShadowOpacity = avatarPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 0.5],
  });

  const renderChatItem = ({ item }: { item: ChatMessage }) => {
    if (item.type === 'system') {
      return (
        <View style={styles.systemMsg}>
          <Text style={styles.systemMsgText}>{item.text}</Text>
        </View>
      );
    }
    const isSent = item.type === 'sent';
    return (
      <View style={[styles.chatBubble, isSent ? styles.chatBubbleSent : styles.chatBubbleReceived]}>
        <Text style={[styles.chatBubbleText, isSent && styles.chatBubbleTextSent]}>{item.text}</Text>
        <Text style={[styles.chatTime, isSent && styles.chatTimeSent]}>{item.time}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Main Video Area */}
      <View style={styles.mainVideo}>
        {!isConnected ? (
          // Connecting state with ripple
          <Animated.View style={[styles.connectingContainer, { opacity: fadeIn }]}>
            <View style={styles.rippleContainer}>
              <Animated.View style={[styles.rippleRing, { transform: [{ scale: ripple1 }], opacity: ripple1.interpolate({ inputRange: [0.7, 1.4], outputRange: [1, 0] }) }]} />
              <Animated.View style={[styles.rippleRing, { transform: [{ scale: ripple2 }], opacity: ripple2.interpolate({ inputRange: [0.7, 1.4], outputRange: [1, 0] }) }]} />
              <View style={styles.connectAvatar}>
                <MaterialIcons name="person" size={56} color={Colors.primaryContainer} />
              </View>
            </View>
            <Text style={styles.connectName}>{doctorName}</Text>
            <Text style={styles.connectSub}>Connecting to secure consultation...</Text>
          </Animated.View>
        ) : (
          // Connected state
          <Animated.View style={[styles.connectedContainer, { opacity: fadeIn }]}>
            <View style={styles.connectedAvatar}>
              <MaterialIcons name="person" size={64} color={Colors.primaryContainer} />
            </View>
            <Text style={styles.connectedName}>{doctorName}</Text>
            <Text style={styles.connectedSub}>Video consultation in progress</Text>
          </Animated.View>
        )}
      </View>

      {/* Top Bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <View style={styles.topBarLeft}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => (isConnected ? setEndModalVisible(true) : navigation.goBack())}
          >
            <MaterialIcons name="arrow-back" size={20} color={Colors.white} />
          </TouchableOpacity>
          <View>
            <Text style={styles.topBarName}>{doctorName}</Text>
            <Text style={styles.topBarSub}>
              {isConnected ? 'Video consultation in progress' : 'Connecting...'}
            </Text>
          </View>
        </View>
        <View style={styles.topBarRight}>
          {isConnected && (
            <View style={styles.timerBadge}>
              <View style={styles.recDot} />
              <Text style={styles.timerText}>{formatTime(elapsed)}</Text>
            </View>
          )}
          <View style={styles.secureBadge}>
            <MaterialIcons name="signal-cellular-alt" size={14} color="#34d399" />
            <Text style={styles.secureText}>Secure</Text>
          </View>
        </View>
      </View>

      {/* Self View (PiP) */}
      <View style={[styles.selfView, { bottom: 130 + insets.bottom }]}>
        {isVideoOff ? (
          <View style={styles.selfViewOff}>
            <MaterialIcons name="person" size={36} color="rgba(255,255,255,0.2)" />
            <Text style={styles.selfViewOffText}>Camera Off</Text>
          </View>
        ) : (
          <View style={styles.selfViewOn}>
            <MaterialIcons name="person" size={40} color={Colors.outlineVariant} />
          </View>
        )}
        <View style={styles.selfLabel}>
          <Text style={styles.selfLabelText}>You</Text>
        </View>
        {isMuted && (
          <View style={styles.mutedBadge}>
            <MaterialIcons name="mic-off" size={14} color={Colors.white} />
          </View>
        )}
      </View>

      {/* Bottom Controls */}
      <View style={[styles.controlsContainer, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.controlBar}>
          {/* Mic */}
          <TouchableOpacity
            style={[styles.controlBtn, isMuted && styles.controlBtnDanger]}
            onPress={() => setIsMuted(!isMuted)}
          >
            <MaterialIcons name={isMuted ? 'mic-off' : 'mic'} size={24} color={isMuted ? '#fa746f' : Colors.white} />
          </TouchableOpacity>

          {/* Camera */}
          <TouchableOpacity
            style={[styles.controlBtn, isVideoOff && styles.controlBtnDanger]}
            onPress={() => setIsVideoOff(!isVideoOff)}
          >
            <MaterialIcons name={isVideoOff ? 'videocam-off' : 'videocam'} size={24} color={isVideoOff ? '#fa746f' : Colors.white} />
          </TouchableOpacity>

          {/* Chat */}
          <TouchableOpacity
            style={[styles.controlBtn, isChatOpen && styles.controlBtnActive]}
            onPress={() => {
              setIsChatOpen(true);
              setUnread(0);
            }}
          >
            <MaterialIcons name="chat" size={24} color={Colors.white} />
            {unread > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{unread}</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.controlDivider} />

          {/* End Call */}
          <TouchableOpacity style={styles.endBtn} onPress={() => setEndModalVisible(true)}>
            <MaterialIcons name="call-end" size={26} color={Colors.white} />
          </TouchableOpacity>
        </View>
        <View style={styles.statusRow}>
          <MaterialIcons name="signal-cellular-alt" size={14} color="rgba(255,255,255,0.4)" />
          <Text style={styles.statusText}>HD STABLE</Text>
        </View>
      </View>

      {/* Chat Modal */}
      <Modal visible={isChatOpen} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.chatModal}>
          <TouchableOpacity style={styles.chatModalOverlay} onPress={() => setIsChatOpen(false)} />
          <View style={[styles.chatPanel, { paddingBottom: insets.bottom + 8 }]}>
            <View style={styles.chatPanelHeader}>
              <Text style={styles.chatPanelTitle}>In-Call Chat</Text>
              <TouchableOpacity style={styles.chatCloseBtn} onPress={() => setIsChatOpen(false)}>
                <MaterialIcons name="close" size={20} color="rgba(255,255,255,0.6)" />
              </TouchableOpacity>
            </View>
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(_, i) => String(i)}
              renderItem={renderChatItem}
              contentContainerStyle={styles.chatList}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />
            <View style={styles.chatInputRow}>
              <TextInput
                style={styles.chatTextInput}
                value={chatInput}
                onChangeText={setChatInput}
                placeholder="Type a message..."
                placeholderTextColor="rgba(255,255,255,0.3)"
                onSubmitEditing={sendChat}
                returnKeyType="send"
              />
              <TouchableOpacity style={styles.chatSendBtn} onPress={sendChat}>
                <MaterialIcons name="send" size={20} color={Colors.white} />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* End Call Confirmation Modal */}
      <Modal visible={endModalVisible} transparent animationType="fade">
        <View style={styles.endModalOverlay}>
          <View style={styles.endModalCard}>
            <View style={styles.endModalIcon}>
              <MaterialIcons name="call-end" size={32} color="#fa746f" />
            </View>
            <Text style={styles.endModalTitle}>End Consultation?</Text>
            <Text style={styles.endModalSub}>
              Are you sure you want to end this video consultation?
            </Text>
            <View style={styles.endModalBtns}>
              <TouchableOpacity
                style={styles.endModalCancelBtn}
                onPress={() => setEndModalVisible(false)}
              >
                <Text style={styles.endModalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.endModalEndBtn} onPress={endCall}>
                <Text style={styles.endModalEndText}>End Call</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0f10' },
  mainVideo: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // Connecting
  connectingContainer: { alignItems: 'center' },
  rippleContainer: { width: 160, height: 160, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  rippleRing: { position: 'absolute', width: 160, height: 160, borderRadius: 80, borderWidth: 2, borderColor: 'rgba(139,229,246,0.3)' },
  connectAvatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#1a2c30', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: 'rgba(139,229,246,0.4)' },
  connectName: { fontSize: 24, fontFamily: 'Manrope_700Bold', color: Colors.white, marginBottom: 8 },
  connectSub: { fontSize: 14, fontFamily: 'Manrope_500Medium', color: 'rgba(255,255,255,0.5)' },

  // Connected
  connectedContainer: { alignItems: 'center' },
  connectedAvatar: { width: 140, height: 140, borderRadius: 70, backgroundColor: '#1a2c30', alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: 'rgba(139,229,246,0.3)', marginBottom: 20 },
  connectedName: { fontSize: 20, fontFamily: 'Manrope_700Bold', color: Colors.white, marginBottom: 4 },
  connectedSub: { fontSize: 14, fontFamily: 'Manrope_500Medium', color: 'rgba(255,255,255,0.4)' },

  // Top Bar
  topBar: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 12 },
  topBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  topBarName: { fontSize: 14, fontFamily: 'Manrope_700Bold', color: Colors.white },
  topBarSub: { fontSize: 11, fontFamily: 'Manrope_500Medium', color: 'rgba(255,255,255,0.5)' },
  topBarRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  timerBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  recDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22c55e' },
  timerText: { fontSize: 13, fontFamily: 'Manrope_600SemiBold', color: Colors.white, letterSpacing: 1 },
  secureBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6 },
  secureText: { fontSize: 11, fontFamily: 'Manrope_500Medium', color: 'rgba(255,255,255,0.6)' },

  // Self View (PiP)
  selfView: { position: 'absolute', right: 20, width: 120, height: 170, borderRadius: 20, backgroundColor: '#1a2428', borderWidth: 2, borderColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' },
  selfViewOff: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  selfViewOffText: { fontSize: 10, fontFamily: 'Manrope_500Medium', color: 'rgba(255,255,255,0.25)', marginTop: 4 },
  selfViewOn: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.surfaceContainerHigh },
  selfLabel: { position: 'absolute', bottom: 8, left: 8, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  selfLabelText: { fontSize: 11, fontFamily: 'Manrope_600SemiBold', color: Colors.white },
  mutedBadge: { position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(198,40,40,0.8)', alignItems: 'center', justifyContent: 'center' },

  // Bottom Controls
  controlsContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingTop: 16 },
  controlBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 8 },
  controlBtn: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  controlBtnDanger: { backgroundColor: 'rgba(168,56,54,0.25)' },
  controlBtnActive: { backgroundColor: 'rgba(0,105,119,0.5)' },
  controlDivider: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.1)', marginHorizontal: 4 },
  endBtn: { width: 72, height: 56, borderRadius: 28, backgroundColor: '#c62828', alignItems: 'center', justifyContent: 'center' },
  unreadBadge: { position: 'absolute', top: -2, right: -2, width: 20, height: 20, borderRadius: 10, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  unreadText: { fontSize: 10, fontFamily: 'Manrope_700Bold', color: Colors.white },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 4, justifyContent: 'center' },
  statusText: { fontSize: 10, fontFamily: 'Manrope_700Bold', color: 'rgba(255,255,255,0.4)', letterSpacing: 1.5 },

  // Chat Modal
  chatModal: { flex: 1 },
  chatModalOverlay: { flex: 0.15 },
  chatPanel: { flex: 0.85, backgroundColor: 'rgba(15,21,23,0.97)', borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  chatPanelHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  chatPanelTitle: { fontSize: 15, fontFamily: 'Manrope_700Bold', color: Colors.white },
  chatCloseBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  chatList: { paddingHorizontal: 20, paddingVertical: 16, gap: 12 },
  systemMsg: { alignItems: 'center', marginVertical: 4 },
  systemMsgText: { fontSize: 11, fontFamily: 'Manrope_500Medium', color: 'rgba(255,255,255,0.3)', backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 14, paddingVertical: 4, borderRadius: 20 },
  chatBubble: { maxWidth: '80%', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20 },
  chatBubbleSent: { alignSelf: 'flex-end', backgroundColor: '#006977', borderBottomRightRadius: 4 },
  chatBubbleReceived: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.08)', borderBottomLeftRadius: 4 },
  chatBubbleText: { fontSize: 13, fontFamily: 'Manrope_500Medium', color: 'rgba(255,255,255,0.9)', lineHeight: 20 },
  chatBubbleTextSent: { color: Colors.white },
  chatTime: { fontSize: 10, fontFamily: 'Manrope_500Medium', color: 'rgba(255,255,255,0.4)', marginTop: 4 },
  chatTimeSent: { color: 'rgba(255,255,255,0.6)' },
  chatInputRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 20, paddingVertical: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' },
  chatTextInput: { flex: 1, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 24, paddingHorizontal: 20, paddingVertical: 12, color: Colors.white, fontSize: 13, fontFamily: 'Manrope_500Medium', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  chatSendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#006977', alignItems: 'center', justifyContent: 'center' },

  // End Call Modal
  endModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center' },
  endModalCard: { backgroundColor: '#1a2428', borderRadius: 28, padding: 32, width: '85%', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  endModalIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(198,40,40,0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  endModalTitle: { fontSize: 20, fontFamily: 'Manrope_700Bold', color: Colors.white, marginBottom: 8 },
  endModalSub: { fontSize: 14, fontFamily: 'Manrope_500Medium', color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginBottom: 28 },
  endModalBtns: { flexDirection: 'row', gap: 12, width: '100%' },
  endModalCancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center' },
  endModalCancelText: { fontSize: 14, fontFamily: 'Manrope_600SemiBold', color: Colors.white },
  endModalEndBtn: { flex: 1, paddingVertical: 14, borderRadius: 16, backgroundColor: '#c62828', alignItems: 'center' },
  endModalEndText: { fontSize: 14, fontFamily: 'Manrope_600SemiBold', color: Colors.white },
});

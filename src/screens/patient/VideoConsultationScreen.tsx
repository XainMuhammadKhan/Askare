import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { io, Socket } from 'socket.io-client';
import { Colors } from '../../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { videoService, tokenStorage } from '../../api';
import { ENV } from '../../config/env';
import { formatDateTime, formatTime, initials } from '../../utils/format';

type Props = { navigation: NativeStackNavigationProp<any>; route: any };

interface JoinInfo {
  roomId: string;
  role: 'patient' | 'doctor' | string;
  self?: { id?: number; name?: string };
  peer?: { id?: number; name?: string };
  startAt?: string;
  endAt?: string;
  opensAt?: string;
  closesAt?: string;
  canJoin?: boolean;
  iceServers?: any[];
}

interface InCallMessage {
  id: string;
  from: string;
  name: string;
  text: string;
  at: string;
}

export const VideoConsultationScreen: React.FC<Props> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const appointmentId = Number(route?.params?.appointmentId);

  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('front');
  const [joinInfo, setJoinInfo] = useState<JoinInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Camera & Mic state
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [demoPreviewActive, setDemoPreviewActive] = useState(false);
  const [swapFullCamera, setSwapFullCamera] = useState(false);

  // Socket.io room & in-call chat state
  const [peerPresent, setPeerPresent] = useState(false);
  const [peerMedia, setPeerMedia] = useState<{ audio: boolean; video: boolean }>({
    audio: true,
    video: true,
  });
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<InCallMessage[]>([]);
  const [unreadChat, setUnreadChat] = useState(0);

  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const isCallActive = Boolean(joinInfo?.canJoin || demoPreviewActive);

  const fetchJoinInfo = async () => {
    if (!appointmentId) {
      setError('Missing appointment ID for video consultation.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const info = await videoService.joinInfo(appointmentId);
      setJoinInfo(info);
    } catch (e: any) {
      const msg = e?.message ?? 'Could not fetch video consultation room info.';
      setError(msg);
      Alert.alert('Video Consultation', msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJoinInfo();
  }, [appointmentId]);

  // Request camera permission automatically when screen opens
  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission().catch(() => {});
    }
  }, [permission, requestPermission]);

  // Call timer runs whenever room is open or demo preview is active
  useEffect(() => {
    if (isCallActive) {
      timerRef.current = setInterval(() => setElapsed((prev) => prev + 1), 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isCallActive]);

  // Connect to Socket.io `/video` namespace for signaling, peer presence & live chat
  useEffect(() => {
    const token = tokenStorage.get();
    if (!appointmentId || !token || !isCallActive) return;

    const socket = io(`${ENV.API_BASE_URL}/video`, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join', { appointmentId }, (ack: any) => {
        if (ack?.ok && ack?.peerPresent) {
          setPeerPresent(true);
        }
      });
    });

    socket.on('peer-joined', () => {
      setPeerPresent(true);
    });

    socket.on('peer-left', () => {
      setPeerPresent(false);
    });

    socket.on('media-state', (data: { from?: string; audio?: boolean; video?: boolean }) => {
      setPeerMedia({
        audio: data?.audio ?? true,
        video: data?.video ?? true,
      });
    });

    socket.on('chat', (msg: { from?: string; name?: string; text?: string; at?: string }) => {
      if (!msg?.text) return;
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-${Math.random()}`,
          from: msg.from ?? 'peer',
          name: msg.name ?? 'Peer',
          text: msg.text ?? '',
          at: msg.at ?? new Date().toISOString(),
        },
      ]);
      setUnreadChat((c) => c + 1);
    });

    return () => {
      try {
        socket.emit('leave');
        socket.disconnect();
      } catch {
        // Ignore disconnect error
      }
      socketRef.current = null;
    };
  }, [appointmentId, isCallActive]);

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    socketRef.current?.emit('media-state', { audio: !next, video: !isVideoOff });
  };

  const toggleVideo = async () => {
    if (!permission?.granted) {
      const res = await requestPermission();
      if (!res.granted) {
        Alert.alert(
          'Camera Permission Needed',
          'Please allow camera access in your phone settings to stream video.'
        );
        return;
      }
    }
    const next = !isVideoOff;
    setIsVideoOff(next);
    socketRef.current?.emit('media-state', { audio: !isMuted, video: !next });
  };

  const flipCamera = () => {
    setFacing((prev) => (prev === 'front' ? 'back' : 'front'));
  };

  const handleSendChat = () => {
    const text = chatInput.trim();
    if (!text) return;
    setChatInput('');
    if (socketRef.current?.connected) {
      socketRef.current.emit('chat', { text });
    } else {
      // Local echo when testing in demo preview mode
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}`,
          from: joinInfo?.role ?? 'self',
          name: joinInfo?.self?.name ?? 'You',
          text,
          at: new Date().toISOString(),
        },
      ]);
    }
  };

  const formatTimer = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const peerName = joinInfo?.peer?.name || 'Consultation Peer';
  const selfName = joinInfo?.self?.name || 'You';
  const roleLabel = joinInfo?.role ? joinInfo.role.toString().toUpperCase() : 'PARTICIPANT';
  const hasCameraStream = Boolean(permission?.granted && !isVideoOff);

  const handleEndCall = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    socketRef.current?.emit('leave');
    socketRef.current?.disconnect();
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Full-Screen Background Camera when swapped or in active camera mode */}
      {hasCameraStream && swapFullCamera && (
        <CameraView style={StyleSheet.absoluteFillObject} facing={facing} />
      )}

      {/* Top Bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <View style={styles.topBarLeft}>
          <TouchableOpacity style={styles.backBtn} onPress={handleEndCall}>
            <MaterialIcons name="arrow-back" size={20} color={Colors.white} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.topBarName} numberOfLines={1}>
              {peerName}
            </Text>
            <Text style={styles.topBarSub}>
              {joinInfo?.roomId ? `Room: ${joinInfo.roomId}` : `Appointment #${appointmentId}`}
            </Text>
          </View>
        </View>

        <View style={styles.topBarRight}>
          {isCallActive && (
            <View style={styles.timerBadge}>
              <View style={styles.recDot} />
              <Text style={styles.timerText}>{formatTimer(elapsed)}</Text>
            </View>
          )}
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>{roleLabel}</Text>
          </View>
        </View>
      </View>

      {/* Main Content Area */}
      <View style={styles.mainVideo}>
        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={Colors.primaryContainer} />
            <Text style={styles.connectSub}>Fetching secure WebRTC room info...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerBox}>
            <MaterialIcons name="error-outline" size={48} color="#fa746f" />
            <Text style={styles.errorTitle}>Unable to Join Room</Text>
            <Text style={styles.errorText}>{error}</Text>
            <View style={styles.errorActions}>
              <TouchableOpacity style={styles.retryBtn} onPress={fetchJoinInfo}>
                <Text style={styles.retryBtnText}>Retry</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.leaveBtn} onPress={handleEndCall}>
                <Text style={styles.leaveBtnText}>Go Back</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : joinInfo && !swapFullCamera ? (
          <View style={styles.centerBox}>
            <View style={[styles.connectedAvatar, peerPresent && styles.connectedAvatarOnline]}>
              <Text style={styles.avatarInitials}>{initials(peerName) || 'PR'}</Text>
            </View>
            <Text style={styles.connectedName}>{peerName}</Text>
            <Text style={styles.connectedSub}>
              {peerPresent
                ? `${peerName} is in the room ${!peerMedia.audio ? '(Muted)' : ''}`
                : `Joined as ${selfName} (${roleLabel})`}
            </Text>

            {/* Info Card */}
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <MaterialIcons name="meeting-room" size={16} color={Colors.primaryContainer} />
                <Text style={styles.infoLabel}>Room ID:</Text>
                <Text style={styles.infoValue}>{joinInfo.roomId}</Text>
              </View>

              <View style={styles.infoRow}>
                <MaterialIcons name="schedule" size={16} color={Colors.primaryContainer} />
                <Text style={styles.infoLabel}>Scheduled:</Text>
                <Text style={styles.infoValue}>
                  {formatDateTime(joinInfo.startAt)}
                  {joinInfo.endAt ? ` – ${formatTime(joinInfo.endAt)}` : ''}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <MaterialIcons
                  name={isCallActive ? 'check-circle' : 'lock-clock'}
                  size={16}
                  color={isCallActive ? '#34d399' : '#fbbf24'}
                />
                <Text style={styles.infoLabel}>Status:</Text>
                <Text
                  style={[
                    styles.infoValue,
                    { color: isCallActive ? '#34d399' : '#fbbf24' },
                  ]}
                >
                  {joinInfo.canJoin
                    ? 'Room Open — Live Call Active'
                    : demoPreviewActive
                    ? 'Live Camera Preview Active'
                    : 'Outside Call Window'}
                </Text>
              </View>

              {!joinInfo.canJoin && !demoPreviewActive && (
                <>
                  {(joinInfo.opensAt || joinInfo.closesAt) && (
                    <View style={styles.windowNotice}>
                      <MaterialIcons name="info-outline" size={16} color="#fbbf24" />
                      <Text style={styles.windowNoticeText}>
                        Call window opens {formatDateTime(joinInfo.opensAt)} (10 min before start)
                        and closes {formatDateTime(joinInfo.closesAt)} (30 min after end).
                      </Text>
                    </View>
                  )}
                  <TouchableOpacity
                    style={styles.demoStartBtn}
                    onPress={async () => {
                      if (!permission?.granted) {
                        await requestPermission();
                      }
                      setDemoPreviewActive(true);
                    }}
                  >
                    <MaterialIcons name="videocam" size={18} color={Colors.onPrimary} />
                    <Text style={styles.demoStartBtnText}>
                      Start Live Camera & Call Preview Now
                    </Text>
                  </TouchableOpacity>
                </>
              )}

              {hasCameraStream && (
                <TouchableOpacity
                  style={styles.expandCamBtn}
                  onPress={() => setSwapFullCamera(true)}
                >
                  <MaterialIcons name="fullscreen" size={18} color={Colors.primaryContainer} />
                  <Text style={styles.expandCamText}>Expand My Camera to Full Screen</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ) : null}
      </View>

      {/* Self View (PiP Live Camera) — Tap to toggle full-screen vs PiP */}
      {joinInfo && (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => hasCameraStream && setSwapFullCamera((v) => !v)}
          style={[styles.selfView, { bottom: 130 + insets.bottom }]}
        >
          {hasCameraStream && !swapFullCamera ? (
            <CameraView style={StyleSheet.absoluteFillObject} facing={facing} />
          ) : isVideoOff ? (
            <View style={styles.selfViewOff}>
              <MaterialIcons name="videocam-off" size={28} color="rgba(255,255,255,0.3)" />
              <Text style={styles.selfViewOffText}>Camera Off</Text>
            </View>
          ) : !permission?.granted ? (
            <TouchableOpacity style={styles.selfViewOff} onPress={() => requestPermission()}>
              <MaterialIcons name="photo-camera" size={24} color={Colors.primaryContainer} />
              <Text style={styles.selfViewOffText}>Tap to Enable Camera</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.selfViewOn}>
              <Text style={styles.selfInitials}>{initials(peerName) || 'PR'}</Text>
            </View>
          )}
          <View style={styles.selfLabel}>
            <Text style={styles.selfLabelText} numberOfLines={1}>
              {swapFullCamera ? peerName : selfName}
            </Text>
          </View>
          {isMuted && (
            <View style={styles.mutedBadge}>
              <MaterialIcons name="mic-off" size={14} color={Colors.white} />
            </View>
          )}
        </TouchableOpacity>
      )}

      {/* In-Call Chat Drawer */}
      {chatOpen && (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={[styles.chatSheet, { bottom: 115 + insets.bottom }]}
        >
          <View style={styles.chatHeader}>
            <Text style={styles.chatTitle}>In-Call Chat</Text>
            <TouchableOpacity onPress={() => setChatOpen(false)}>
              <MaterialIcons name="close" size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.chatList} contentContainerStyle={{ gap: 8, paddingVertical: 6 }}>
            {messages.length === 0 ? (
              <Text style={styles.chatEmpty}>No messages in this call yet.</Text>
            ) : (
              messages.map((m) => (
                <View key={m.id} style={styles.chatBubble}>
                  <Text style={styles.chatSender}>{m.name}</Text>
                  <Text style={styles.chatText}>{m.text}</Text>
                </View>
              ))
            )}
          </ScrollView>
          <View style={styles.chatInputRow}>
            <TextInput
              style={styles.chatInput}
              placeholder="Type a message..."
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={chatInput}
              onChangeText={setChatInput}
              onSubmitEditing={handleSendChat}
            />
            <TouchableOpacity style={styles.chatSendBtn} onPress={handleSendChat}>
              <MaterialIcons name="send" size={18} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}

      {/* Bottom Controls */}
      <View style={[styles.controlsContainer, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.controlBar}>
          <TouchableOpacity
            style={[styles.controlBtn, isMuted && styles.controlBtnDanger]}
            onPress={toggleMute}
          >
            <MaterialIcons
              name={isMuted ? 'mic-off' : 'mic'}
              size={24}
              color={isMuted ? '#fa746f' : Colors.white}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlBtn, isVideoOff && styles.controlBtnDanger]}
            onPress={toggleVideo}
          >
            <MaterialIcons
              name={isVideoOff ? 'videocam-off' : 'videocam'}
              size={24}
              color={isVideoOff ? '#fa746f' : Colors.white}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlBtn} onPress={flipCamera}>
            <MaterialIcons name="flip-camera-ios" size={22} color={Colors.white} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlBtn, chatOpen && styles.controlBtnActive]}
            onPress={() => {
              setChatOpen((v) => !v);
              setUnreadChat(0);
            }}
          >
            <MaterialIcons name="chat-bubble-outline" size={22} color={Colors.white} />
            {unreadChat > 0 && !chatOpen && (
              <View style={styles.chatBadge}>
                <Text style={styles.chatBadgeText}>{unreadChat}</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.controlDivider} />

          <TouchableOpacity style={styles.endBtn} onPress={handleEndCall}>
            <MaterialIcons name="call-end" size={26} color={Colors.white} />
          </TouchableOpacity>
        </View>
        <View style={styles.statusRow}>
          <MaterialIcons name="lock" size={13} color="rgba(255,255,255,0.45)" />
          <Text style={styles.statusText}>ENCRYPTED WEBRTC CONSULTATION</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0f10' },
  mainVideo: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  centerBox: { alignItems: 'center', width: '100%' },
  connectedAvatar: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: '#1a2c30',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(139,229,246,0.35)',
    marginBottom: 14,
  },
  connectedAvatarOnline: {
    borderColor: '#34d399',
  },
  avatarInitials: {
    fontSize: 34,
    fontFamily: 'Manrope_800ExtraBold',
    color: Colors.primaryContainer,
  },
  connectedName: { fontSize: 22, fontFamily: 'Manrope_700Bold', color: Colors.white },
  connectedSub: {
    fontSize: 13,
    fontFamily: 'Manrope_500Medium',
    color: 'rgba(255,255,255,0.55)',
    marginTop: 4,
    marginBottom: 20,
  },
  connectSub: {
    fontSize: 14,
    fontFamily: 'Manrope_500Medium',
    color: 'rgba(255,255,255,0.6)',
    marginTop: 12,
  },
  infoCard: {
    width: '100%',
    backgroundColor: 'rgba(11,15,16,0.82)',
    borderRadius: 18,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoLabel: {
    fontSize: 12,
    fontFamily: 'Manrope_600SemiBold',
    color: 'rgba(255,255,255,0.55)',
  },
  infoValue: {
    fontSize: 13,
    fontFamily: 'Manrope_700Bold',
    color: Colors.white,
    flex: 1,
  },
  windowNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: 'rgba(251,191,36,0.12)',
    padding: 12,
    borderRadius: 12,
    marginTop: 4,
  },
  windowNoticeText: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Manrope_500Medium',
    color: '#fde68a',
    lineHeight: 18,
  },
  demoStartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 6,
  },
  demoStartBtnText: {
    fontSize: 13,
    fontFamily: 'Manrope_700Bold',
    color: Colors.onPrimary,
  },
  expandCamBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(139,229,246,0.12)',
    marginTop: 4,
  },
  expandCamText: {
    fontSize: 12,
    fontFamily: 'Manrope_700Bold',
    color: Colors.primaryContainer,
  },
  errorTitle: {
    fontSize: 18,
    fontFamily: 'Manrope_700Bold',
    color: Colors.white,
    marginTop: 12,
  },
  errorText: {
    fontSize: 13,
    fontFamily: 'Manrope_500Medium',
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 18,
  },
  errorActions: { flexDirection: 'row', gap: 12 },
  retryBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  retryBtnText: { fontSize: 13, fontFamily: 'Manrope_700Bold', color: Colors.white },
  leaveBtn: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  leaveBtnText: { fontSize: 13, fontFamily: 'Manrope_700Bold', color: Colors.white },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: 'rgba(11,15,16,0.55)',
  },
  topBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarName: { fontSize: 15, fontFamily: 'Manrope_700Bold', color: Colors.white },
  topBarSub: {
    fontSize: 11,
    fontFamily: 'Manrope_500Medium',
    color: 'rgba(255,255,255,0.55)',
  },
  topBarRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  recDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22c55e' },
  timerText: {
    fontSize: 12,
    fontFamily: 'Manrope_700Bold',
    color: Colors.white,
    letterSpacing: 1,
  },
  roleBadge: {
    backgroundColor: 'rgba(139,229,246,0.18)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  roleBadgeText: {
    fontSize: 10,
    fontFamily: 'Manrope_700Bold',
    color: Colors.primaryContainer,
    letterSpacing: 0.6,
  },
  selfView: {
    position: 'absolute',
    right: 20,
    width: 118,
    height: 158,
    borderRadius: 18,
    backgroundColor: '#1a2428',
    borderWidth: 2,
    borderColor: 'rgba(139,229,246,0.45)',
    overflow: 'hidden',
  },
  selfViewOff: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 6 },
  selfViewOffText: {
    fontSize: 10,
    fontFamily: 'Manrope_500Medium',
    color: 'rgba(255,255,255,0.55)',
    marginTop: 4,
    textAlign: 'center',
  },
  selfViewOn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#24343a',
  },
  selfInitials: { fontSize: 22, fontFamily: 'Manrope_700Bold', color: Colors.white },
  selfLabel: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  selfLabelText: {
    fontSize: 10,
    fontFamily: 'Manrope_600SemiBold',
    color: Colors.white,
    textAlign: 'center',
  },
  mutedBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(198,40,40,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatSheet: {
    position: 'absolute',
    left: 20,
    right: 148,
    maxHeight: 240,
    backgroundColor: 'rgba(18,26,29,0.95)',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  chatTitle: { fontSize: 13, fontFamily: 'Manrope_700Bold', color: Colors.white },
  chatList: { maxHeight: 135 },
  chatEmpty: {
    fontSize: 11,
    fontFamily: 'Manrope_500Medium',
    color: 'rgba(255,255,255,0.45)',
    paddingVertical: 12,
  },
  chatBubble: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chatSender: {
    fontSize: 10,
    fontFamily: 'Manrope_700Bold',
    color: Colors.primaryContainer,
  },
  chatText: { fontSize: 12, fontFamily: 'Manrope_500Medium', color: Colors.white, marginTop: 1 },
  chatInputRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  chatInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 12,
    color: Colors.white,
    fontFamily: 'Manrope_500Medium',
  },
  chatSendBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlsContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: 'rgba(11,15,16,0.55)',
  },
  controlBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 8,
  },
  controlBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlBtnActive: { backgroundColor: Colors.primary },
  controlBtnDanger: { backgroundColor: 'rgba(168,56,54,0.28)' },
  chatBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  chatBadgeText: { fontSize: 9, fontFamily: 'Manrope_700Bold', color: Colors.white },
  controlDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginHorizontal: 2,
  },
  endBtn: {
    width: 68,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#c62828',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    justifyContent: 'center',
  },
  statusText: {
    fontSize: 10,
    fontFamily: 'Manrope_700Bold',
    color: 'rgba(255,255,255,0.45)',
    letterSpacing: 1.2,
  },
});

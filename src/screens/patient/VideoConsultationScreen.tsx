import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { videoService } from '../../api';
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

export const VideoConsultationScreen: React.FC<Props> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const appointmentId = Number(route?.params?.appointmentId);

  const [joinInfo, setJoinInfo] = useState<JoinInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  useEffect(() => {
    if (joinInfo?.canJoin) {
      timerRef.current = setInterval(() => setElapsed((prev) => prev + 1), 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [joinInfo?.canJoin]);

  const formatTimer = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const peerName = joinInfo?.peer?.name || 'Consultation Peer';
  const selfName = joinInfo?.self?.name || 'You';
  const roleLabel = joinInfo?.role
    ? joinInfo.role.toString().toUpperCase()
    : 'PARTICIPANT';

  const handleEndCall = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <View style={styles.topBarLeft}>
          <TouchableOpacity style={styles.backBtn} onPress={handleEndCall}>
            <MaterialIcons name="arrow-back" size={20} color={Colors.white} />
          </TouchableOpacity>
          <View>
            <Text style={styles.topBarName}>{peerName}</Text>
            <Text style={styles.topBarSub}>
              {joinInfo?.roomId ? `Room: ${joinInfo.roomId}` : `Appointment #${appointmentId}`}
            </Text>
          </View>
        </View>

        <View style={styles.topBarRight}>
          {joinInfo?.canJoin && (
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
        ) : joinInfo ? (
          <View style={styles.centerBox}>
            <View style={styles.connectedAvatar}>
              <Text style={styles.avatarInitials}>{initials(peerName) || 'PR'}</Text>
            </View>
            <Text style={styles.connectedName}>{peerName}</Text>
            <Text style={styles.connectedSub}>
              Joined as {selfName} ({roleLabel})
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
                  name={joinInfo.canJoin ? 'check-circle' : 'lock-clock'}
                  size={16}
                  color={joinInfo.canJoin ? '#34d399' : '#fbbf24'}
                />
                <Text style={styles.infoLabel}>Status:</Text>
                <Text
                  style={[
                    styles.infoValue,
                    { color: joinInfo.canJoin ? '#34d399' : '#fbbf24' },
                  ]}
                >
                  {joinInfo.canJoin ? 'Room Open — Ready to Connect' : 'Outside Call Window'}
                </Text>
              </View>

              {!joinInfo.canJoin && (joinInfo.opensAt || joinInfo.closesAt) && (
                <View style={styles.windowNotice}>
                  <MaterialIcons name="info-outline" size={16} color="#fbbf24" />
                  <Text style={styles.windowNoticeText}>
                    Call window opens {formatDateTime(joinInfo.opensAt)} (10 min before start) and closes {formatDateTime(joinInfo.closesAt)} (30 min after end).
                  </Text>
                </View>
              )}
            </View>
          </View>
        ) : null}
      </View>

      {/* Self View (PiP) */}
      {joinInfo && (
        <View style={[styles.selfView, { bottom: 130 + insets.bottom }]}>
          {isVideoOff ? (
            <View style={styles.selfViewOff}>
              <MaterialIcons name="videocam-off" size={28} color="rgba(255,255,255,0.3)" />
              <Text style={styles.selfViewOffText}>Camera Off</Text>
            </View>
          ) : (
            <View style={styles.selfViewOn}>
              <Text style={styles.selfInitials}>{initials(selfName) || 'ME'}</Text>
            </View>
          )}
          <View style={styles.selfLabel}>
            <Text style={styles.selfLabelText} numberOfLines={1}>
              {selfName}
            </Text>
          </View>
          {isMuted && (
            <View style={styles.mutedBadge}>
              <MaterialIcons name="mic-off" size={14} color={Colors.white} />
            </View>
          )}
        </View>
      )}

      {/* Bottom Controls */}
      <View style={[styles.controlsContainer, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.controlBar}>
          <TouchableOpacity
            style={[styles.controlBtn, isMuted && styles.controlBtnDanger]}
            onPress={() => setIsMuted(!isMuted)}
          >
            <MaterialIcons
              name={isMuted ? 'mic-off' : 'mic'}
              size={24}
              color={isMuted ? '#fa746f' : Colors.white}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlBtn, isVideoOff && styles.controlBtnDanger]}
            onPress={() => setIsVideoOff(!isVideoOff)}
          >
            <MaterialIcons
              name={isVideoOff ? 'videocam-off' : 'videocam'}
              size={24}
              color={isVideoOff ? '#fa746f' : Colors.white}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlBtn} onPress={fetchJoinInfo}>
            <MaterialIcons name="refresh" size={22} color={Colors.white} />
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
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 18,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
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
    width: 110,
    height: 145,
    borderRadius: 18,
    backgroundColor: '#1a2428',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  selfViewOff: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  selfViewOffText: {
    fontSize: 10,
    fontFamily: 'Manrope_500Medium',
    color: 'rgba(255,255,255,0.35)',
    marginTop: 4,
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
    backgroundColor: 'rgba(0,0,0,0.55)',
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
  controlsContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  controlBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 8,
  },
  controlBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlBtnDanger: { backgroundColor: 'rgba(168,56,54,0.28)' },
  controlDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginHorizontal: 4,
  },
  endBtn: {
    width: 70,
    height: 54,
    borderRadius: 27,
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

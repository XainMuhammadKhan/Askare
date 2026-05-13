import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography } from '../../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = { navigation: NativeStackNavigationProp<any> };

export const VideoConsultationScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.container}>
      {/* Doctor background placeholder */}
      <View style={styles.bgPlaceholder}><MaterialIcons name="person" size={120} color={Colors.outlineVariant} /></View>
      {/* Overlay Info */}
      <View style={[styles.topInfo, { top: insets.top + 12 }]}>
        <View><Text style={styles.statusLabel}>IN CONSULTATION</Text><Text style={styles.doctorName}>Dr. Arsalan K.</Text><View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><View style={styles.liveDot} /><Text style={styles.timer}>08:42</Text></View></View>
        <TouchableOpacity style={styles.infoBtn}><MaterialIcons name="info-outline" size={22} color={Colors.onSurface} /></TouchableOpacity>
      </View>
      {/* Self View */}
      <View style={styles.selfView}><MaterialIcons name="person" size={40} color={Colors.outlineVariant} /><View style={styles.selfLabel}><MaterialIcons name="mic" size={12} color={Colors.white} /><Text style={styles.selfLabelText}>Live</Text></View></View>
      {/* Controls */}
      <View style={[styles.controls, { paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.controlBar}>
          <TouchableOpacity style={[styles.controlBtn, styles.controlBtnActive]}><MaterialIcons name="videocam" size={24} color={Colors.primary} /></TouchableOpacity>
          <TouchableOpacity style={styles.controlBtn}><MaterialIcons name="mic" size={24} color={Colors.onSurface} /></TouchableOpacity>
          <TouchableOpacity style={styles.controlBtn}><MaterialIcons name="chat-bubble-outline" size={24} color={Colors.onSurface} /><View style={styles.chatDot} /></TouchableOpacity>
          <TouchableOpacity style={styles.endBtn} onPress={() => navigation.goBack()}><MaterialIcons name="call-end" size={24} color={Colors.white} /></TouchableOpacity>
        </View>
        <View style={styles.statusRow}><MaterialIcons name="signal-cellular-alt" size={16} color={Colors.onSurfaceVariant} /><Text style={styles.statusText}>HD STABLE</Text></View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a2c30' },
  bgPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.surfaceContainerHigh },
  topInfo: { position: 'absolute', left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  statusLabel: { fontSize: 10, fontFamily: 'Manrope_700Bold', color: 'rgba(255,255,255,0.6)', letterSpacing: 2 },
  doctorName: { fontSize: 24, fontFamily: 'Manrope_700Bold', color: Colors.white, marginVertical: 4 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22c55e' },
  timer: { fontSize: 14, fontFamily: 'Manrope_500Medium', color: 'rgba(255,255,255,0.8)' },
  infoBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  selfView: { position: 'absolute', top: '30%', right: 20, width: 120, height: 160, borderRadius: 20, backgroundColor: Colors.surfaceContainerHigh, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)' },
  selfLabel: { position: 'absolute', bottom: 10, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,0,0,0.4)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  selfLabelText: { fontSize: 11, fontFamily: 'Manrope_500Medium', color: Colors.white },
  controls: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingTop: 16 },
  controlBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 40, paddingVertical: 14, paddingHorizontal: 20, marginBottom: 8 },
  controlBtn: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  controlBtnActive: { backgroundColor: `${Colors.primary}15` },
  endBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#c0392b', alignItems: 'center', justifyContent: 'center', marginLeft: 12 },
  chatDot: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.error },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 4, justifyContent: 'center' },
  statusText: { fontSize: 10, fontFamily: 'Manrope_700Bold', color: 'rgba(255,255,255,0.5)', letterSpacing: 1.5 },
});

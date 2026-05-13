import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography, BorderRadius } from '../../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = { navigation: NativeStackNavigationProp<any> };
interface Msg { id: string; text: string; isUser: boolean; time: string; isFile?: boolean; fileName?: string; fileSize?: string; }

const messages: Msg[] = [
  { id: '1', text: "Hello! I've reviewed your latest lab results. Everything looks stable, but I'd like to adjust your evening dosage slightly.", isUser: false, time: '10:42 AM' },
  { id: '2', text: "Thank you, Dr. Khan. Should I start the new dosage from tonight, or finish the current strip first?", isUser: true, time: '10:45 AM' },
  { id: '3', text: "You can start from tonight. I've sent the updated digital prescription to your portal. Have you been feeling any lightheadedness lately?", isUser: false, time: '09:15 AM' },
  { id: '4', text: '', isUser: false, time: '', isFile: true, fileName: 'Prescription_Update_Jan24.pdf', fileSize: '245 KB' },
  { id: '5', text: "Received it, thanks! No lightheadedness, but I noticed a bit of a metallic taste after the morning dose. Is that normal?", isUser: true, time: '09:22 AM' },
];

export const ClinicalChatScreen: React.FC<Props> = ({ navigation }) => {
  const [input, setInput] = useState('');
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}><MaterialIcons name="arrow-back" size={24} color={Colors.onSurface} /></TouchableOpacity>
        <View style={styles.headerAvatar}><MaterialIcons name="person" size={22} color={Colors.outlineVariant} /><View style={styles.onlineDot} /></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerName}>Dr. Ayesha Khan</Text>
          <Text style={styles.headerStatus}>ONLINE NOW</Text>
        </View>
        <TouchableOpacity><MaterialIcons name="videocam" size={24} color={Colors.onSurface} /></TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.dateBadge}><Text style={styles.dateBadgeText}>YESTERDAY</Text></View>
        {messages.slice(0, 2).map(m => m.isUser ? (
          <View key={m.id} style={styles.userRow}><View style={styles.userBubble}><Text style={styles.userText}>{m.text}</Text></View><Text style={styles.timestamp}>{m.time} ✓✓</Text></View>
        ) : (
          <View key={m.id} style={styles.aiRow}><View style={styles.aiBubble}><View style={styles.aiAccent} /><Text style={styles.aiText}>{m.text}</Text></View><Text style={styles.timestampLeft}>{m.time}</Text></View>
        ))}
        <View style={styles.dateBadge}><Text style={styles.dateBadgeText}>TODAY</Text></View>
        {messages.slice(2).map(m => m.isFile ? (
          <View key={m.id} style={styles.fileCard}>
            <MaterialIcons name="description" size={24} color={Colors.secondary} />
            <View style={{ flex: 1 }}><Text style={styles.fileName}>{m.fileName}</Text><Text style={styles.fileSize}>{m.fileSize} • PDF</Text></View>
            <TouchableOpacity><MaterialIcons name="download" size={22} color={Colors.onSurfaceVariant} /></TouchableOpacity>
          </View>
        ) : m.isUser ? (
          <View key={m.id} style={styles.userRow}><View style={styles.userBubble}><Text style={styles.userText}>{m.text}</Text></View><Text style={styles.timestamp}>{m.time} ✓</Text></View>
        ) : (
          <View key={m.id} style={styles.aiRow}><View style={styles.aiBubble}><View style={styles.aiAccent} /><Text style={styles.aiText}>{m.text}</Text></View><Text style={styles.timestampLeft}>{m.time}</Text></View>
        ))}
        <View style={styles.typing}><View style={styles.typingDots}><View style={styles.dot} /><View style={styles.dot} /><View style={styles.dot} /></View></View>
      </ScrollView>

      {/* Input */}
      <View style={[styles.inputRow, { paddingBottom: insets.bottom + 8 }]}>
        <TouchableOpacity><MaterialIcons name="add" size={28} color={Colors.primary} /></TouchableOpacity>
        <View style={styles.inputWrapper}>
          <TextInput style={styles.input} placeholder="Type your message..." placeholderTextColor={Colors.outlineVariant} value={input} onChangeText={setInput} />
          <TouchableOpacity><MaterialIcons name="mood" size={22} color={Colors.outlineVariant} /></TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.sendBtn}><MaterialIcons name="send" size={20} color={Colors.onPrimary} /></TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: Colors.surfaceContainerHighest },
  headerAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.surfaceContainerHigh, alignItems: 'center', justifyContent: 'center' },
  onlineDot: { position: 'absolute', bottom: 2, right: 2, width: 10, height: 10, borderRadius: 5, backgroundColor: '#22c55e', borderWidth: 2, borderColor: Colors.background },
  headerName: { fontSize: 16, fontFamily: 'Manrope_700Bold', color: Colors.onSurface },
  headerStatus: { fontSize: 10, fontFamily: 'Manrope_700Bold', color: '#22c55e', letterSpacing: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 20, paddingTop: 8 },
  dateBadge: { alignSelf: 'center', backgroundColor: Colors.surfaceContainerLow, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, marginVertical: 12 },
  dateBadgeText: { ...Typography.labelSmall, color: Colors.onSurfaceVariant, fontSize: 10 },
  userRow: { alignItems: 'flex-end', marginBottom: 12 },
  userBubble: { backgroundColor: Colors.primary, borderRadius: 20, borderBottomRightRadius: 4, padding: 16, maxWidth: '80%' },
  userText: { fontSize: 15, fontFamily: 'Manrope_400Regular', color: Colors.white, lineHeight: 22 },
  timestamp: { fontSize: 11, color: Colors.onSurfaceVariant, marginTop: 4 },
  aiRow: { alignItems: 'flex-start', marginBottom: 12 },
  aiBubble: { flexDirection: 'row', maxWidth: '85%' },
  aiAccent: { width: 3, backgroundColor: Colors.primary, borderRadius: 2, marginRight: 12 },
  aiText: { fontSize: 15, fontFamily: 'Manrope_400Regular', color: Colors.onSurface, lineHeight: 22, flex: 1 },
  timestampLeft: { fontSize: 11, color: Colors.onSurfaceVariant, marginTop: 4 },
  fileCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.surfaceContainerLowest, borderRadius: 14, padding: 14, marginBottom: 12, alignSelf: 'center', width: '80%', borderWidth: 1, borderColor: Colors.surfaceContainerHighest },
  fileName: { fontSize: 13, fontFamily: 'Manrope_600SemiBold', color: Colors.onSurface },
  fileSize: { fontSize: 11, color: Colors.onSurfaceVariant },
  typing: { alignItems: 'flex-start', marginTop: 8 },
  typingDots: { flexDirection: 'row', gap: 4, backgroundColor: Colors.surfaceContainerLow, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.onSurfaceVariant },
  inputRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingTop: 8, gap: 8, borderTopWidth: 1, borderTopColor: Colors.surfaceContainerHighest },
  inputWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceContainerLow, borderRadius: 24, paddingHorizontal: 16, gap: 8 },
  input: { flex: 1, height: 44, fontSize: 14, color: Colors.onSurface },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
});

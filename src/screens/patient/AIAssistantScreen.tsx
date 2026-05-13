import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography, BorderRadius, Spacing, Shadows } from '../../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';

type Props = { navigation: NativeStackNavigationProp<any> };

interface ChatMessage { id: string; text: string; isUser: boolean; time: string; chips?: string[]; }

const initialMessages: ChatMessage[] = [
  { id: '1', text: 'Describe your symptoms', isUser: false, time: 'Just Now', chips: [] },
  { id: '2', text: "I have a dull ache in my lower back that gets worse when I've been sitting for too long. It started about three days ago.", isUser: true, time: '2M Ago' },
  { id: '3', text: 'Understood. Based on your description, this could be related to postural strain or lumbar stiffness. Would you like to check for any radiating pain or numbness?', isUser: false, time: '', chips: ['Yes, in my legs', 'No other symptoms'] },
];

export const AIAssistantScreen: React.FC<Props> = ({ navigation }) => {
  const [messages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.headerLeft}>
          <MaterialIcons name="description" size={22} color={Colors.primary} />
          <Text style={styles.headerTitle}>AI Assistant</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
          <MaterialIcons name="notifications-none" size={22} color={Colors.secondary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Book Banner */}
        <LinearGradient colors={[Colors.primary, Colors.primaryDim]} style={styles.banner}>
          <View style={styles.bannerIcon}><MaterialIcons name="fact-check" size={24} color={Colors.white} /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>Need a clinical review?</Text>
            <Text style={styles.bannerSub}>Speak with a specialist today.</Text>
          </View>
          <TouchableOpacity style={styles.bannerBtn} onPress={() => navigation.navigate('FindSpecialist')}>
            <Text style={styles.bannerBtnText}>Book Now</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bannerClose}><MaterialIcons name="close" size={18} color="rgba(255,255,255,0.7)" /></TouchableOpacity>
        </LinearGradient>

        {/* Messages */}
        {messages.map(msg => (
          <View key={msg.id} style={msg.isUser ? styles.userMsg : styles.aiMsg}>
            {!msg.isUser && msg.text === 'Describe your symptoms' ? (
              <View style={styles.aiLabelMsg}>
                <Text style={styles.aiLabelText}>{msg.text}</Text>
                <Text style={styles.aiTimestamp}>CLINICAL AI  •  {msg.time}</Text>
              </View>
            ) : msg.isUser ? (
              <View>
                <View style={styles.userBubble}><Text style={styles.userBubbleText}>{msg.text}</Text></View>
                <Text style={styles.userTimestamp}>YOU  •  {msg.time}</Text>
              </View>
            ) : (
              <View>
                <View style={styles.aiBubble}>
                  <View style={styles.aiAccent} />
                  <Text style={styles.aiBubbleText}>{msg.text}</Text>
                </View>
                {msg.chips && msg.chips.length > 0 && (
                  <View style={styles.chipRow}>
                    {msg.chips.map((chip, i) => (
                      <TouchableOpacity key={i} style={styles.chip}><Text style={styles.chipText}>{chip}</Text></TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      {/* Input */}
      <View style={[styles.inputRow, { paddingBottom: insets.bottom + 8 }]}>
        <TouchableOpacity style={styles.attachBtn}><MaterialIcons name="add-circle" size={28} color={Colors.primary} /></TouchableOpacity>
        <View style={styles.inputWrapper}>
          <TextInput style={styles.input} placeholder="Type your message..." placeholderTextColor={Colors.outlineVariant} value={input} onChangeText={setInput} />
        </View>
        <TouchableOpacity style={styles.sendBtn}>
          <MaterialIcons name="send" size={20} color={Colors.onPrimary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 8 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { ...Typography.titleLarge, color: Colors.primary, fontSize: 20 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 20 },
  banner: { borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  bannerIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  bannerTitle: { fontSize: 14, fontFamily: 'Manrope_700Bold', color: Colors.white },
  bannerSub: { ...Typography.bodySmall, color: 'rgba(255,255,255,0.8)' },
  bannerBtn: { backgroundColor: Colors.white, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  bannerBtnText: { fontSize: 12, fontFamily: 'Manrope_700Bold', color: Colors.primary },
  bannerClose: { position: 'absolute', top: 10, right: 10 },
  userMsg: { alignItems: 'flex-end', marginBottom: 16 },
  aiMsg: { alignItems: 'flex-start', marginBottom: 16 },
  aiLabelMsg: { backgroundColor: Colors.surfaceContainerLow, borderRadius: 16, padding: 16, maxWidth: '75%' },
  aiLabelText: { fontSize: 16, fontFamily: 'Manrope_600SemiBold', color: Colors.onSurface },
  aiTimestamp: { ...Typography.labelSmall, color: Colors.onSurfaceVariant, marginTop: 8 },
  userBubble: { backgroundColor: Colors.primary, borderRadius: 20, borderBottomRightRadius: 4, padding: 16, maxWidth: 280 },
  userBubbleText: { ...Typography.bodyLarge, color: Colors.white, lineHeight: 22 },
  userTimestamp: { ...Typography.labelSmall, color: Colors.onSurfaceVariant, marginTop: 6, textAlign: 'right' },
  aiBubble: { flexDirection: 'row', maxWidth: 300 },
  aiAccent: { width: 3, backgroundColor: Colors.primary, borderRadius: 2, marginRight: 12 },
  aiBubbleText: { ...Typography.bodyLarge, color: Colors.onSurface, lineHeight: 24, flex: 1 },
  chipRow: { marginTop: 10, gap: 8 },
  chip: { backgroundColor: `${Colors.primary}12`, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
  chipText: { ...Typography.bodySmall, color: Colors.primary, fontFamily: 'Manrope_500Medium' },
  inputRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingTop: 8, gap: 8, backgroundColor: Colors.background, borderTopWidth: 1, borderTopColor: Colors.surfaceContainerHighest },
  attachBtn: {},
  inputWrapper: { flex: 1, backgroundColor: Colors.surfaceContainerLow, borderRadius: 24, paddingHorizontal: 16 },
  input: { height: 44, fontSize: 14, color: Colors.onSurface },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
});

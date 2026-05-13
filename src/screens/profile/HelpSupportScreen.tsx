import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography, Shadows } from '../../theme';
import { Header } from '../../components';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = { navigation: NativeStackNavigationProp<any> };

export const HelpSupportScreen: React.FC<Props> = ({ navigation }) => {
  const [search, setSearch] = useState('');
  const topics = [
    { icon: 'people', title: 'Account & Security', sub: 'Manage profile, passwords, privacy' },
    { icon: 'payment', title: 'Billing & Payments', sub: 'Invoices, payment methods, receipts' },
    { icon: 'videocam', title: 'Video Consultation', sub: 'Joining calls, audio/video setup' },
  ];
  const faqs = ['How do I reset my portal password?', 'Is this covered by insurance?', 'How to upload my lab results?'];
  return (
    <View style={styles.container}>
      <Header title="Help & Support" showBack onBack={() => navigation.goBack()} showNotification={false} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.searchBox}><MaterialIcons name="search" size={20} color={Colors.outlineVariant} /><TextInput style={styles.searchInput} placeholder="Search for articles, topics, or issues..." placeholderTextColor={Colors.outlineVariant} value={search} onChangeText={setSearch} /></View>
        <Text style={styles.sectionTitle}>Browse Topics</Text>
        {topics.map((t, i) => (
          <TouchableOpacity key={i} style={styles.topicRow} activeOpacity={0.7}>
            <View style={styles.topicIcon}><MaterialIcons name={t.icon as any} size={22} color={Colors.primary} /></View>
            <View style={{ flex: 1 }}><Text style={styles.topicTitle}>{t.title}</Text><Text style={styles.topicSub}>{t.sub}</Text></View>
            <MaterialIcons name="chevron-right" size={22} color={Colors.outlineVariant} />
          </TouchableOpacity>
        ))}
        <View style={styles.faqHeader}><Text style={styles.sectionTitle}>Frequently Asked Questions</Text><TouchableOpacity><Text style={styles.viewAll}>View All</Text></TouchableOpacity></View>
        <View style={styles.faqCard}>
          {faqs.map((q, i) => (
            <TouchableOpacity key={i} style={styles.faqRow}>
              <Text style={styles.faqText}>{q}</Text>
              <MaterialIcons name="add" size={22} color={Colors.outlineVariant} />
            </TouchableOpacity>
          ))}
        </View>
        {/* Still need help */}
        <View style={styles.helpBanner}>
          <View style={styles.helpIcon}><MaterialIcons name="headset-mic" size={32} color={Colors.primary} /></View>
          <Text style={styles.helpTitle}>Still need help?</Text>
          <Text style={styles.helpSub}>Our dedicated care team is available to assist you 24/7.</Text>
          <TouchableOpacity style={styles.liveChatBtn}><MaterialIcons name="chat" size={18} color={Colors.onPrimary} /><Text style={styles.liveChatText}>Live Chat</Text></TouchableOpacity>
          <TouchableOpacity style={styles.messageBtn}><MaterialIcons name="email" size={18} color={Colors.primary} /><Text style={styles.messageText}>Send a Message</Text></TouchableOpacity>
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: 16, paddingBottom: 40 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceContainerLow, borderRadius: 14, paddingHorizontal: 14, gap: 8, marginBottom: 20 },
  searchInput: { flex: 1, height: 48, fontSize: 14, color: Colors.onSurface },
  sectionTitle: { fontSize: 20, fontFamily: 'Manrope_600SemiBold', color: Colors.onSurface, marginBottom: 14 },
  topicRow: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: Colors.surfaceContainerLowest, borderRadius: 16, padding: 16, marginBottom: 8, ...Shadows.subtle },
  topicIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: `${Colors.primary}12`, alignItems: 'center', justifyContent: 'center' },
  topicTitle: { fontSize: 15, fontFamily: 'Manrope_600SemiBold', color: Colors.onSurface },
  topicSub: { ...Typography.bodySmall, color: Colors.onSurfaceVariant, marginTop: 2 },
  faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 },
  viewAll: { fontSize: 13, fontFamily: 'Manrope_600SemiBold', color: Colors.primary },
  faqCard: { backgroundColor: Colors.surfaceContainerLowest, borderRadius: 16, overflow: 'hidden', ...Shadows.subtle },
  faqRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: Colors.surfaceContainerHighest },
  faqText: { ...Typography.bodyMedium, color: Colors.onSurface, flex: 1, marginRight: 8 },
  helpBanner: { backgroundColor: Colors.surfaceContainerLow, borderRadius: 24, padding: 28, alignItems: 'center', marginTop: 24 },
  helpIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: `${Colors.primary}12`, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  helpTitle: { fontSize: 20, fontFamily: 'Manrope_700Bold', color: Colors.onSurface, marginBottom: 4 },
  helpSub: { ...Typography.bodyMedium, color: Colors.onSurfaceVariant, textAlign: 'center', marginBottom: 20, lineHeight: 20 },
  liveChatBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.primary, borderRadius: 20, paddingHorizontal: 32, paddingVertical: 14, width: '100%', justifyContent: 'center', marginBottom: 10 },
  liveChatText: { fontSize: 14, fontFamily: 'Manrope_700Bold', color: Colors.onPrimary },
  messageBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: Colors.onSurface, borderRadius: 20, paddingHorizontal: 32, paddingVertical: 14, width: '100%', justifyContent: 'center' },
  messageText: { fontSize: 14, fontFamily: 'Manrope_700Bold', color: Colors.primary },
});

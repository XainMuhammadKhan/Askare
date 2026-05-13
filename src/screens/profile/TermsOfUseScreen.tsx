import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Colors, Typography } from '../../theme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = { navigation: NativeStackNavigationProp<any> };

const sections = [
  { title: '1. Acceptance of Terms', body: 'By accessing and using the Askare application, you agree to be bound by these Terms of Use and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using this service.' },
  { title: '2. User Responsibilities', body: 'You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to use the service only for lawful purposes and in accordance with these terms.' },
  { title: '3. Intellectual Property', body: 'All content, features, and functionality within the Askare platform, including but not limited to text, graphics, logos, and software, are the exclusive property of Askare and are protected by intellectual property laws.' },
  { title: '4. Limitation of Liability', body: 'Askare and its affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service, or any content obtained through the service.' },
];

export const TermsOfUseScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.brandHeader}><Text style={styles.brand}>Askare</Text></View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Terms of Use</Text>
        <Text style={styles.date}>Effective Date: October 2023</Text>
        {sections.map((s, i) => (
          <View key={i} style={styles.section}>
            <Text style={styles.sectionTitle}>{s.title}</Text>
            <View style={styles.sectionBody}><View style={styles.accent} /><Text style={styles.bodyText}>{s.body}</Text></View>
          </View>
        ))}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  brandHeader: { alignItems: 'center', paddingTop: 60, paddingBottom: 8 },
  brand: { fontSize: 22, fontFamily: 'Manrope_700Bold', color: Colors.primary },
  content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  title: { fontSize: 34, fontFamily: 'Manrope_700Bold', color: Colors.primary, marginBottom: 4 },
  date: { ...Typography.bodyMedium, color: Colors.onSurfaceVariant, marginBottom: 28 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontFamily: 'Manrope_700Bold', color: Colors.onSurface, marginBottom: 12 },
  sectionBody: { flexDirection: 'row' },
  accent: { width: 3, backgroundColor: Colors.surfaceContainerHighest, borderRadius: 2, marginRight: 16 },
  bodyText: { ...Typography.bodyLarge, color: Colors.onSurfaceVariant, lineHeight: 26, flex: 1 },
});

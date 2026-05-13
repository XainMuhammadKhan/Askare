import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Colors, Typography } from '../../theme';
import { Header } from '../../components';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = { navigation: NativeStackNavigationProp<any> };

const sections = [
  { title: '1. Data Collection', body: 'We gather only the essential information required to curate your clinical experience. This includes basic identifying data and voluntary health history to ensure a personalized and secure service environment.' },
  { title: '2. Purpose of Use', body: 'Your digital footprint within Clinical Zen is utilized strictly for optimizing your care pathways. We maintain a profound respect for the confidentiality of your clinical narrative and do not engage in unauthorized third-party distributions.' },
  { title: '3. Security Architecture', body: "We employ robust, state-of-the-art encryption protocols to safeguard your records. Our infrastructure operates on a 'Sterile-Warm' philosophy—impenetrable to external threats while remaining seamlessly accessible to you and your designated medical proxies." },
  { title: '4. Your Rights', body: 'You retain total sovereignty over your health data. At any point, you may request access to, modification of, or complete deletion of your records from our active databases.' },
];

export const PrivacyPolicyScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.brandHeader}><Text style={styles.brand}>Askare</Text></View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Privacy Policy</Text>
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

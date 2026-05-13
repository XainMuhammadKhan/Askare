import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography, Shadows } from '../../theme';
import { Header, PrimaryButton } from '../../components';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = { navigation: NativeStackNavigationProp<any> };

export const EmailSubscriptionScreen: React.FC<Props> = ({ navigation }) => {
  const [appointmentReminders, setAppointmentReminders] = useState(true);
  const [labResults, setLabResults] = useState(true);
  const [newsletter, setNewsletter] = useState(false);
  const [productUpdates, setProductUpdates] = useState(false);
  return (
    <View style={styles.container}>
      <Header title="Email Subscription" showBack onBack={() => navigation.goBack()} showNotification={false} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>Stay informed.</Text>
        <Text style={styles.subtitle}>Manage the communications you receive from Askare to ensure you only get what matters most to your health journey.</Text>
        <Text style={styles.sectionLabel}>CLINICAL UPDATES</Text>
        <View style={styles.card}>
          <View style={styles.item}>
            <View style={styles.itemIcon}><MaterialIcons name="event" size={20} color={Colors.secondary} /></View>
            <View style={{ flex: 1 }}><Text style={styles.itemTitle}>Appointment Reminders</Text><Text style={styles.itemSub}>Get notified before your scheduled visits and follow-ups. Highly recommended.</Text></View>
            <Switch value={appointmentReminders} onValueChange={setAppointmentReminders} trackColor={{ false: Colors.surfaceContainerHighest, true: Colors.primary }} thumbColor={Colors.white} />
          </View>
          <View style={styles.item}>
            <View style={styles.itemIcon}><MaterialIcons name="science" size={20} color={Colors.secondary} /></View>
            <View style={{ flex: 1 }}><Text style={styles.itemTitle}>Lab Results Available</Text><Text style={styles.itemSub}>Receive an alert when new test results are ready to view in your portal.</Text></View>
            <Switch value={labResults} onValueChange={setLabResults} trackColor={{ false: Colors.surfaceContainerHighest, true: Colors.primary }} thumbColor={Colors.white} />
          </View>
        </View>
        <Text style={styles.sectionLabel}>NEWS & INSIGHTS</Text>
        <View style={styles.card}>
          <View style={styles.item}>
            <View style={styles.itemIcon}><MaterialIcons name="article" size={20} color={Colors.secondary} /></View>
            <View style={{ flex: 1 }}><Text style={styles.itemTitle}>Medical Newsletter</Text><Text style={styles.itemSub}>Weekly insights on wellness, preventative care, and health trends curated by our clinical team.</Text></View>
            <Switch value={newsletter} onValueChange={setNewsletter} trackColor={{ false: Colors.surfaceContainerHighest, true: Colors.primary }} thumbColor={Colors.white} />
          </View>
          <View style={styles.item}>
            <View style={styles.itemIcon}><MaterialIcons name="flash-on" size={20} color={Colors.secondary} /></View>
            <View style={{ flex: 1 }}><Text style={styles.itemTitle}>Product Updates</Text><Text style={styles.itemSub}>Occasional emails about new features, app improvements, and service expansions.</Text></View>
            <Switch value={productUpdates} onValueChange={setProductUpdates} trackColor={{ false: Colors.surfaceContainerHighest, true: Colors.primary }} thumbColor={Colors.white} />
          </View>
        </View>
        <PrimaryButton title="Save Preferences" onPress={() => navigation.goBack()} style={{ marginTop: 24 }} />
        <Text style={styles.disclaimer}>By updating these settings, you agree to our Privacy Policy. Essential account alerts cannot be disabled.</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: 16, paddingBottom: 40 },
  heading: { fontSize: 28, fontFamily: 'Manrope_700Bold', color: Colors.onSurface, marginBottom: 8, paddingHorizontal: 4 },
  subtitle: { ...Typography.bodyLarge, color: Colors.onSurfaceVariant, lineHeight: 24, marginBottom: 24, paddingHorizontal: 4 },
  sectionLabel: { fontSize: 11, fontFamily: 'Manrope_700Bold', color: Colors.onSurfaceVariant, letterSpacing: 1.5, marginBottom: 10, paddingHorizontal: 4, marginTop: 16 },
  card: { backgroundColor: Colors.surfaceContainerLowest, borderRadius: 20, overflow: 'hidden', ...Shadows.subtle },
  item: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, paddingHorizontal: 18, paddingVertical: 18 },
  itemIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surfaceContainerLow, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  itemTitle: { fontSize: 16, fontFamily: 'Manrope_600SemiBold', color: Colors.onSurface, marginBottom: 4 },
  itemSub: { ...Typography.bodySmall, color: Colors.onSurfaceVariant, lineHeight: 18 },
  disclaimer: { ...Typography.bodySmall, color: Colors.onSurfaceVariant, textAlign: 'center', marginTop: 16, lineHeight: 18 },
});

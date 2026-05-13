import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography } from '../../theme';
import { Header, PrimaryButton } from '../../components';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = { navigation: NativeStackNavigationProp<any>; route: any };

export const PaymentSuccessScreen: React.FC<Props> = ({ navigation, route }) => {
  const doctor = route?.params?.doctor;
  return (
    <View style={styles.container}>
      <Header title="Payment Details" showBack onBack={() => navigation.goBack()} onNotification={() => navigation.navigate('Notifications')} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Success Icon */}
        <View style={styles.iconCircle}><MaterialIcons name="check" size={40} color={Colors.onPrimary} /></View>
        <Text style={styles.title}>Payment Successful!</Text>
        <Text style={styles.subtitle}>Your appointment has been confirmed. A receipt has been sent to your email.</Text>
        {/* Transaction Details */}
        <View style={styles.detailsCard}>
          <View style={styles.detailHeader}><Text style={styles.detailHeaderLabel}>TRANSACTION DETAILS</Text><View style={styles.verifiedBadge}><View style={styles.verifiedDot} /><Text style={styles.verifiedText}>VERIFIED</Text></View></View>
          {[
            { label: 'DOCTOR', value: doctor?.name || 'Dr. Sarah Mansoor', icon: 'medical-services' },
            { label: 'DATE & TIME', value: 'Oct 24, 2023 • 10:30 AM', icon: 'event' },
            { label: 'AMOUNT PAID', value: 'PKR 5,000', icon: 'payment' },
          ].map((d, i) => (
            <View key={i} style={styles.detailRow}>
              <View style={styles.detailIcon}><MaterialIcons name={d.icon as any} size={18} color={Colors.primary} /></View>
              <View><Text style={styles.detailLabel}>{d.label}</Text><Text style={styles.detailValue}>{d.value}</Text></View>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.metaRow}><Text style={styles.metaLabel}>Transaction ID</Text><Text style={styles.metaValue}>#ASK-8829-XPL</Text></View>
          <View style={styles.metaRow}><Text style={styles.metaLabel}>Payment Method</Text><Text style={styles.metaValue}>Mastercard (**** 4242)</Text></View>
        </View>
        {/* Doctor Placeholder Image */}
        <View style={styles.imagePlaceholder}><MaterialIcons name="person" size={48} color={Colors.outlineVariant} /></View>
        <PrimaryButton title="Continue" onPress={() => navigation.navigate('PatientTabs')} icon={<MaterialIcons name="arrow-forward" size={20} color={Colors.onPrimary} />} style={{ marginTop: 20 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: 16, paddingBottom: 100, alignItems: 'center' },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', marginVertical: 24, borderWidth: 6, borderColor: `${Colors.primary}30` },
  title: { fontSize: 28, fontFamily: 'Manrope_700Bold', color: Colors.onSurface, marginBottom: 8 },
  subtitle: { ...Typography.bodyLarge, color: Colors.onSurfaceVariant, textAlign: 'center', lineHeight: 24, marginBottom: 24, paddingHorizontal: 16 },
  detailsCard: { backgroundColor: Colors.surfaceContainerLowest, borderRadius: 20, padding: 20, width: '100%', borderWidth: 1, borderColor: Colors.surfaceContainerHighest },
  detailHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  detailHeaderLabel: { ...Typography.labelMedium, color: Colors.onSurfaceVariant },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  verifiedDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary },
  verifiedText: { fontSize: 10, fontFamily: 'Manrope_700Bold', color: Colors.primary, letterSpacing: 0.5 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 },
  detailIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: `${Colors.primary}10`, alignItems: 'center', justifyContent: 'center' },
  detailLabel: { fontSize: 10, fontFamily: 'Manrope_700Bold', color: Colors.primary, letterSpacing: 0.5, marginBottom: 2 },
  detailValue: { fontSize: 16, fontFamily: 'Manrope_600SemiBold', color: Colors.onSurface },
  divider: { height: 1, backgroundColor: Colors.surfaceContainerHighest, marginVertical: 12 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  metaLabel: { ...Typography.bodySmall, color: Colors.onSurfaceVariant },
  metaValue: { ...Typography.bodySmall, color: Colors.onSurface, fontFamily: 'Manrope_500Medium' },
  imagePlaceholder: { width: '100%', height: 120, backgroundColor: Colors.surfaceContainerHigh, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 20 },
});

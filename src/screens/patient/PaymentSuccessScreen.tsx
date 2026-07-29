import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography } from '../../theme';
import { Header, PrimaryButton, SecondaryButton } from '../../components';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = { navigation: NativeStackNavigationProp<any>; route: any };

export const PaymentSuccessScreen: React.FC<Props> = ({ navigation, route }) => {
  const doctor = route?.params?.doctor;
  const bookDate = route?.params?.date || 'Oct 24, 2026';
  const bookTime = route?.params?.time || '10:00 AM';
  const fee = doctor?.fee || 'PKR 5,000';
  const doctorName = doctor?.name || 'Dr. Sarah Mansoor';
  const doctorSpec = doctor?.specialty || 'Specialist';

  // Generate transaction ID from booking data (matching web formula)
  const txSeed = `${doctorName}-${bookDate}-${bookTime}`
    .split('')
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const txId = `#ASK-${String(100000 + (txSeed % 900000)).padStart(6, '0')}`;

  return (
    <View style={styles.container}>
      <Header title="Payment Confirmation" showBack onBack={() => navigation.goBack()} onNotification={() => navigation.navigate('Notifications')} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Success Icon */}
        <View style={styles.iconOuter}>
          <View style={styles.iconCircle}>
            <MaterialIcons name="check" size={40} color={Colors.onPrimary} />
          </View>
        </View>
        <Text style={styles.title}>Payment Successful</Text>
        <Text style={styles.subtitle}>
          Your appointment has been confirmed. A detailed summary has been sent to your registered email.
        </Text>

        {/* Confirmation Card */}
        <View style={styles.detailsCard}>
          {/* Watermark */}
          <View style={styles.watermark}>
            <MaterialIcons name="verified" size={100} color={Colors.outlineVariant} style={{ opacity: 0.06 }} />
          </View>

          {/* Doctor Details */}
          <View style={styles.detailSection}>
            <Text style={styles.detailLabel}>DOCTOR DETAILS</Text>
            <View style={styles.doctorRow}>
              <View style={styles.doctorAvatar}>
                <MaterialIcons name="person" size={22} color={Colors.outlineVariant} />
              </View>
              <View>
                <Text style={styles.doctorName}>{doctorName}</Text>
                <Text style={styles.doctorSpec}>{doctorSpec}</Text>
              </View>
            </View>
          </View>

          {/* Schedule */}
          <View style={styles.detailSection}>
            <Text style={styles.detailLabel}>SCHEDULE</Text>
            <View style={styles.scheduleRow}>
              <MaterialIcons name="calendar-today" size={18} color={Colors.secondary} />
              <Text style={styles.scheduleText}>{bookDate}</Text>
              <Text style={styles.scheduleDot}>•</Text>
              <Text style={styles.scheduleText}>{bookTime}</Text>
            </View>
          </View>

          {/* Service Type */}
          <View style={styles.detailSection}>
            <Text style={styles.detailLabel}>SERVICE TYPE</Text>
            <View style={styles.scheduleRow}>
              <MaterialIcons name="videocam" size={18} color={Colors.secondary} />
              <Text style={styles.scheduleText}>Video Consultation</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Payment Method */}
          <View style={styles.detailSection}>
            <Text style={styles.detailLabel}>PAYMENT METHOD</Text>
            <View style={styles.paymentMethodRow}>
              <View style={styles.paymentMethodLeft}>
                <MaterialIcons name="credit-card" size={18} color={Colors.primary} />
                <Text style={styles.paymentMethodText}>Debit Card **** 4242</Text>
              </View>
              <View style={styles.paymentPulse} />
            </View>
          </View>

          {/* Transaction Details */}
          <View style={styles.detailSection}>
            <Text style={styles.detailLabel}>TRANSACTION DETAILS</Text>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Transaction ID</Text>
              <Text style={styles.metaValue}>{txId}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Amount Paid</Text>
              <Text style={styles.amountPaid}>{fee}</Text>
            </View>
          </View>

          {/* Info Note */}
          <View style={styles.infoNote}>
            <MaterialIcons name="info" size={16} color={Colors.tertiary} />
            <Text style={styles.infoNoteText}>
              A receipt has been saved to your clinical vault.
            </Text>
          </View>
        </View>

        {/* Actions */}
        <PrimaryButton
          title="Go to Dashboard"
          onPress={() => navigation.navigate('PatientTabs')}
          style={{ marginTop: 20 }}
        />
        <TouchableOpacity style={styles.downloadBtn} activeOpacity={0.7}>
          <MaterialIcons name="download" size={20} color={Colors.primary} />
          <Text style={styles.downloadText}>Download Receipt</Text>
        </TouchableOpacity>

        {/* Support */}
        <View style={styles.supportRow}>
          <Text style={styles.supportText}>Need help with your appointment? </Text>
          <TouchableOpacity>
            <Text style={styles.supportLink}>Contact Support</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: 16, paddingBottom: 100, alignItems: 'center' },
  iconOuter: { marginVertical: 24 },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 6, borderColor: `${Colors.primary}30` },
  title: { fontSize: 28, fontFamily: 'Manrope_700Bold', color: Colors.onSurface, marginBottom: 8 },
  subtitle: { ...Typography.bodyLarge, color: Colors.onSurfaceVariant, textAlign: 'center', lineHeight: 24, marginBottom: 24, paddingHorizontal: 16 },
  detailsCard: { backgroundColor: Colors.surfaceContainerLowest, borderRadius: 20, padding: 24, width: '100%', borderWidth: 1, borderColor: Colors.surfaceContainerHighest, overflow: 'hidden' },
  watermark: { position: 'absolute', top: 10, right: 10 },
  detailSection: { marginBottom: 20 },
  detailLabel: { fontSize: 10, fontFamily: 'Manrope_700Bold', color: Colors.primary, letterSpacing: 1.5, marginBottom: 10 },
  doctorRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  doctorAvatar: { width: 44, height: 44, borderRadius: 12, backgroundColor: Colors.surfaceContainerHigh, alignItems: 'center', justifyContent: 'center' },
  doctorName: { fontSize: 17, fontFamily: 'Manrope_600SemiBold', color: Colors.onSurface },
  doctorSpec: { fontSize: 13, fontFamily: 'Manrope_500Medium', color: Colors.secondary, marginTop: 2 },
  scheduleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  scheduleText: { fontSize: 15, fontFamily: 'Manrope_500Medium', color: Colors.onSurface },
  scheduleDot: { color: Colors.outlineVariant },
  divider: { height: 1, backgroundColor: Colors.surfaceContainerHighest, marginVertical: 16 },
  paymentMethodRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.surfaceContainerLow, borderRadius: 12, padding: 14 },
  paymentMethodLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  paymentMethodText: { fontSize: 14, fontFamily: 'Manrope_500Medium', color: Colors.onSurface },
  paymentPulse: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  metaLabel: { ...Typography.bodySmall, color: Colors.onSurfaceVariant },
  metaValue: { fontSize: 13, fontFamily: 'Manrope_500Medium', color: Colors.onSurface },
  amountPaid: { fontSize: 18, fontFamily: 'Manrope_700Bold', color: Colors.primary },
  infoNote: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: `${Colors.tertiary}10`, borderRadius: 12, padding: 14 },
  infoNoteText: { fontSize: 12, fontFamily: 'Manrope_500Medium', color: Colors.onSurface, flex: 1 },
  downloadBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.surfaceContainerHigh, borderRadius: 16, paddingVertical: 16, width: '100%', marginTop: 12 },
  downloadText: { fontSize: 16, fontFamily: 'Manrope_600SemiBold', color: Colors.primary },
  supportRow: { flexDirection: 'row', alignItems: 'center', marginTop: 24, flexWrap: 'wrap', justifyContent: 'center' },
  supportText: { fontSize: 13, fontFamily: 'Manrope_500Medium', color: Colors.secondary },
  supportLink: { fontSize: 13, fontFamily: 'Manrope_600SemiBold', color: Colors.primary, textDecorationLine: 'underline' },
});

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography, BorderRadius } from '../../theme';
import { Header, InputField, PrimaryButton } from '../../components';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = { navigation: NativeStackNavigationProp<any>; route: any };

export const PaymentDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const doctor = route?.params?.doctor;
  const bookDate = route?.params?.date || 'Oct 24, 2026';
  const bookTime = route?.params?.time || '10:00 AM';
  const fee = doctor?.fee || 'PKR 5,000';

  const [cardName, setCardName] = useState('');
  const [cardNum, setCardNum] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [method, setMethod] = useState<'card' | 'crypto' | null>(null);
  const [payError, setPayError] = useState('');

  // Format card number with spaces
  const handleCardNum = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, 16);
    const formatted = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNum(formatted);
  };

  // Format expiry as MM/YY
  const handleExpiry = (text: string) => {
    let digits = text.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 2) {
      let mm = parseInt(digits.slice(0, 2), 10);
      if (mm > 12) digits = '12' + digits.slice(2);
      if (mm === 0 && digits.length >= 2) digits = '01' + digits.slice(2);
      setExpiry(digits.slice(0, 2) + '/' + digits.slice(2));
    } else {
      setExpiry(digits);
    }
  };

  // CVV: max 3 digits
  const handleCvv = (text: string) => {
    setCvv(text.replace(/\D/g, '').slice(0, 3));
  };

  // Name: letters only
  const handleName = (text: string) => {
    setCardName(text.replace(/[^a-zA-Z\s\-'.]/g, ''));
  };

  const handlePay = () => {
    setPayError('');
    if (!method) {
      setPayError('Please select a payment method.');
      return;
    }
    if (method === 'card') {
      if (!cardName.trim()) { setPayError('Please enter cardholder name.'); return; }
      if (/[0-9]/.test(cardName)) { setPayError('Cardholder name cannot contain numbers.'); return; }
      const rawCard = cardNum.replace(/\s/g, '');
      if (!rawCard || rawCard.length < 16) { setPayError('Please enter a valid 16-digit card number.'); return; }
      if (!expiry || expiry.length < 5) { setPayError('Please enter expiry date (MM/YY).'); return; }
      if (!cvv || cvv.length < 3) { setPayError('Please enter a 3-digit CVV.'); return; }
    }
    navigation.navigate('PaymentSuccess', { doctor, date: bookDate, time: bookTime });
  };

  return (
    <View style={styles.container}>
      <Header title="Payment Details" showBack onBack={() => navigation.goBack()} onNotification={() => navigation.navigate('Notifications')} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Booking Summary */}
        <View style={styles.bookingSummary}>
          <View style={styles.bookingRow}>
            <View style={styles.bookingAvatar}>
              <MaterialIcons name="person" size={24} color={Colors.outlineVariant} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.bookingTitle}>Video Consultation</Text>
              <Text style={styles.bookingDoctor}>
                {doctor?.name || 'Dr. Ayesha Khan'} • {doctor?.specialty || 'Specialist'}
              </Text>
              <View style={styles.bookingDateRow}>
                <View style={styles.bookingPulse} />
                <Text style={styles.bookingDateText}>
                  {bookDate.toUpperCase()} AT {bookTime}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Fee Display */}
        <View style={styles.feeSection}>
          <Text style={styles.feeLabel}>Consultation Fee</Text>
          <Text style={styles.feeAmount}>{fee}</Text>
        </View>

        <Text style={styles.methodTitle}>Select Payment Method</Text>

        {/* SSL Badge */}
        <View style={styles.sslBadge}>
          <MaterialIcons name="lock" size={14} color={Colors.secondary} />
          <Text style={styles.sslText}>SSL ENCRYPTED</Text>
        </View>

        {/* Card Option */}
        <TouchableOpacity
          style={[styles.methodCard, method === 'card' && styles.methodCardActive]}
          onPress={() => setMethod('card')}
          activeOpacity={0.8}
        >
          <View style={styles.methodHeader}>
            <View style={[styles.radio, method === 'card' && styles.radioActive]}>
              {method === 'card' && <View style={styles.radioInner} />}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.methodLabel}>Debit / Credit Card</Text>
              <Text style={styles.methodSub}>Securely pay with Visa, Mastercard, or UnionPay</Text>
            </View>
            <MaterialIcons name="credit-card" size={22} color={Colors.primary} />
          </View>
          {method === 'card' && (
            <View style={styles.cardForm}>
              <InputField label="Cardholder Name" placeholder="Enter name as on card" value={cardName} onChangeText={handleName} />
              <InputField label="Card Number" placeholder="0000 0000 0000 0000" value={cardNum} onChangeText={handleCardNum} keyboardType="numeric" />
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <InputField label="Expiry Date" placeholder="MM/YY" value={expiry} onChangeText={handleExpiry} keyboardType="numeric" />
                </View>
                <View style={{ flex: 1 }}>
                  <InputField label="CVV" placeholder="123" value={cvv} onChangeText={handleCvv} secureTextEntry keyboardType="numeric" />
                </View>
              </View>
            </View>
          )}
        </TouchableOpacity>

        {/* Crypto Option */}
        <TouchableOpacity
          style={[styles.methodCard, method === 'crypto' && styles.methodCardActive]}
          onPress={() => setMethod('crypto')}
          activeOpacity={0.8}
        >
          <View style={styles.methodHeader}>
            <View style={[styles.radio, method === 'crypto' && styles.radioActive]}>
              {method === 'crypto' && <View style={styles.radioInner} />}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.methodLabel}>Cryptocurrency</Text>
              <Text style={styles.methodSub}>Pay with BTC, ETH, or USDT</Text>
            </View>
            <MaterialIcons name="currency-bitcoin" size={22} color={Colors.onSurfaceVariant} />
          </View>
          {method === 'crypto' && (
            <View style={styles.cryptoSection}>
              {/* QR Placeholder */}
              <View style={styles.qrPlaceholder}>
                <MaterialIcons name="qr-code-2" size={64} color={Colors.outlineVariant} />
                <Text style={styles.qrLabel}>SCAN QR TO PAY</Text>
              </View>
              {/* Wallet Address */}
              <View style={styles.walletRow}>
                <Text style={styles.walletLabel}>Wallet Address</Text>
                <View style={styles.walletInput}>
                  <Text style={styles.walletAddress} numberOfLines={1}>
                    bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh
                  </Text>
                  <TouchableOpacity>
                    <MaterialIcons name="content-copy" size={18} color={Colors.primary} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.walletWarning}>
                  Only send BTC to this address. Sending other coins may result in permanent loss.
                </Text>
              </View>
            </View>
          )}
        </TouchableOpacity>

        {/* Summary */}
        <View style={styles.summarySection}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Consultation Fee</Text>
            <Text style={styles.summaryValue}>{fee}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Service Charge</Text>
            <Text style={styles.summaryValue}>PKR 0.00</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>VAT (Clinical)</Text>
            <Text style={styles.summaryValue}>Included</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Amount Payable</Text>
            <Text style={styles.totalAmount}>{fee}</Text>
          </View>
        </View>

        {/* Error */}
        {payError ? (
          <View style={styles.errorBox}>
            <MaterialIcons name="error" size={18} color={Colors.error} />
            <Text style={styles.errorText}>{payError}</Text>
          </View>
        ) : null}

        <PrimaryButton
          title="Confirm & Pay Securely"
          onPress={handlePay}
          icon={<MaterialIcons name="verified" size={20} color={Colors.onPrimary} />}
          style={{ marginTop: 8 }}
        />

        {/* HIPAA Badge */}
        <View style={styles.hipaaRow}>
          <MaterialIcons name="verified-user" size={22} color={Colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.hipaaTitle}>HIPAA Compliant</Text>
            <Text style={styles.hipaaSub}>Your data and financial information are protected by world-class encryption.</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: 16, paddingBottom: 100 },
  bookingSummary: { backgroundColor: Colors.surfaceContainerLow, borderRadius: 16, padding: 16, marginBottom: 16 },
  bookingRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bookingAvatar: { width: 48, height: 48, borderRadius: 12, backgroundColor: Colors.surfaceContainerHigh, alignItems: 'center', justifyContent: 'center' },
  bookingTitle: { fontSize: 16, fontFamily: 'Manrope_600SemiBold', color: Colors.onSurface },
  bookingDoctor: { fontSize: 13, fontFamily: 'Manrope_500Medium', color: Colors.secondary, marginTop: 2 },
  bookingDateRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  bookingPulse: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary },
  bookingDateText: { fontSize: 10, fontFamily: 'Manrope_700Bold', color: Colors.primary, letterSpacing: 1 },
  feeSection: { alignItems: 'center', paddingVertical: 16, marginBottom: 16 },
  feeLabel: { ...Typography.bodyMedium, color: Colors.onSurfaceVariant },
  feeAmount: { fontSize: 36, fontFamily: 'Manrope_800ExtraBold', color: Colors.onSurface, marginVertical: 4 },
  methodTitle: { fontSize: 18, fontFamily: 'Manrope_600SemiBold', color: Colors.onSurface, marginBottom: 8 },
  sslBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-end', backgroundColor: Colors.surfaceContainer, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginBottom: 12 },
  sslText: { fontSize: 9, fontFamily: 'Manrope_700Bold', color: Colors.secondary, letterSpacing: 1 },
  methodCard: { borderWidth: 1, borderColor: Colors.surfaceContainerHighest, borderRadius: 16, padding: 16, marginBottom: 12 },
  methodCardActive: { borderColor: Colors.primary, borderWidth: 2 },
  methodHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: Colors.outlineVariant, alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: Colors.primary },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.primary },
  methodLabel: { fontSize: 15, fontFamily: 'Manrope_600SemiBold', color: Colors.onSurface },
  methodSub: { fontSize: 12, fontFamily: 'Manrope_500Medium', color: Colors.secondary, marginTop: 2 },
  cardForm: { marginTop: 16, borderTopWidth: 1, borderTopColor: Colors.surfaceContainerHighest, paddingTop: 16 },
  cryptoSection: { marginTop: 16, borderTopWidth: 1, borderTopColor: Colors.surfaceContainerHighest, paddingTop: 16 },
  qrPlaceholder: { alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.surfaceContainerLow, borderRadius: 12, padding: 24, marginBottom: 16, borderWidth: 1, borderStyle: 'dashed', borderColor: Colors.outlineVariant },
  qrLabel: { fontSize: 10, fontFamily: 'Manrope_700Bold', color: Colors.onSurfaceVariant, letterSpacing: 1.5, marginTop: 8 },
  walletRow: { marginTop: 4 },
  walletLabel: { fontSize: 10, fontFamily: 'Manrope_700Bold', color: Colors.onSurfaceVariant, letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' },
  walletInput: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceContainerLowest, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: Colors.surfaceContainerHighest, gap: 8 },
  walletAddress: { flex: 1, fontSize: 12, fontFamily: 'Manrope_500Medium', color: Colors.onSurface },
  walletWarning: { fontSize: 10, fontFamily: 'Manrope_500Medium', color: Colors.onSurfaceVariant, marginTop: 8, lineHeight: 16 },
  summarySection: { backgroundColor: Colors.surfaceContainerLow, borderRadius: 16, padding: 18, marginVertical: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  summaryLabel: { ...Typography.bodyMedium, color: Colors.onSurfaceVariant },
  summaryValue: { ...Typography.bodyMedium, color: Colors.onSurface },
  summaryDivider: { height: 1, backgroundColor: Colors.surfaceContainerHighest, marginVertical: 10 },
  totalLabel: { fontSize: 16, fontFamily: 'Manrope_700Bold', color: Colors.onSurface },
  totalAmount: { fontSize: 22, fontFamily: 'Manrope_800ExtraBold', color: Colors.primary },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fef2f2', borderWidth: 1, borderColor: `${Colors.error}30`, borderRadius: 12, padding: 14, marginBottom: 8 },
  errorText: { fontSize: 13, fontFamily: 'Manrope_500Medium', color: Colors.error, flex: 1 },
  hipaaRow: { flexDirection: 'row', gap: 12, backgroundColor: Colors.surfaceContainerHigh, borderRadius: 12, padding: 16, marginTop: 16 },
  hipaaTitle: { fontSize: 13, fontFamily: 'Manrope_700Bold', color: Colors.onSurface, marginBottom: 4 },
  hipaaSub: { fontSize: 12, fontFamily: 'Manrope_500Medium', color: Colors.onSurfaceVariant, lineHeight: 18 },
});

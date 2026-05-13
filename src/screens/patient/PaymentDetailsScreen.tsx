import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography, BorderRadius } from '../../theme';
import { Header, InputField, PrimaryButton } from '../../components';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = { navigation: NativeStackNavigationProp<any>; route: any };

export const PaymentDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const doctor = route?.params?.doctor;
  const [cardName, setCardName] = useState('');
  const [cardNum, setCardNum] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [method, setMethod] = useState<'card' | 'crypto'>('card');
  return (
    <View style={styles.container}>
      <Header title="Payment Details" showBack onBack={() => navigation.goBack()} onNotification={() => navigation.navigate('Notifications')} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.feeSection}>
          <Text style={styles.feeLabel}>Consultation Fee</Text>
          <Text style={styles.feeAmount}>PKR 5,000</Text>
          <Text style={styles.feeDoctor}>{doctor?.name || 'Dr. Ayesha Khan'}</Text>
        </View>
        <Text style={styles.methodTitle}>Select Payment Method</Text>
        {/* Card Option */}
        <TouchableOpacity style={[styles.methodCard, method === 'card' && styles.methodCardActive]} onPress={() => setMethod('card')}>
          <View style={styles.methodHeader}>
            <View style={[styles.radio, method === 'card' && styles.radioActive]}>{method === 'card' && <View style={styles.radioInner} />}</View>
            <Text style={styles.methodLabel}>Debit/Credit Card</Text>
            <MaterialIcons name="credit-card" size={20} color={Colors.primary} />
          </View>
          {method === 'card' && (
            <View style={styles.cardForm}>
              <InputField label="Cardholder Name" placeholder="John Doe" value={cardName} onChangeText={setCardName} />
              <InputField label="Card Number" placeholder="0000 0000 0000 0000" value={cardNum} onChangeText={setCardNum} keyboardType="numeric" />
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}><InputField label="Expiry Date" placeholder="MM/YY" value={expiry} onChangeText={setExpiry} /></View>
                <View style={{ flex: 1 }}><InputField label="CVV" placeholder="***" value={cvv} onChangeText={setCvv} secureTextEntry /></View>
              </View>
            </View>
          )}
        </TouchableOpacity>
        {/* Crypto Option */}
        <TouchableOpacity style={[styles.methodCard, method === 'crypto' && styles.methodCardActive]} onPress={() => setMethod('crypto')}>
          <View style={styles.methodHeader}>
            <View style={[styles.radio, method === 'crypto' && styles.radioActive]}>{method === 'crypto' && <View style={styles.radioInner} />}</View>
            <Text style={styles.methodLabel}>Cryptocurrency</Text>
            <MaterialIcons name="currency-bitcoin" size={20} color={Colors.onSurfaceVariant} />
          </View>
        </TouchableOpacity>
        {/* Total */}
        <View style={styles.totalRow}><Text style={styles.totalLabel}>Total Amount</Text><Text style={styles.totalAmount}>PKR 5,000</Text></View>
        <PrimaryButton title="Confirm Payment" onPress={() => navigation.navigate('PaymentSuccess', { doctor })} icon={<MaterialIcons name="verified" size={20} color={Colors.onPrimary} />} style={{ marginTop: 8 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: 16, paddingBottom: 100 },
  feeSection: { alignItems: 'center', paddingVertical: 20, marginBottom: 20 },
  feeLabel: { ...Typography.bodyMedium, color: Colors.onSurfaceVariant },
  feeAmount: { fontSize: 36, fontFamily: 'Manrope_800ExtraBold', color: Colors.onSurface, marginVertical: 4 },
  feeDoctor: { ...Typography.bodyMedium, color: Colors.onSurfaceVariant },
  methodTitle: { fontSize: 18, fontFamily: 'Manrope_600SemiBold', color: Colors.onSurface, marginBottom: 16 },
  methodCard: { borderWidth: 1, borderColor: Colors.surfaceContainerHighest, borderRadius: 16, padding: 16, marginBottom: 12 },
  methodCardActive: { borderColor: Colors.primary, borderWidth: 2 },
  methodHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: Colors.outlineVariant, alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: Colors.primary },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.primary },
  methodLabel: { flex: 1, fontSize: 15, fontFamily: 'Manrope_600SemiBold', color: Colors.onSurface },
  cardForm: { marginTop: 16, borderTopWidth: 1, borderTopColor: Colors.surfaceContainerHighest, paddingTop: 16 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: Colors.surfaceContainerHighest, paddingTop: 16, marginVertical: 12 },
  totalLabel: { ...Typography.bodyLarge, color: Colors.onSurfaceVariant },
  totalAmount: { fontSize: 28, fontFamily: 'Manrope_800ExtraBold', color: Colors.onSurface },
});

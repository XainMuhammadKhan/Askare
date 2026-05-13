import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography } from '../../theme';
import { Header, InputField, PrimaryButton } from '../../components';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = { navigation: NativeStackNavigationProp<any> };

export const UpdatePasswordScreen: React.FC<Props> = ({ navigation }) => {
  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const has8 = newPw.length >= 8;
  const hasUpperNum = /[A-Z]/.test(newPw) && /[0-9]/.test(newPw);
  return (
    <View style={styles.container}>
      <Header title="Update Password" showBack onBack={() => navigation.goBack()} showNotification={false} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>Security</Text>
        <Text style={styles.subtitle}>Please enter your current password to create a new one. This ensures your account remains secure.</Text>
        <InputField label="PREVIOUS PASSWORD" placeholder="••••••••" value={oldPw} onChangeText={setOldPw} secureTextEntry />
        <InputField label="NEW PASSWORD" placeholder="••••••••" value={newPw} onChangeText={setNewPw} secureTextEntry />
        <View style={styles.rules}>
          <View style={styles.ruleRow}><MaterialIcons name={has8 ? 'check-circle' : 'radio-button-unchecked'} size={18} color={has8 ? Colors.primary : Colors.outlineVariant} /><Text style={[styles.ruleText, has8 && styles.ruleTextOk]}>At least 8 characters</Text></View>
          <View style={styles.ruleRow}><MaterialIcons name={hasUpperNum ? 'check-circle' : 'radio-button-unchecked'} size={18} color={hasUpperNum ? Colors.primary : Colors.outlineVariant} /><Text style={[styles.ruleText, hasUpperNum && styles.ruleTextOk]}>One uppercase letter & number</Text></View>
        </View>
        <PrimaryButton title="Save Changes" onPress={() => navigation.goBack()} style={{ marginTop: 24 }} />
        <Text style={styles.forgotLink}>FORGOT PREVIOUS PASSWORD?</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40 },
  heading: { fontSize: 28, fontFamily: 'Manrope_700Bold', color: Colors.onSurface, marginBottom: 8 },
  subtitle: { ...Typography.bodyLarge, color: Colors.onSurfaceVariant, lineHeight: 24, marginBottom: 28 },
  rules: { gap: 10 },
  ruleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ruleText: { ...Typography.bodyMedium, color: Colors.onSurfaceVariant },
  ruleTextOk: { color: Colors.primary },
  forgotLink: { textAlign: 'center', marginTop: 20, fontSize: 12, fontFamily: 'Manrope_700Bold', color: Colors.primary, letterSpacing: 1.5 },
});

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography } from '../../theme';
import { Header, InputField, PrimaryButton } from '../../components';
import { useAuthStore } from '../../store';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = { navigation: NativeStackNavigationProp<any> };

export const PatientInfoScreen: React.FC<Props> = ({ navigation }) => {
  const user = useAuthStore(s => s.user);
  const [name, setName] = useState(user?.name || 'Sarah Jenkins');
  const [email, setEmail] = useState(user?.email || 'sarah.j@example.com');
  const [phone, setPhone] = useState(user?.phone || '+1 (555) 123-4567');
  const [dob, setDob] = useState('04/15/1988');
  const [gender, setGender] = useState('Female');
  const [address, setAddress] = useState('1240 Serenity Lane, Apt 4B\nPortland, OR 97204');
  return (
    <View style={styles.container}>
      <Header title="Personal Information" showBack onBack={() => navigation.goBack()} showNotification={false} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.avatarSection}>
          <View style={styles.avatar}><MaterialIcons name="person" size={48} color={Colors.outlineVariant} /><View style={styles.editBadge}><MaterialIcons name="edit" size={14} color={Colors.onPrimary} /></View></View>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.subtitle}>Review and update your clinical profile details.</Text>
        </View>
        <View style={styles.section}><Text style={styles.sectionTitle}>Basic Details</Text>
          <InputField label="FULL NAME" value={name} onChangeText={setName} />
          <InputField label="EMAIL ADDRESS" value={email} onChangeText={setEmail} keyboardType="email-address" />
          <InputField label="PHONE NUMBER" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        </View>
        <View style={styles.section}><Text style={styles.sectionTitle}>Demographics</Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}><InputField label="DATE OF BIRTH" value={dob} onChangeText={setDob} /></View>
            <View style={{ flex: 1 }}><InputField label="GENDER" value={gender} onChangeText={setGender} /></View>
          </View>
          <InputField label="RESIDENTIAL ADDRESS" value={address} onChangeText={setAddress} multiline numberOfLines={2} />
        </View>
        <PrimaryButton title="Save Changes" onPress={() => navigation.goBack()} icon={<MaterialIcons name="check" size={20} color={Colors.onPrimary} />} />
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: 16, paddingBottom: 40 },
  avatarSection: { alignItems: 'center', paddingVertical: 20 },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: Colors.surfaceContainerHigh, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  editBadge: { position: 'absolute', bottom: 2, right: 2, width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: Colors.background },
  name: { fontSize: 22, fontFamily: 'Manrope_700Bold', color: Colors.primary, marginBottom: 4 },
  subtitle: { ...Typography.bodyMedium, color: Colors.onSurfaceVariant, textAlign: 'center' },
  section: { backgroundColor: Colors.surfaceContainerLowest, borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: Colors.surfaceContainerHighest },
  sectionTitle: { fontSize: 16, fontFamily: 'Manrope_600SemiBold', color: Colors.primary, marginBottom: 16 },
});

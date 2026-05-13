import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography } from '../../theme';
import { Header, InputField, PrimaryButton } from '../../components';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = { navigation: NativeStackNavigationProp<any> };

export const DoctorInfoScreen: React.FC<Props> = ({ navigation }) => {
  const [name, setName] = useState('Dr. Sarah Jenkins');
  const [email, setEmail] = useState('sarah.jenkins@clinicalzen.com');
  const [phone, setPhone] = useState('+1 (555) 019-2834');
  const [specialty, setSpecialty] = useState('Cardiology');
  const [experience, setExperience] = useState('12');
  const [licenseId, setLicenseId] = useState('MED-99201-XYZ');
  const [hospital, setHospital] = useState('Zenith Memorial Medical Center');
  const [bio, setBio] = useState('Board-certified cardiologist with over 12 years of experience specializing in preventative cardiovascular medicine and advanced lipidology.');
  return (
    <View style={styles.container}>
      <Header title="Personal Information" showBack onBack={() => navigation.goBack()} showNotification={false} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.avatarSection}>
          <View style={styles.avatar}><MaterialIcons name="person" size={48} color={Colors.outlineVariant} /><View style={styles.editBadge}><MaterialIcons name="edit" size={14} color={Colors.onPrimary} /></View></View>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.subtitle}>Cardiology Specialist</Text>
        </View>
        <View style={styles.section}><Text style={styles.sectionTitle}>Basic Details</Text>
          <InputField label="FULL NAME" value={name} onChangeText={setName} />
          <InputField label="EMAIL ADDRESS" value={email} onChangeText={setEmail} keyboardType="email-address" />
          <InputField label="PHONE NUMBER" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        </View>
        <View style={styles.section}><Text style={styles.sectionTitle}>Clinical Profile</Text>
          <InputField label="MEDICAL SPECIALTY" value={specialty} onChangeText={setSpecialty} />
          <InputField label="YEARS OF EXPERIENCE" value={experience} onChangeText={setExperience} keyboardType="numeric" />
          <InputField label="CLINICAL ID / LICENSE" value={licenseId} onChangeText={setLicenseId} />
          <InputField label="HOSPITAL / CLINIC NAME" value={hospital} onChangeText={setHospital} />
        </View>
        <View style={styles.section}><Text style={styles.sectionTitle}>Biography</Text>
          <InputField label="PROFESSIONAL BIO" value={bio} onChangeText={setBio} multiline numberOfLines={4} />
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
  name: { fontSize: 18, fontFamily: 'Manrope_600SemiBold', color: Colors.primary, marginBottom: 2 },
  subtitle: { ...Typography.bodyMedium, color: Colors.onSurfaceVariant },
  section: { backgroundColor: Colors.surfaceContainerLowest, borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: Colors.surfaceContainerHighest },
  sectionTitle: { fontSize: 16, fontFamily: 'Manrope_600SemiBold', color: Colors.primary, marginBottom: 16 },
});

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography } from '../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Patient Screens
import { DashboardScreen } from '../screens/patient/DashboardScreen';
import { AIAssistantScreen } from '../screens/patient/AIAssistantScreen';
import { AppointmentsScreen } from '../screens/patient/AppointmentsScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';

// Stack Screens
import { FindSpecialistScreen } from '../screens/patient/FindSpecialistScreen';
import { BookAppointmentScreen } from '../screens/patient/BookAppointmentScreen';
import { AppointmentStatusScreen } from '../screens/patient/AppointmentStatusScreen';
import { ClinicalChatScreen } from '../screens/patient/ClinicalChatScreen';
import { ClinicalArchiveScreen } from '../screens/patient/ClinicalArchiveScreen';
import { NotificationsScreen } from '../screens/patient/NotificationsScreen';
import { PaymentDetailsScreen } from '../screens/patient/PaymentDetailsScreen';
import { PaymentSuccessScreen } from '../screens/patient/PaymentSuccessScreen';
import { VideoConsultationScreen } from '../screens/patient/VideoConsultationScreen';
import { ConsultationSummaryScreen } from '../screens/patient/ConsultationSummaryScreen';
import { DoctorProfileScreen } from '../screens/profile/DoctorProfileScreen';
import { PatientInfoScreen } from '../screens/patient/PatientInfoScreen';
import { SettingsScreen } from '../screens/profile/SettingsScreen';
import { UpdatePasswordScreen } from '../screens/profile/UpdatePasswordScreen';
import { EmailSubscriptionScreen } from '../screens/profile/EmailSubscriptionScreen';
import { HelpSupportScreen } from '../screens/profile/HelpSupportScreen';
import { PrivacyPolicyScreen } from '../screens/profile/PrivacyPolicyScreen';
import { TermsOfUseScreen } from '../screens/profile/TermsOfUseScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const tabIcons: Record<string, string> = {
  Home: 'home',
  Assistant: 'smart-toy',
  Appointments: 'event',
  Profile: 'person',
};

const PatientTabs = () => {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => (
          <View style={[styles.tabIcon, focused && styles.tabIconActive]}>
            <MaterialIcons name={tabIcons[route.name] as any} size={24} color={focused ? Colors.primary : Colors.onSurfaceVariant} />
          </View>
        ),
        tabBarLabel: ({ focused }) => (
          <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{route.name}</Text>
        ),
        tabBarStyle: [
          styles.tabBar,
          { paddingBottom: insets.bottom + 24, height: 78 + insets.bottom },
        ],
      })}
    >
      <Tab.Screen name="Home" component={DashboardScreen} />
      <Tab.Screen name="Assistant" component={AIAssistantScreen} />
      <Tab.Screen name="Appointments" component={AppointmentsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export const PatientNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
    <Stack.Screen name="PatientTabs" component={PatientTabs} />
    <Stack.Screen name="FindSpecialist" component={FindSpecialistScreen} />
    <Stack.Screen name="BookAppointment" component={BookAppointmentScreen} />
    <Stack.Screen name="AppointmentStatus" component={AppointmentStatusScreen} />
    <Stack.Screen name="ClinicalChat" component={ClinicalChatScreen} />
    <Stack.Screen name="ClinicalArchive" component={ClinicalArchiveScreen} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} />
    <Stack.Screen name="PaymentDetails" component={PaymentDetailsScreen} />
    <Stack.Screen name="PaymentSuccess" component={PaymentSuccessScreen} />
    <Stack.Screen name="VideoConsultation" component={VideoConsultationScreen} options={{ animation: 'fade' }} />
    <Stack.Screen name="ConsultationSummary" component={ConsultationSummaryScreen} options={{ animation: 'slide_from_bottom' }} />
    <Stack.Screen name="DoctorProfile" component={DoctorProfileScreen} />
    <Stack.Screen name="PatientInfo" component={PatientInfoScreen} />
    <Stack.Screen name="Settings" component={SettingsScreen} />
    <Stack.Screen name="UpdatePassword" component={UpdatePasswordScreen} />
    <Stack.Screen name="EmailSubscription" component={EmailSubscriptionScreen} />
    <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
    <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
    <Stack.Screen name="TermsOfUse" component={TermsOfUseScreen} />
  </Stack.Navigator>
);

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderTopWidth: 0,
    height: 85,
    paddingTop: 8,
    paddingBottom: 20,
    shadowColor: 'rgba(0,0,0,0.05)',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 8,
  },
  tabIcon: {
    width: 48,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconActive: {
    backgroundColor: `${Colors.primary}12`,
  },
  tabLabel: {
    fontSize: 11,
    fontFamily: 'Manrope_500Medium',
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  tabLabelActive: {
    color: Colors.primary,
    fontFamily: 'Manrope_700Bold',
  },
});

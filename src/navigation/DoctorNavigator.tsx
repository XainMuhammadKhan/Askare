import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Doctor Screens
import { DoctorDashboardScreen } from '../screens/doctor/DoctorDashboardScreen';
import { PatientRecordsScreen } from '../screens/doctor/PatientRecordsScreen';
import { AppointmentsScreen } from '../screens/patient/AppointmentsScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { DoctorAppointmentScreen } from '../screens/doctor/DoctorAppointmentScreen';
import { PatientDetailScreen } from '../screens/doctor/PatientDetailScreen';
import { VideoConsultationScreen } from '../screens/patient/VideoConsultationScreen';

// Doctor Extra Screens
import { ScheduleScreen } from '../screens/doctor/extras/ScheduleScreen';
import { DoctorCalendarScreen } from '../screens/doctor/extras/DoctorCalendarScreen';
import { EarningsScreen } from '../screens/doctor/extras/EarningsScreen';
import { DoctorReviewsScreen } from '../screens/doctor/extras/DoctorReviewsScreen';
import { DoctorDocumentsScreen } from '../screens/doctor/extras/DoctorDocumentsScreen';

// Shared Stack Screens
import { NotificationsScreen } from '../screens/patient/NotificationsScreen';
import { DoctorInfoScreen } from '../screens/profile/DoctorInfoScreen';
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
  Records: 'folder-shared',
  Appointments: 'event',
  Profile: 'person',
};

const DoctorTabs = () => {
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
      <Tab.Screen name="Home" component={DoctorDashboardScreen} />
      <Tab.Screen name="Records" component={PatientRecordsScreen} />
      <Tab.Screen name="Appointments" component={AppointmentsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export const DoctorNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
    <Stack.Screen name="DoctorTabs" component={DoctorTabs} />
    <Stack.Screen name="DoctorAppointment" component={DoctorAppointmentScreen} />
    <Stack.Screen name="PatientDetail" component={PatientDetailScreen} />
    <Stack.Screen name="VideoConsultation" component={VideoConsultationScreen} options={{ animation: 'fade' }} />
    <Stack.Screen name="Schedule" component={ScheduleScreen} />
    <Stack.Screen name="DoctorCalendar" component={DoctorCalendarScreen} />
    <Stack.Screen name="Earnings" component={EarningsScreen} />
    <Stack.Screen name="DoctorReviews" component={DoctorReviewsScreen} />
    <Stack.Screen name="DoctorDocuments" component={DoctorDocumentsScreen} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} />
    <Stack.Screen name="DoctorInfo" component={DoctorInfoScreen} />
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

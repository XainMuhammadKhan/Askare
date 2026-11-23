import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../theme';
import { useAuthStore } from '../store/authStore';

// Hospital Admin Screens
import { HospitalDashboardScreen } from '../screens/admin/hospital/HospitalDashboardScreen';
import { HospitalDoctorsScreen } from '../screens/admin/hospital/HospitalDoctorsScreen';
import { HospitalAppointmentsScreen } from '../screens/admin/hospital/HospitalAppointmentsScreen';
import { HospitalMoreScreen } from '../screens/admin/hospital/HospitalMoreScreen';

// Super Admin Screens
import { SuperDashboardScreen } from '../screens/admin/super/SuperDashboardScreen';
import { SuperHospitalsScreen } from '../screens/admin/super/SuperHospitalsScreen';
import { SuperDoctorsScreen } from '../screens/admin/super/SuperDoctorsScreen';
import { SuperMoreScreen } from '../screens/admin/super/SuperMoreScreen';

// Shared Notifications Screen
import { NotificationsScreen } from '../screens/patient/NotificationsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const tabIcons: Record<string, keyof typeof MaterialIcons.glyphMap> = {
  Dashboard: 'dashboard',
  Hospitals: 'local-hospital',
  Doctors: 'medical-services',
  Appointments: 'event-note',
  More: 'tune',
};

const HospitalAdminTabs = () => {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => (
          <View style={[styles.tabIcon, focused && styles.tabIconActive]}>
            <MaterialIcons
              name={tabIcons[route.name] ?? 'circle'}
              size={24}
              color={focused ? Colors.primary : Colors.onSurfaceVariant}
            />
          </View>
        ),
        tabBarLabel: ({ focused }) => (
          <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
            {route.name}
          </Text>
        ),
        tabBarStyle: [
          styles.tabBar,
          { paddingBottom: insets.bottom + 24, height: 78 + insets.bottom },
        ],
      })}
    >
      <Tab.Screen name="Dashboard" component={HospitalDashboardScreen} />
      <Tab.Screen name="Doctors" component={HospitalDoctorsScreen} />
      <Tab.Screen name="Appointments" component={HospitalAppointmentsScreen} />
      <Tab.Screen name="More" component={HospitalMoreScreen} />
    </Tab.Navigator>
  );
};

const SuperAdminTabs = () => {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => (
          <View style={[styles.tabIcon, focused && styles.tabIconActive]}>
            <MaterialIcons
              name={tabIcons[route.name] ?? 'circle'}
              size={24}
              color={focused ? Colors.primary : Colors.onSurfaceVariant}
            />
          </View>
        ),
        tabBarLabel: ({ focused }) => (
          <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
            {route.name}
          </Text>
        ),
        tabBarStyle: [
          styles.tabBar,
          { paddingBottom: insets.bottom + 24, height: 78 + insets.bottom },
        ],
      })}
    >
      <Tab.Screen name="Dashboard" component={SuperDashboardScreen} />
      <Tab.Screen name="Hospitals" component={SuperHospitalsScreen} />
      <Tab.Screen name="Doctors" component={SuperDoctorsScreen} />
      <Tab.Screen name="More" component={SuperMoreScreen} />
    </Tab.Navigator>
  );
};

export const AdminNavigator = () => {
  const userType = useAuthStore((s) => s.user?.type);
  const userHospital = useAuthStore((s) => s.user?.hospital);

  const isHospitalAdmin =
    userType === 'HOSPITAL_ADMIN' || (Boolean(userHospital) && userType !== 'SUPER_ADMIN');

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen
        name="AdminTabs"
        component={isHospitalAdmin ? HospitalAdminTabs : SuperAdminTabs}
      />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
    </Stack.Navigator>
  );
};

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

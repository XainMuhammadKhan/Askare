import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { useAuthStore, useThemeStore } from '../store';
import { AuthNavigator } from './AuthNavigator';
import { PatientNavigator } from './PatientNavigator';
import { DoctorNavigator } from './DoctorNavigator';
import { AdminNavigator } from './AdminNavigator';

/** Picks the navigator for the signed-in role. */
const RoleNavigator = () => {
  const role = useAuthStore((s) => s.role);
  if (role === 'doctor') return <DoctorNavigator />;
  if (role === 'admin') return <AdminNavigator />;
  return <PatientNavigator />;
};

export const AppNavigator = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { isDark, colors, version } = useThemeStore();

  const navTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      primary: colors.primary,
      background: colors.background,
      card: colors.surfaceContainerLowest,
      text: colors.onSurface,
      border: colors.surfaceContainerHigh,
      notification: colors.error,
    },
  };

  return (
    <NavigationContainer key={`theme-${version}`} theme={navTheme}>
      {isAuthenticated ? <RoleNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Image, StyleSheet, Appearance } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as ExpoSplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';
import { AppNavigator } from './src/navigation/AppNavigator';
import { useAuthStore, useThemeStore } from './src/store';

// Keep native splash visible only until the root component mounts
ExpoSplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  const isAuthHydrated = useAuthStore((s) => s.isHydrated);
  const hydrateAuth = useAuthStore((s) => s.hydrate);
  const isDark = useThemeStore((s) => s.isDark);
  const colors = useThemeStore((s) => s.colors);
  const hydrateTheme = useThemeStore((s) => s.hydrate);
  const syncSystemScheme = useThemeStore((s) => s.syncSystemScheme);

  useEffect(() => {
    ExpoSplashScreen.hideAsync().catch(() => {});
    hydrateAuth();
    hydrateTheme();
  }, [hydrateAuth, hydrateTheme]);

  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      syncSystemScheme(colorScheme);
    });
    return () => sub.remove();
  }, [syncSystemScheme]);

  if (!fontsLoaded || !isAuthHydrated) {
    return (
      <View style={styles.splashFallback}>
        <StatusBar style="dark" translucent backgroundColor="transparent" />
        <Image
          source={require('./assets/Images/splash.png')}
          style={styles.splashImage}
          resizeMode="cover"
        />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <AppNavigator />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splashFallback: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  splashImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
});

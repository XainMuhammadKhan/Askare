import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Image, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });
  if (!fontsLoaded) {
    return (
      <SafeAreaProvider>
        <View style={styles.splashContainer}>
          <Image
            source={require('./assets/Images/splash1.png')}
            style={styles.splashTop}
            resizeMode="contain"
          />
          <Image
            source={require('./assets/Images/splash2.png')}
            style={styles.splashBottom}
            resizeMode="contain"
          />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1 }}>
        <StatusBar style="dark" />
        <AppNavigator />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 40,
  },
  splashTop: {
    width: '60%',
    height: 200,
    marginTop: 20,
  },
  splashBottom: {
    width: '60%',
    height: 150,
    marginBottom: 20,
  },
});

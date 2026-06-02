import React, { useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export const SplashScreen: React.FC<Props> = ({ navigation }) => {
  useEffect(() => {
    const t = setTimeout(() => navigation.replace('Onboarding'), 1400);
    return () => clearTimeout(t);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image
        source={require('../../../assets/Images/splash.png')}
        style={styles.image}
        resizeMode="cover"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  image: {
    flex: 1,
    width: undefined,
    height: undefined,
  },
});

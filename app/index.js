import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { View, ActivityIndicator, Image, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function StartPage() {
  const router = useRouter();

  useEffect(() => {
    const verificarLogin = async () => {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      try {
        const token = await AsyncStorage.getItem('@user_token');
        if (token) {
          router.replace('/lista');
        } else {
          router.replace('/login');
        }
      } catch (e) {
        router.replace('/login');
      }
    };

    verificarLogin();
  }, []);

  return (
    <View style={styles.container}>
      <Image source={require('../assets/images/icon.png')} style={styles.logo} />
      <ActivityIndicator size="large" color="#fff" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#145a8d'
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
    marginBottom: 20
  }
});
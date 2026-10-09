import { Stack } from 'expo-router';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';

export default function AppLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#145a8d" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#f4f6f8' },
          animation: 'slide_from_right', 
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="cadastro" />
        <Stack.Screen name="esqueci-senha" />
        <Stack.Screen name="lista" />
        <Stack.Screen name="rop" />
        <Stack.Screen name="pagina2" />
        <Stack.Screen name="pagina3" />
        <Stack.Screen name="detalheRop" />
        <Stack.Screen name="finalizado" />
      </Stack>
    </SafeAreaProvider>
  );
}
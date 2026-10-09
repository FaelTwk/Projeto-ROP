import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function FinalizadoScreen() {
  const router = useRouter();

  const handleVoltarInicio = () => {
    router.replace('/lista'); 
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <MaterialCommunityIcons 
          name="check-circle" 
          size={120} 
          color="#28a745"
        />
        
        <Text style={styles.title}>ROP FINALIZADO COM SUCESSO</Text>
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={handleVoltarInicio}
        >
          <Text style={styles.buttonText}>VOLTAR PARA O INÍCIO</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#145a8d',
    marginVertical: 30,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#145a8d',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
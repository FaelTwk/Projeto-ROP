import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function EsqueciSenhaScreen() {
  const router = useRouter();
  
  const [etapa, setEtapa] = useState('buscar'); 
  const [usuario, setUsuario] = useState('');
  const [usuarioEncontrado, setUsuarioEncontrado] = useState(null);
  const [novaSenha, setNovaSenha] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleBuscar = async () => {
    setIsLoading(true);
    // Simulação de busca
    setTimeout(async () => {
      const usuariosSalvos = await AsyncStorage.getItem('@usuarios');
      const lista = usuariosSalvos ? JSON.parse(usuariosSalvos) : [];
      const user = lista.find(u => u.usuario === usuario);
      
      setIsLoading(false);
      if (user) {
        setUsuarioEncontrado(user);
        setEtapa('redefinir');
      } else {
        Alert.alert('Erro', 'Usuário não encontrado.');
      }
    }, 1000);
  };

  const handleSalvar = async () => {
    if(!novaSenha) return Alert.alert('Erro', 'Digite a nova senha');
    
    setIsLoading(true);
    const usuariosSalvos = await AsyncStorage.getItem('@usuarios');
    let lista = usuariosSalvos ? JSON.parse(usuariosSalvos) : [];
    
    // Atualiza a senha
    lista = lista.map(u => u.usuario === usuario ? {...u, senha: novaSenha} : u);
    await AsyncStorage.setItem('@usuarios', JSON.stringify(lista));
    
    setIsLoading(false);
    Alert.alert('Sucesso', 'Senha alterada!');
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
         <TouchableOpacity onPress={() => router.back()}>
            <MaterialCommunityIcons name="arrow-left" size={28} color="#145a8d" />
         </TouchableOpacity>
         <Text style={styles.title}>Recuperar Senha</Text>
      </View>

      <View style={styles.card}>
        {etapa === 'buscar' ? (
          <>
            <Text style={styles.label}>Digite seu usuário</Text>
            <TextInput style={styles.input} value={usuario} onChangeText={setUsuario} autoCapitalize="none"/>
            <TouchableOpacity style={styles.btn} onPress={handleBuscar} disabled={isLoading}>
               {isLoading ? <ActivityIndicator color="#fff"/> : <Text style={styles.btnText}>BUSCAR</Text>}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.text}>Usuário encontrado: <Text style={{fontWeight:'bold'}}>{usuarioEncontrado.nome}</Text></Text>
            <Text style={styles.label}>Nova Senha</Text>
            <TextInput style={styles.input} value={novaSenha} onChangeText={setNovaSenha} secureTextEntry/>
            <TouchableOpacity style={styles.btn} onPress={handleSalvar} disabled={isLoading}>
               {isLoading ? <ActivityIndicator color="#fff"/> : <Text style={styles.btnText}>SALVAR NOVA SENHA</Text>}
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f8', padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 30 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#145a8d', marginLeft: 10 },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 10, elevation: 2 },
  label: { fontWeight: 'bold', color: '#333', marginBottom: 5, marginTop: 10 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16 },
  btn: { backgroundColor: '#145a8d', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  btnText: { color: '#fff', fontWeight: 'bold' },
  text: { fontSize: 16, marginBottom: 10, color: '#333' }
});
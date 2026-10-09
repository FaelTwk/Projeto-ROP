import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
  SafeAreaView,
  KeyboardAvoidingView,
  ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function CadastroScreen() {
  const router = useRouter();
  
  const [nome, setNome] = useState('');
  const [usuario, setUsuario] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState(''); 
  const [isLoading, setIsLoading] = useState(false);
  const [senhaVisivel, setSenhaVisivel] = useState(false);

  const handleCadastro = async () => {
    if (!nome || !usuario || !email || !senha || !confirmarSenha) {
      Alert.alert('Erro', 'Preencha todos os campos.');
      return;
    }
    if (senha !== confirmarSenha) {
      Alert.alert('Erro', 'As senhas não conferem.');
      return;
    }
    setIsLoading(true);

    try {
      const usuariosSalvos = await AsyncStorage.getItem('@usuarios');
      const listaUsuarios = usuariosSalvos ? JSON.parse(usuariosSalvos) : [];
      
      if (listaUsuarios.some(u => u.usuario === usuario)) {
        Alert.alert('Erro', 'Usuário já existe.');
        setIsLoading(false);
        return;
      }

      const novoUsuario = { nome, usuario, email, senha };
      listaUsuarios.push(novoUsuario);
      
      await AsyncStorage.setItem('@usuarios', JSON.stringify(listaUsuarios));
      
      Alert.alert('Sucesso', 'Cadastro realizado! Faça login.');
      router.replace('/login');

    } catch (error) {
      Alert.alert('Erro', 'Falha ao cadastrar.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
             <TouchableOpacity onPress={() => router.back()}>
               <MaterialCommunityIcons name="arrow-left" size={28} color="#145a8d" />
             </TouchableOpacity>
             <Text style={styles.headerTitle}>Criar Conta</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Nome Completo</Text>
            <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Ex: João Silva" />

            <Text style={styles.label}>Usuário</Text>
            <TextInput style={styles.input} value={usuario} onChangeText={setUsuario} placeholder="Ex: joao.silva" autoCapitalize="none"/>

            <Text style={styles.label}>Email</Text>
            <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="exemplo@email.com" keyboardType="email-address" autoCapitalize="none"/>

            <Text style={styles.label}>Senha</Text>
            <View style={styles.passwordContainer}>
              <TextInput 
                style={styles.passwordInput} 
                value={senha} 
                onChangeText={setSenha} 
                secureTextEntry={!senhaVisivel}
                placeholder="******"
              />
              <TouchableOpacity onPress={() => setSenhaVisivel(!senhaVisivel)}>
                <MaterialCommunityIcons name={senhaVisivel ? "eye-off" : "eye"} size={22} color="#666" />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Confirmar Senha</Text>
            <TextInput style={styles.input} value={confirmarSenha} onChangeText={setConfirmarSenha} secureTextEntry={!senhaVisivel} placeholder="******"/>

            <TouchableOpacity style={styles.btnPrimary} onPress={handleCadastro} disabled={isLoading}>
              {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>CADASTRAR</Text>}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f4f6f8' },
  scrollContent: { padding: 20, paddingBottom: 50 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#145a8d', marginLeft: 10 },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 20, elevation: 2 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#333', marginTop: 15, marginBottom: 5 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#f9f9f9' },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 10, backgroundColor: '#f9f9f9' },
  passwordInput: { flex: 1, paddingVertical: 12, fontSize: 16 },
  btnPrimary: { backgroundColor: '#145a8d', height: 50, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 30 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
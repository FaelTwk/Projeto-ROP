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
  KeyboardAvoidingView,
  ScrollView,
  Image // IMPORTANTE: Componente de Imagem
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function LoginScreen() { 
  const router = useRouter(); 
  
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [senhaVisivel, setSenhaVisivel] = useState(false);

  const handleLogin = async () => {
    if (!usuario || !senha) {
      Alert.alert('Campo Obrigatório', 'Por favor, preencha usuário e senha.');
      return;
    }
    setIsLoading(true);

    try {
      const usuariosSalvos = await AsyncStorage.getItem('@usuarios');
      const listaUsuarios = usuariosSalvos ? JSON.parse(usuariosSalvos) : [];
      
      const usuarioEncontrado = listaUsuarios.find(
        u => u.usuario.toLowerCase() === usuario.toLowerCase()
      );

      // Login mockado + usuário padrão
      if ((usuarioEncontrado && usuarioEncontrado.senha === senha) || (usuario === 'admin' && senha === '1234')) {
        await AsyncStorage.setItem('@user_token', 'token_dummy_123');
        await AsyncStorage.setItem('@usuario_logado', usuarioEncontrado ? usuarioEncontrado.nome : 'Administrador');
        
        router.replace('/lista');
      } else {
        Alert.alert('Erro de Acesso', 'Usuário ou senha incorretos.');
      }
    } catch (e) {
      Alert.alert('Erro', 'Falha ao verificar credenciais.');
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
          
          {/* LOGO DA PMSE */}
          <View style={styles.logoContainer}>
            <Image 
              source={require('../assets/images/icon.png')} 
              style={styles.logo}
            />
          </View>
          
          <Text style={styles.title}>Portal PMSE</Text>
          <Text style={styles.subtitle}>SRO - Sistema de Registro de Ocorrências</Text>

          <View style={styles.card}>
            <Text style={styles.label}>Usuário</Text>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="account" size={20} color="#666" style={styles.icon} />
              <TextInput 
                style={styles.input}
                placeholder="Digite seu usuário"
                value={usuario}
                onChangeText={setUsuario}
                autoCapitalize="none"
              />
            </View>

            <Text style={styles.label}>Senha</Text>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="lock" size={20} color="#666" style={styles.icon} />
              <TextInput 
                style={styles.input}
                placeholder="Digite sua senha"
                value={senha}
                onChangeText={setSenha}
                secureTextEntry={!senhaVisivel}
              />
              <TouchableOpacity onPress={() => setSenhaVisivel(!senhaVisivel)}>
                <MaterialCommunityIcons name={senhaVisivel ? "eye-off" : "eye"} size={22} color="#666" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.forgotPass} onPress={() => router.push('/esqueci-senha')}>
              <Text style={styles.forgotPassText}>Esqueceu a senha?</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnPrimary} onPress={handleLogin} disabled={isLoading}>
              {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>ENTRAR</Text>}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Não tem acesso?</Text>
            <TouchableOpacity onPress={() => router.push('/cadastro')}>
              <Text style={styles.linkText}>Cadastre-se</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f4f6f8' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  
  logoContainer: { alignItems: 'center', marginBottom: 20 },
  logo: {
    width: 130, // Ajustei levemente o tamanho
    height: 130,
    resizeMode: 'contain' 
  },

  title: { fontSize: 28, fontWeight: 'bold', color: '#145a8d', textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 30 },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 20, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 5, marginTop: 10 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 10, height: 50, backgroundColor: '#f9f9f9' },
  icon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: '#333' },
  forgotPass: { alignSelf: 'flex-end', marginTop: 10, marginBottom: 20 },
  forgotPassText: { color: '#145a8d', fontWeight: '600' },
  btnPrimary: { backgroundColor: '#145a8d', height: 50, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 30, gap: 5 },
  footerText: { color: '#666' },
  linkText: { color: '#145a8d', fontWeight: 'bold' }
});
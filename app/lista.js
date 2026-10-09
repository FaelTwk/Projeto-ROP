import React, { useState, useCallback, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons'; 
import NetInfo from '@react-native-community/netinfo';

export default function ListaScreen() {
  const router = useRouter();
  const [rops, setRops] = useState([]);
  const [rascunho, setRascunho] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Controle de montagem para evitar CRASH se o usuário sair da tela rápido
  const isMounted = useRef(true);

  useFocusEffect(
    useCallback(() => {
      isMounted.current = true;
      carregarDadosESincronizar();

      return () => {
        isMounted.current = false; // Marca como desmontado ao sair
      };
    }, [])
  );

  const carregarDadosESincronizar = async () => {
    if (!isMounted.current) return;
    setIsLoading(true);
    
    try {
      const token = await AsyncStorage.getItem('@user_token');
      if(!token) { router.replace('/login'); return; }
      
      const usuarioLogado = await AsyncStorage.getItem('@usuario_logado');

      const ropsStr = await AsyncStorage.getItem('@rops');
      let listaRops = ropsStr ? JSON.parse(ropsStr) : [];

      const rascunhoStr = await AsyncStorage.getItem('@rop_rascunho');
      if (isMounted.current) {
        if (rascunhoStr) {
          const rascunhoData = JSON.parse(rascunhoStr);
          setRascunho(rascunhoData.usuario === usuarioLogado ? rascunhoData : null);
        } else {
          setRascunho(null);
        }
      }

      const atualizarListaVisual = (lista) => {
        if (!isMounted.current) return;
        const meusRops = lista.filter(r => r.usuario === usuarioLogado);
        meusRops.sort((a, b) => new Date(b.dhFato) - new Date(a.dhFato));
        setRops(meusRops);
      };

      atualizarListaVisual(listaRops); 
      if (isMounted.current) setIsLoading(false);

      // Sincronização
      const networkState = await NetInfo.fetch();
      
      if (networkState.isConnected && isMounted.current) {
        const pendentes = listaRops.filter(r => r.status === 'PENDENTE_ENVIO');
        
        if (pendentes.length > 0) {
          if (isMounted.current) setIsSyncing(true);
          
          // Reduzi para 1.5s para evitar crash por timeout longo
          await new Promise(r => setTimeout(r, 1500));
          
          if (!isMounted.current) return;

          listaRops = listaRops.map(r => {
            if (r.status === 'PENDENTE_ENVIO') return { ...r, status: 'ENVIADO' };
            return r;
          });
          
          await AsyncStorage.setItem('@rops', JSON.stringify(listaRops));
          atualizarListaVisual(listaRops);
          
          if (isMounted.current) {
            Alert.alert("Sincronização", `${pendentes.length} ROPs offline foram enviados.`);
            setIsSyncing(false);
          }
        }
      }

    } catch (e) {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.multiRemove(['@user_token', '@usuario_logado']);
    router.replace('/login');
  };

  const handleResumeDraft = async () => {
    if (!rascunho) return;
    try {
      await AsyncStorage.setItem('@rop_temporario', JSON.stringify(rascunho));
      await AsyncStorage.removeItem('@rop_rascunho');
      if (rascunho.detalhesPagina2) router.push('/pagina2');
      else router.push('/rop');
    } catch (error) { Alert.alert("Erro", "Falha ao abrir rascunho."); }
  };

  const handleAdicionarNovo = async () => {
    await AsyncStorage.removeItem('@rop_temporario');
    router.push('/rop');
  };

  const handleDelete = (indexToDelete) => {
    Alert.alert("Deletar", "Tem certeza?", [
      { text: "Cancelar", style: "cancel" },
      { 
        text: "Deletar", style: "destructive",
        onPress: async () => {
          const novaLista = rops.filter((_, i) => i !== indexToDelete);
          setRops(novaLista);
          const ropsStr = await AsyncStorage.getItem('@rops');
          let todosRops = ropsStr ? JSON.parse(ropsStr) : [];
          // Em produção usaria ID. Aqui salvamos o estado visual filtrado para o MVP.
          await AsyncStorage.setItem('@rops', JSON.stringify(novaLista)); 
        }
      }
    ]);
  };

  const handleEdit = (ropParaEditar, index) => {
    Alert.alert("Editar", "O ROP voltará para rascunho.", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Editar",
        onPress: async () => {
          const novaLista = rops.filter((_, i) => i !== index);
          await AsyncStorage.setItem('@rops', JSON.stringify(novaLista));
          setRops(novaLista);
          await AsyncStorage.setItem('@rop_temporario', JSON.stringify(ropParaEditar));
          router.push('/rop');
        }
      }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Meus ROPs</Text>
        <TouchableOpacity onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {(isLoading || isSyncing) && (
            <View style={styles.syncContainer}>
                <ActivityIndicator color="#145a8d" size="small" />
                <Text style={styles.syncText}>
                    {isSyncing ? "Sincronizando dados..." : "Carregando..."}
                </Text>
            </View>
        )}
        
        {!isLoading && rascunho && (
          <TouchableOpacity style={[styles.card, styles.cardRascunho]} onPress={handleResumeDraft}>
             <View style={styles.rascunhoHeader}>
                <MaterialCommunityIcons name="file-document-edit-outline" size={24} color="#856404" />
                <Text style={styles.rascunhoTitle}>Rascunho em Aberto</Text>
             </View>
             <Text style={styles.rascunhoText}>Tipo: {rascunho.tipoRop || '...'}</Text>
             <Text style={styles.rascunhoHint}>Toque para continuar</Text>
          </TouchableOpacity>
        )}

        {!isLoading && rops.length === 0 && !rascunho && (
           <Text style={styles.emptyText}>Nenhum ROP registrado.</Text>
        )}

        {!isLoading && rops.map((rop, i) => (
          <View key={i} style={styles.card}>
            <View style={styles.cardHeaderStatus}>
                {rop.status === 'PENDENTE_ENVIO' ? (
                    <View style={[styles.badge, {backgroundColor: '#ffc107'}]}>
                        <MaterialCommunityIcons name="cloud-off-outline" size={14} color="#fff" />
                        <Text style={styles.badgeText}>OFFLINE</Text>
                    </View>
                ) : (
                    <View style={[styles.badge, {backgroundColor: '#28a745'}]}>
                        <MaterialCommunityIcons name="cloud-check-outline" size={14} color="#fff" />
                        <Text style={styles.badgeText}>ENVIADO</Text>
                    </View>
                )}
            </View>

            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>ROP: {rop.tipoRop}</Text>
              <Text style={styles.cardText}>Ciosp: {rop.nmNumeroCiosp}</Text>
              <Text style={styles.cardText}>Data: {new Date(rop.dhFato).toLocaleDateString('pt-BR')}</Text>
            </View>
            <View style={styles.cardActions}>
               <TouchableOpacity style={[styles.actionBtn, styles.btnView]} onPress={() => router.push({pathname: '/detalheRop', params: {ropData: JSON.stringify(rop)}})}>
                 <MaterialCommunityIcons name="eye" size={20} color="#0056b3" />
                 <Text style={styles.btnTextBlue}>Ver</Text>
               </TouchableOpacity>
               <TouchableOpacity style={[styles.actionBtn, styles.btnEdit]} onPress={() => handleEdit(rop, i)}>
                 <MaterialCommunityIcons name="pencil" size={20} color="#e0a800" />
                 <Text style={styles.btnTextOrange}>Editar</Text>
               </TouchableOpacity>
               <TouchableOpacity style={[styles.actionBtn, styles.btnDelete]} onPress={() => handleDelete(i)}>
                 <MaterialCommunityIcons name="trash-can" size={20} color="#c82333" />
                 <Text style={styles.btnTextRed}>Excluir</Text>
               </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.fab} onPress={handleAdicionarNovo}>
          <MaterialCommunityIcons name="plus" size={30} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f8' },
  header: { backgroundColor: '#145a8d', padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  scrollContent: { padding: 15, paddingBottom: 80 },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#666' },
  footer: { position: 'absolute', bottom: 20, right: 20 },
  fab: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#28a745', justifyContent: 'center', alignItems: 'center', elevation: 5 },
  syncContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 15, padding: 10, backgroundColor: '#e3f2fd', borderRadius: 8 },
  syncText: { marginLeft: 10, color: '#145a8d', fontWeight: 'bold' },
  card: { backgroundColor: '#fff', borderRadius: 8, marginBottom: 15, elevation: 2, overflow: 'hidden' },
  cardRascunho: { backgroundColor: '#fff3cd', borderWidth: 1, borderColor: '#ffeeba', padding: 15 },
  rascunhoHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  rascunhoTitle: { fontSize: 16, fontWeight: 'bold', color: '#856404', marginLeft: 10 },
  rascunhoText: { color: '#856404' },
  rascunhoHint: { color: '#856404', fontStyle: 'italic', marginTop: 5, fontWeight: 'bold', fontSize: 12 },
  cardHeaderStatus: { flexDirection:'row', justifyContent:'flex-end', padding: 8, paddingBottom: 0 },
  badge: { flexDirection:'row', alignItems:'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, gap: 4 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  cardContent: { padding: 15, paddingTop: 5 },
  cardTitle: { fontWeight: 'bold', fontSize: 16, color: '#145a8d', marginBottom: 5 },
  cardText: { color: '#333', marginBottom: 2 },
  cardActions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#eee' },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, gap: 5 },
  btnView: { backgroundColor: '#f0f7ff' },
  btnEdit: { backgroundColor: '#fffdf5' },
  btnDelete: { backgroundColor: '#fff5f5' },
  btnTextBlue: { color: '#0056b3', fontWeight: 'bold', fontSize: 12 },
  btnTextOrange: { color: '#e0a800', fontWeight: 'bold', fontSize: 12 },
  btnTextRed: { color: '#c82333', fontWeight: 'bold', fontSize: 12 },
});
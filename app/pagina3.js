import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Checkbox from 'expo-checkbox'; 
import { Picker } from '@react-native-picker/picker';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import NetInfo from '@react-native-community/netinfo';

import { API_RESUMO_KEY } from '../resumoIA';

const DELEGACIAS = ['1ª DM', '2ª DM', '3ª DM', '1º BPM', '2º BPM', 'BPTran'];
const MAP_TIPO_ROP = { 'ordinario': 1, 'extraordinario': 2, 'especifico': 3 };

export default function Pagina3Screen() {
  const router = useRouter();
  const [rop, setRop] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [destinatario, setDestinatario] = useState('');
  const [historicoFinal, setHistoricoFinal] = useState('');

  useFocusEffect(
    React.useCallback(() => {
      const load = async () => {
        const temp = await AsyncStorage.getItem('@rop_temporario');
        if (temp) {
          const d = JSON.parse(temp);
          setRop(d);
          setDestinatario(d.nmDestinatarioFinal || '');
          setHistoricoFinal(d.detalhesPagina2?.descricaoGeral || '');
        } else {
          router.replace('/rop');
        }
      };
      load();
    }, [])
  );
  
const gerarRelatoComIA = async () => {
    // 1. Validações Iniciais (Internet e Chave) vêm primeiro
    const netState = await NetInfo.fetch();
    if (!netState.isConnected) {
        Alert.alert("Sem Internet", "A IA precisa de conexão para funcionar. Digite o relato manualmente.");
        return;
    }

    if (!API_RESUMO_KEY) { 
        Alert.alert("Erro", "Configure a chave em resumoIA.js"); 
        return; 
    }
    
    setIsAiLoading(true);

    try {
      // 2. PRIMEIRO cria os dados
      const dadosParaAnalise = {
        tipo: rop.tipoRop, 
        evento: rop.eventoOperacao, 
        data: rop.dhFato,
        local: `${rop.nmLogradouro}, ${rop.nmBairro}`,
        envolvidos: rop.detalhesPagina2?.envolvidos,
        armas: [...(rop.detalhesPagina2?.armasFogo || []), ...(rop.detalhesPagina2?.armasBrancas || [])],
        veiculos: rop.detalhesPagina2?.veiculos,
        objetos: rop.detalhesPagina2?.objetos,
        drogas: rop.detalhesPagina2?.drogas,
        rascunhoPolicial: rop.detalhesPagina2?.descricaoGeral
      };

      // 3. DEPOIS cria os prompts usando os dados criados acima
      const promptSistema = "Você é um assistente da Polícia Militar. Sua função é escrever um Relato de Ocorrência Policial (Histórico) formal, impessoal, técnico e cronológico com base nos dados estruturados JSON fornecidos.";
      const promptUsuario = `Gere o texto do histórico oficial baseado nestes dados: ${JSON.stringify(dadosParaAnalise)}. Use linguagem policial padrão.`;
      
      // 4. Faz a chamada
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${API_RESUMO_KEY}` },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: promptSistema }, 
            { role: "user", content: promptUsuario }
          ],
          temperature: 0.5
        })
      });
      
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      
      setHistoricoFinal(data.choices[0].message.content);
      Alert.alert("IA Finalizada", "Texto gerado. Revise e gere o PDF.");
      
    } catch (error) {
      Alert.alert("Erro IA", "Falha ao gerar: " + error.message);
    } finally {
      setIsAiLoading(false);
    }
  };

  // --- 2. FUNÇÃO HTML DO PDF ---
  const gerarHtmlDoRop = () => {
    const detalhes = rop.detalhesPagina2 || {};
    const dataFormatada = new Date(rop.dhFato).toLocaleString('pt-BR');

    const renderEnvolvidos = detalhes.envolvidos?.map(e => 
      `<tr><td>${e.nome}</td><td>${e.tipo}</td><td>${e.cpf || '-'}</td><td>${e.rg || '-'}</td></tr>`
    ).join('') || '<tr><td colspan="4">Nenhum envolvido.</td></tr>';

    const renderArmas = [...(detalhes.armasFogo || []), ...(detalhes.armasBrancas || [])].map(a => 
      `<tr><td>${a.tipo}</td><td>${a.calibre || '-'}</td><td>${a.numeroSerie || '-'}</td></tr>`
    ).join('') || '<tr><td colspan="3">Nenhuma arma apreendida.</td></tr>';

    const renderVeiculos = detalhes.veiculos?.map(v => 
      `<tr><td>${v.tipo}</td><td>${v.placa || '-'}</td><td>${v.marcaModelo}</td></tr>`
    ).join('') || '<tr><td colspan="3">Nenhum veículo.</td></tr>';

    // Usa o historicoFinal (editado) ou o original se estiver vazio
    const textoHistorico = historicoFinal || detalhes.descricaoGeral || "Histórico não preenchido.";

    return `
      <html>
        <head>
          <style>
            body { font-family: 'Helvetica', sans-serif; padding: 20px; color: #333; }
            h1 { text-align: center; color: #145a8d; margin-bottom: 5px; }
            h2 { text-align: center; font-size: 14px; color: #666; margin-top: 0; margin-bottom: 30px; border-bottom: 2px solid #145a8d; padding-bottom: 10px;}
            h3 { background-color: #f0f0f0; padding: 8px; border-left: 5px solid #145a8d; margin-top: 20px; }
            .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
            .label { font-weight: bold; color: #145a8d; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #145a8d; color: white; }
            .historico { border: 1px solid #ccc; padding: 15px; background-color: #f9f9f9; text-align: justify; line-height: 1.6; min-height: 100px; white-space: pre-wrap; }
            .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #888; }
            .assinatura { margin-top: 60px; border-top: 1px solid #000; width: 200px; margin-left: auto; margin-right: auto; text-align: center; padding-top: 5px;}
          </style>
        </head>
        <body>
          <h1>POLÍCIA MILITAR DE SERGIPE</h1>
          <h2>RELATÓRIO DE OCORRÊNCIA POLICIAL (ROP)</h2>

          <div class="info-row">
            <div><span class="label">Protocolo:</span> ${rop.nmNumeroCiosp}</div>
            <div><span class="label">Data/Hora:</span> ${dataFormatada}</div>
          </div>
          <div class="info-row">
            <div><span class="label">Tipo:</span> ${rop.tipoRop}</div>
            <div><span class="label">Evento:</span> ${rop.eventoOperacao}</div>
          </div>
          <div class="info-row">
            <div><span class="label">Local:</span> ${rop.nmLogradouro}, ${rop.nmBairro} - ${rop.cidade}</div>
          </div>
          <div class="info-row">
            <div><span class="label">Destino Final:</span> ${destinatario || 'Não definido'}</div>
          </div>

          <h3>HISTÓRICO DA OCORRÊNCIA</h3>
          <div class="historico">${textoHistorico}</div>

          <h3>ENVOLVIDOS</h3>
          <table>
            <tr><th>Nome</th><th>Envolvimento</th><th>CPF</th><th>RG</th></tr>
            ${renderEnvolvidos}
          </table>

          <h3>APREENSÕES DE ARMAS</h3>
          <table>
            <tr><th>Tipo</th><th>Calibre</th><th>Série</th></tr>
            ${renderArmas}
          </table>

          <h3>VEÍCULOS</h3>
          <table>
            <tr><th>Tipo</th><th>Placa</th><th>Modelo</th></tr>
            ${renderVeiculos}
          </table>

          <div class="footer">
            <p>Documento gerado eletronicamente pelo Sistema SRO Mobile.</p>
            <div class="assinatura">Assinatura do Responsável</div>
          </div>
        </body>
      </html>
    `;
  };

  // --- 3. GERAR PDF ---
  const gerarECompartilharPDF = async () => {
    setIsPdfLoading(true);
    try {
      const html = gerarHtmlDoRop();
      const { uri } = await Print.printToFileAsync({ html, base64: false });
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (error) {
      Alert.alert("Erro PDF", "Não foi possível gerar o documento.");
    } finally {
      setIsPdfLoading(false);
    }
  };

  // --- 4. FINALIZAR (Com lógica Offline) ---
  const handleFinalizar = async () => {
    if (!isChecked || !destinatario) { Alert.alert('Atenção', 'Preencha destinatário e confirme.'); return; }
    
    setIsLoading(true);
    try {
      // Checa conexão
      const networkState = await NetInfo.fetch();
      const isOnline = networkState.isConnected;
      const statusEnvio = isOnline ? 'ENVIADO' : 'PENDENTE_ENVIO';

      const usuario = await AsyncStorage.getItem('@usuario_logado');
      
      // Atualiza objeto com histórico final e status
      const ropAtualizado = { 
        ...rop, 
        detalhesPagina2: { ...rop.detalhesPagina2, descricaoGeral: historicoFinal },
        nmDestinatarioFinal: destinatario,
        status: statusEnvio,
        usuario
      };
      
      // Simula Payload da API (apenas demonstrativo no MVP)
      const dadosParaApi = {
        usuarioResponsavel: usuario,
        numeroCiosp: rop.nmNumeroCiosp,
        tipoRopId: MAP_TIPO_ROP[rop.tipoRop], // Mapeamento ID
        unidadeDestino: destinatario,
        historico: historicoFinal,
      };

      if (isOnline) {
          // Delay simulando envio real
          await new Promise(r => setTimeout(r, 1000));
      }

      // Salva na lista
      const ropsStr = await AsyncStorage.getItem('@rops');
      const ropsList = ropsStr ? JSON.parse(ropsStr) : [];
      ropsList.push(ropAtualizado);
      await AsyncStorage.setItem('@rops', JSON.stringify(ropsList));
      
      // Limpa rascunhos
      await AsyncStorage.removeItem('@rop_temporario');
      await AsyncStorage.removeItem('@rop_rascunho');
      
      router.replace('/finalizado');

      if (!isOnline) {
          Alert.alert("Modo Offline", "ROP salvo localmente. Será enviado quando houver conexão.");
      }

    } catch (e) {
      Alert.alert('Erro', 'Falha ao finalizar.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!rop) return null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/pagina2')} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Revisão</Text>
        <Text style={styles.headerSubtitle}>Passo 3 de 3</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Resumo Geral</Text>
        <Text style={styles.text}>Tipo: {rop.tipoRop}</Text>
        <Text style={styles.text}>Local: {rop.nmBairro} - {rop.cidade}</Text>
        
        <Text style={styles.sectionTitle}>Itens Adicionados</Text>
        <Text style={styles.text}>Policiais: {rop.detalhesPagina2?.policiais?.length || 0}</Text>
        <Text style={styles.text}>Envolvidos: {rop.detalhesPagina2?.envolvidos?.length || 0}</Text>
        <Text style={styles.text}>Armas: {(rop.detalhesPagina2?.armasFogo?.length || 0) + (rop.detalhesPagina2?.armasBrancas?.length || 0)}</Text>
        <Text style={styles.text}>Veículos: {rop.detalhesPagina2?.veiculos?.length || 0}</Text>
        <Text style={styles.text}>Objetos: {rop.detalhesPagina2?.objetos?.length || 0}</Text>
        <Text style={styles.text}>Munições: {rop.detalhesPagina2?.municoes?.length || 0}</Text>
        <Text style={styles.text}>Drogas: {rop.detalhesPagina2?.drogas?.length || 0}</Text>
        <Text style={styles.text}>Dinheiro: R$ {rop.detalhesPagina2?.dinheiroValor || '0,00'}</Text>
        
        <Text style={styles.sectionTitle}>Histórico / Relato Final</Text>
        <TextInput 
          style={styles.textBoxEditable} 
          multiline 
          value={historicoFinal} 
          onChangeText={setHistoricoFinal} 
          placeholder="O histórico aparecerá aqui..."
        />

        {/* BOTÃO IA */}
        <TouchableOpacity style={styles.aiButton} onPress={gerarRelatoComIA} disabled={isAiLoading}>
           {isAiLoading ? <ActivityIndicator color="#145a8d" /> : 
           <><MaterialCommunityIcons name="robot-outline" size={24} color="#145a8d" /><Text style={styles.aiButtonText}>1. Gerar Texto com IA</Text></>}
        </TouchableOpacity>

        {/* BOTÃO PDF */}
        <TouchableOpacity style={styles.pdfButton} onPress={gerarECompartilharPDF} disabled={isPdfLoading}>
           {isPdfLoading ? <ActivityIndicator color="#fff" /> : 
           <><MaterialCommunityIcons name="file-pdf-box" size={24} color="#fff" /><Text style={styles.pdfButtonText}>2. Gerar PDF Oficial</Text></>}
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Finalização</Text>
        <Text style={styles.label}>Destinatário Final*</Text>
        <View style={styles.pickerContainer}>
          <Picker selectedValue={destinatario} onValueChange={setDestinatario}>
            <Picker.Item label="Selecione..." value="" />
            {DELEGACIAS.map(d => <Picker.Item key={d} label={d} value={d} />)}
          </Picker>
        </View>
        <View style={styles.checkboxContainer}>
          <Checkbox value={isChecked} onValueChange={setIsChecked} color={isChecked ? '#28a745' : undefined} />
          <Text style={styles.checkboxLabel}>Confirmo que os dados estão corretos.</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={[styles.btn, styles.btnDraft]} onPress={() => router.back()}>
          <Text style={styles.btnTextDark}>Voltar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.btnNext]} onPress={handleFinalizar} disabled={!isChecked || !destinatario || isLoading}>
          <Text style={styles.btnTextLight}>{isLoading ? '...' : 'Finalizar ROP'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { backgroundColor: '#145a8d', padding: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  headerSubtitle: { color: '#fff', fontSize: 14 },
  backButton: { position: 'absolute', left: 15, zIndex: 10 },
  scrollContent: { padding: 20, paddingBottom: 100 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#eee', padding: 15, flexDirection: 'row', gap: 10 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#145a8d', marginTop: 20, marginBottom: 5 },
  text: { fontSize: 16, marginBottom: 5, color: '#333' },
  textBoxEditable: { backgroundColor: '#f0f8ff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#b0c4de', minHeight: 120, textAlignVertical: 'top', fontSize: 16, color: '#333' },
  label: { fontWeight: 'bold', marginTop: 10 },
  pickerContainer: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginVertical: 5 },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 20, marginBottom: 10 },
  checkboxLabel: { marginLeft: 10, fontSize: 16 },
  hintText: { fontSize: 14, color: '#666', marginBottom: 5, fontStyle: 'italic' },
  
  aiButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, borderWidth: 1, borderColor: '#145a8d', backgroundColor: '#e3f2fd', borderRadius: 8, marginTop: 15, marginBottom: 10 },
  aiButtonText: { color: '#145a8d', fontWeight: 'bold', marginLeft: 8, fontSize: 16 },
  
  pdfButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, backgroundColor: '#d32f2f', borderRadius: 8, marginTop: 5, marginBottom: 15, elevation: 3 },
  pdfButtonText: { color: '#fff', fontWeight: 'bold', marginLeft: 8, fontSize: 16 },

  btn: { flex: 1, padding: 14, borderRadius: 8, alignItems: 'center' },
  btnDraft: { backgroundColor: '#ddd' },
  btnNext: { backgroundColor: '#28a745' },
  btnTextDark: { color: '#333', fontWeight: 'bold' },
  btnTextLight: { color: '#fff', fontWeight: 'bold' }
});
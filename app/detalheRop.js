import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export default function DetalheRopScreen() {
  const router = useRouter();
  const params = useLocalSearchParams(); 
  const [rop, setRop] = useState(null);
  const [isPdfLoading, setIsPdfLoading] = useState(false);

  useEffect(() => {
    if (params.ropData) {
      try {
        setRop(JSON.parse(params.ropData));
      } catch (e) {
        Alert.alert("Erro", "Não foi possível ler os dados.");
        router.back();
      }
    }
  }, [params.ropData]);

  // --- 1. FUNÇÃO GERADORA DE HTML (Template do PDF) ---
  const gerarHtmlDoRop = () => {
    const detalhes = rop.detalhesPagina2 || {};
    const dataFormatada = new Date(rop.dhFato).toLocaleString('pt-BR');

    // Helpers para gerar linhas de tabelas
    const renderEnvolvidos = detalhes.envolvidos?.map(e => 
      `<tr><td>${e.nome}</td><td>${e.tipo}</td><td>${e.cpf || '-'}</td><td>${e.rg || '-'}</td></tr>`
    ).join('') || '<tr><td colspan="4">Nenhum envolvido.</td></tr>';

    const renderArmas = [...(detalhes.armasFogo || []), ...(detalhes.armasBrancas || [])].map(a => 
      `<tr><td>${a.tipo}</td><td>${a.calibre || '-'}</td><td>${a.numeroSerie || '-'}</td></tr>`
    ).join('') || '<tr><td colspan="3">Nenhuma arma apreendida.</td></tr>';

    const renderVeiculos = detalhes.veiculos?.map(v => 
      `<tr><td>${v.tipo}</td><td>${v.placa || '-'}</td><td>${v.marcaModelo}</td></tr>`
    ).join('') || '<tr><td colspan="3">Nenhum veículo.</td></tr>';

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
            <div><span class="label">Local:</span> ${rop.nmLogradouro}, ${rop.nmLogradouroNumero}, ${rop.nmBairro} - ${rop.cidade}</div>
          </div>
          <div class="info-row">
            <div><span class="label">Destino Final:</span> ${rop.nmDestinatarioFinal || 'Não definido'}</div>
          </div>

          <h3>HISTÓRICO DA OCORRÊNCIA</h3>
          <div class="historico">
            ${detalhes.descricaoGeral || "Histórico não preenchido."}
          </div>

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
            <p>Documento emitido via SRO Mobile - Reimpressão.</p>
            <div class="assinatura">Assinatura do Responsável</div>
          </div>
        </body>
      </html>
    `;
  };

  // --- 2. FUNÇÃO GERAR PDF ---
  const gerarECompartilharPDF = async () => {
    setIsPdfLoading(true);
    try {
      const html = gerarHtmlDoRop();
      const { uri } = await Print.printToFileAsync({
        html: html,
        base64: false
      });
      await Sharing.shareAsync(uri, {
        UTI: '.pdf',
        mimeType: 'application/pdf'
      });
    } catch (error) {
      Alert.alert("Erro PDF", "Não foi possível gerar o documento.");
      console.error(error);
    } finally {
      setIsPdfLoading(false);
    }
  };

  if (!rop) return (
    <SafeAreaView style={[styles.container, {justifyContent:'center', alignItems:'center'}]}>
      <ActivityIndicator size="large" color="#145a8d" />
    </SafeAreaView>
  );

  const detalhes = rop.detalhesPagina2 || {};

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
           <MaterialCommunityIcons name="arrow-left" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes do ROP</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
         
         <Text style={styles.title}>Resumo Operacional</Text>
         <View style={styles.card}>
            <Text style={styles.text}>Protocolo: <Text style={styles.bold}>{rop.nmNumeroCiosp}</Text></Text>
            <Text style={styles.text}>Tipo: {rop.tipoRop}</Text>
            <Text style={styles.text}>Destino Final: {rop.nmDestinatarioFinal || 'Não informado'}</Text>
            <Text style={styles.text}>Data: {new Date(rop.dhFato).toLocaleDateString('pt-BR')}</Text>
         </View>

         {detalhes.policiais?.length > 0 && (
           <>
             <Text style={styles.title}>Policiais Envolvidos</Text>
             <View style={styles.card}>
               {detalhes.policiais.map((p, i) => (
                 <Text key={i} style={styles.itemText}>• {p.nome} ({p.matricula}) - {p.funcao}</Text>
               ))}
             </View>
           </>
         )}

         {detalhes.envolvidos?.length > 0 && (
           <>
             <Text style={styles.title}>Envolvidos (Civis)</Text>
             <View style={styles.card}>
               {detalhes.envolvidos.map((e, i) => (
                 <Text key={i} style={styles.itemText}>• {e.nome} ({e.tipo}) - CPF: {e.cpf}</Text>
               ))}
             </View>
           </>
         )}

         {detalhes.armasFogo?.length > 0 && (
           <>
             <Text style={styles.title}>Armas de Fogo</Text>
             <View style={styles.card}>
               {detalhes.armasFogo.map((a, i) => (
                 <Text key={i} style={styles.itemText}>• {a.tipo} {a.calibre} - Série: {a.numeroSerie}</Text>
               ))}
             </View>
           </>
         )}
         {detalhes.armasBrancas?.length > 0 && (
           <>
             <Text style={styles.title}>Armas Brancas</Text>
             <View style={styles.card}>
               {detalhes.armasBrancas.map((a, i) => (
                 <Text key={i} style={styles.itemText}>• {a.tipo} - Obs: {a.obs}</Text>
               ))}
             </View>
           </>
         )}
         {detalhes.veiculos?.length > 0 && (
           <>
             <Text style={styles.title}>Veículos</Text>
             <View style={styles.card}>
               {detalhes.veiculos.map((v, i) => (
                 <Text key={i} style={styles.itemText}>• {v.tipo} {v.marcaModelo} - Placa: {v.placa}</Text>
               ))}
             </View>
           </>
         )}
         {detalhes.objetos?.length > 0 && (
           <>
             <Text style={styles.title}>Objetos</Text>
             <View style={styles.card}>
               {detalhes.objetos.map((o, i) => (
                 <Text key={i} style={styles.itemText}>• {o.marcaModelo} (ID: {o.identificador})</Text>
               ))}
             </View>
           </>
         )}
         {detalhes.municoes?.length > 0 && (
           <>
             <Text style={styles.title}>Munições</Text>
             <View style={styles.card}>
               {detalhes.municoes.map((m, i) => (
                 <Text key={i} style={styles.itemText}>• {m.quantidade} un. de {m.tipo}</Text>
               ))}
             </View>
           </>
         )}
         {detalhes.drogas?.length > 0 && (
           <>
             <Text style={styles.title}>Drogas</Text>
             <View style={styles.card}>
               {detalhes.drogas.map((d, i) => (
                 <Text key={i} style={styles.itemText}>• {d.tipo} ({d.apresentacao}) - Qtd: {d.qtdUnid}</Text>
               ))}
             </View>
           </>
         )}

         <Text style={styles.title}>Histórico / Narrativa</Text>
         <View style={[styles.card, styles.historyCard]}>
            <Text style={styles.historyText}>{detalhes.descricaoGeral || "Nenhum histórico registrado."}</Text>
         </View>

      </ScrollView>

      {/* FOOTER FIXO COM BOTÃO DE PDF */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.pdfButton} 
          onPress={gerarECompartilharPDF} 
          disabled={isPdfLoading}
        >
           {isPdfLoading ? (
             <ActivityIndicator color="#fff" />
           ) : (
             <>
               <MaterialCommunityIcons name="file-pdf-box" size={24} color="#fff" />
               <Text style={styles.pdfButtonText}>Gerar PDF Oficial</Text>
             </>
           )}
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f8' },
  header: { backgroundColor: '#145a8d', padding: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  backButton: { position: 'absolute', left: 15, zIndex: 10 },
  scrollContent: { padding: 20, paddingBottom: 100 }, // Espaço extra para o footer
  title: { fontSize: 18, fontWeight: 'bold', color: '#145a8d', marginTop: 20, marginBottom: 8, paddingLeft: 5 },
  card: { backgroundColor: '#fff', borderRadius: 8, padding: 15, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  text: { fontSize: 16, color: '#333', marginBottom: 6 },
  bold: { fontWeight: 'bold', color: '#000' },
  itemText: { fontSize: 15, color: '#444', marginBottom: 8, lineHeight: 22, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 4 },
  historyCard: { backgroundColor: '#fff', minHeight: 80 },
  historyText: { fontSize: 16, color: '#333', lineHeight: 24, fontStyle: 'italic' },
  
  // Footer e Botão PDF
  footer: {
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    backgroundColor: '#fff', 
    borderTopWidth: 1, 
    borderTopColor: '#eee', 
    padding: 15, 
    elevation: 5
  },
  pdfButton: {
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 14, 
    backgroundColor: '#d32f2f', // Vermelho PDF
    borderRadius: 8,
    elevation: 3 
  },
  pdfButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16
  }
});
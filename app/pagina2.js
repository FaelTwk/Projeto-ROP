import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
  StatusBar,
  Modal,
  KeyboardAvoidingView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

export default function Pagina2Screen() {
  const router = useRouter();
  
  const [dadosPagina1, setDadosPagina1] = useState({});
  const [descricaoGeral, setDescricaoGeral] = useState('');
  
  const [policiais, setPoliciais] = useState([]);
  const [envolvidos, setEnvolvidos] = useState([]);
  const [armasFogo, setArmasFogo] = useState([]);
  const [armasBrancas, setArmasBrancas] = useState([]);
  const [veiculos, setVeiculos] = useState([]);
  const [objetos, setObjetos] = useState([]);
  const [municoes, setMunicoes] = useState([]);
  const [drogas, setDrogas] = useState([]);
  const [dinheiroValor, setDinheiroValor] = useState('');

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState(''); 
  const [currentItem, setCurrentItem] = useState({}); 

  const factories = {
    policial: () => ({ matricula: '', nome: '', funcao: '' }),
    envolvido: () => ({ tipo: '', nome: '', cpf: '', rg: '', dataNascimento: '', nomePai: '', nomeMae: '', endereco: '', crimesCometidos: '' }),
    armaFogo: () => ({ tipo: '', calibre: '', numeroSerie: '', obs: '' }),
    armaBranca: () => ({ tipo: '', obs: '' }),
    veiculo: () => ({ tipo: '', placa: '', chassi: '', marcaModelo: '', cor: '' }),
    objeto: () => ({ marcaModelo: '', identificador: '', situacao: '' }),
    municao: () => ({ tipo: '', quantidade: '' }),
    droga: () => ({ tipo: '', apresentacao: '', qtdUnid: '', embalagem: '' }),
  };

  useFocusEffect(
    React.useCallback(() => {
      const load = async () => {
        const temp = await AsyncStorage.getItem('@rop_temporario');
        if (temp) {
          const d = JSON.parse(temp);
          setDadosPagina1(d);
          if (d.detalhesPagina2) {
            const det = d.detalhesPagina2;
            setDescricaoGeral(det.descricaoGeral || '');
            setPoliciais(det.policiais || []);
            setEnvolvidos(det.envolvidos || []);
            setArmasFogo(det.armasFogo || []);
            setArmasBrancas(det.armasBrancas || []);
            setVeiculos(det.veiculos || []);
            setObjetos(det.objetos || []);
            setMunicoes(det.municoes || []);
            setDrogas(det.drogas || []);
            setDinheiroValor(det.dinheiroValor || '');
          }
        }
      };
      load();
    }, [])
  );

  const openModal = (type) => {
    setModalType(type);
    if (factories[type]) {
        setCurrentItem(factories[type]());
        setModalVisible(true);
    }
  };

  const saveModalItem = () => {
    let erro = null;
    switch (modalType) {
      case 'policial': if (!currentItem.nome || !currentItem.matricula) erro = "Informe Nome e Matrícula."; break;
      case 'envolvido': 
        if (!currentItem.nome) erro = "Nome obrigatório."; 
        if (currentItem.tipo === 'suspeito' && !currentItem.crimesCometidos) erro = "Informe os crimes cometidos.";
        break;
      case 'armaFogo': if (!currentItem.tipo) erro = "Tipo obrigatório."; break;
      case 'veiculo': if (!currentItem.placa && !currentItem.chassi) erro = "Placa ou Chassi necessários."; break;
    }
    if(erro) { Alert.alert("Atenção", erro); return; }

    const setters = {
      policial: setPoliciais, envolvido: setEnvolvidos, armaFogo: setArmasFogo,
      armaBranca: setArmasBrancas, veiculo: setVeiculos, objeto: setObjetos,
      municao: setMunicoes, droga: setDrogas,
    };
    setters[modalType](prev => [...prev, currentItem]);
    setModalVisible(false);
  };

  const deleteItem = (index, array, setArray) => {
    const novo = [...array];
    novo.splice(index, 1);
    setArray(novo);
  };

  const saveData = async (targetRoute) => {
    const detalhes = {
      descricaoGeral, policiais, envolvidos, armasFogo, armasBrancas,
      veiculos, objetos, municoes, drogas, dinheiroValor
    };
    const fullRop = { ...dadosPagina1, detalhesPagina2: detalhes };

    try {
      if (targetRoute === 'lista') { 
        await AsyncStorage.setItem('@rop_rascunho', JSON.stringify(fullRop));
        await AsyncStorage.removeItem('@rop_temporario');
        router.replace('/lista');
      } else { 
        await AsyncStorage.setItem('@rop_temporario', JSON.stringify(fullRop));
        router.push(targetRoute);
      }
    } catch (e) {
      Alert.alert('Erro', 'Falha ao salvar.');
    }
  };

  const renderListItem = (item, index, label, setArray, array) => (
    <View key={index} style={styles.listItem}>
      <Text style={styles.listItemText}>{label}</Text>
      <TouchableOpacity onPress={() => deleteItem(index, array, setArray)}>
        <MaterialCommunityIcons name="trash-can-outline" size={24} color="#c82333" />
      </TouchableOpacity>
    </View>
  );

  const { elementosPresentes } = dadosPagina1 || { elementosPresentes: {} };

  return (
    <SafeAreaView style={styles.container}>
      {/* Removido KeyboardAvoidingView daqui para evitar conflito no Android */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes</Text>
        <Text style={styles.headerSubtitle}>Passo 2 de 3</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {elementosPresentes?.policiaisEnvolvidos && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Policiais Envolvidos</Text>
            {policiais.map((p, i) => renderListItem(p, i, `${p.nome} (${p.matricula})`, setPoliciais, policiais))}
            <TouchableOpacity style={styles.btnAdd} onPress={() => openModal('policial')}>
              <Text style={styles.btnAddText}>+ Adicionar Policial</Text>
            </TouchableOpacity>
          </View>
        )}
        {elementosPresentes?.envolvidos && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Envolvidos (Civis)</Text>
            {envolvidos.map((e, i) => renderListItem(e, i, `${e.nome} (${e.tipo})`, setEnvolvidos, envolvidos))}
            <TouchableOpacity style={styles.btnAdd} onPress={() => openModal('envolvido')}>
              <Text style={styles.btnAddText}>+ Adicionar Envolvido</Text>
            </TouchableOpacity>
          </View>
        )}
        {elementosPresentes?.armaFogo && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Armas de Fogo</Text>
            {armasFogo.map((a, i) => renderListItem(a, i, `${a.tipo} - ${a.calibre}`, setArmasFogo, armasFogo))}
            <TouchableOpacity style={styles.btnAdd} onPress={() => openModal('armaFogo')}>
              <Text style={styles.btnAddText}>+ Adicionar Arma Fogo</Text>
            </TouchableOpacity>
          </View>
        )}
        {elementosPresentes?.armaBranca && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Armas Brancas</Text>
            {armasBrancas.map((a, i) => renderListItem(a, i, `${a.tipo}`, setArmasBrancas, armasBrancas))}
            <TouchableOpacity style={styles.btnAdd} onPress={() => openModal('armaBranca')}>
              <Text style={styles.btnAddText}>+ Adicionar Arma Branca</Text>
            </TouchableOpacity>
          </View>
        )}
        {elementosPresentes?.veiculos && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Veículos</Text>
            {veiculos.map((v, i) => renderListItem(v, i, `${v.tipo} - ${v.placa}`, setVeiculos, veiculos))}
            <TouchableOpacity style={styles.btnAdd} onPress={() => openModal('veiculo')}>
              <Text style={styles.btnAddText}>+ Adicionar Veículo</Text>
            </TouchableOpacity>
          </View>
        )}
        {elementosPresentes?.objetos && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Objetos</Text>
            {objetos.map((o, i) => renderListItem(o, i, `${o.marcaModelo}`, setObjetos, objetos))}
            <TouchableOpacity style={styles.btnAdd} onPress={() => openModal('objeto')}>
              <Text style={styles.btnAddText}>+ Adicionar Objeto</Text>
            </TouchableOpacity>
          </View>
        )}
         {elementosPresentes?.municoes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Munições</Text>
            {municoes.map((m, i) => renderListItem(m, i, `${m.tipo} (${m.quantidade})`, setMunicoes, municoes))}
            <TouchableOpacity style={styles.btnAdd} onPress={() => openModal('municao')}>
              <Text style={styles.btnAddText}>+ Adicionar Munição</Text>
            </TouchableOpacity>
          </View>
        )}
         {elementosPresentes?.drogas && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Drogas</Text>
            {drogas.map((d, i) => renderListItem(d, i, `${d.tipo} (${d.qtdUnid})`, setDrogas, drogas))}
            <TouchableOpacity style={styles.btnAdd} onPress={() => openModal('droga')}>
              <Text style={styles.btnAddText}>+ Adicionar Droga</Text>
            </TouchableOpacity>
          </View>
        )}
        {elementosPresentes?.dinheiro && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dinheiro</Text>
            <Text style={styles.label}>Valor Total (R$)</Text>
            <TextInput style={styles.input} value={dinheiroValor} onChangeText={setDinheiroValor} keyboardType="numeric" placeholder="0,00"/>
          </View>
        )}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Histórico / Narrativa</Text>
          <TextInput style={styles.textArea} value={descricaoGeral} onChangeText={setDescricaoGeral} multiline placeholder="Descreva o fato..."/>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={[styles.btn, styles.btnDraft]} onPress={() => saveData('lista')}>
          <Text style={styles.btnTextDark}>Rascunho</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.btnNext]} onPress={() => saveData('/pagina3')}>
          <Text style={styles.btnTextLight}>Próximo</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        {/* KeyboardAvoidingView MANTIDO APENAS NO MODAL */}
        <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"} 
            style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>Adicionar Item</Text>
              
              {/* MODAIS */}
              {modalType === 'policial' && (
                <>
                  <TextInput style={styles.input} placeholder="Matrícula" value={currentItem.matricula} onChangeText={t=>setCurrentItem({...currentItem, matricula:t})} />
                  <TextInput style={styles.input} placeholder="Nome" value={currentItem.nome} onChangeText={t=>setCurrentItem({...currentItem, nome:t})} />
                  <View style={styles.pickerContainer}>
                    <Picker selectedValue={currentItem.funcao} onValueChange={t=>setCurrentItem({...currentItem, funcao:t})}>
                       <Picker.Item label="Função..." value="" />
                       <Picker.Item label="Comandante" value="comandante" /><Picker.Item label="Motorista" value="motorista" /><Picker.Item label="Patrulheiro" value="patrulheiro" />
                    </Picker>
                  </View>
                </>
              )}
              {modalType === 'envolvido' && (
                 <>
                  <View style={styles.pickerContainer}>
                    <Picker selectedValue={currentItem.tipo} onValueChange={t=>setCurrentItem({...currentItem, tipo:t})}>
                      <Picker.Item label="Tipo..." value="" />
                      <Picker.Item label="Suspeito" value="suspeito" />
                      <Picker.Item label="Vítima" value="vitima" />
                      <Picker.Item label="Testemunha" value="testemunha" />
                    </Picker>
                  </View>
                  
                  {currentItem.tipo === 'suspeito' && (
                    <TextInput 
                        style={[styles.input, {borderColor: '#d32f2f', borderWidth: 1}]} 
                        placeholder="Crimes Cometidos (Ex: Roubo, Homicídio)" 
                        value={currentItem.crimesCometidos} 
                        onChangeText={t=>setCurrentItem({...currentItem, crimesCometidos:t})} 
                    />
                  )}

                  <TextInput style={styles.input} placeholder="Nome" value={currentItem.nome} onChangeText={t=>setCurrentItem({...currentItem, nome:t})} />
                  <TextInput style={styles.input} placeholder="CPF" value={currentItem.cpf} onChangeText={t=>setCurrentItem({...currentItem, cpf:t})} keyboardType="numeric"/>
                  <TextInput style={styles.input} placeholder="RG" value={currentItem.rg} onChangeText={t=>setCurrentItem({...currentItem, rg:t})} keyboardType="numeric"/>
                  <TextInput style={styles.input} placeholder="Data Nasc." value={currentItem.dataNascimento} onChangeText={t=>setCurrentItem({...currentItem, dataNascimento:t})} />
                  <TextInput style={styles.input} placeholder="Nome da Mãe" value={currentItem.nomeMae} onChangeText={t=>setCurrentItem({...currentItem, nomeMae:t})} />
                  <TextInput style={styles.input} placeholder="Nome do Pai" value={currentItem.nomePai} onChangeText={t=>setCurrentItem({...currentItem, nomePai:t})} />
                  <TextInput style={styles.input} placeholder="Endereço" value={currentItem.endereco} onChangeText={t=>setCurrentItem({...currentItem, endereco:t})} />
                 </>
              )}
              {modalType === 'armaFogo' && (
                <>
                   <View style={styles.pickerContainer}>
                    <Picker selectedValue={currentItem.tipo} onValueChange={t=>setCurrentItem({...currentItem, tipo:t})}>
                      <Picker.Item label="Tipo..." value="" />
                      <Picker.Item label="Pistola" value="pistola" /><Picker.Item label="Revólver" value="revolver" /><Picker.Item label="Fuzil" value="fuzil" />
                    </Picker>
                  </View>
                  <TextInput style={styles.input} placeholder="Calibre" value={currentItem.calibre} onChangeText={t=>setCurrentItem({...currentItem, calibre:t})} />
                  <TextInput style={styles.input} placeholder="Nº Série" value={currentItem.numeroSerie} onChangeText={t=>setCurrentItem({...currentItem, numeroSerie:t})} />
                </>
              )}
               {modalType === 'armaBranca' && (
                <>
                   <View style={styles.pickerContainer}>
                    <Picker selectedValue={currentItem.tipo} onValueChange={t=>setCurrentItem({...currentItem, tipo:t})}>
                      <Picker.Item label="Tipo..." value="" />
                      <Picker.Item label="Faca" value="faca" /><Picker.Item label="Facão" value="facao" /><Picker.Item label="Canivete" value="canivete" />
                    </Picker>
                  </View>
                  <TextInput style={styles.input} placeholder="Obs" value={currentItem.obs} onChangeText={t=>setCurrentItem({...currentItem, obs:t})} />
                </>
              )}
               {modalType === 'veiculo' && (
                  <>
                    <TextInput style={styles.input} placeholder="Tipo (Carro/Moto)" value={currentItem.tipo} onChangeText={t=>setCurrentItem({...currentItem, tipo:t})} />
                    <TextInput style={styles.input} placeholder="Placa" value={currentItem.placa} onChangeText={t=>setCurrentItem({...currentItem, placa:t})} />
                    <TextInput style={styles.input} placeholder="Chassi" value={currentItem.chassi} onChangeText={t=>setCurrentItem({...currentItem, chassi:t})} />
                    <TextInput style={styles.input} placeholder="Marca/Modelo" value={currentItem.marcaModelo} onChangeText={t=>setCurrentItem({...currentItem, marcaModelo:t})} />
                    <TextInput style={styles.input} placeholder="Cor" value={currentItem.cor} onChangeText={t=>setCurrentItem({...currentItem, cor:t})} />
                  </>
               )}
              {modalType === 'objeto' && (
                <>
                  <TextInput style={styles.input} placeholder="Marca/Modelo" value={currentItem.marcaModelo} onChangeText={t=>setCurrentItem({...currentItem, marcaModelo:t})} />
                  <TextInput style={styles.input} placeholder="Identificador" value={currentItem.identificador} onChangeText={t=>setCurrentItem({...currentItem, identificador:t})} />
                  <View style={styles.pickerContainer}>
                    <Picker selectedValue={currentItem.situacao} onValueChange={t=>setCurrentItem({...currentItem, situacao:t})}>
                      <Picker.Item label="Situação..." value="" />
                      <Picker.Item label="Apreendido" value="apreendido" />
                      <Picker.Item label="Restituído" value="restituido" />
                    </Picker>
                  </View>
                </>
              )}
              {modalType === 'municao' && (
                <>
                   <View style={styles.pickerContainer}>
                    <Picker selectedValue={currentItem.tipo} onValueChange={t=>setCurrentItem({...currentItem, tipo:t})}>
                      <Picker.Item label="Tipo..." value="" />
                      <Picker.Item label="Intacta" value="intacta" />
                      <Picker.Item label="Deflagrada" value="deflagrada" />
                    </Picker>
                  </View>
                  <TextInput style={styles.input} placeholder="Quantidade" value={currentItem.quantidade} onChangeText={t=>setCurrentItem({...currentItem, quantidade:t})} keyboardType="numeric"/>
                </>
              )}
              {modalType === 'droga' && (
                <>
                  <View style={styles.pickerContainer}>
                    <Picker selectedValue={currentItem.tipo} onValueChange={t=>setCurrentItem({...currentItem, tipo:t})}>
                      <Picker.Item label="Tipo..." value="" />
                      <Picker.Item label="Maconha" value="maconha" />
                      <Picker.Item label="Cocaína" value="cocaina" />
                      <Picker.Item label="Crack" value="crack" />
                    </Picker>
                  </View>
                  <View style={styles.pickerContainer}>
                    <Picker selectedValue={currentItem.apresentacao} onValueChange={t=>setCurrentItem({...currentItem, apresentacao:t})}>
                      <Picker.Item label="Apresentação..." value="" />
                      <Picker.Item label="Tablete" value="tablete" />
                      <Picker.Item label="Papelote" value="papelote" />
                      <Picker.Item label="Pó" value="po" />
                    </Picker>
                  </View>
                  <TextInput style={styles.input} placeholder="Qtd/Unid (Ex: 10g)" value={currentItem.qtdUnid} onChangeText={t=>setCurrentItem({...currentItem, qtdUnid:t})} />
                  <TextInput style={styles.input} placeholder="Embalagem" value={currentItem.embalagem} onChangeText={t=>setCurrentItem({...currentItem, embalagem:t})} />
                </>
              )}

              <View style={{flexDirection:'row', gap:10, marginTop:20}}>
                <TouchableOpacity style={[styles.btn, styles.btnDraft]} onPress={()=>setModalVisible(false)}>
                   <Text>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn, styles.btnNext]} onPress={saveModalItem}>
                   <Text style={{color:'white'}}>Salvar Item</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#145a8d', marginBottom: 10 },
  label: { fontWeight: 'bold', color: '#333', marginTop: 5 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginVertical: 5, backgroundColor: '#f9f9f9' },
  textArea: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, height: 100, textAlignVertical: 'top', backgroundColor: '#f9f9f9' },
  pickerContainer: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginVertical: 5, backgroundColor: '#f9f9f9' },
  btnAdd: { backgroundColor: '#e3f2fd', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 5 },
  btnAddText: { color: '#145a8d', fontWeight: 'bold' },
  listItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, backgroundColor: '#f0f0f0', borderRadius: 8, marginBottom: 5 },
  listItemText: { color: '#333', flex: 1 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 10, padding: 20, maxHeight: '80%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  btn: { flex: 1, padding: 14, borderRadius: 8, alignItems: 'center' },
  btnDraft: { backgroundColor: '#ddd' },
  btnNext: { backgroundColor: '#28a745' },
  btnTextDark: { color: '#333', fontWeight: 'bold' },
  btnTextLight: { color: '#fff', fontWeight: 'bold' },
});
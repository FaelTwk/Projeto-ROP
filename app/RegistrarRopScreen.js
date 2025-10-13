import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Switch,
  Platform,
  Alert,
  StatusBar,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native'; // Vai ser usado para navegação entre telas

// Lista de cidades da região de Sergipe para o Picker
const CIDADES_SERGIPE = [
  'Aracaju', 'São Cristóvão', 'Nossa Senhora do Socorro', 'Itabaiana', 'Lagarto',
  'Estância', 'Tobias Barreto', 'Barra dos Coqueiros', 'Capela', 'Propriá',
];

// Função para gerar um número de atendimento aleatório
const gerarNumeroAtendimento = () => {
  const parte1 = Math.floor(Math.random() * 900) + 100;
  const parte2 = Math.floor(Math.random() * 900) + 100;
  const parte3 = Math.floor(Math.random() * 900) + 100;
  const parte4 = Math.floor(Math.random() * 90) + 10;
  const parte5 = Math.floor(Math.random() * 900) + 100;
  return `${parte1}${parte2}${parte3}${parte4}${parte5}`;
};

// Componente principal da tela de registro de ROP
export default function RegistrarRopScreen() {
  // const navigation = useNavigation(); // Hook do React Navigation para navegação

  // Estados para armazenar os dados do formulário
  const [tipoRop, setTipoRop] = useState('');
  const [evento, setEvento] = useState('');
  const [destino, setDestino] = useState('');
  const [cidade, setCidade] = useState('Aracaju');
  const [bairro, setBairro] = useState('');
  const [logradouro, setLogradouro] = useState('');
  const [numero, setNumero] = useState('');
  const [pontoReferencia, setPontoReferencia] = useState('');
  const [numAtendimento, setNumAtendimento] = useState('');

  // Estados para data e hora com seletores nativos
  const [data, setData] = useState(new Date());
  const [hora, setHora] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Estados para os switches dos "Elementos presentes"
  const [envolvidos, setEnvolvidos] = useState(false);
  const [armaFogo, setArmaFogo] = useState(false);
  const [armaBranca, setArmaBranca] = useState(false);
  const [municoes, setMunicoes] = useState(false);
  const [dinheiro, setDinheiro] = useState(false);
  const [drogas, setDrogas] = useState(false);
  const [objetos, setObjetos] = useState(false);
  const [veiculos, setVeiculos] = useState(false);

  // Efeito para gerar o número de atendimento ao carregar a tela
  useEffect(() => {
    setNumAtendimento(gerarNumeroAtendimento());
  }, []);

  // Funções de manipulação para os seletores de data e hora
  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || data;
    setShowDatePicker(Platform.OS === 'ios');
    setData(currentDate);
  };

  const onChangeTime = (event, selectedTime) => {
    const currentTime = selectedTime || hora;
    setShowTimePicker(Platform.OS === 'ios');
    setHora(currentTime);
  };

  // Função para salvar o rascunho (simulação)
  const handleSaveDraft = () => {
    Alert.alert('Rascunho salvo', 'Seu rascunho foi salvo com sucesso.');
  };
  
  // Função para lidar com a submissão do formulário (botão 'Próximo')
  const handleNext = () => {
    // Validação de campos obrigatórios
    if (!tipoRop || !evento) {
      Alert.alert('Erro de Validação', 'Por favor, preencha os campos obrigatórios (Tipo de ROP e Evento/Operação).');
      return;
    }

    // Preparação dos dados para a próxima página
    const dadosParaProximaPagina = {
      tipoRop, evento, destino, cidade, bairro, logradouro, numero,
      pontoReferencia, numAtendimento,
      data: data.toISOString().split('T')[0],
      hora: hora.toTimeString().split(' ')[0].substring(0, 5),
      elementosSelecionados: {
        envolvidos, armaFogo, armaBranca, municoes, dinheiro, drogas, objetos, veiculos,
      },
    };

    console.log('Dados para Próxima Página:', dadosParaProximaPagina);
    Alert.alert('Sucesso', 'Denúncia registrada, prosseguindo para o próximo passo.');

  };

  return (
    <View style={styles.fullScreen}>
      <StatusBar barStyle="light-content" backgroundColor="#145a8d" />

      {/* Cabeçalho */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Registrar ROP</Text>
        <Text style={styles.headerSubtitle}>Passo 1 de 3</Text>
      </View>

      {/* ScrollView que contém o formulário */}
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {/* Container principal do formulário */}
        <View style={styles.formContainer}>

          <Text style={styles.label}>Tipo de ROP<Text style={styles.requiredIndicator}>*</Text></Text>
          <View style={styles.pickerContainer}>
            <Picker selectedValue={tipoRop} onValueChange={setTipoRop} style={styles.picker}>
              <Picker.Item label="Selecione..." value="" />
              <Picker.Item label="Ordinário" value="ordinario" />
              <Picker.Item label="Extraordinário" value="extraordinario" />
              <Picker.Item label="Específico" value="especifico" />
            </Picker>
          </View>

          <Text style={styles.label}>Evento/Operação<Text style={styles.requiredIndicator}>*</Text></Text>
          <View style={styles.pickerContainer}>
            <Picker selectedValue={evento} onValueChange={setEvento} style={styles.picker}>
              <Picker.Item label="Selecione..." value="" />
              <Picker.Item label="Patrulha" value="patrulha" />
              <Picker.Item label="Operação Especial" value="operacao_especial" />
              <Picker.Item label="Abordagem" value="abordagem" />
              <Picker.Item label="Investigação" value="investigacao" />
            </Picker>
          </View>

          <Text style={styles.label}>Destino</Text>
          <TextInput style={styles.input} value={destino} onChangeText={setDestino} placeholder="Ex: Centro da cidade" placeholderTextColor="#999" />

          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Cidade</Text>
              <View style={styles.pickerContainer}>
                <Picker selectedValue={cidade} onValueChange={setCidade} style={styles.picker}>
                  {CIDADES_SERGIPE.map((city) => (<Picker.Item key={city} label={city} value={city} />))}
                </Picker>
              </View>
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Bairro</Text>
              <TextInput style={styles.input} value={bairro} onChangeText={setBairro} placeholder="Ex: Grageru" placeholderTextColor="#999" />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Logradouro do fato</Text>
              <TextInput style={styles.input} value={logradouro} onChangeText={setLogradouro} placeholder="Ex: Av. Beira Mar" placeholderTextColor="#999" />
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Número</Text>
              <TextInput style={styles.input} value={numero} onChangeText={setNumero} keyboardType="numeric" placeholder="Ex: 123" placeholderTextColor="#999" />
            </View>
          </View>

          <Text style={styles.label}>Ponto de referência</Text>
          <TextInput style={styles.input} value={pontoReferencia} onChangeText={setPontoReferencia} placeholder="Ex: Próximo ao shopping" placeholderTextColor="#999" />

          <Text style={styles.label}>Número de atendimento</Text>
          <TextInput style={[styles.input, styles.atendimentoNumber]} value={numAtendimento} editable={false} />

          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Data</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateInput}>
                <Text style={styles.dateInputText}>{data.toLocaleDateString('pt-BR')}</Text>
              </TouchableOpacity>
              {showDatePicker && (<DateTimePicker value={data} mode="date" display="default" onChange={onChangeDate} />)}
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Hora</Text>
              <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.dateInput}>
                <Text style={styles.dateInputText}>{hora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</Text>
              </TouchableOpacity>
              {showTimePicker && (<DateTimePicker value={hora} mode="time" display="default" onChange={onChangeTime} />)}
            </View>
          </View>

          <Text style={styles.sectionTitle}>Elementos presentes</Text>

          {/* Switches para seleção de elementos */}
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Envolvidos</Text>
            <Switch trackColor={{ false: '#ccc', true: '#28a745' }} thumbColor={envolvidos ? '#fff' : '#f4f3f4'} ios_backgroundColor="#e9e9ea" onValueChange={setEnvolvidos} value={envolvidos} />
          </View>
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Arma de fogo</Text>
            <Switch trackColor={{ false: '#ccc', true: '#28a745' }} thumbColor={armaFogo ? '#fff' : '#f4f3f4'} ios_backgroundColor="#e9e9ea" onValueChange={setArmaFogo} value={armaFogo} />
          </View>
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Arma branca</Text>
            <Switch trackColor={{ false: '#ccc', true: '#28a745' }} thumbColor={armaBranca ? '#fff' : '#f4f3f4'} ios_backgroundColor="#e9e9ea" onValueChange={setArmaBranca} value={armaBranca} />
          </View>
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Munições</Text>
            <Switch trackColor={{ false: '#ccc', true: '#28a745' }} thumbColor={municoes ? '#fff' : '#f4f3f4'} ios_backgroundColor="#e9e9ea" onValueChange={setMunicoes} value={municoes} />
          </View>
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Dinheiro</Text>
            <Switch trackColor={{ false: '#ccc', true: '#28a745' }} thumbColor={dinheiro ? '#fff' : '#f4f3f4'} ios_backgroundColor="#e9e9ea" onValueChange={setDinheiro} value={dinheiro} />
          </View>
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Drogas</Text>
            <Switch trackColor={{ false: '#ccc', true: '#28a745' }} thumbColor={drogas ? '#fff' : '#f4f3f4'} ios_backgroundColor="#e9e9ea" onValueChange={setDrogas} value={drogas} />
          </View>
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Objetos</Text>
            <Switch trackColor={{ false: '#ccc', true: '#28a745' }} thumbColor={objetos ? '#fff' : '#f4f3f4'} ios_backgroundColor="#e9e9ea" onValueChange={setObjetos} value={objetos} />
          </View>
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Veículos</Text>
            <Switch trackColor={{ false: '#ccc', true: '#28a745' }} thumbColor={veiculos ? '#fff' : '#f4f3f4'} ios_backgroundColor="#e9e9ea" onValueChange={setVeiculos} value={veiculos} />
          </View>

          {/* Botões de ação: Salvar rascunho e Próximo */}
          <View style={styles.buttons}>
            <TouchableOpacity style={styles.btnDraft} onPress={handleSaveDraft}>
              <Text style={styles.btnDraftText}>Salvar rascunho</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnNext} onPress={handleNext}>
              <Text style={styles.btnNextText}>Próximo</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </View>
  );
}

// Definição dos estilos usando StyleSheet.create para organização e performance
const styles = StyleSheet.create({
  fullScreen: {
    flex: 1, // Ocupa toda a tela
    backgroundColor: '#f4f4f4',
  },
  header: {
    backgroundColor: '#145a8d',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 40,
    paddingBottom: 15,
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#fff',
    fontSize: 15,
    marginTop: 4,
    opacity: 0.9,
  },
  scrollViewContent: {
    flexGrow: 1, // Permite que o conteúdo do ScrollView seja rolavel
    paddingHorizontal: 0, // Removido padding horizontal
    paddingVertical: 0,   // Removido padding vertical para encostar no header/bottom
  },
  formContainer: {
    flex: 1, // Permite que o formContainer preencha o espaço disponível
    backgroundColor: '#fff',
    borderRadius: 0, // Removido border radius para encostar nas bordas
    padding: 20, // Mantido padding interno para o conteúdo do formulário
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2.22,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
    marginBottom: 6,
  },
  requiredIndicator: {
    color: 'red', // Asterisco vermelho para campos obrigatórios
    fontSize: 14,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: Platform.OS === 'ios' ? 14 : 12,
    fontSize: 15,
    backgroundColor: '#fefefe',
    color: '#333',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fefefe',
    height: Platform.OS === 'ios' ? 48 : 50,
    justifyContent: 'center',
  },
  picker: {
    height: Platform.OS === 'ios' ? 48 : 50,
    width: '100%',
  },
  row: {
    flexDirection: 'row', // Itens lado a lado
    justifyContent: 'space-between',
    gap: 10, // Espaçamento entre os itens na linha
    marginTop: 5,
  },
  column: {
    flex: 1, // Cada coluna ocupa espaço igual
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: Platform.OS === 'ios' ? 14 : 12,
    justifyContent: 'center',
    height: Platform.OS === 'ios' ? 48 : 50,
    backgroundColor: '#fefefe',
  },
  dateInputText: {
    fontSize: 15,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#145a8d',
    marginTop: 25,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 5,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
    paddingVertical: 4,
  },
  switchLabel: {
    fontSize: 16,
    color: '#555',
  },
  atendimentoNumber: {
    backgroundColor: '#e0f7fa',
    borderColor: '#a7d9f7',
    fontWeight: 'bold',
    fontSize: 16,
    color: '#007bff',
    paddingVertical: 14,
    textAlign: 'center',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  btnDraft: {
    flex: 1,
    backgroundColor: '#e0e0e0',
    padding: 15,
    borderRadius: 8,
    marginRight: 10,
    alignItems: 'center',
  },
  btnDraftText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
  },
  btnNext: {
    flex: 1,
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 8,
    marginLeft: 10,
    alignItems: 'center',
  },
  btnNextText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
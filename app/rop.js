import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Switch,
  Platform,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useFocusEffect } from 'expo-router'; 
import { MaterialCommunityIcons } from '@expo/vector-icons'; 
import MaskInput, { Masks } from 'react-native-mask-input'; 

const CIDADES_SERGIPE = [
  'Aracaju', 'São Cristóvão', 'Nossa Senhora do Socorro', 'Itabaiana', 'Lagarto',
  'Estância', 'Tobias Barreto', 'Barra dos Coqueiros', 'Capela', 'Propriá',
];

const BAIRROS_ARACAJU = [
  '13 de Julho', 'Aeroporto', 'América', 'Atalaia', 'Bugio', 'Castelo Branco', 'Centro',
  'Cidade Nova', 'Cirurgia', 'Coroa do Meio', 'Farolândia', 'Getúlio Vargas',
  'Grageru', 'Inácio Barbosa', 'Industrial', 'Jabotiana', 'Jardim Centenário',
  'Jardins', 'Lamarão', 'Luzia', 'Olaria', 'Pereira Lobo', 'Ponto Novo',
  'Porto Dantas', 'Salgado Filho', 'Santa Maria', 'Santo Antônio', 'Santos Dumont',
  'São Conrado', 'São José', 'Siqueira Campos', 'Suíça', 'Treze de Julho',
  'Zona de Expansão', 'Outro'
];

const gerarNumeroAtendimento = () => {
  const p1 = Math.floor(Math.random() * 900) + 100;
  const p2 = Math.floor(Math.random() * 900) + 100;
  const p3 = Math.floor(Math.random() * 9000) + 1000;
  const year = new Date().getFullYear();
  return `${p1}.${p2}.${p3}/${year}`;
};

const defaultElementos = {
  policiaisEnvolvidos: false, 
  envolvidos: false,
  armaFogo: false,
  armaBranca: false,
  municoes: false,
  dinheiro: false,
  drogas: false,
  objetos: false,
  veiculos: false,
};

export default function RegistrarRopScreen() {
  const router = useRouter(); 

  const [tipoRop, setTipoRop] = useState('');
  const [eventoOperacao, setEventoOperacao] = useState('');
  const [destino, setDestino] = useState('');
  const [cidade, setCidade] = useState('Aracaju');
  const [bairro, setBairro] = useState('');
  const [bairroInput, setBairroInput] = useState('');
  const [logradouro, setLogradouro] = useState('');
  const [numero, setNumero] = useState('');
  const [pontoReferencia, setPontoReferencia] = useState('');
  const [numeroAtendimento, setNumeroAtendimento] = useState('');

  // Estados para Data e Hora (Strings para a Máscara)
  const [dataString, setDataString] = useState('');
  const [horaString, setHoraString] = useState('');
  
  // Objeto Date real para lógica interna
  const [dateObj, setDateObj] = useState(new Date());
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [elementosPresentes, setElementosPresentes] = useState(defaultElementos);
  const [isLoading, setIsLoading] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      const carregarDados = async () => {
        const token = await AsyncStorage.getItem('@user_token');
        if (!token) {
          router.replace('/login');
          return;
        }
        
        const rascunho = await AsyncStorage.getItem('@rop_temporario');
        if (rascunho) {
          const d = JSON.parse(rascunho);
          setTipoRop(d.tipoRop || '');
          setEventoOperacao(d.eventoOperacao || '');
          setDestino(d.nmDestinatario || '');
          setCidade(d.cidade || 'Aracaju');
          
          const b = d.nmBairro || '';
          if (d.cidade === 'Aracaju' && BAIRROS_ARACAJU.includes(b)) {
            setBairro(b);
            setBairroInput('');
          } else {
            setBairro('Outro');
            setBairroInput(b);
          }
          
          setLogradouro(d.nmLogradouro || '');
          setNumero(d.nmLogradouroNumero || '');
          setPontoReferencia(d.nmProntoReferencia || '');
          setNumeroAtendimento(d.nmNumeroCiosp || gerarNumeroAtendimento());
          
          // Recupera Data
          try {
            const dt = new Date(d.dhFato);
            if (!isNaN(dt.getTime())) {
                setDateObj(dt);
                setDataString(dt.toLocaleDateString('pt-BR'));
                setHoraString(dt.toLocaleTimeString('pt-BR').substring(0, 5));
            }
          } catch(e) {}

          if (d.elementosPresentes) setElementosPresentes(d.elementosPresentes);
        } else {
          // Novo ROP
          setNumeroAtendimento(gerarNumeroAtendimento());
          setElementosPresentes(defaultElementos);
          const agora = new Date();
          setDateObj(agora);
          setDataString(agora.toLocaleDateString('pt-BR'));
          setHoraString(agora.toLocaleTimeString('pt-BR').substring(0, 5));
        }
      };
      carregarDados();
    }, [])
  );

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const nova = new Date(dateObj);
      nova.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      setDateObj(nova);
      setDataString(nova.toLocaleDateString('pt-BR'));
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const nova = new Date(dateObj);
      nova.setHours(selectedTime.getHours(), selectedTime.getMinutes());
      setDateObj(nova);
      setHoraString(nova.toLocaleTimeString('pt-BR').substring(0, 5));
    }
  };

  const handleElementoChange = (key) => {
    setElementosPresentes(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSalvarRascunho = async () => {
    setIsLoading(true);
    try {
      // CORREÇÃO: Pegar o usuário logado para vincular ao rascunho
      const usuario = await AsyncStorage.getItem('@usuario_logado');

      let dataIso = new Date().toISOString(); 

      // Tenta aproveitar a data digitada
      if (dataString.length === 10 && horaString.length === 5) {
          const [dia, mes, ano] = dataString.split('/');
          const [hora, min] = horaString.split(':');
          const dataTentativa = new Date(ano, mes - 1, dia, hora, min);
          
          if (!isNaN(dataTentativa.getTime())) {
              dataIso = dataTentativa.toISOString();
          }
      }

      const dados = {
        usuario, // Importante: Salvar o dono do rascunho
        tipoRop, eventoOperacao, destino, cidade,
        nmBairro: (cidade === 'Aracaju' && bairro !== 'Outro') ? bairro : bairroInput,
        nmLogradouro: logradouro, nmLogradouroNumero: numero, nmProntoReferencia: pontoReferencia,
        nmNumeroCiosp: numeroAtendimento,
        dhFato: dataIso,
        elementosPresentes,
      };

      await AsyncStorage.setItem('@rop_rascunho', JSON.stringify(dados));
      await AsyncStorage.removeItem('@rop_temporario');
      
      router.replace('/lista');
    } catch (e) {
      console.error(e);
      Alert.alert('Erro', 'Falha ao salvar rascunho.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextPress = async () => {
    if (!tipoRop || !eventoOperacao) {
      Alert.alert('Erro', 'Preencha Tipo e Evento.');
      return;
    }
    
    if (dataString.length !== 10 || horaString.length !== 5) {
       Alert.alert('Erro', 'Data ou Hora incompletas.');
       return;
    }

    try {
      // CORREÇÃO: Pegar o usuário também ao avançar
      const usuario = await AsyncStorage.getItem('@usuario_logado');

      const [dia, mes, ano] = dataString.split('/');
      const [hora, min] = horaString.split(':');
      const dataFinal = new Date(ano, mes - 1, dia, hora, min);

      if (isNaN(dataFinal.getTime())) {
        Alert.alert('Erro', 'Data inválida.');
        return;
      }
      if (dataFinal > new Date()) {
        Alert.alert('Erro', 'Data futura não permitida.');
        return;
      }

      setIsLoading(true);
      const dados = {
        usuario, // Vincula o usuário
        tipoRop, eventoOperacao, destino, cidade,
        nmBairro: (cidade === 'Aracaju' && bairro !== 'Outro') ? bairro : bairroInput,
        nmLogradouro: logradouro, nmLogradouroNumero: numero, nmProntoReferencia: pontoReferencia,
        nmNumeroCiosp: numeroAtendimento,
        dhFato: dataFinal.toISOString(),
        elementosPresentes,
      };

      await AsyncStorage.setItem('@rop_temporario', JSON.stringify(dados));
      router.push('/pagina2');
    } catch (e) {
      Alert.alert('Erro', 'Falha ao processar dados.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/lista')} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Registrar ROP</Text>
        <Text style={styles.headerSubtitle}>Passo 1 de 3</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <Text style={styles.groupTitle}>CLASSIFICAÇÃO</Text>
        
        <Text style={styles.label}>Tipo de ROP*</Text>
        <View style={styles.pickerContainer}>
          <Picker selectedValue={tipoRop} onValueChange={setTipoRop}>
            <Picker.Item label="Selecione..." value="" />
            <Picker.Item label="Ordinário" value="ordinario" />
            <Picker.Item label="Extraordinário" value="extraordinario" />
            <Picker.Item label="Específico" value="especifico" />
          </Picker>
        </View>

        <Text style={styles.label}>Evento/Operação*</Text>
        <View style={styles.pickerContainer}>
          <Picker selectedValue={eventoOperacao} onValueChange={setEventoOperacao}>
            <Picker.Item label="Selecione..." value="" />
            <Picker.Item label="Patrulha" value="patrulha" />
            <Picker.Item label="Operação Especial" value="operacao_especial" />
            <Picker.Item label="Abordagem" value="abordagem" />
          </Picker>
        </View>

        <Text style={styles.label}>Nº Atendimento</Text>
        <TextInput style={[styles.input, styles.readOnly]} value={numeroAtendimento} editable={false} />

        <Text style={styles.groupTitle}>LOCAL E DATA</Text>

        <Text style={styles.label}>Cidade</Text>
        <View style={styles.pickerContainer}>
          <Picker selectedValue={cidade} onValueChange={setCidade}>
            {CIDADES_SERGIPE.map((c, i) => <Picker.Item key={i} label={c} value={c} />)}
          </Picker>
        </View>

        <Text style={styles.label}>Bairro</Text>
        {cidade === 'Aracaju' ? (
          <View style={styles.pickerContainer}>
            <Picker selectedValue={bairro} onValueChange={setBairro}>
              <Picker.Item label="Selecione..." value="" />
              {BAIRROS_ARACAJU.map((b, i) => <Picker.Item key={i} label={b} value={b} />)}
            </Picker>
          </View>
        ) : null}
        
        {(cidade !== 'Aracaju' || bairro === 'Outro') && (
          <TextInput 
            style={[styles.input, {marginTop: 5}]} 
            value={bairroInput} 
            onChangeText={setBairroInput} 
            placeholder="Digite o nome do bairro"
          />
        )}

        <Text style={styles.label}>Logradouro</Text>
        <TextInput style={styles.input} value={logradouro} onChangeText={setLogradouro} placeholder="Rua, Avenida..." />
        
        <View style={styles.row}>
          <View style={{flex: 1}}>
            <Text style={styles.label}>Número</Text>
            <TextInput style={styles.input} value={numero} onChangeText={setNumero} keyboardType="numeric"/>
          </View>
          <View style={{flex: 1.5}}>
            <Text style={styles.label}>Ponto Ref.</Text>
            <TextInput style={styles.input} value={pontoReferencia} onChangeText={setPontoReferencia} placeholder="Próximo a..."/>
          </View>
        </View>

        <View style={styles.row}>
          <View style={{flex: 1}}>
            <Text style={styles.label}>Data do Fato</Text>
            <View style={styles.inputWithIcon}>
                <MaskInput
                    style={styles.inputMask}
                    value={dataString}
                    onChangeText={setDataString}
                    mask={Masks.DATE_DDMMYYYY}
                    keyboardType="numeric"
                    placeholder="DD/MM/AAAA"
                />
                <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.iconButton}>
                    <MaterialCommunityIcons name="calendar" size={24} color="#145a8d" />
                </TouchableOpacity>
            </View>
          </View>
          <View style={{flex: 0.8}}>
            <Text style={styles.label}>Hora</Text>
            <View style={styles.inputWithIcon}>
                <MaskInput
                    style={styles.inputMask}
                    value={horaString}
                    onChangeText={setHoraString}
                    mask={[/\d/, /\d/, ':', /\d/, /\d/]} 
                    keyboardType="numeric"
                    placeholder="HH:MM"
                />
                <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.iconButton}>
                    <MaterialCommunityIcons name="clock-outline" size={24} color="#145a8d" />
                </TouchableOpacity>
            </View>
          </View>
        </View>
        
        {showDatePicker && <DateTimePicker value={dateObj} mode="date" onChange={handleDateChange} maximumDate={new Date()} />}
        {showTimePicker && <DateTimePicker value={dateObj} mode="time" onChange={handleTimeChange} maximumDate={new Date()} />}

        <Text style={styles.groupTitle}>ELEMENTOS PRESENTES</Text>
        {Object.keys(elementosPresentes).map(key => {
          let label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
          if(key === 'armaFogo') label = 'Arma de Fogo';
          if(key === 'armaBranca') label = 'Arma Branca';
          if(key === 'policiaisEnvolvidos') label = 'Policiais Envolvidos';

          return (
            <View key={key} style={styles.switchContainer}>
              <Text style={styles.switchLabel}>{label}</Text>
              <Switch 
                value={elementosPresentes[key]} 
                onValueChange={() => handleElementoChange(key)} 
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={elementosPresentes[key] ? "#145a8d" : "#f4f3f4"}
              />
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={[styles.btn, styles.btnDraft]} onPress={handleSalvarRascunho}>
          <Text style={styles.btnTextDark}>Rascunho</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.btnNext]} onPress={handleNextPress}>
          <Text style={styles.btnTextLight}>Próximo</Text>
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
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee', padding: 15, flexDirection: 'row', gap: 10 },
  groupTitle: { fontSize: 12, fontWeight: 'bold', color: '#888', marginTop: 20, marginBottom: 5, letterSpacing: 1 },
  label: { fontSize: 15, fontWeight: 'bold', color: '#145a8d', marginTop: 10, marginBottom: 5 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, fontSize: 15, backgroundColor: '#fefefe' },
  inputWithIcon: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, backgroundColor: '#fefefe' },
  inputMask: { flex: 1, padding: 10, fontSize: 15 },
  iconButton: { padding: 10 },
  pickerContainer: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, overflow: 'hidden', backgroundColor: '#fefefe' },
  row: { flexDirection: 'row', gap: 10 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#145a8d', marginTop: 25, marginBottom: 10, borderBottomWidth: 1, borderColor: '#eee', paddingBottom: 5 },
  switchContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 5 },
  switchLabel: { fontSize: 16, color: '#555' },
  readOnly: { backgroundColor: '#e9ecef', color: '#495057', fontWeight: 'bold', textAlign: 'center' },
  btn: { flex: 1, padding: 14, borderRadius: 8, alignItems: 'center' },
  btnDraft: { backgroundColor: '#ddd' },
  btnNext: { backgroundColor: '#28a745' },
  btnTextDark: { color: '#333', fontWeight: 'bold' },
  btnTextLight: { color: '#fff', fontWeight: 'bold' }
});
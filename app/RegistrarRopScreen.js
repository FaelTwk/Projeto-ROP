import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, Platform, StatusBar } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';

const RegistrarRopScreen = () => {
  const [tipoRop, setTipoRop] = useState('');
  const [evento, setEvento] = useState('');
  const [destino, setDestino] = useState('');
  const [cidade, setCidade] = useState('Aracaju');
  const [bairro, setBairro] = useState('');
  const [logradouro, setLogradouro] = useState('');
  const [numero, setNumero] = useState('');
  const [pontoReferencia, setPontoReferencia] = useState('');
  const [numAtendimento, setNumAtendimento] = useState('');
  const [data, setData] = useState(new Date());
  const [hora, setHora] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [envolvidos, setEnvolvidos] = useState(false);
  const [armaFogo, setArmaFogo] = useState(false);
  const [armaBranca, setArmaBranca] = useState(false);
  const [municoes, setMunicoes] = useState(false);
  const [dinheiro, setDinheiro] = useState(false);
  const [drogas, setDrogas] = useState(false);
  const [objetos, setObjetos] = useState(false);
  const [veiculos, setVeiculos] = useState(false);

  const cidadesSergipe = [
    'Aracaju',
    'Nossa Senhora do Socorro',
    'São Cristóvão',
    'Barra dos Coqueiros',
    'Itaporanga d\'Ajuda',
    'Laranjeiras',
    'Estância',
    'Itabaiana',
    'Lagarto',
  ];

  useEffect(() => {
    generateNumAtendimento();
  }, []);

  const generateNumAtendimento = () => {
    const randomNum = Math.floor(100000000000 + Math.random() * 900000000000);
    setNumAtendimento(randomNum.toString());
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || data;
    setShowDatePicker(Platform.OS === 'ios');
    setData(currentDate);
  };

  const onTimeChange = (event, selectedTime) => {
    const currentTime = selectedTime || hora;
    setShowTimePicker(Platform.OS === 'ios');
    setHora(currentTime);
  };

  const handleSaveDraft = () => {
    Alert.alert('Rascunho Salvo', 'Os dados foram salvos como rascunho.');
    // Implementar lógica de salvamento real aqui
  };

  const handleSubmit = () => {
    if (!tipoRop || !evento) {
      Alert.alert('Erro', 'Por favor, preencha os campos obrigatórios (Tipo de ROP e Evento/Operação).');
      return;
    }

    const dadosRop = {
      tipoRop,
      evento,
      destino,
      cidade,
      bairro,
      logradouro,
      numero,
      pontoReferencia,
      numAtendimento,
      data: data.toISOString().split('T')[0],
      hora: hora.toTimeString().split(' ')[0],
      elementosSelecionados: {
        envolvidos,
        armaFogo,
        armaBranca,
        municoes,
        dinheiro,
        drogas,
        objetos,
        veiculos,
      },
    };
    console.log('Dados do ROP:', dadosRop);
    Alert.alert('Sucesso', 'Formulário enviado! (Verifique o console para os dados)');
    // Implementar navegação para a próxima página aqui
  };

  return (
    <View style={styles.fullScreenContainer}>
      <ScrollView contentContainerStyle={styles.scrollViewContent} keyboardShouldPersistTaps="handled">
        <Animated.View entering={FadeIn.duration(500)} exiting={FadeOut.duration(500)} layout={Layout.springify()} style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerText}>Registrar ROP</Text>
            <Text style={styles.headerSmallText}>Passo 1 de 3</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Tipo de ROP*</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={tipoRop}
                onValueChange={(itemValue) => setTipoRop(itemValue)}
                style={styles.picker}
                itemStyle={styles.pickerItem}
              >
                <Picker.Item label="Selecione..." value="" />
                <Picker.Item label="Ordinário" value="ordinario" />
                <Picker.Item label="Extraordinário" value="extraordinario" />
                <Picker.Item label="Específico" value="especifico" />
              </Picker>
            </View>

            <Text style={styles.label}>Evento/Operação*</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={evento}
                onValueChange={(itemValue) => setEvento(itemValue)}
                style={styles.picker}
                itemStyle={styles.pickerItem}
              >
                <Picker.Item label="Selecione..." value="" />
                <Picker.Item label="Patrulha" value="patrulha" />
                <Picker.Item label="Operação Especial" value="operacao_especial" />
                <Picker.Item label="Abordagem" value="abordagem" />
                <Picker.Item label="Investigação" value="investigacao" />
              </Picker>
            </View>

            <Text style={styles.label}>Destino</Text>
            <TextInput
              style={styles.input}
              value={destino}
              onChangeText={setDestino}
            />

            <View style={styles.row}>
              <View style={styles.rowItem}>
                <Text style={styles.label}>Cidade</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={cidade}
                    onValueChange={(itemValue) => setCidade(itemValue)}
                    style={styles.picker}
                    itemStyle={styles.pickerItem}
                  >
                    {cidadesSergipe.map((city, index) => (
                      <Picker.Item key={index} label={city} value={city} />
                    ))}
                  </Picker>
                </View>
              </View>
              <View style={styles.rowItem}>
                <Text style={styles.label}>Bairro</Text>
                <TextInput
                  style={styles.input}
                  value={bairro}
                  onChangeText={setBairro}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.rowItem}>
                <Text style={styles.label}>Logradouro do fato</Text>
                <TextInput
                  style={styles.input}
                  value={logradouro}
                  onChangeText={setLogradouro}
                />
              </View>
              <View style={styles.rowItem}>
                <Text style={styles.label}>Número</Text>
                <TextInput
                  style={styles.input}
                  value={numero}
                  onChangeText={setNumero}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <Text style={styles.label}>Ponto de referência</Text>
            <TextInput
              style={styles.input}
              value={pontoReferencia}
              onChangeText={setPontoReferencia}
            />

            <Text style={styles.label}>Número de atendimento</Text>
            <TextInput
              style={[styles.input, styles.numAtendimentoInput]}
              value={numAtendimento}
              editable={false} // Não editável, gerado automaticamente
            />

            <View style={styles.row}>
              <View style={styles.rowItem}>
                <Text style={styles.label}>Data</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePickerButton}>
                  <Text style={styles.datePickerButtonText}>{data.toLocaleDateString()}</Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={data}
                    mode="date"
                    display="default"
                    onChange={onDateChange}
                  />
                )}
              </View>
              <View style={styles.rowItem}>
                <Text style={styles.label}>Hora</Text>
                <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.datePickerButton}>
                  <Text style={styles.datePickerButtonText}>{hora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                </TouchableOpacity>
                {showTimePicker && (
                  <DateTimePicker
                    value={hora}
                    mode="time"
                    display="default"
                    onChange={onTimeChange}
                  />
                )}
              </View>
            </View>

            <Text style={styles.sectionTitle}>Elementos presentes</Text>

            <Animated.View entering={FadeIn} exiting={FadeOut} layout={Layout.springify()}>
              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>Envolvidos</Text>
                <Switch
                  onValueChange={setEnvolvidos}
                  value={envolvidos}
                  trackColor={{ false: '#ccc', true: '#28a745' }}
                  thumbColor={envolvidos ? '#fff' : '#f4f3f4'}
                />
              </View>
            </Animated.View>
            <Animated.View entering={FadeIn} exiting={FadeOut} layout={Layout.springify()}>
              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>Arma de fogo</Text>
                <Switch
                  onValueChange={setArmaFogo}
                  value={armaFogo}
                  trackColor={{ false: '#ccc', true: '#28a745' }}
                  thumbColor={armaFogo ? '#fff' : '#f4f3f4'}
                />
              </View>
            </Animated.View>
            <Animated.View entering={FadeIn} exiting={FadeOut} layout={Layout.springify()}>
              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>Arma branca</Text>
                <Switch
                  onValueChange={setArmaBranca}
                  value={armaBranca}
                  trackColor={{ false: '#ccc', true: '#28a745' }}
                  thumbColor={armaBranca ? '#fff' : '#f4f3f4'}
                />
              </View>
            </Animated.View>
            <Animated.View entering={FadeIn} exiting={FadeOut} layout={Layout.springify()}>
              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>Munições</Text>
                <Switch
                  onValueChange={setMunicoes}
                  value={municoes}
                  trackColor={{ false: '#ccc', true: '#28a745' }}
                  thumbColor={municoes ? '#fff' : '#f4f3f4'}
                />
              </View>
            </Animated.View>
            <Animated.View entering={FadeIn} exiting={FadeOut} layout={Layout.springify()}>
              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>Dinheiro</Text>
                <Switch
                  onValueChange={setDinheiro}
                  value={dinheiro}
                  trackColor={{ false: '#ccc', true: '#28a745' }}
                  thumbColor={dinheiro ? '#fff' : '#f4f3f4'}
                />
              </View>
            </Animated.View>
            <Animated.View entering={FadeIn} exiting={FadeOut} layout={Layout.springify()}>
              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>Drogas</Text>
                <Switch
                  onValueChange={setDrogas}
                  value={drogas}
                  trackColor={{ false: '#ccc', true: '#28a745' }}
                  thumbColor={drogas ? '#fff' : '#f4f3f4'}
                />
              </View>
            </Animated.View>
            <Animated.View entering={FadeIn} exiting={FadeOut} layout={Layout.springify()}>
              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>Objetos</Text>
                <Switch
                  onValueChange={setObjetos}
                  value={objetos}
                  trackColor={{ false: '#ccc', true: '#28a745' }}
                  thumbColor={objetos ? '#fff' : '#f4f3f4'}
                />
              </View>
            </Animated.View>
            <Animated.View entering={FadeIn} exiting={FadeOut} layout={Layout.springify()}>
              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>Veículos</Text>
                <Switch
                  onValueChange={setVeiculos}
                  value={veiculos}
                  trackColor={{ false: '#ccc', true: '#28a745' }}
                  thumbColor={veiculos ? '#fff' : '#f4f3f4'}
                />
              </View>
            </Animated.View>

            <View style={styles.buttons}>
              <TouchableOpacity style={styles.btnDraft} onPress={handleSaveDraft}>
                <Text style={styles.btnText}>Salvar rascunho</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnNext} onPress={handleSubmit}>
                <Text style={styles.btnText}>Próximo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#f4f4f4',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0, // Ajuste para barra de status no Android
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'flex-start', // Alinha o conteúdo ao topo para melhor visualização
    paddingVertical: 0, // Remover padding vertical para ocupar mais espaço
    paddingHorizontal: 0, // Remover padding horizontal
  },
  container: {
    flex: 1, // Ocupa todo o espaço disponível dentro do ScrollView
    backgroundColor: '#fff',
    borderRadius: 0, // Remover borda arredondada para ocupar a tela toda
    shadowColor: 'transparent', // Remover sombra para visual mais limpo
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    overflow: 'hidden',
    marginHorizontal: 0, // Remover margem horizontal
  },
  header: {
    backgroundColor: '#145a8d',
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 40 : 16, // Ajuste para iOS para evitar sobreposição com a notch
  },
  headerText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  headerSmallText: {
    color: '#fff',
    fontSize: 13,
    marginTop: 4,
  },
  form: {
    padding: 16,
  },
  label: {
    marginTop: 15,
    marginBottom: 8,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  input: {
    width: '100%',
    padding: 12, // Aumentar padding para melhor visualização do texto
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8, // Bordas mais arredondadas
    fontSize: 16, // Aumentar tamanho da fonte
    backgroundColor: '#fff',
    marginBottom: 10,
    color: '#333',
  },
  numAtendimentoInput: {
    backgroundColor: '#e0f2f7', // Cor de fundo diferente para destacar
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
    borderColor: '#145a8d',
    borderWidth: 2,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 10,
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  picker: {
    height: 50, // Aumentar altura do picker
    width: '100%',
    color: '#333',
  },
  pickerItem: {
    fontSize: 16, // Aumentar tamanho da fonte dos itens do picker
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 10,
  },
  rowItem: {
    flex: 1,
  },
  sectionTitle: {
    marginTop: 25,
    marginBottom: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    marginBottom: 20,
  },
  btnDraft: {
    flex: 1,
    marginHorizontal: 5,
    padding: 15,
    backgroundColor: '#ddd',
    borderRadius: 8,
    alignItems: 'center',
  },
  btnNext: {
    flex: 1,
    marginHorizontal: 5,
    padding: 15,
    backgroundColor: '#28a745',
    borderRadius: 8,
    alignItems: 'center',
  },
  btnText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  datePickerButton: {
    width: '100%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'flex-start',
    height: 50,
  },
  datePickerButtonText: {
    fontSize: 16,
    color: '#333',
  },
});

export default RegistrarRopScreen;

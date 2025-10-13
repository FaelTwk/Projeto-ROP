import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Platform } from 'react-native';
import RegistrarRopScreen from '../app/RegistrarRopScreen'; // Ajuste o caminho se necessário

export default function App() {
return (
    <View style={styles.container}>
    <RegistrarRopScreen />
    <StatusBar style="auto" />
    </View>
);
}

const styles = StyleSheet.create({
container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0, // Para evitar que o conteúdo fique atrás da barra de status no Android
    },
});

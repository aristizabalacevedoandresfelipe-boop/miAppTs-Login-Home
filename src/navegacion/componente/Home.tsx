import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../StackNavigator';

type HomeProps = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function Home({ navigation }: HomeProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>HOME</Text>
      <Text style={styles.subtitle}>Selecciona una opción para continuar</Text>

<TouchableOpacity style={styles.botonTexto} onPress={() => navigation.navigate('Texto')}>
  <Text style={styles.textoBoton}>Texto</Text>
</TouchableOpacity>


<TouchableOpacity style={styles.botonInput} onPress={() => navigation.navigate('Input')}>
  <Text style={styles.textoBoton}>Input</Text>
</TouchableOpacity>


<TouchableOpacity style={styles.botonBoton} onPress={() => navigation.navigate('Boton')}>
   <Text style={styles.textoBoton}>Boton</Text>
</TouchableOpacity>

<TouchableOpacity style={styles.botonLista} onPress={() => navigation.navigate('Lista')}>
   <Text style={styles.textoBoton}>Lista</Text>
</TouchableOpacity>

<TouchableOpacity style={styles.botonModal} onPress={() => navigation.navigate('Modal')}>
   <Text style={styles.textoBoton}>Modal</Text>
</TouchableOpacity>

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#F7F8FA',
  },

  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#202124',
  },

  subtitle: {
    marginBottom: 24,
    color: '#5F6368',
  },

    botonTexto: {
    backgroundColor: '#1DC907',
    width: 250,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },

  textoBoton: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },

  botonInput: {
    backgroundColor: '#1808A8',
    width: 250,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    
  },

  botonBoton: {
    backgroundColor: '#790265',
    width: 250,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },

  botonLista: {
    backgroundColor: '#10C7F5',
    width: 250,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },

  botonModal: {
    backgroundColor: '#FA2904',
    width: 250,
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },

  botonHome:{
    backgroundColor: '#FA4C07',
    width: 250,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,

  },
})

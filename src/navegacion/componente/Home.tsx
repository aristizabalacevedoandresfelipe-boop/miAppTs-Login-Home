import { StyleSheet, Text, View,  Button, TouchableOpacity } from 'react-native'
import React from 'react'

export default function Home() {
  return (
    <View>

<TouchableOpacity style={styles.botonTexto}>
  <Text style={styles.textoBoton}>Texto</Text>
</TouchableOpacity>


<TouchableOpacity style={styles.botonInput}>
  <Text style={styles.textoBoton}>Input</Text>
</TouchableOpacity>


<TouchableOpacity style={styles.botonBoton}>
   <Text style={styles.textoBoton}>Boton</Text>
</TouchableOpacity>

<TouchableOpacity style={styles.botonLista}>
   <Text style={styles.textoBoton}>Lista</Text>
</TouchableOpacity>

<TouchableOpacity style={styles.botonModal}>
   <Text style={styles.textoBoton}>Modal</Text>
</TouchableOpacity>

    </View>
  )
}

const styles = StyleSheet.create({
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

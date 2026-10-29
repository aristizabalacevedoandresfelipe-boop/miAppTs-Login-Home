import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navegacion/StackNavigator';
import { listarClientes } from '../servicios/api';
import { useCargar } from '../utilidades';

type Props = NativeStackScreenProps<RootStackParamList, 'Clientes'>;

export default function Clientes(_: Props) {
  const { datos, cargando, error } = useCargar(listarClientes);

  return (
    <View style={styles.container}>
      {cargando && !datos && <ActivityIndicator size="large" />}
      {error !== '' && <Text style={styles.error}>{error}</Text>}
      <FlatList
        data={datos ?? []}
        keyExtractor={c => String(c.id)}
        ListEmptyComponent={!cargando ? <Text style={styles.vacio}>No hay clientes registrados</Text> : null}
        renderItem={({ item }) => (
          <View style={styles.tarjeta}>
            <Text style={styles.nombre}>{item.nombreCompleto}</Text>
            <Text style={styles.dato}>CC {item.cedula}</Text>
            <Text style={styles.dato}>{item.correo}{item.telefono ? '  |  ' + item.telefono : ''}</Text>
            <Text style={styles.dato}>Nacimiento: {item.fechaNac}</Text>
          </View>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#F7F8FA' },
  tarjeta: { backgroundColor: '#FFFFFF', padding: 14, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#E0E0E0' },
  nombre: { fontSize: 16, fontWeight: 'bold', color: '#202124' },
  dato: { color: '#5F6368', marginTop: 2 },
  vacio: { textAlign: 'center', color: '#5F6368', marginTop: 24 },
  error: { color: '#D93025', marginBottom: 10, textAlign: 'center' },
})

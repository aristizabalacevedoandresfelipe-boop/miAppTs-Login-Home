import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navegacion/StackNavigator';
import { listarVentas } from '../servicios/api';
import { dinero, fechaCorta, useCargar } from '../utilidades';

type Props = NativeStackScreenProps<RootStackParamList, 'Ventas'>;

export default function Ventas({ navigation }: Props) {
  // La BD ya filtra: el administrador ve todas, el cliente solo las suyas
  const { datos, cargando, error } = useCargar(listarVentas);

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={{ padding: 16 }}
      data={datos ?? []}
      keyExtractor={e => String(e.id)}
      ListHeaderComponent={
        <>
          {cargando && !datos && <ActivityIndicator size="large" />}
          {error !== '' && <Text style={styles.error}>{error}</Text>}
        </>
      }
      ListEmptyComponent={!cargando ? <Text style={styles.vacio}>Aún no hay ventas</Text> : null}
      renderItem={({ item }) => (
        <TouchableOpacity style={styles.tarjeta} onPress={() => navigation.navigate('DetalleVenta', { idEnc: item.id })}>
          <View style={{ flex: 1 }}>
            <Text style={styles.nombre}>Venta #{item.id}</Text>
            <Text style={styles.dato}>{item.clienteNombre}</Text>
            <Text style={styles.dato}>{fechaCorta(item.fecha)}  |  {item.formaPago}</Text>
          </View>
          <Text style={styles.total}>{dinero(item.total)}</Text>
        </TouchableOpacity>
      )}
    />
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F8FA' },
  tarjeta: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 14, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#E0E0E0' },
  nombre: { fontSize: 16, fontWeight: 'bold', color: '#202124' },
  dato: { color: '#5F6368', marginTop: 2 },
  total: { fontSize: 16, fontWeight: 'bold', color: '#1DC907' },
  vacio: { textAlign: 'center', color: '#5F6368', marginTop: 24 },
  error: { color: '#D93025', marginBottom: 10, textAlign: 'center' },
})

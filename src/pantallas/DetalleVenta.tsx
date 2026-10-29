import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navegacion/StackNavigator';
import { obtenerVenta } from '../servicios/api';
import { dinero, fechaCorta, useCargar } from '../utilidades';

type Props = NativeStackScreenProps<RootStackParamList, 'DetalleVenta'>;

export default function DetalleVenta({ route, navigation }: Props) {
  const { idEnc } = route.params;
  const { datos: venta, cargando, error } = useCargar(() => obtenerVenta(idEnc));

  if (cargando && !venta) {
    return <View style={styles.container}><ActivityIndicator size="large" style={{ marginTop: 40 }} /></View>;
  }
  if (!venta) {
    return <View style={styles.container}><Text style={styles.vacio}>{error || 'Venta no encontrada'}</Text></View>;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.titulo}>Venta #{venta.id}</Text>
      <Text style={styles.dato}>Cliente: {venta.clienteNombre}{venta.clienteCedula ? ' (CC ' + venta.clienteCedula + ')' : ''}</Text>
      <Text style={styles.dato}>Fecha: {fechaCorta(venta.fecha)}</Text>
      <Text style={styles.dato}>Forma de pago: {venta.formaPago}</Text>

      <View style={styles.tabla}>
        {venta.lineas.map(l => (
          <View key={l.id} style={styles.fila}>
            <View style={{ flex: 1 }}>
              <Text style={styles.nombre}>{l.descripcion}</Text>
              <Text style={styles.dato}>Chasis: {l.chasis}</Text>
            </View>
            <Text style={styles.subtotal}>{dinero(l.precioUnitario)}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.total}>Total: {dinero(venta.total)}</Text>

      <TouchableOpacity style={styles.boton} onPress={() => navigation.navigate('Home')}>
        <Text style={styles.textoBoton}>Volver al inicio</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F8FA' },
  titulo: { fontSize: 24, fontWeight: 'bold', color: '#202124', marginBottom: 6 },
  dato: { color: '#5F6368', marginTop: 2 },
  tabla: { marginTop: 16, backgroundColor: '#FFFFFF', borderRadius: 10, borderWidth: 1, borderColor: '#E0E0E0' },
  fila: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  nombre: { fontSize: 16, fontWeight: 'bold', color: '#202124' },
  subtotal: { fontWeight: 'bold', color: '#202124' },
  total: { fontSize: 22, fontWeight: 'bold', textAlign: 'right', marginVertical: 16, color: '#1DC907' },
  boton: { backgroundColor: '#1808A8', padding: 15, borderRadius: 10 },
  textoBoton: { color: '#FFFFFF', textAlign: 'center', fontWeight: 'bold', fontSize: 16 },
  vacio: { textAlign: 'center', color: '#5F6368', marginTop: 24 },
})

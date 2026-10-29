import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native'
import React from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navegacion/StackNavigator';
import { sesion } from '../servicios/sesion';
import { cerrarSesion } from '../servicios/api';
import { temaHome as paleta } from '../navegacion/tema';

type HomeProps = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function Home({ navigation }: HomeProps) {
  const esAdmin = sesion.rol === 'Administrador';
  const nombre = sesion.cliente?.nombreCompleto ?? 'Administrador';
  const inicial = nombre.trim().charAt(0).toUpperCase() || 'U';

  const salir = async () => {
    await cerrarSesion();
    navigation.replace('Login');
  };

  const opciones = [
    esAdmin && { label: 'Clientes', detalle: 'Ver y registrar clientes', icono: '👥', ruta: 'Clientes' as const },
    esAdmin && { label: 'Inventario de motos', detalle: 'Unidades disponibles', icono: '🏍️', ruta: 'Motos' as const },
    { label: esAdmin ? 'Nueva venta' : 'Comprar una moto', detalle: esAdmin ? 'Registrar una venta' : 'Elegir tu moto', icono: '🧾', ruta: 'NuevaVenta' as const },
    { label: esAdmin ? 'Historial de ventas' : 'Mis compras', detalle: esAdmin ? 'Ventas registradas' : 'Tus compras anteriores', icono: '📊', ruta: 'Ventas' as const },
  ].filter(Boolean) as { label: string; detalle: string; icono: string; ruta: 'Clientes' | 'Motos' | 'NuevaVenta' | 'Ventas' }[];

  return (
    <View style={styles.pantalla}>
      <View style={styles.encabezado}>
        <View style={styles.avatar}>
          <Text style={styles.avatarTexto}>{inicial}</Text>
        </View>
        <View>
          <Text style={styles.saludo}>Bienvenido</Text>
          <Text style={styles.nombreUsuario}>{nombre}</Text>
          <View style={styles.insignia}>
            <Text style={styles.insigniaTexto}>{sesion.rol ?? ''}</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.contenido} contentContainerStyle={{ paddingBottom: 24 }}>
        <Text style={styles.tituloSeccion}>Panel principal</Text>

        <View style={styles.tarjetaMenu}>
          {opciones.map((op, i) => (
            <TouchableOpacity
              key={op.ruta}
              style={[styles.fila, i === opciones.length - 1 && styles.filaSinBorde]}
              onPress={() => navigation.navigate(op.ruta)}
              activeOpacity={0.6}
            >
              <View style={styles.iconoChip}>
                <Text style={styles.iconoTexto}>{op.icono}</Text>
              </View>
              <View style={styles.filaTexto}>
                <Text style={styles.filaTitulo}>{op.label}</Text>
                <Text style={styles.filaDetalle}>{op.detalle}</Text>
              </View>
              <Text style={styles.flecha}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.botonSalir} onPress={salir} activeOpacity={0.7}>
          <Text style={styles.textoSalir}>Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: paleta.fondo },

  encabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: paleta.marino,
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 24,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: paleta.marinoClaro,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  avatarTexto: { color: '#FFFFFF', fontSize: 20, fontWeight: '700' },
  saludo: { color: 'rgba(255,255,255,0.65)', fontSize: 13 },
  nombreUsuario: { color: '#FFFFFF', fontSize: 18, fontWeight: '700', marginTop: 1 },
  insignia: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 2,
    marginTop: 6,
  },
  insigniaTexto: { color: '#FFFFFF', fontSize: 11, fontWeight: '600', letterSpacing: 0.4 },

  contenido: { flex: 1, paddingHorizontal: 20 },
  tituloSeccion: {
    fontSize: 13,
    fontWeight: '700',
    color: paleta.textoSecundario,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginTop: 24,
    marginBottom: 10,
  },

  tarjetaMenu: {
    backgroundColor: paleta.tarjeta,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: paleta.borde,
    overflow: 'hidden',
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: paleta.borde,
    gap: 12,
  },
  filaSinBorde: { borderBottomWidth: 0 },
  iconoChip: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#EAF0FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconoTexto: { fontSize: 18 },
  filaTexto: { flex: 1 },
  filaTitulo: { fontSize: 15, fontWeight: '600', color: paleta.texto },
  filaDetalle: { fontSize: 12.5, color: paleta.textoSecundario, marginTop: 1 },
  flecha: { fontSize: 22, color: '#C2C9D3', fontWeight: '300' },

  botonSalir: {
    marginTop: 20,
    backgroundColor: paleta.peligroFondo,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3CACA',
  },
  textoSalir: { color: paleta.peligro, fontWeight: '700', fontSize: 14.5 },
})
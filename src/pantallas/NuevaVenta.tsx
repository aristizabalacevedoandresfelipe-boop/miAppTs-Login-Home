import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navegacion/StackNavigator';
import type { FormaPago } from '../modelos';
import { sesion } from '../servicios/sesion';
import { crearVenta, listarClientes, listarMotos } from '../servicios/api';
import { dinero, mensajeError, useCargar } from '../utilidades';
import BotonVerFoto from '../componentes/BotonVerFoto';

type Props = NativeStackScreenProps<RootStackParamList, 'NuevaVenta'>;

const PAGOS: { valor: FormaPago; texto: string }[] = [
  { valor: 'contado', texto: 'Contado' },
  { valor: 'credito', texto: 'Crédito' },
  { valor: 'transferencia', texto: 'Transferencia' },
];

export default function NuevaVenta({ navigation }: Props) {
  const esAdmin = sesion.rol === 'Administrador';
  const { datos, cargando, error: errorCarga } = useCargar(async () => ({
    motos: await listarMotos(true),
    clientes: esAdmin ? await listarClientes() : [],
  }));
  const [idCliente, setIdCliente] = useState<number | null>(sesion.cliente?.id ?? null);
  const [elegidas, setElegidas] = useState<number[]>([]);
  const [formaPago, setFormaPago] = useState<FormaPago>('contado');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  const motos = datos?.motos ?? [];
  const clientes = datos?.clientes ?? [];

  const alternar = (id: number) => {
    setElegidas(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
    setError('');
  };

  const total = motos.filter(m => elegidas.includes(m.id)).reduce((acc, m) => acc + m.precio, 0);

  const confirmar = async () => {
    if (idCliente === null) return setError(esAdmin ? 'Selecciona un cliente' : 'Tu usuario no tiene un perfil de cliente');
    if (elegidas.length === 0) return setError('Selecciona al menos una moto');
    setEnviando(true);
    try {
      const idEnc = await crearVenta(idCliente, elegidas, formaPago);
      navigation.replace('DetalleVenta', { idEnc });
    } catch (e: any) {
      setError(mensajeError(e));
      setEnviando(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {esAdmin && <Text style={styles.titulo}>Cliente</Text>}
        {esAdmin && (
          <View style={styles.chips}>
            {clientes.map(c => (
              <TouchableOpacity
                key={c.id}
                style={[styles.chip, idCliente === c.id && styles.chipActivo]}
                onPress={() => setIdCliente(c.id)}
              >
                <Text style={[styles.chipTexto, idCliente === c.id && { color: '#FFFFFF' }]}>{c.nombreCompleto}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text style={[styles.titulo, { marginTop: 16 }]}>Forma de pago</Text>
        <View style={styles.chips}>
          {PAGOS.map(p => (
            <TouchableOpacity
              key={p.valor}
              style={[styles.chip, formaPago === p.valor && styles.chipActivo]}
              onPress={() => setFormaPago(p.valor)}
            >
              <Text style={[styles.chipTexto, formaPago === p.valor && { color: '#FFFFFF' }]}>{p.texto}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.titulo, { marginTop: 16 }]}>Motos disponibles</Text>
        {cargando && !datos && <ActivityIndicator size="large" />}
        {errorCarga !== '' && <Text style={styles.error}>{errorCarga}</Text>}
        {!cargando && motos.length === 0 && <Text style={styles.vacio}>No hay motos disponibles.</Text>}
        {motos.map(m => {
          const activa = elegidas.includes(m.id);
          return (
            <TouchableOpacity key={m.id} style={[styles.tarjeta, activa && styles.tarjetaActiva]} onPress={() => alternar(m.id)}>
              <View style={{ flex: 1 }}>
                <Text style={styles.nombre}>{m.marca} {m.modelo} {m.anio}</Text>
                <Text style={styles.dato}>{m.cilindraje} cc  |  {m.color || 'Sin color'}  |  {m.condicion}</Text>
                <Text style={styles.dato}>{dinero(m.precio)}</Text>
                <BotonVerFoto imagenUrl={m.imagenUrl} titulo={`${m.marca} ${m.modelo} ${m.anio}`} />
              </View>
              <Text style={styles.marca}>{activa ? '✓' : '+'}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.pie}>
        <Text style={styles.total}>Total: {dinero(total)}</Text>
        {error !== '' && <Text style={styles.error}>{error}</Text>}
        <TouchableOpacity style={styles.boton} onPress={confirmar} disabled={enviando}>
          <Text style={styles.textoBoton}>{enviando ? 'Registrando...' : 'Confirmar venta'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F8FA' },
  titulo: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#202124' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1, borderColor: '#790265', backgroundColor: '#FFFFFF' },
  chipActivo: { backgroundColor: '#790265' },
  chipTexto: { color: '#790265', fontWeight: 'bold' },
  tarjeta: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 14, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#E0E0E0' },
  tarjetaActiva: { borderColor: '#790265', borderWidth: 2 },
  nombre: { fontSize: 16, fontWeight: 'bold', color: '#202124' },
  dato: { color: '#5F6368', marginTop: 2 },
  marca: { fontSize: 24, fontWeight: 'bold', color: '#790265', width: 32, textAlign: 'center' },
  vacio: { color: '#5F6368' },
  pie: { padding: 16, borderTopWidth: 1, borderTopColor: '#E0E0E0', backgroundColor: '#FFFFFF' },
  total: { fontSize: 20, fontWeight: 'bold', marginBottom: 8, color: '#202124' },
  error: { color: '#D93025', marginBottom: 8 },
  boton: { backgroundColor: '#790265', padding: 15, borderRadius: 10 },
  textoBoton: { color: '#FFFFFF', textAlign: 'center', fontWeight: 'bold', fontSize: 16 },
})

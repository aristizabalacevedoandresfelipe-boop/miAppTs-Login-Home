import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navegacion/StackNavigator';
import type { Condicion } from '../modelos';
import { crearMoto, listarMotos } from '../servicios/api';
import { dinero, mensajeError, useCargar } from '../utilidades';
import { temaMotos as paleta } from '../navegacion/tema';
import { Image } from 'expo-image';
import { elegirYSubirFoto } from '../servicios/fotos';
import BotonVerFoto from '../componentes/BotonVerFoto';

type Props = NativeStackScreenProps<RootStackParamList, 'Motos'>;

const vacio = { marca: '', modelo: '', anio: '', cilindraje: '', color: '', chasis: '', numeroMotor: '', placa: '', kilometraje: '', precio: '' };
const CONDICIONES: Condicion[] = ['nueva', 'usada'];

const ESTADOS = {
  disponible: { etiqueta: 'Disponible', color: paleta.disponible, fondo: paleta.disponibleFondo },
  reservada: { etiqueta: 'Reservada', color: paleta.reservada, fondo: paleta.reservadaFondo },
  vendida: { etiqueta: 'Vendida', color: paleta.vendida, fondo: paleta.vendidaFondo },
} as const;

// Campo con etiqueta arriba, para que el formulario se vea como el de un sistema de gestión
function Campo({ etiqueta, style, ...props }: { etiqueta: string; style?: any } & React.ComponentProps<typeof TextInput>) {
  return (
    <View style={[styles.campo, style]}>
      <Text style={styles.etiqueta}>{etiqueta}</Text>
      <TextInput style={styles.input} placeholderTextColor={paleta.textoSecundario} {...props} />
    </View>
  );
}

export default function Motos(_: Props) {
  const { datos, cargando, error: errorCarga, recargar } = useCargar(() => listarMotos());
  const [f, setF] = useState(vacio);
  const [condicion, setCondicion] = useState<Condicion>('nueva');
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);


  const [imagenUrl, setImagenUrl] = useState<string | null>(null);
const [subiendoFoto, setSubiendoFoto] = useState(false);

const seleccionarFoto = async () => {
  setSubiendoFoto(true);
  try {
    const url = await elegirYSubirFoto();
    if (url) setImagenUrl(url);
  } catch (e: any) {
    setError(mensajeError(e));
  } finally {
    setSubiendoFoto(false);
  }
};

  const set = (k: keyof typeof vacio) => (v: string) => setF(p => ({ ...p, [k]: v }));

  const guardar = async () => {
    const anio = Number(f.anio);
    const cilindraje = Number(f.cilindraje);
    const kilometraje = f.kilometraje.trim() === '' ? 0 : Number(f.kilometraje);
    const precio = Number(f.precio);

    if (!f.marca.trim() || !f.modelo.trim()) return setError('Marca y modelo son obligatorios');
    if (!Number.isInteger(anio) || anio < 1980 || anio > new Date().getFullYear() + 1) return setError('Año inválido');
    if (!Number.isInteger(cilindraje) || cilindraje <= 0) return setError('El cilindraje debe ser un entero mayor a 0');
    if (f.chasis.trim().length < 5) return setError('El chasis (VIN) es obligatorio');
    if (condicion === 'usada' && !f.placa.trim()) return setError('Una moto usada debe tener placa');
    if (!Number.isInteger(kilometraje) || kilometraje < 0) return setError('Kilometraje inválido');
    if (!(precio > 0)) return setError('El precio debe ser mayor a 0');

    setGuardando(true);
    try {
      await crearMoto({
        marca: f.marca.trim(),
        modelo: f.modelo.trim(),
        anio,
        cilindraje,
        color: f.color.trim(),
        condicion,
        chasis: f.chasis.trim().toUpperCase(),
        numeroMotor: f.numeroMotor.trim().toUpperCase(),
        placa: f.placa.trim().toUpperCase(),
        kilometraje,
        precio,
        imagenUrl,
      });
      setF(vacio);
      setImagenUrl(null);
      setError('');
      await recargar();
    } catch (e: any) {
      setError(mensajeError(e));
    } finally {
      setGuardando(false);
    }
  };

  const formulario = (
    <View>
      <View style={styles.tarjetaForm}>
        <Text style={styles.titulo}>Nueva moto</Text>
        <Text style={styles.subtitulo}>Registra una nueva unidad en el inventario</Text>

        <View style={styles.fila}>
          <Campo etiqueta="Marca" placeholder="Yamaha" value={f.marca} onChangeText={set('marca')} style={styles.mitad} />
          <Campo etiqueta="Modelo" placeholder="MT-03" value={f.modelo} onChangeText={set('modelo')} style={styles.mitad} />
        </View>

        <View style={styles.fila}>
          <Campo etiqueta="Año" placeholder="2025" value={f.anio} onChangeText={set('anio')} keyboardType="numeric" style={styles.mitad} />
          <Campo etiqueta="Cilindraje (cc)" placeholder="190" value={f.cilindraje} onChangeText={set('cilindraje')} keyboardType="numeric" style={styles.mitad} />
        </View>

        <View style={styles.fila}>
          <Campo etiqueta="Color" placeholder="Rojo" value={f.color} onChangeText={set('color')} style={styles.mitad} />
          <View style={styles.mitad}>
            <Text style={styles.etiqueta}>Condición</Text>
            <View style={styles.segmentado}>
              {CONDICIONES.map(c => (
                <TouchableOpacity
                  key={c}
                  style={[styles.segmento, condicion === c && styles.segmentoActivo]}
                  onPress={() => setCondicion(c)}
                >
                  <Text style={[styles.segmentoTexto, condicion === c && styles.segmentoTextoActivo]}>
                    {c === 'nueva' ? 'Nueva' : 'Usada'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <Campo etiqueta="Chasis / VIN (único)" placeholder="Identificador único de la unidad" value={f.chasis} onChangeText={set('chasis')} autoCapitalize="characters" />

        <View style={styles.fila}>
          <Campo etiqueta="Número de motor" value={f.numeroMotor} onChangeText={set('numeroMotor')} autoCapitalize="characters" style={styles.mitad} />
          <Campo etiqueta="Placa" placeholder="Obligatoria si es usada" value={f.placa} onChangeText={set('placa')} autoCapitalize="characters" style={styles.mitad} />
        </View>

        <View style={styles.fila}>
          <Campo etiqueta="Kilometraje" value={f.kilometraje} onChangeText={set('kilometraje')} keyboardType="numeric" style={styles.mitad} />
          <Campo etiqueta="Precio (COP)" value={f.precio} onChangeText={set('precio')} keyboardType="numeric" style={styles.mitad} />
        </View>

        {error !== '' && <Text style={styles.error}>{error}</Text>}

                <TouchableOpacity style={styles.botonFoto} onPress={seleccionarFoto} disabled={subiendoFoto} activeOpacity={0.8}>
          <Text style={styles.textoBotonFoto}>
            {subiendoFoto ? 'Subiendo foto...' : imagenUrl ? 'Cambiar foto' : 'Agregar foto'}
          </Text>
        </TouchableOpacity>

        {imagenUrl && (
          <Image source={{ uri: imagenUrl }} style={styles.vistaPrevia} contentFit="cover" />
        )}

        <TouchableOpacity style={styles.boton} onPress={guardar} disabled={guardando} activeOpacity={0.8}>
          <Text style={styles.textoBoton}>{guardando ? 'Guardando...' : 'Guardar moto'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.encabezadoLista}>
        <Text style={styles.tituloSeccion}>Inventario</Text>
        {datos && <Text style={styles.contador}>{datos.length} {datos.length === 1 ? 'unidad' : 'unidades'}</Text>}
      </View>

      {cargando && !datos && <ActivityIndicator size="large" color={paleta.marino} style={{ marginTop: 12 }} />}
      {errorCarga !== '' && <Text style={styles.error}>{errorCarga}</Text>}
    </View>
  );

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={{ padding: 16 }}
      data={datos ?? []}
      keyExtractor={m => String(m.id)}
      ListHeaderComponent={formulario}
      ListEmptyComponent={!cargando ? <Text style={styles.vacio}>No hay motos registradas</Text> : null}
      renderItem={({ item }) => {
        const estado = ESTADOS[item.estado];
        return (
          <View style={styles.tarjeta}>
            <View style={[styles.franja, { backgroundColor: estado.color }]} />
            <View style={styles.tarjetaContenido}>
              <Text style={styles.precio}>{dinero(item.precio)}</Text>
              <BotonVerFoto imagenUrl={item.imagenUrl} titulo={`${item.marca} ${item.modelo} ${item.anio}`} />
              <View style={styles.tarjetaCabecera}>
                <Text style={styles.nombre}>{item.marca} {item.modelo} {item.anio}</Text>
                <View style={[styles.insignia, { backgroundColor: estado.fondo }]}>
                  <Text style={[styles.insigniaTexto, { color: estado.color }]}>{estado.etiqueta}</Text>
                </View>
              </View>
              <Text style={styles.dato}>{item.cilindraje} cc  ·  {item.color || 'Sin color'}  ·  {item.condicion === 'nueva' ? 'Nueva' : 'Usada'}</Text>
              <Text style={styles.datoChasis}>Chasis: {item.chasis}{item.placa ? '  ·  Placa: ' + item.placa : ''}</Text>
              <Text style={styles.precio}>{dinero(item.precio)}</Text>
            </View>
          </View>
        );
      }}
    />
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: paleta.fondo },

  tarjetaForm: {
    backgroundColor: paleta.tarjeta,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: paleta.borde,
    padding: 16,
    marginBottom: 20,
  },
  titulo: { fontSize: 18, fontWeight: '700', color: paleta.texto },
  subtitulo: { fontSize: 12.5, color: paleta.textoSecundario, marginTop: 2, marginBottom: 16 },

  fila: { flexDirection: 'row', gap: 12 },
  mitad: { flex: 1 },
  campo: { marginBottom: 12 },
  etiqueta: { fontSize: 12.5, fontWeight: '600', color: paleta.textoSecundario, marginBottom: 5 },
  input: {
    borderWidth: 1,
    borderColor: paleta.borde,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: paleta.fondo,
    color: paleta.texto,
    fontSize: 14.5,
  },

  botonFoto: { borderWidth: 1, borderColor: paleta.borde, paddingVertical: 12, borderRadius: 10, marginBottom: 12, backgroundColor: paleta.fondo },
  textoBotonFoto: { color: paleta.texto, textAlign: 'center', fontWeight: '600', fontSize: 14 },
  vistaPrevia: { width: '100%', height: 180, borderRadius: 10, marginBottom: 12 },
  foto: { width: '100%', height: 160, borderRadius: 8, marginBottom: 10 },

  segmentado: { flexDirection: 'row', backgroundColor: paleta.fondo, borderRadius: 8, borderWidth: 1, borderColor: paleta.borde, overflow: 'hidden' },
  segmento: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  segmentoActivo: { backgroundColor: paleta.marino },
  segmentoTexto: { color: paleta.textoSecundario, fontWeight: '600', fontSize: 13.5 },
  segmentoTextoActivo: { color: '#FFFFFF' },

  error: { color: paleta.peligro, marginBottom: 10, fontWeight: '600', fontSize: 13 },

  boton: { backgroundColor: paleta.acento, paddingVertical: 14, borderRadius: 10, marginTop: 4 },
  textoBoton: { color: '#FFFFFF', textAlign: 'center', fontWeight: '700', fontSize: 15 },

  encabezadoLista: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 },
  tituloSeccion: { fontSize: 13, fontWeight: '700', color: paleta.textoSecundario, letterSpacing: 0.6, textTransform: 'uppercase' },
  contador: { fontSize: 12.5, color: paleta.textoSecundario },

  tarjeta: { flexDirection: 'row', backgroundColor: paleta.tarjeta, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: paleta.borde, overflow: 'hidden' },
  franja: { width: 5 },
  tarjetaContenido: { flex: 1, padding: 14 },
  tarjetaCabecera: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  nombre: { fontSize: 15.5, fontWeight: '700', color: paleta.texto, flexShrink: 1 },
  insignia: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 20 },
  insigniaTexto: { fontSize: 11, fontWeight: '700' },
  dato: { color: paleta.textoSecundario, marginTop: 4, fontSize: 13 },
  datoChasis: { color: paleta.textoSecundario, marginTop: 2, fontSize: 12 },
  precio: { color: paleta.texto, fontWeight: '700', fontSize: 15, marginTop: 6 },

  vacio: { textAlign: 'center', color: paleta.textoSecundario, marginTop: 12 },
})

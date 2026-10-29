import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { temaMotos as paleta } from '../navegacion/tema';

type Props = { imagenUrl?: string | null; titulo: string };

export default function BotonVerFoto({ imagenUrl, titulo }: Props) {
  const [abierto, setAbierto] = useState(false);

  if (!imagenUrl) return <Text style={styles.sinFoto}>Sin foto disponible</Text>;

  return (
    <>
      <TouchableOpacity style={styles.boton} onPress={() => setAbierto(true)} activeOpacity={0.8}>
        <Text style={styles.textoBoton}>Ver foto</Text>
      </TouchableOpacity>

      <Modal visible={abierto} transparent animationType="fade" onRequestClose={() => setAbierto(false)}>
        <View style={styles.fondo}>
          <Text style={styles.titulo}>{titulo}</Text>
          <Image
            source={{ uri: imagenUrl }}
            style={styles.foto}
            contentFit="contain"
            cachePolicy="memory-disk"
          />
          <TouchableOpacity style={styles.cerrar} onPress={() => setAbierto(false)} activeOpacity={0.8}>
            <Text style={styles.textoCerrar}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  boton: { alignSelf: 'flex-start', marginTop: 8, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, backgroundColor: paleta.marino },
  textoBoton: { color: '#FFFFFF', fontWeight: '600', fontSize: 13.5 },
  sinFoto: { color: paleta.textoSecundario, fontSize: 12.5, marginTop: 8 },

  fondo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.88)', justifyContent: 'center', alignItems: 'center', padding: 16 },
  titulo: { color: '#FFFFFF', fontSize: 17, fontWeight: '700', marginBottom: 14, textAlign: 'center' },
  foto: { width: '100%', height: '60%' },
  cerrar: { marginTop: 18, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 10, backgroundColor: paleta.acento },
  textoCerrar: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
});
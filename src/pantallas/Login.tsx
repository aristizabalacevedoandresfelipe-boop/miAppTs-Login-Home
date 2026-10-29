import { ActivityIndicator, Button, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useEffect, useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navegacion/StackNavigator';
import { cargarSesion, iniciarSesion } from '../servicios/api';
import { mensajeError } from '../utilidades';

type LoginProps = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function Login({ navigation }: LoginProps) {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true); // true mientras se revisa si ya hay sesión guardada

  // Si el usuario ya tenía sesión iniciada, entra directo al Home
  useEffect(() => {
    cargarSesion()
      .then(hay => { if (hay) navigation.replace('Home'); else setCargando(false); })
      .catch(() => setCargando(false));
  }, []);

  const entrar = async () => {
    if (!correo.trim() || !contrasena) {
      setError('Ingresa tu correo y tu contraseña');
      return;
    }
    setCargando(true);
    try {
      await iniciarSesion(correo.trim(), contrasena);
      setError('');
      setContrasena('');
      navigation.replace('Home'); // replace: no se puede volver al Login con "atrás"
    } catch (e: any) {
      setError(mensajeError(e));
      setCargando(false);
    }
  };

  if (cargando) {
    return <View style={styles.container}><ActivityIndicator size="large" /></View>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Motos · Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Correo"
        keyboardType="email-address"
        autoCapitalize="none"
        value={correo}
        onChangeText={setCorreo}
      />

      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        secureTextEntry
        value={contrasena}
        onChangeText={setContrasena}
      />

      {error !== '' && <Text style={styles.error}>{error}</Text>}

      <Button title="Iniciar sesión" onPress={entrar} />

      <View style={styles.separador} />
      <Button title="Crear cuenta de cliente" color="#1DC907" onPress={() => navigation.navigate('Registro')} />
    </View>
  )
}
import { colores, sombra } from '../navegacion/tema';

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: colores.primario },
  title: { fontSize: 34, fontWeight: '900', marginBottom: 28, textAlign: 'center', color: colores.blanco, letterSpacing: 1 },
  input: { borderWidth: 0, borderRadius: 14, marginBottom: 16, padding: 16, backgroundColor: colores.tarjeta, ...sombra },
  label: { fontWeight: 'bold', marginBottom: 10, color: colores.blanco, fontSize: 15 },
  roles: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  chip: { flex: 1, paddingVertical: 14, borderRadius: 14, borderWidth: 2, borderColor: colores.acentoSecundario, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)' },
  chipActivo: { backgroundColor: colores.acentoSecundario, borderColor: colores.acentoSecundario },
  chipTexto: { color: colores.acentoSecundario, fontWeight: 'bold' },
  error: { color: '#FF8585', marginBottom: 12, textAlign: 'center', fontWeight: '700' },
  separador: { height: 14 },
})

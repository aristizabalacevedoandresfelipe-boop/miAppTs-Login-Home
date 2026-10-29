import { Button, ScrollView, StyleSheet, Text, TextInput } from 'react-native'
import React, { useState } from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navegacion/StackNavigator';
import { registrarCliente } from '../servicios/api';
import { fechaValida, mensajeError } from '../utilidades';

type Props = NativeStackScreenProps<RootStackParamList, 'Registro'>;

export default function Registro({ navigation }: Props) {
  const [nombre, setNombre] = useState('');
  const [cedula, setCedula] = useState('');
  const [fechaNac, setFechaNac] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [ok, setOk] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const guardar = async () => {
    if (!nombre.trim()) return setError('El nombre es obligatorio');
    if (!/^\d{5,12}$/.test(cedula.trim())) return setError('La cédula debe tener entre 5 y 12 dígitos');
    if (!fechaValida(fechaNac.trim())) return setError('Fecha inválida. Usa el formato AAAA-MM-DD');
    if (!/^\S+@\S+\.\S+$/.test(correo.trim())) return setError('Correo inválido');
    if (contrasena.length < 6) return setError('La contraseña debe tener al menos 6 caracteres');

    setEnviando(true);
    try {
      await registrarCliente({
        nombre: nombre.trim(),
        cedula: cedula.trim(),
        fechaNac: fechaNac.trim(),
        telefono: telefono.trim(),
        correo: correo.trim(),
        contrasena,
      });
      setError('');
      setOk(true);
    } catch (e: any) {
      setError(mensajeError(e));
    } finally {
      setEnviando(false);
    }
  };

  if (ok) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.exito}>¡Cuenta creada! Si tu correo requiere confirmación, revisa tu bandeja de entrada.</Text>
        <Button title="Ir al login" onPress={() => navigation.goBack()} />
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Nombre completo</Text>
      <TextInput style={styles.input} value={nombre} onChangeText={setNombre} placeholder="Nombre completo" />

      <Text style={styles.label}>Cédula</Text>
      <TextInput style={styles.input} value={cedula} onChangeText={setCedula} placeholder="Número de cédula" keyboardType="numeric" />

      <Text style={styles.label}>Fecha de nacimiento</Text>
      <TextInput style={styles.input} value={fechaNac} onChangeText={setFechaNac} placeholder="AAAA-MM-DD" />

      <Text style={styles.label}>Teléfono</Text>
      <TextInput style={styles.input} value={telefono} onChangeText={setTelefono} placeholder="Celular" keyboardType="phone-pad" />

      <Text style={styles.label}>Correo</Text>
      <TextInput style={styles.input} value={correo} onChangeText={setCorreo} placeholder="correo@ejemplo.com" keyboardType="email-address" autoCapitalize="none" />

      <Text style={styles.label}>Contraseña</Text>
      <TextInput style={styles.input} value={contrasena} onChangeText={setContrasena} placeholder="Mínimo 6 caracteres" secureTextEntry />

      {error !== '' && <Text style={styles.error}>{error}</Text>}

      <Button title={enviando ? 'Guardando...' : 'Crear cuenta'} onPress={guardar} disabled={enviando} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { padding: 24 },
  label: { fontWeight: 'bold', marginBottom: 6, color: '#202124' },
  input: { borderWidth: 1, borderColor: '#999', borderRadius: 6, marginBottom: 16, padding: 12 },
  error: { color: '#D93025', marginBottom: 12 },
  exito: { color: '#188038', fontSize: 16, marginBottom: 20 },
})

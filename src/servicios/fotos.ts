import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';
import { supabase } from './supabase';

export async function elegirYSubirFoto(): Promise<string | null> {
  const resultado = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    quality: 0.7,
    base64: true,
  });

  if (resultado.canceled) return null;

  const foto = resultado.assets[0];
  const ruta = `${Date.now()}.jpg`;

  const { error } = await supabase.storage
    .from('motos')
    .upload(ruta, decode(foto.base64!), { contentType: 'image/jpeg' });

  if (error) throw error;

  return supabase.storage.from('motos').getPublicUrl(ruta).data.publicUrl;
}
import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

// Traduce errores de Supabase/Postgres a mensajes legibles
export function mensajeError(e: any): string {
  if (e?.code === '23505') return 'Ya existe un registro con ese dato único (chasis, placa, motor, cédula o correo)';
  return e?.message ?? 'Ocurrió un error inesperado';
}

// Carga datos de forma asíncrona cada vez que la pantalla recibe el foco.
export function useCargar<T>(fn: () => Promise<T>) {
  const fnRef = useRef(fn);
  fnRef.current = fn;
  const [datos, setDatos] = useState<T | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const recargar = useCallback(async () => {
    setCargando(true);
    try {
      setDatos(await fnRef.current());
      setError('');
    } catch (e: any) {
      setError(mensajeError(e));
    } finally {
      setCargando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      recargar();
    }, [recargar])
  );

  return { datos, cargando, error, recargar };
}

export function dinero(n: number): string {
  return '$' + n.toLocaleString('es-CO');
}

export function fechaCorta(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('es-CO') + ' ' + d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
}

// Valida 'YYYY-MM-DD' y que sea una fecha real y no futura
export function fechaValida(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(s + 'T00:00:00');
  if (isNaN(d.getTime())) return false;
  if (d.toISOString().slice(0, 10) !== s) return false;
  return d.getTime() <= Date.now();
}

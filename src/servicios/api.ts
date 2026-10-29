import { supabase } from './supabase';
import { sesion } from './sesion';
import type { Cliente, Condicion, Encabezado, FormaPago, Moto, VentaCompleta } from '../modelos';

// ---------- Conversión snake_case (BD) -> camelCase (app) ----------
const aCliente = (r: any): Cliente => ({
  id: Number(r.id),
  cedula: r.cedula,
  nombreCompleto: r.nombre_completo,
  fechaNac: r.fecha_nac ?? '',
  correo: r.correo,
  telefono: r.telefono ?? '',
});

const aMoto = (r: any): Moto => ({
  id: Number(r.id),
  marca: r.marca,
  modelo: r.modelo,
  anio: r.anio,
  cilindraje: r.cilindraje,
  color: r.color ?? '',
  condicion: r.condicion,
  chasis: r.chasis,
  numeroMotor: r.numero_motor ?? '',
  placa: r.placa ?? '',
  kilometraje: r.kilometraje ?? 0,
  precio: Number(r.precio),
  estado: r.estado,
  imagenUrl: r.imagen_url ?? null,
});

// ---------- Sesión ----------
// Carga rol y cliente del usuario con sesión activa. Devuelve false si no hay sesión.
export async function cargarSesion(): Promise<boolean> {
  const { data } = await supabase.auth.getSession();
  const user = data.session?.user;
  if (!user) return false;

  const { data: u, error } = await supabase.from('usuarios').select('rol').eq('id', user.id).single();
  if (error || !u) throw new Error('Tu usuario no tiene un rol asignado');
  sesion.rol = u.rol;

  if (u.rol === 'Cliente') {
    const { data: c } = await supabase.from('clientes').select('*').eq('correo', user.email).maybeSingle();
    sesion.cliente = c ? aCliente(c) : null;
  } else {
    sesion.cliente = null;
  }
  return true;
}

export async function iniciarSesion(correo: string, contrasena: string): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({ email: correo, password: contrasena });
  if (error) throw new Error('Correo o contraseña incorrectos');
  await cargarSesion();
}

export async function cerrarSesion(): Promise<void> {
  await supabase.auth.signOut();
  sesion.rol = null;
  sesion.cliente = null;
}

export async function registrarCliente(d: {
  nombre: string; cedula: string; fechaNac: string; telefono: string; correo: string; contrasena: string;
}): Promise<void> {
  const { error } = await supabase.auth.signUp({
    email: d.correo,
    password: d.contrasena,
    // La fila en "clientes" la crea un trigger de la BD con estos datos
    options: { data: { nombre: d.nombre, cedula: d.cedula, fecha_nac: d.fechaNac, telefono: d.telefono } },
  });
  if (error) {
    if (/already registered/i.test(error.message)) throw new Error('Ya existe una cuenta con ese correo');
    if (/database error/i.test(error.message)) throw new Error('No se pudo crear la cuenta: la cédula o el correo ya están registrados');
    throw error;
  }
  await supabase.auth.signOut(); // el usuario inicia sesión desde el Login
}

// ---------- Clientes ----------
export async function listarClientes(): Promise<Cliente[]> {
  const { data, error } = await supabase.from('clientes').select('*').order('nombre_completo');
  if (error) throw error;
  return (data ?? []).map(aCliente);
}

// ---------- Motos ----------
export async function listarMotos(soloDisponibles = false): Promise<Moto[]> {
  let q = supabase.from('motos').select('*').order('marca').order('modelo');
  if (soloDisponibles) q = q.eq('estado', 'disponible');
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []).map(aMoto);
}

export async function crearMoto(m: Omit<Moto, 'id' | 'estado'>): Promise<void> {
  const { error } = await supabase.from('motos').insert({
    marca: m.marca,
    modelo: m.modelo,
    anio: m.anio,
    cilindraje: m.cilindraje,
    color: m.color || null,
    condicion: m.condicion,
    chasis: m.chasis,
    numero_motor: m.numeroMotor || null,
    placa: m.placa || null,
    kilometraje: m.kilometraje,
    precio: m.precio,
    imagen_url: m.imagenUrl || null,
  });
  if (error) throw error;
}

// ---------- Ventas ----------
// La venta se ejecuta en la BD como una sola transacción (función registrar_venta)
export async function crearVenta(idCliente: number, idsMotos: number[], formaPago: FormaPago): Promise<number> {
  const { data, error } = await supabase.rpc('registrar_venta', {
    p_id_cliente: idCliente,
    p_ids_motos: idsMotos,
    p_forma_pago: formaPago,
  });
  if (error) throw error;
  return Number(data);
}

export async function listarVentas(): Promise<Encabezado[]> {
  const { data, error } = await supabase
    .from('encabezados')
    .select('id, id_cliente, fecha, total, forma_pago, clientes(nombre_completo)')
    .order('id', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r: any) => ({
    id: Number(r.id),
    idCliente: Number(r.id_cliente),
    fecha: r.fecha,
    total: Number(r.total),
    formaPago: r.forma_pago,
    clienteNombre: r.clientes?.nombre_completo ?? 'Cliente',
  }));
}

export async function obtenerVenta(id: number): Promise<VentaCompleta> {
  const { data, error } = await supabase
    .from('encabezados')
    .select('id, id_cliente, fecha, total, forma_pago, clientes(nombre_completo, cedula), detalles(id, precio_unitario, motos(marca, modelo, anio, color, chasis))')
    .eq('id', id)
    .single();
  if (error) throw error;
  const r: any = data;
  return {
    id: Number(r.id),
    idCliente: Number(r.id_cliente),
    fecha: r.fecha,
    total: Number(r.total),
    formaPago: r.forma_pago,
    clienteNombre: r.clientes?.nombre_completo ?? 'Cliente',
    clienteCedula: r.clientes?.cedula ?? '',
    lineas: (r.detalles ?? []).map((d: any) => ({
      id: Number(d.id),
      precioUnitario: Number(d.precio_unitario),
      descripcion: `${d.motos?.marca ?? ''} ${d.motos?.modelo ?? ''} ${d.motos?.anio ?? ''}${d.motos?.color ? ' · ' + d.motos.color : ''}`.trim(),
      chasis: d.motos?.chasis ?? '',
    })),
  };
}

export type { Condicion };

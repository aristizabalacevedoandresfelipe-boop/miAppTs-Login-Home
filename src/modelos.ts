export type Rol = 'Administrador' | 'Cliente';
export type FormaPago = 'contado' | 'credito' | 'transferencia';
export type Condicion = 'nueva' | 'usada';
export type EstadoMoto = 'disponible' | 'reservada' | 'vendida';

export interface Cliente {
  id: number;
  cedula: string;
  nombreCompleto: string;
  fechaNac: string; // 'YYYY-MM-DD'
  correo: string;   // único
  telefono: string;
}

export interface Moto {
  id: number;
  marca: string;
  modelo: string;
  anio: number;
  cilindraje: number;
  color: string;
  condicion: Condicion;
  chasis: string;      // único: identifica cada unidad física
  numeroMotor: string;
  placa: string;
  kilometraje: number;
  precio: number;
  estado: EstadoMoto;
  imagenUrl?: string | null;
}

export interface Encabezado {
  id: number;
  idCliente: number;
  fecha: string;
  total: number;
  formaPago: FormaPago;
  clienteNombre: string;
}

export interface LineaVenta {
  id: number;
  precioUnitario: number; // precio al momento de la venta
  descripcion: string;    // "Honda CB 190R 2025 · Rojo"
  chasis: string;
}

export interface VentaCompleta extends Encabezado {
  clienteCedula: string;
  lineas: LineaVenta[];
}

import type { Cliente, Rol } from '../modelos';

// Sesión actual (el rol viene de la tabla "usuarios" de Supabase)
export const sesion: { rol: Rol | null; cliente: Cliente | null } = { rol: null, cliente: null };

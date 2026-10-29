# Concesionario de motos (Expo + TypeScript + Supabase)

## Estructura
```
App.tsx                      Punto de entrada
.env                         Claves de Supabase (NO subir a Git)
supabase/01_esquema_motos.sql   Tablas, funciones y seguridad de la BD
src/
├── modelos.ts               Tipos: Moto, Cliente, Encabezado, Rol...
├── utilidades.ts            Formato de dinero/fechas, hook useCargar
├── navegacion/
│   └── StackNavigator.tsx   Rutas de la app
├── pantallas/
│   ├── Login.tsx · Registro.tsx · Home.tsx
│   ├── Motos.tsx            Inventario (administrador)
│   ├── Clientes.tsx         Lista de clientes (administrador)
│   ├── NuevaVenta.tsx · Ventas.tsx · DetalleVenta.tsx
└── servicios/
    ├── supabase.ts          Conexión con Supabase
    ├── api.ts               Todas las consultas a la BD
    └── sesion.ts            Rol y cliente de la sesión actual
```

## Ejecutar
```
npx expo install @supabase/supabase-js @react-native-async-storage/async-storage react-native-url-polyfill
npx expo start -c
```

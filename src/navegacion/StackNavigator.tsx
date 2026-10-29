import React from 'react'
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from '../pantallas/Home';
import Login from '../pantallas/Login';
import Registro from '../pantallas/Registro';
import Clientes from '../pantallas/Clientes';
import Motos from '../pantallas/Motos';
import NuevaVenta from '../pantallas/NuevaVenta';
import Ventas from '../pantallas/Ventas';
import DetalleVenta from '../pantallas/DetalleVenta';

export type RootStackParamList = {
  Login: undefined;
  Registro: undefined;
  Home: undefined;
  Clientes: undefined;
  Motos: undefined;
  NuevaVenta: undefined;
  Ventas: undefined;
  DetalleVenta: { idEnc: number };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function StackNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={Login} options={{ title: 'Iniciar sesión' }} />
        <Stack.Screen name="Registro" component={Registro} options={{ title: 'Crear cuenta' }} />
        <Stack.Screen name="Home" component={Home} options={{ title: 'Concesionario de motos', headerBackVisible: false }} />
        <Stack.Screen name="Clientes" component={Clientes} />
        <Stack.Screen name="Motos" component={Motos} options={{ title: 'Inventario de motos' }} />
        <Stack.Screen name="NuevaVenta" component={NuevaVenta} options={{ title: 'Nueva venta' }} />
        <Stack.Screen name="Ventas" component={Ventas} options={{ title: 'Ventas' }} />
        <Stack.Screen name="DetalleVenta" component={DetalleVenta} options={{ title: 'Detalle de venta' }} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
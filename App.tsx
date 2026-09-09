import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button } from 'react-native';
//import { createNativeStackNavigator } from '@react-navigation/native-stack';
//import { NavigationContainer } from '@react-navigation/native';
import StackNavigator from './src/navegacion/StackNavigator';



export default function App() {
  return (
      <StackNavigator/>
    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3DC0F',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

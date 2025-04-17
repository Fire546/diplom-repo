// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './screens/LoginScreen';
import ProfileScreen from './screens/ProfileScreen';
import QRScreen from './screens/QRScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Вход' }} />
        <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Профиль' }} />
        <Stack.Screen name="QR" component={QRScreen} options={{ title: 'QR-код' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

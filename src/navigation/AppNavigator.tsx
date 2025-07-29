import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/HomeScreen';
import { DetailsScreen } from '../screens/DetailsScreen';
import { ExportScreen } from '../screens/ExportScreen';
import { InvoicesHistoryScreen } from '../screens/InvoicesHistoryScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

export type RootStackParamList = {
  Home: undefined;
  Details: undefined;
  Export: undefined;
  InvoicesHistory: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#3182CE',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: 'Make Your Invoice' }}
        />
        <Stack.Screen 
          name="Details" 
          component={DetailsScreen} 
          options={{ title: 'Invoice Details' }}
        />
        <Stack.Screen 
          name="Export" 
          component={ExportScreen} 
          options={{ title: 'Export Invoice' }}
        />
        <Stack.Screen 
          name="InvoicesHistory" 
          component={InvoicesHistoryScreen} 
          options={{ title: 'Saved Invoices' }}
        />
        <Stack.Screen 
          name="Settings" 
          component={SettingsScreen} 
          options={{ title: 'Settings' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
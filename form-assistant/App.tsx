import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './src/components/HomeScreen';
import FormFlowScreen from './src/screens/FormFlowScreen';
import MappingScreen from './src/screens/MappingScreen';
import type { DynamicFormSchema } from './src/types/form';

export type RootStackParamList = {
  Home: undefined;
  FormFlow: { situation?: string; pdfUri?: string; mapping?: Record<string, string> };
  Mapping: { schema: DynamicFormSchema; pdfUri: string; situation?: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="FormFlow" component={FormFlowScreen} />
        <Stack.Screen name="Mapping" component={MappingScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
